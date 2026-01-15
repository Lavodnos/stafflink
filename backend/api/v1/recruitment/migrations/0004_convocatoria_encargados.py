from __future__ import annotations

from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [
        ("recruitment", "0003_convocatoria_defaults"),
    ]

    operations = [
        migrations.AddField(
            model_name="link",
            name="encargados",
            field=models.JSONField(blank=True, default=list),
        ),
    ]
