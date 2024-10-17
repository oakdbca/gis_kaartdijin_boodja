# Generated by Django 5.0.7 on 2024-10-17 03:27

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('publisher', '0051_rename_layerhealthcheck_geoserverlayerhealthcheck'),
    ]

    operations = [
        migrations.AlterField(
            model_name='geoserverlayerhealthcheck',
            name='health_status',
            field=models.CharField(choices=[('healthy', 'Healthy'), ('unhealthy', 'Unhealthy'), ('unknown', 'Unknown')], default='unknown', max_length=20),
        ),
    ]
