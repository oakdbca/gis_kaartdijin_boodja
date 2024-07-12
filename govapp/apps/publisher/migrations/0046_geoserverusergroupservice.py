# Generated by Django 3.2.25 on 2024-07-12 02:21

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('publisher', '0045_geoserverrole_parent_role'),
    ]

    operations = [
        migrations.CreateModel(
            name='GeoServerUserGroupService',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.CharField(max_length=255, unique=True)),
            ],
            options={
                'abstract': False,
            },
        ),
    ]
