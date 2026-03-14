from django.contrib import admin
from .models import Lot, QualityForm, FormField


@admin.register(Lot)
class LotAdmin(admin.ModelAdmin):
    list_display = ["code", "species", "tenant", "status", "entry_date", "quantity_kg"]
    list_filter = ["status", "tenant"]
    search_fields = ["code", "species"]


class FormFieldInline(admin.TabularInline):
    model = FormField
    extra = 1


@admin.register(QualityForm)
class QualityFormAdmin(admin.ModelAdmin):
    list_display = ["form_type", "lot", "tenant", "status", "filled_by", "submitted_at"]
    list_filter = ["status", "form_type", "tenant"]
    inlines = [FormFieldInline]
