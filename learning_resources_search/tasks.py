"""Indexing tasks"""

import logging
from contextlib import contextmanager

import celery
from celery.exceptions import Ignore
from django.conf import settings
from django.contrib.auth import get_user_model
from django.db.models import Q
from opensearchpy.exceptions import NotFoundError, RequestError

from learning_resources.etl.constants import RESOURCE_FILE_ETL_SOURCES
from learning_resources.models import (
    ContentFile,
    Course,
    LearningResource,
)
from learning_resources.utils import load_course_blocklist
from learning_resources_search import indexing_api as api
from learning_resources_search.api import (
    gen_content_file_id,
    percolate_matches_for_document,
)
from learning_resources_search.constants import (
    CONTENT_FILE_TYPE,
    COURSE_TYPE,
    LEARNING_PATH_TYPE,
    PERCOLATE_INDEX_TYPE,
    PODCAST_EPISODE_TYPE,
    PODCAST_TYPE,
    PROGRAM_TYPE,
    SEARCH_CONN_EXCEPTIONS,
    VIDEO_PLAYLIST_TYPE,
    VIDEO_TYPE,
    IndexestoUpdate,
)
from learning_resources_search.exceptions import ReindexError, RetryError
from learning_resources_search.models import PercolateQuery
from learning_resources_search.serializers import (
    serialize_bulk_percolators,
    serialize_content_file_for_update,
    serialize_learning_resource_for_update,
    serialize_percolate_query_for_update,
)
from main.celery import app
from main.utils import chunks, merge_strings

User = get_user_model()
log = logging.getLogger(__name__)


# For our tasks that attempt to partially update a document, there's a chance that
# the document has not yet been created. When we get an error that indicates that the
# document doesn't exist for the given ID, we will retry a few times in case there is
# a waiting task to create the document.
PARTIAL_UPDATE_TASK_SETTINGS = {
    "autoretry_for": (NotFoundError,),
    "retry_kwargs": {"max_retries": 5},
    "default_retry_delay": 2,
}


@app.task(**PARTIAL_UPDATE_TASK_SETTINGS)
def upsert_content_file(file_id):
    """Upsert content file based on stored database information"""

    content_file_obj = ContentFile.objects.get(id=file_id)
    content_file_data = serialize_content_file_for_update(content_file_obj)
    api.upsert_document(
        gen_content_file_id(content_file_obj.id),
        content_file_data,
        COURSE_TYPE,
        retry_on_conflict=settings.INDEXING_ERROR_RETRIES,
        routing=content_file_obj.run.learning_resource_id,
    )


@app.task
def upsert_percolate_query(percolate_id):
    """Task that makes a request to add an ES document"""
    percolate_query = PercolateQuery.objects.get(id=percolate_id)
    serialized = serialize_percolate_query_for_update(percolate_query)
    api.upsert_document(
        percolate_id,
        serialized,
        PERCOLATE_INDEX_TYPE,
        retry_on_conflict=settings.INDEXING_ERROR_RETRIES,
    )


@app.task
def deindex_document(doc_id, object_type, **kwargs):
    """Task that makes a request to remove an ES document"""
    return api.deindex_document(doc_id, object_type, **kwargs)


@app.task(**PARTIAL_UPDATE_TASK_SETTINGS)
def upsert_learning_resource(learning_resource_id):
    """Upsert learning resource based on stored database information"""
    resource_obj = LearningResource.objects.get(id=learning_resource_id)
    resource_data = serialize_learning_resource_for_update(resource_obj)
    api.upsert_document(
        learning_resource_id,
        resource_data,
        resource_obj.resource_type,
        retry_on_conflict=settings.INDEXING_ERROR_RETRIES,
    )


@app.task(autoretry_for=(RetryError,), retry_backoff=True, rate_limit="600/m")
def index_learning_resources(ids, resource_type, index_types):
    """
    Index courses

    Args:
        ids(list of int): List of course id's
        index_types (string): one of the values IndexestoUpdate. Whether the default
            index, the reindexing index or both need to be updated
        resource_type (string): resource_type value for the learning resource objects

    """
    try:
        with wrap_retry_exception(*SEARCH_CONN_EXCEPTIONS):
            api.index_learning_resources(ids, resource_type, index_types)
    except (RetryError, Ignore):
        raise
    except:  # noqa: E722
        error = "index_courses threw an error"
        log.exception(error)
        return error


@app.task(autoretry_for=(RetryError,), retry_backoff=True, rate_limit="600/m")
def percolate_learning_resource(resource_id):
    """
    Task that percolates a document following an index operation
    """
    log.info("percolating document %s", resource_id)
    percolate_matches_for_document(resource_id)


@app.task(autoretry_for=(RetryError,), retry_backoff=True, rate_limit="600/m")
def bulk_deindex_learning_resources(ids, resource_type):
    """
    Deindex learning resourse by a list of ids

    Args:
        ids(list of int): List of learning resource ids
        resource_type: the resource type

    """
    try:
        with wrap_retry_exception(*SEARCH_CONN_EXCEPTIONS):
            api.deindex_learning_resources(ids, resource_type)
    except (RetryError, Ignore):
        raise
    except:  # noqa: E722
        error = "bulk_deindex_learning_resources threw an error"
        log.exception(error)
        return error


@app.task(autoretry_for=(RetryError,), retry_backoff=True, rate_limit="600/m")
def bulk_deindex_percolators(ids):
    """
    Deindex percolators by a list of ids

    Args:
        ids(list of int): List of percolator ids

    """
    try:
        with wrap_retry_exception(*SEARCH_CONN_EXCEPTIONS):
            api.deindex_percolators(ids)
    except (RetryError, Ignore):
        raise
    except:  # noqa: E722
        error = "bulk_deindex_percolators threw an error"
        log.exception(error)
        return error


@app.task(autoretry_for=(RetryError,), retry_backoff=True, rate_limit="600/m")
def bulk_index_percolate_queries(percolate_ids, index_types):
    """
    Bulk index percolate queries for provided percolate query Ids

    Args:
        percolate_ids (list of int): List of percolator ids
        index_types (string): one of the values IndexestoUpdate. Whether the default
            index, the reindexing index or both need to be updated
    """
    try:
        percolates = PercolateQuery.objects.filter(id__in=percolate_ids)
        log.info("Indexing %d percolator queries...", percolates.count())
        api.index_items(
            serialize_bulk_percolators(percolate_ids),
            PERCOLATE_INDEX_TYPE,
            index_types,
        )
    except (RetryError, Ignore):
        raise
    except:  # noqa: E722
        error = "bulk_index_percolate_queries threw an error"
        log.exception(error)
        return error


@app.task(autoretry_for=(RetryError,), retry_backoff=True, rate_limit="600/m")
def index_course_content_files(course_ids, index_types):
    """
    Index content files for a list of course ids

    Args:
        course_ids(list of int): List of course id's
        index_types (string): one of the values IndexestoUpdate. Whether the default
            index, the reindexing index or both need to be updated


    """
    try:
        with wrap_retry_exception(*SEARCH_CONN_EXCEPTIONS):
            api.index_course_content_files(course_ids, index_types=index_types)
    except (RetryError, Ignore):
        raise
    except:  # noqa: E722
        error = "index_course_content_files threw an error"
        log.exception(error)
        return error


@app.task(autoretry_for=(RetryError,), retry_backoff=True, rate_limit="600/m")
def index_run_content_files(run_id, index_types=IndexestoUpdate.all_indexes.value):
    """
    Index content files for a LearningResourceRun

    Args:
        run_id(int): LearningResourceRun id
        index_types (string): one of the values IndexestoUpdate. Whether the default
            index, the reindexing index or both need to be updated

    """
    try:
        with wrap_retry_exception(*SEARCH_CONN_EXCEPTIONS):
            api.index_run_content_files(run_id, index_types=index_types)
            api.deindex_run_content_files(run_id, unpublished_only=True)
    except (RetryError, Ignore):
        raise
    except:  # noqa: E722
        error = "index_run_content_files threw an error"
        log.exception(error)
        return error


@app.task(autoretry_for=(RetryError,), retry_backoff=True, rate_limit="600/m")
def deindex_run_content_files(run_id, unpublished_only):
    """
    Deindex content files for a LearningResourceRun

    Args:
        run_id(int): LearningResourceRun id
        unpublished_only(bool): Whether to only deindex unpublished content files

    """
    try:
        with wrap_retry_exception(*SEARCH_CONN_EXCEPTIONS):
            api.deindex_run_content_files(run_id, unpublished_only=unpublished_only)
    except (RetryError, Ignore):
        raise
    except:  # noqa: E722
        error = "deindex_run_content_files threw an error"
        log.exception(error)
        return error


@contextmanager
def wrap_retry_exception(*exception_classes):
    """
    Wrap exceptions with RetryError so Celery can use it for autoretry

    Args:
        *exception_classes (tuple of type): Exception classes which should become
            RetryError
    """
    try:
        yield
    except Exception as ex:
        # Celery is confused by exceptions which don't take a string as an argument,
        # so we need to wrap before raising
        if isinstance(ex, exception_classes):
            raise RetryError(str(ex)) from ex
        raise


@app.task(bind=True)
def start_recreate_index(self, indexes):
    """
    Wipe and recreate index and mapping, and index all items.
    """
    try:
        new_backing_indices = {
            obj_type: api.create_backing_index(obj_type) for obj_type in indexes
        }

        # Do the indexing on the temp index
        log.info("starting to index %s objects...", ", ".join(indexes))

        index_tasks = []

        if PERCOLATE_INDEX_TYPE in indexes:
            index_tasks = index_tasks + [
                bulk_index_percolate_queries.si(
                    percolate_ids, IndexestoUpdate.reindexing_index.value
                )
                for percolate_ids in chunks(
                    PercolateQuery.objects.order_by("id").values_list("id", flat=True),
                    chunk_size=settings.OPENSEARCH_INDEXING_CHUNK_SIZE,
                )
            ]

        if COURSE_TYPE in indexes:
            blocklisted_ids = load_course_blocklist()
            index_tasks = (
                index_tasks
                + [
                    index_learning_resources.si(
                        ids,
                        COURSE_TYPE,
                        index_types=IndexestoUpdate.reindexing_index.value,
                    )
                    for ids in chunks(
                        Course.objects.filter(learning_resource__published=True)
                        .exclude(learning_resource__readable_id=blocklisted_ids)
                        .order_by("learning_resource_id")
                        .values_list("learning_resource_id", flat=True),
                        chunk_size=settings.OPENSEARCH_INDEXING_CHUNK_SIZE,
                    )
                ]
                + [
                    index_course_content_files.si(
                        ids, index_types=IndexestoUpdate.reindexing_index.value
                    )
                    for ids in chunks(
                        Course.objects.filter(learning_resource__published=True)
                        .filter(
                            learning_resource__etl_source__in=RESOURCE_FILE_ETL_SOURCES
                        )
                        .exclude(learning_resource__readable_id=blocklisted_ids)
                        .order_by("learning_resource_id")
                        .values_list("learning_resource_id", flat=True),
                        chunk_size=settings.OPENSEARCH_INDEXING_CHUNK_SIZE,
                    )
                ]
            )

        for resource_type in [
            PROGRAM_TYPE,
            PODCAST_TYPE,
            PODCAST_EPISODE_TYPE,
            LEARNING_PATH_TYPE,
            VIDEO_TYPE,
            VIDEO_PLAYLIST_TYPE,
        ]:
            if resource_type in indexes:
                index_tasks = index_tasks + [
                    index_learning_resources.si(
                        ids,
                        resource_type,
                        index_types=IndexestoUpdate.reindexing_index.value,
                    )
                    for ids in chunks(
                        LearningResource.objects.filter(
                            published=True, resource_type=resource_type
                        )
                        .order_by("id")
                        .values_list("id", flat=True),
                        chunk_size=settings.OPENSEARCH_INDEXING_CHUNK_SIZE,
                    )
                ]

        index_tasks = celery.group(index_tasks)
    except:  # noqa: E722
        error = "start_recreate_index threw an error"
        log.exception(error)
        return error

    # Use self.replace so that code waiting on this task will also wait on the indexing
    #  and finish tasks
    raise self.replace(
        celery.chain(index_tasks, finish_recreate_index.s(new_backing_indices))
    )


@app.task(bind=True)
def start_update_index(self, indexes, etl_source):
    """
    Wipe and recreate index and mapping, and index all items.
    """
    try:
        log.info("starting to index %s objects...", ", ".join(indexes))

        index_tasks = []

        if COURSE_TYPE in indexes or CONTENT_FILE_TYPE in indexes:
            blocklisted_ids = load_course_blocklist()

        if COURSE_TYPE in indexes:
            index_tasks = index_tasks + get_update_courses_tasks(
                blocklisted_ids, etl_source
            )

        if CONTENT_FILE_TYPE in indexes:
            index_tasks = index_tasks + get_update_resource_files_tasks(
                blocklisted_ids, etl_source
            )
        if PERCOLATE_INDEX_TYPE in indexes:
            index_tasks = index_tasks + get_update_percolator_tasks()

        for resource_type in [
            PROGRAM_TYPE,
            PODCAST_TYPE,
            PODCAST_EPISODE_TYPE,
            LEARNING_PATH_TYPE,
            VIDEO_TYPE,
            VIDEO_PLAYLIST_TYPE,
        ]:
            if resource_type in indexes:
                index_tasks = index_tasks + get_update_learning_resource_tasks(
                    resource_type
                )

        index_tasks = celery.group(index_tasks)
    except:  # noqa: E722
        error = "start_update_index threw an error"
        log.exception(error)
        return [error]

    raise self.replace(index_tasks)


def get_update_resource_files_tasks(blocklisted_ids, etl_source):
    """
    Get list of tasks to update course files
    Args:
        blocklisted_ids(list of int): List of course id's to exclude
        etl_source(str): ETL source filter for the task
    """

    if etl_source is None or etl_source in RESOURCE_FILE_ETL_SOURCES:
        course_update_query = (
            LearningResource.objects.filter(published=True, resource_type=COURSE_TYPE)
            .exclude(readable_id__in=blocklisted_ids)
            .order_by("id")
        )

        if etl_source:
            course_update_query = course_update_query.filter(etl_source=etl_source)
        else:
            course_update_query = course_update_query.filter(
                etl_source__in=RESOURCE_FILE_ETL_SOURCES
            )

        return [
            index_course_content_files.si(
                ids, index_types=IndexestoUpdate.current_index.value
            )
            for ids in chunks(
                course_update_query.values_list("id", flat=True),
                chunk_size=settings.OPENSEARCH_INDEXING_CHUNK_SIZE,
            )
        ]
    else:
        return []


def get_update_courses_tasks(blocklisted_ids, etl_source):
    """
    Get list of tasks to update courses
    Args:
        blocklisted_ids(list of int): List of course id's to exclude
        etl_source(str): Etl source filter for the task
    """

    course_update_query = (
        LearningResource.objects.filter(published=True, resource_type=COURSE_TYPE)
        .exclude(readable_id__in=blocklisted_ids)
        .order_by("id")
    )

    course_deletion_query = (
        LearningResource.objects.filter(resource_type=COURSE_TYPE)
        .filter(Q(published=False) | Q(readable_id__in=blocklisted_ids))
        .order_by("id")
    )

    if etl_source:
        course_update_query = course_update_query.filter(etl_source=etl_source)
        course_deletion_query = course_deletion_query.filter(etl_source=etl_source)

    index_tasks = [
        index_learning_resources.si(
            ids, COURSE_TYPE, index_types=IndexestoUpdate.current_index.value
        )
        for ids in chunks(
            course_update_query.values_list("id", flat=True),
            chunk_size=settings.OPENSEARCH_INDEXING_CHUNK_SIZE,
        )
    ]

    return index_tasks + [
        bulk_deindex_learning_resources.si(ids, COURSE_TYPE)
        for ids in chunks(
            course_deletion_query.values_list("id", flat=True),
            chunk_size=settings.OPENSEARCH_INDEXING_CHUNK_SIZE,
        )
    ]


def get_update_percolator_tasks():
    """
    Get list of tasks to update percolators
    """
    index_tasks = [
        bulk_index_percolate_queries.si(
            percolate_ids, index_types=IndexestoUpdate.current_index.value
        )
        for percolate_ids in chunks(
            PercolateQuery.objects.order_by("id").values_list("id", flat=True),
            chunk_size=settings.OPENSEARCH_INDEXING_CHUNK_SIZE,
        )
    ]

    return index_tasks + [
        bulk_deindex_percolators.si(ids)
        for ids in chunks(
            PercolateQuery.objects.all().order_by("id").values_list("id", flat=True),
            chunk_size=settings.OPENSEARCH_INDEXING_CHUNK_SIZE,
        )
    ]


def get_update_learning_resource_tasks(resource_type):
    """
    Get list of tasks to update non-course learning resources
    """
    index_tasks = [
        index_learning_resources.si(
            ids, resource_type, index_types=IndexestoUpdate.current_index.value
        )
        for ids in chunks(
            LearningResource.objects.filter(published=True, resource_type=resource_type)
            .order_by("id")
            .values_list("id", flat=True),
            chunk_size=settings.OPENSEARCH_INDEXING_CHUNK_SIZE,
        )
    ]

    return index_tasks + [
        bulk_deindex_learning_resources.si(ids, resource_type)
        for ids in chunks(
            LearningResource.objects.filter(
                published=False, resource_type=resource_type
            )
            .order_by("id")
            .values_list("id", flat=True),
            chunk_size=settings.OPENSEARCH_INDEXING_CHUNK_SIZE,
        )
    ]


@app.task(autoretry_for=(RetryError,), retry_backoff=True, rate_limit="600/m")
def finish_recreate_index(results, backing_indices):
    """
    Swap reindex backing index with default backing index

    Args:
        results (list or bool): Results saying whether the error exists
        backing_indices (dict): The backing OpenSearch indices keyed by object type
    """
    errors = merge_strings(results)
    if errors:
        try:
            api.delete_orphaned_indices()
        except RequestError as ex:
            raise RetryError(str(ex)) from ex
        msg = f"Errors occurred during recreate_index: {errors}"
        raise ReindexError(msg)

    log.info(
        "Done with temporary index. Pointing default aliases to newly created backing indexes..."  # noqa: E501
    )
    for obj_type, backing_index in backing_indices.items():
        try:
            api.switch_indices(backing_index, obj_type)
        except RequestError as ex:
            raise RetryError(str(ex)) from ex
    log.info("recreate_index has finished successfully!")
