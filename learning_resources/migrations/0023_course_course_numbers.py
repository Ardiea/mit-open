# Generated by Django 4.1.10 on 2023-10-31 15:06

from django.db import migrations, models

from learning_resources.etl.constants import ETLSource
from learning_resources.etl.utils import generate_course_numbers_json


def set_course_numbers(apps, schema_editor):
    """
    Save course_numbers for every course
    """
    Course = apps.get_model("learning_resources", "Course")
    for course in Course.objects.select_related("learning_resource").iterator():
        is_ocw = course.learning_resource.etl_source == ETLSource.ocw.name
        course.course_numbers = generate_course_numbers_json(
            course.learning_resource.readable_id.split("+")[0]
            if is_ocw
            else course.learning_resource.readable_id,
            extra_nums=course.extra_course_numbers,
            is_ocw=is_ocw,
        )
        course.save()


class Migration(migrations.Migration):
    dependencies = [
        ("learning_resources", "0022_alter_learningresource_resource_type"),
    ]

    operations = [
        migrations.AddField(
            model_name="course",
            name="course_numbers",
            field=models.JSONField(blank=True, null=True),
        ),
        migrations.RunPython(
            set_course_numbers, reverse_code=migrations.RunPython.noop
        ),
    ]
