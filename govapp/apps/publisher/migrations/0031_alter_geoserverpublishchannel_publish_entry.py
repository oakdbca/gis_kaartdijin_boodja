# Generated by Django 3.2.25 on 2024-05-01 08:15

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('publisher', '0030_rename_geo_server_pool_geoserverpublishchannel_geoserver_pool'),
    ]

    operations = [
        migrations.AlterField(
            model_name='geoserverpublishchannel',
            name='publish_entry',
            field=models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='geoserver_channels', to='publisher.publishentry'),
        ),
    ]
