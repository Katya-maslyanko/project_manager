# Generated by Django 5.1.7 on 2025-05-19 19:53

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("tasks", "0026_projectinvitation"),
    ]

    operations = [
        migrations.AddField(
            model_name="userprofile",
            name="totp_enabled",
            field=models.BooleanField(default=False),
        ),
    ]
