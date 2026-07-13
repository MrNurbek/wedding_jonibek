import json
from django.shortcuts import render
from django.http import JsonResponse
from django.views.decorators.http import require_POST
from django.views.decorators.csrf import csrf_exempt
from django.utils import timezone
import datetime

from .models import WeddingConfig, GalleryImage, ProgramItem, RSVP


def index(request):
    cfg, _ = WeddingConfig.objects.get_or_create(pk=1)
    gallery = GalleryImage.objects.all()
    program = ProgramItem.objects.all()
    rsvps = RSVP.objects.all()

    yes_qs = rsvps.filter(status='yes')
    no_qs = rsvps.filter(status='no')
    yes_count = sum(r.guest_count for r in yes_qs)
    no_count = no_qs.count()
    total = yes_count

    wedding_date_iso = None
    if cfg.wedding_date and cfg.wedding_time:
        tz = timezone.get_current_timezone()
        dt = datetime.datetime.combine(cfg.wedding_date, cfg.wedding_time)
        dt = timezone.make_aware(dt, tz)
        wedding_date_iso = dt.isoformat()

    return render(request, 'invitation/index.html', {
        'cfg': cfg,
        'gallery': gallery,
        'program': program,
        'rsvps': rsvps,
        'yes_count': yes_count,
        'no_count': no_count,
        'total': total,
        'wedding_date_iso': wedding_date_iso,
    })


@require_POST
def rsvp_submit(request):
    try:
        data = json.loads(request.body)
        name = data.get('name', '').strip()
        if not name:
            return JsonResponse({'success': False, 'error': 'Ism kiritilishi shart'})

        guest_count = max(1, min(5, int(data.get('guest_count', 1))))
        status = data.get('status', 'yes')
        message = data.get('message', '').strip()

        RSVP.objects.create(
            name=name,
            guest_count=guest_count,
            status=status,
            message=message,
        )

        rsvps = RSVP.objects.all()
        yes_count = sum(r.guest_count for r in rsvps.filter(status='yes'))
        no_count = rsvps.filter(status='no').count()

        return JsonResponse({
            'success': True,
            'total': yes_count,
            'yes_count': yes_count,
            'no_count': no_count,
        })
    except Exception as e:
        return JsonResponse({'success': False, 'error': str(e)})
