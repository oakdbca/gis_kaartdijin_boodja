# Generated by Django 5.0.7 on 2024-08-09 03:40

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('catalogue', '0038_catalogueentrypermission_access_permission'),
    ]

    operations = [
        migrations.AddField(
            model_name='catalogueentry',
            name='force_run_postgres_scanner',
            field=models.BooleanField(default=False),
        ),
    ]
