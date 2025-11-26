from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("recruitment", "0001_initial"),
    ]

    operations = [
        migrations.AlterField(
            model_name="campaign",
            name="codigo",
            field=models.CharField(
                blank=True,
                max_length=50,
                null=True,
                unique=True,
            ),
        ),
    ]
