"""Admin for channels"""

from django.contrib import admin
from django.utils.html import format_html

from channels.models import FieldChannel


class FieldChannelAdmin(admin.ModelAdmin):
    """FieldChannel admin model"""

    def field_widget_list(self, instance):
        """Render a link to the WidgetList admin URL"""
        return (
            format_html(
                '<a href="/admin/widgets/widgetlist/{0}/change/"'
                ' target="_blank">WidgetList {0}</a>',
                instance.widget_list.pk,
            )
            if instance.widget_list
            else "No widget"
        )

    model = FieldChannel
    exclude = ("widget_list",)
    search_fields = ("name", "title")
    list_display = ("title", "name", "channel_type")
    list_filter = ("channel_type",)
    readonly_fields = (
        "field_widget_list",
        "updated_on",
        "created_on",
    )


admin.site.register(FieldChannel, FieldChannelAdmin)
