# Generated by Django 3.2.16 on 2023-02-02 06:50

from django.db import migrations, models
import django.utils.timezone


class Migration(migrations.Migration):

    dependencies = [
        ('catalogue', '0011_change_notification_types'),
    ]

    operations = [
        migrations.AddField(
            model_name='catalogueentry',
            name='created_at',
            field=models.DateTimeField(auto_now_add=True, default=django.utils.timezone.now),
            preserve_default=False,
        ),
    ]
