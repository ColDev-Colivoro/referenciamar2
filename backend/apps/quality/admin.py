from django.contrib import admin
from .models import Lot


@admin.register(Lot)
class LotAdmin(admin.ModelAdmin):
    list_display = ["code", "species", "tenant", "status", "entry_date", "quantity_kg"]
    list_filter = ["status", "tenant"]
    search_fields = ["code", "species"]
