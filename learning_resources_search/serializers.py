"""Serializers for opensearch data"""

import logging
from collections import defaultdict
from decimal import Decimal
from typing import TypedDict

from django.conf import settings
from django.core.exceptions import ValidationError
from drf_spectacular.plumbing import build_choice_description_list
from drf_spectacular.utils import extend_schema_field
from rest_framework import serializers
from rest_framework.utils.urls import replace_query_param

from learning_resources.constants import (
    DEPARTMENTS,
    LEARNING_RESOURCE_SORTBY_OPTIONS,
    LearningResourceFormat,
    LearningResourceType,
    LevelType,
    OfferedBy,
    PlatformType,
)
from learning_resources.models import LearningResource
from learning_resources.serializers import (
    ContentFileSerializer,
    CourseNumberSerializer,
    LearningResourceSerializer,
)
from learning_resources_search.api import gen_content_file_id
from learning_resources_search.constants import (
    CONTENT_FILE_TYPE,
)
from learning_resources_search.models import PercolateQuery
from learning_resources_search.utils import remove_child_queries
from main.serializers import (
    COMMON_IGNORED_FIELDS,
)

log = logging.getLogger()


class SearchCourseNumberSerializer(CourseNumberSerializer):
    """Serializer for CourseNumber, including extra fields for search"""

    primary = serializers.BooleanField()
    sort_coursenum = serializers.CharField()


def serialize_learning_resource_for_update(
    learning_resource_obj: LearningResource,
) -> dict:
    """
    Add any special search-related fields to the serializer data here

    Args:
        learning_resource_obj(LearningResource): The learning resource object

    Returns:
        dict: The serialized and transformed resource data

    """
    serialized_data = LearningResourceSerializer(instance=learning_resource_obj).data
    # Note: this is an ES-specific field that is filtered out on retrieval
    #       see SOURCE_EXCLUDED_FIELDS in learning_resources_search/constants.py
    if learning_resource_obj.resource_type in [
        LearningResourceType.course.name,
        LearningResourceType.program.name,
    ]:
        prices = learning_resource_obj.prices
        serialized_data["free"] = Decimal(0.00) in prices or not prices or prices == []
    else:
        serialized_data["free"] = True
    if learning_resource_obj.resource_type == LearningResourceType.course.name:
        serialized_data["course"]["course_numbers"] = [
            SearchCourseNumberSerializer(instance=num).data
            for num in learning_resource_obj.course.course_numbers
        ]
    return {
        "resource_relations": {"name": "resource"},
        "created_on": learning_resource_obj.created_on,
        **serialized_data,
    }


def extract_values(obj, key):
    """
    Pull all values of specified key from nested JSON.

    Args:
        obj(dict): The JSON object
        key(str): The JSON key to search for and extract

    Returns:
        list of matching key values

    """
    array = []

    def extract(obj, array, key):
        """Recursively search for values of key in JSON tree."""
        if isinstance(obj, dict):
            for k, v in obj.items():
                if k == key:
                    array.append(v)
                if isinstance(v, dict | list):
                    extract(v, array, key)
        elif isinstance(obj, list):
            for item in obj:
                extract(item, array, key)
        return array

    return extract(obj, array, key)


class StringArrayField(serializers.ListField):
    """
    Character separated ListField.
    """

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)

    def to_internal_value(self, data):
        normalized = ",".join(data).split(",")

        return super().to_internal_value(normalized)


class ArrayWrappedBoolean(serializers.BooleanField):
    """
    Wrapper that wraps booleans in arrays so they have the same format as
    other fields when passed to execute_learn_search() by the view
    """

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)

    def to_representation(self, data):
        data = super().to_internal_value(data)
        if data is None:
            return data
        else:
            return [data]


CONTENT_FILE_SORTBY_OPTIONS = [
    "id",
    "-id",
    "resource_readable_id",
    "-resource_readable_id",
]

LEARNING_RESOURCE_AGGREGATIONS = [
    "resource_type",
    "certification",
    "offered_by",
    "platform",
    "topic",
    "department",
    "level",
    "course_feature",
    "professional",
    "free",
    "learning_format",
]

CONTENT_FILE_AGGREGATIONS = ["topic", "content_feature_type", "platform", "offered_by"]


class SearchRequestSerializer(serializers.Serializer):
    q = serializers.CharField(required=False, help_text="The search text")
    offset = serializers.IntegerField(
        required=False, help_text="The initial index from which to return the results"
    )
    limit = serializers.IntegerField(
        required=False, help_text="Number of results to return per page"
    )
    offered_by_choices = [(e.name.lower(), e.value) for e in OfferedBy]
    offered_by = StringArrayField(
        required=False,
        child=serializers.ChoiceField(choices=offered_by_choices),
        help_text=(
            f"The organization that offers the learning resource \
            \n\n{build_choice_description_list(offered_by_choices)}"
        ),
    )
    platform_choices = [(e.name.lower(), e.value) for e in PlatformType]
    platform = StringArrayField(
        required=False,
        child=serializers.ChoiceField(choices=platform_choices),
        help_text=(
            f"The platform on which the learning resource is offered \
            \n\n{build_choice_description_list(platform_choices)}"
        ),
    )
    topic = StringArrayField(
        required=False,
        child=serializers.CharField(),
        help_text="The topic name. To see a list of options go to api/v1/topics/",
    )

    def validate(self, attrs):
        unknown = set(self.initial_data) - set(self.fields)
        if unknown:
            error_message = "Unknown field(s): {}".format(", ".join(unknown))
            raise ValidationError(error_message)
        return attrs


class LearningResourcesSearchRequestSerializer(SearchRequestSerializer):
    id = StringArrayField(
        required=False,
        child=serializers.IntegerField(),
        help_text="The id value for the learning resource",
    )
    sortby = serializers.ChoiceField(
        required=False,
        choices=[
            (key, LEARNING_RESOURCE_SORTBY_OPTIONS[key]["title"])
            for key in LEARNING_RESOURCE_SORTBY_OPTIONS
        ],
        help_text="If the parameter starts with '-' the sort is in descending order",
    )
    resource_choices = [(e.name, e.value.lower()) for e in LearningResourceType]
    resource_type = StringArrayField(
        required=False,
        child=serializers.ChoiceField(
            choices=resource_choices,
        ),
        help_text=(
            f"The type of learning resource \
            \n\n{build_choice_description_list(resource_choices)}"
        ),
    )
    free = ArrayWrappedBoolean(
        required=False,
        allow_null=True,
        default=None,
    )
    professional = ArrayWrappedBoolean(
        required=False,
        allow_null=True,
        default=None,
    )
    certification = ArrayWrappedBoolean(
        required=False,
        allow_null=True,
        default=None,
        help_text="True if the learning resource offers a certificate",
    )
    department_choices = list(DEPARTMENTS.items())
    department = StringArrayField(
        required=False,
        child=serializers.ChoiceField(choices=department_choices),
        help_text=(
            f"The department that offers the learning resource \
            \n\n{build_choice_description_list(department_choices)}"
        ),
    )

    level = StringArrayField(
        required=False, child=serializers.ChoiceField(choices=LevelType.as_list())
    )

    course_feature = StringArrayField(
        required=False,
        child=serializers.CharField(),
        help_text="The course feature. "
        "Possible options are at api/v1/course_features/",
    )
    aggregations = StringArrayField(
        required=False,
        help_text="Show resource counts by category",
        child=serializers.ChoiceField(choices=LEARNING_RESOURCE_AGGREGATIONS),
    )
    learning_format_choices = LearningResourceFormat.as_list()
    learning_format = StringArrayField(
        required=False,
        child=serializers.ChoiceField(choices=learning_format_choices),
        help_text=(
            f"The format(s) in which the learning resource is offered \
            \n\n{build_choice_description_list(learning_format_choices)}"
        ),
    )


class ContentFileSearchRequestSerializer(SearchRequestSerializer):
    id = StringArrayField(
        required=False,
        child=serializers.IntegerField(),
        help_text="The id value for the content file",
    )
    sortby = serializers.ChoiceField(
        required=False,
        choices=CONTENT_FILE_SORTBY_OPTIONS,
        help_text="if the parameter starts with '-' the sort is in descending order",
    )
    content_feature_type = StringArrayField(
        required=False,
        child=serializers.CharField(),
        help_text="The feature type of the content file. "
        "Possible options are at api/v1/course_features/",
    )
    aggregations = StringArrayField(
        required=False,
        help_text="Show resource counts by category",
        child=serializers.ChoiceField(choices=CONTENT_FILE_AGGREGATIONS),
    )
    run_id = StringArrayField(
        required=False,
        child=serializers.IntegerField(),
        help_text="The id value of the run that the content file belongs to",
    )
    resource_id = StringArrayField(
        required=False,
        child=serializers.IntegerField(),
        help_text="The id value of the parent learning resource for the content file",
    )


class AggregationValue(TypedDict):
    key: str
    doc_count: int


def _transform_aggregations(aggregations):
    def get_buckets(key, aggregation):
        if "buckets" in aggregation:
            return aggregation["buckets"]
        if key in aggregation:
            return get_buckets(key, aggregation[key])
        return []

    def format_bucket(bucket):
        """
        We want to ensure the key is a string.

        For example, for boolean indexes, the OpenSearch bucket values are of
        form
            {
                "key": 0 | 1,
                "key_as_string": "false" | "true",
                "doc_count": int
            }
        Here, we return "false" or "true" as the key.
        """
        copy = {**bucket}
        if "key_as_string" in bucket:
            copy["key"] = copy.pop("key_as_string")
        if "root" in bucket:
            root_doc_count = copy.pop("root")["doc_count"]
            copy["doc_count"] = root_doc_count
        return copy

    return {
        key: [format_bucket(b) for b in get_buckets(key, agg)]
        for key, agg in aggregations.items()
    }


def _transform_search_results_suggest(search_result):
    """
    Transform suggest results from opensearch

    Args:
        search_result (dict): The results from opensearch

    Returns:
        dict: The opensearch response dict with transformed suggestions
    """

    es_suggest = search_result.pop("suggest", {})
    if (
        search_result.get("hits", {}).get("total", {}).get("value")
        <= settings.OPENSEARCH_MAX_SUGGEST_HITS
    ):
        suggestion_dict = defaultdict(int)
        suggestions = [
            suggestion
            for suggestion_list in extract_values(es_suggest, "options")
            for suggestion in suggestion_list
            if suggestion["collate_match"] is True
        ]
        for suggestion in suggestions:
            suggestion_dict[suggestion["text"]] = (
                suggestion_dict[suggestion["text"]] + suggestion["score"]
            )
        return [
            key
            for key, value in sorted(
                suggestion_dict.items(), key=lambda item: item[1], reverse=True
            )
        ][: settings.OPENSEARCH_MAX_SUGGEST_RESULTS]
    else:
        return []


class SearchResponseMetadata(TypedDict):
    aggregations: dict[str, list[AggregationValue]]
    suggestions: list[str]


class SearchResponseSerializer(serializers.Serializer):
    count = serializers.SerializerMethodField()
    next = serializers.SerializerMethodField()
    previous = serializers.SerializerMethodField()
    results = serializers.SerializerMethodField()
    metadata = serializers.SerializerMethodField()

    def construct_pagination_url(self, instance, request, link_type="next"):
        if request:
            url = request.build_absolute_uri()
            total_record_count = self.get_count(instance)
            offset = int(request.query_params.get("offset", 0))
            limit = int(
                request.query_params.get("limit", settings.OPENSEARCH_DEFAULT_PAGE_SIZE)
            )
            url = replace_query_param(url, "limit", limit)
            if link_type == "previous":
                offset -= limit
            else:
                offset += limit
            if offset >= 0 and offset < total_record_count:
                return replace_query_param(url, "offset", offset)
        return None

    def get_next(self, instance) -> str | None:
        request = self.context.get("request")
        return self.construct_pagination_url(instance, request, link_type="next")

    def get_previous(self, instance) -> str | None:
        request = self.context.get("request")
        return self.construct_pagination_url(instance, request, link_type="previous")

    def get_count(self, instance) -> int:
        return instance.get("hits", {}).get("total", {}).get("value")

    def get_results(self, instance):
        hits = instance.get("hits", {}).get("hits", [])
        return (hit.get("_source") for hit in hits)

    def get_metadata(self, instance) -> SearchResponseMetadata:
        return {
            "aggregations": _transform_aggregations(instance.get("aggregations", {})),
            "suggest": _transform_search_results_suggest(instance),
        }


class PercolateQuerySerializer(serializers.ModelSerializer):
    class Meta:
        model = PercolateQuery
        exclude = COMMON_IGNORED_FIELDS


class LearningResourceSearchResponseSerializer(SearchResponseSerializer):
    """
    SearchResponseSerializer with OpenAPI annotations for Learning Resources
    search
    """

    @extend_schema_field(LearningResourceSerializer(many=True))
    def get_results():
        return super().get_results()


class ContentFileSearchResponseSerializer(SearchResponseSerializer):
    """
    SearchResponseSerializer with OpenAPI annotations for Content Files search
    """

    @extend_schema_field(ContentFileSerializer(many=True))
    def get_results():
        return super().get_results()


class UserPercolateQueryRequestSerializer(SearchResponseSerializer):
    """
    SearchResponseSerializer with OpenAPI annotations for Content Files search
    """

    @extend_schema_field(PercolateQuerySerializer(many=True))
    def get_results():
        return super().get_results()


def serialize_content_file_for_update(content_file_obj):
    """Serialize a content file for API request"""

    return {
        "resource_relations": {
            "name": CONTENT_FILE_TYPE,
            "parent": content_file_obj.run.learning_resource_id,
        },
        **ContentFileSerializer(content_file_obj).data,
    }


def serialize_bulk_learning_resources(ids):
    """
    Serialize learning resource for bulk indexing

    Args:
        ids(list of int): List of learning_resource id's
    """
    for learning_resource in (
        LearningResource.objects.select_related(*LearningResource.related_selects)
        .prefetch_related(*LearningResource.prefetches)
        .filter(id__in=ids)
    ):
        yield serialize_learning_resource_for_bulk(learning_resource)


def serialize_bulk_percolators(ids):
    """
    Serialize percolators for bulk indexing

    Args:
        ids(list of int): List of percolator id's
    """
    for percolator in PercolateQuery.objects.filter(id__in=ids):
        yield serialize_percolate_query(percolator)


def serialize_percolate_query(query):
    """
    Serialize PercolateQuery for Opensearch indexing

    Args:
        query (PercolateQuery): A PercolateQuery instance

    Returns:
        dict:
            This is the query dict value with `id` set to the database id so that
            OpenSearch can update this in place.
    """
    serialized = PercolateQuerySerializer(instance=query).data
    return {
        "query": {**remove_child_queries(serialized["query"])},
        "id": serialized["id"],
    }


def serialize_percolate_query_for_update(query):
    """
    Serialize PercolateQuery for Opensearch update

    Args:
        query (PercolateQuery): A PercolateQuery instance

    Returns:
        dict:
            This is the query dict value with `_id` set to the database id so that
            OpenSearch can update this in place.
    """
    return serialize_percolate_query(query)


def serialize_bulk_learning_resources_for_deletion(ids):
    """
    Serialize learning_resource for bulk deletion

    Args:
        ids(list of int): List of learning resource id's
    """
    for learning_resource_id in ids:
        yield serialize_for_deletion(learning_resource_id)


def serialize_bulk_percolators_for_deletion(ids):
    """
    Serialize percolators for bulk deletion

    Args:
        ids(list of int): List of learning resource id's
    """
    for percolate_id in ids:
        yield serialize_for_deletion(percolate_id)


def serialize_learning_resource_for_bulk(learning_resource_obj):
    """
    Serialize a learning resource for bulk API request

    Args:
        learning_resource_obj (LearningResource): A  learning_resource object
    """
    return {
        "_id": learning_resource_obj.id,
        **serialize_learning_resource_for_update(learning_resource_obj),
    }


def serialize_for_deletion(opensearch_object_id):
    """
    Serialize content for bulk deletion API request

    Args:
        opensearch_object_id (string): OpenSearch object id

    Returns:
        dict: the object deletion data
    """
    return {"_id": opensearch_object_id, "_op_type": "delete"}


def serialize_content_file_for_bulk(content_file_obj):
    """
    Serialize a content file for bulk API request

    Args:
        content_file_obj (ContentFile): A content file for a course
    """
    return {
        "_id": gen_content_file_id(content_file_obj.id),
        **serialize_content_file_for_update(content_file_obj),
    }


def serialize_content_file_for_bulk_deletion(content_file_obj):
    """
    Serialize a content file for bulk API request

    Args:
        content_file_obj (ContentFile): A content file for a course
    """
    return serialize_for_deletion(gen_content_file_id(content_file_obj.id))
