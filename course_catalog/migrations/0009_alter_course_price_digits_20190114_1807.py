# Generated by Django 2.0.8 on 2019-01-14 18:07

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [("course_catalog", "0008_renames_last_updated_field_20190111_1820")]

    operations = [
        migrations.AlterField(
            model_name="courseprice",
            name="price",
            field=models.DecimalField(decimal_places=2, max_digits=6),
        )
    ]
