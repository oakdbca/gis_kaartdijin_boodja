# Generated by Django 3.2.20 on 2023-09-06 07:41

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('publisher', '0015_geoserverpublishchannel_override_bbox'),
    ]

    operations = [
        migrations.AddField(
            model_name='geoserverpublishchannel',
            name='native_crs',
            field=models.CharField(max_length=500, null=True),
        ),
    ]
