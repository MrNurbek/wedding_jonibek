from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('invitation', '0001_initial'),
    ]

    operations = [
        migrations.AlterField(
            model_name='weddingconfig',
            name='google_maps_url',
            field=models.TextField(blank=True),
        ),
        migrations.AlterField(
            model_name='weddingconfig',
            name='yandex_maps_url',
            field=models.TextField(blank=True),
        ),
        migrations.AlterField(
            model_name='weddingconfig',
            name='google_maps_embed',
            field=models.TextField(blank=True),
        ),
    ]
