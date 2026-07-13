from django.contrib import admin
from .models import WeddingConfig, GalleryImage, ProgramItem, RSVP


@admin.register(WeddingConfig)
class WeddingConfigAdmin(admin.ModelAdmin):
    fieldsets = [
        ("Juft haqida", {'fields': ['groom_name', 'bride_name', 'wedding_date', 'wedding_time', 'wedding_day_name']}),
        ("Matnlar", {'fields': ['ayat_text', 'ayat_ref', 'invite_message', 'invite_sub']}),
        ("To'y joyi", {'fields': ['venue_name', 'venue_address', 'venue_phone']}),
        ("Xaritalar", {'fields': ['google_maps_url', 'yandex_maps_url', 'google_maps_embed']}),
        ("Fon rasmlari", {'fields': ['cover_bg', 'hero_bg', 'invitation_bg', 'date_bg', 'program_bg', 'venue_bg', 'maps_bg']}),
    ]

    def has_add_permission(self, request):
        return not WeddingConfig.objects.exists()

    def has_delete_permission(self, request, obj=None):
        return False


@admin.register(GalleryImage)
class GalleryImageAdmin(admin.ModelAdmin):
    list_display = ['label', 'caption', 'order']
    list_editable = ['order']


@admin.register(ProgramItem)
class ProgramItemAdmin(admin.ModelAdmin):
    list_display = ['time', 'event', 'icon', 'order']
    list_editable = ['order']


@admin.register(RSVP)
class RSVPAdmin(admin.ModelAdmin):
    list_display = ['name', 'guest_count', 'status', 'created_at']
    list_filter = ['status']
    search_fields = ['name']
    readonly_fields = ['created_at']
