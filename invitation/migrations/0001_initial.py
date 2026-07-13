from django.db import migrations, models


class Migration(migrations.Migration):

    initial = True

    dependencies = []

    operations = [
        migrations.CreateModel(
            name='WeddingConfig',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('groom_name', models.CharField(default='Jasur', max_length=100)),
                ('bride_name', models.CharField(default='Nilufar', max_length=100)),
                ('wedding_date', models.DateField(blank=True, null=True)),
                ('wedding_time', models.TimeField(blank=True, null=True)),
                ('wedding_day_name', models.CharField(default='Shanba', max_length=30)),
                ('ayat_text', models.TextField(default='Va u ikkovingiz orasiga mehr va muhabbat soldi. Albatta, bunda fikr yuritadigan qavmlar uchun oyatlar bor.')),
                ('ayat_ref', models.CharField(default='Ar-Rum surasi, 21-oyat', max_length=100)),
                ('invite_message', models.TextField(default='Siz aziz va qadrli mehmonimiz sifatida to\'yimizda ishtirok etishingizni so\'raymiz.')),
                ('invite_sub', models.TextField(default='Sizning mavjudligingiz bizning eng katta xursandchiligimiz.')),
                ('venue_name', models.CharField(default='"Guliston" to\'y saroyi', max_length=200)),
                ('venue_address', models.TextField(default='Toshkent shahri, Yunusobod tumani')),
                ('venue_phone', models.CharField(default='+998 90 000 00 00', max_length=30)),
                ('google_maps_url', models.URLField(blank=True)),
                ('yandex_maps_url', models.URLField(blank=True)),
                ('google_maps_embed', models.URLField(blank=True)),
                ('cover_bg', models.ImageField(blank=True, upload_to='backgrounds/')),
                ('hero_bg', models.ImageField(blank=True, upload_to='backgrounds/')),
                ('invitation_bg', models.ImageField(blank=True, upload_to='backgrounds/')),
                ('date_bg', models.ImageField(blank=True, upload_to='backgrounds/')),
                ('program_bg', models.ImageField(blank=True, upload_to='backgrounds/')),
                ('venue_bg', models.ImageField(blank=True, upload_to='backgrounds/')),
                ('maps_bg', models.ImageField(blank=True, upload_to='backgrounds/')),
            ],
            options={'verbose_name': "To'y sozlamalari", 'verbose_name_plural': "To'y sozlamalari"},
        ),
        migrations.CreateModel(
            name='GalleryImage',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('image', models.ImageField(upload_to='gallery/')),
                ('label', models.CharField(blank=True, max_length=100)),
                ('caption', models.CharField(blank=True, max_length=200)),
                ('order', models.PositiveSmallIntegerField(default=0)),
            ],
            options={'ordering': ['order'], 'verbose_name': 'Galereya rasmi', 'verbose_name_plural': 'Galereya rasmlari'},
        ),
        migrations.CreateModel(
            name='ProgramItem',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('time', models.CharField(max_length=10)),
                ('event', models.CharField(max_length=200)),
                ('icon', models.CharField(default='◆', max_length=10)),
                ('order', models.PositiveSmallIntegerField(default=0)),
            ],
            options={'ordering': ['order'], 'verbose_name': 'Dastur bandi', 'verbose_name_plural': 'Dastur bandlari'},
        ),
        migrations.CreateModel(
            name='RSVP',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.CharField(max_length=150)),
                ('guest_count', models.PositiveSmallIntegerField(default=1)),
                ('status', models.CharField(choices=[('yes', 'Ha, kelaman'), ('no', 'Kela olmayman')], default='yes', max_length=3)),
                ('message', models.TextField(blank=True)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
            ],
            options={'ordering': ['-created_at'], 'verbose_name': 'Mehmon javobi', 'verbose_name_plural': 'Mehmon javoblari'},
        ),
    ]
