# Generated by Django 3.2.25 on 2024-06-04 00:16

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('publisher', '0039_geoserverrolepermission'),
    ]

    operations = [
        migrations.AlterModelOptions(
            name='geoservergrouprole',
            options={'verbose_name': 'GeoServer GroupRole', 'verbose_name_plural': 'GeoServer GroupRoles'},
        ),
    ]
