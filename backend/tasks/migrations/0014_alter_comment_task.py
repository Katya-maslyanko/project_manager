# Generated by Django 5.1.7 on 2025-04-22 19:24

import django.db.models.deletion
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("tasks", "0013_comment_subtask"),
    ]

    operations = [
        migrations.AlterField(
            model_name="comment",
            name="task",
            field=models.ForeignKey(
                blank=True,
                null=True,
                on_delete=django.db.models.deletion.CASCADE,
                related_name="comments",
                to="tasks.task",
            ),
        ),
    ]
