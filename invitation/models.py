from django.db import models


class WeddingConfig(models.Model):
    groom_name = models.CharField(max_length=100, default="Jasur")
    bride_name = models.CharField(max_length=100, default="Nilufar")
    wedding_date = models.DateField(null=True, blank=True)
    wedding_time = models.TimeField(null=True, blank=True)
    wedding_day_name = models.CharField(max_length=30, default="Shanba")

    ayat_text = models.TextField(
        default="Va u ikkovingiz orasiga mehr va muhabbat soldi. Albatta, bunda fikr yuritadigan qavmlar uchun oyatlar bor."
    )
    ayat_ref = models.CharField(max_length=100, default="Ar-Rum surasi, 21-oyat")

    invite_message = models.TextField(
        default="Siz aziz va qadrli mehmonimiz sifatida to'yimizda ishtirok etishingizni so'raymiz."
    )
    invite_sub = models.TextField(
        default="Sizning mavjudligingiz bizning eng katta xursandchiligimiz."
    )

    venue_name = models.CharField(max_length=200, default='"Guliston" to\'y saroyi')
    venue_address = models.TextField(default="Toshkent shahri, Yunusobod tumani")
    venue_phone = models.CharField(max_length=30, default="+998 90 000 00 00")
    google_maps_url = models.TextField(blank=True)
    yandex_maps_url = models.TextField(blank=True)
    google_maps_embed = models.TextField(blank=True)

    cover_bg = models.ImageField(upload_to='backgrounds/', blank=True)
    hero_bg = models.ImageField(upload_to='backgrounds/', blank=True)
    invitation_bg = models.ImageField(upload_to='backgrounds/', blank=True)
    date_bg = models.ImageField(upload_to='backgrounds/', blank=True)
    program_bg = models.ImageField(upload_to='backgrounds/', blank=True)
    venue_bg = models.ImageField(upload_to='backgrounds/', blank=True)
    maps_bg = models.ImageField(upload_to='backgrounds/', blank=True)

    class Meta:
        verbose_name = "To'y sozlamalari"
        verbose_name_plural = "To'y sozlamalari"

    def save(self, *args, **kwargs):
        self.pk = 1
        super().save(*args, **kwargs)

    def delete(self, *args, **kwargs):
        pass

    def __str__(self):
        return f"{self.groom_name} & {self.bride_name}"


class GalleryImage(models.Model):
    image = models.ImageField(upload_to='gallery/')
    label = models.CharField(max_length=100, blank=True)
    caption = models.CharField(max_length=200, blank=True)
    order = models.PositiveSmallIntegerField(default=0)

    class Meta:
        ordering = ['order']
        verbose_name = "Galereya rasmi"
        verbose_name_plural = "Galereya rasmlari"

    def __str__(self):
        return self.label or f"Rasm {self.pk}"


class ProgramItem(models.Model):
    time = models.CharField(max_length=10)
    event = models.CharField(max_length=200)
    icon = models.CharField(max_length=10, default="◆")
    order = models.PositiveSmallIntegerField(default=0)

    class Meta:
        ordering = ['order']
        verbose_name = "Dastur bandi"
        verbose_name_plural = "Dastur bandlari"

    def __str__(self):
        return f"{self.time} — {self.event}"


class RSVP(models.Model):
    STATUS_CHOICES = [
        ('yes', 'Ha, kelaman'),
        ('no', 'Kela olmayman'),
    ]
    name = models.CharField(max_length=150)
    guest_count = models.PositiveSmallIntegerField(default=1)
    status = models.CharField(max_length=3, choices=STATUS_CHOICES, default='yes')
    message = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']
        verbose_name = "Mehmon javobi"
        verbose_name_plural = "Mehmon javoblari"

    def __str__(self):
        return f"{self.name} — {self.get_status_display()}"
