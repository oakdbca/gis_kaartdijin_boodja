"""Kaartdijin Boodja Publisher Django Application Administration."""

import pprint

# Third-Party
from typing import Any
from django import forms
from django.contrib.admin.widgets import FilteredSelectMultiple
from django.contrib import admin, auth
from django.utils.safestring import mark_safe
import reversion.admin
from django.utils.html import format_html

# Local
from govapp.apps.catalogue.admin import construct_catalogue_entry_link
from govapp.apps.publisher import models
from govapp.apps.publisher.models.geoserver_roles_groups import GeoServerGroupUser, GeoServerRoleUser


def construct_publish_entry_link(publish_entry):
    return format_html(f'<a href="/admin/publisher/publishentry/{publish_entry.id}/change/">{publish_entry.name}</a>')


class PublishEntryAdmin(reversion.admin.VersionAdmin):
    """Custom Django Admin for Publish Entries."""
    # This provides a better interface for `ManyToMany` fields
    # See: https://stackoverflow.com/questions/5385933/a-better-django-admin-manytomany-field-widget
    search_fields = ('id', 'catalogue_entry__name',)
    filter_horizontal = ["editors"]
    list_display = ('id', 'catalogue_entry_link', 'status', 'assigned_to', 'published_at')
    list_filter = ('status', 'assigned_to',)
    ordering = ('-id',)

    def catalogue_entry_link(self, obj):
        return construct_catalogue_entry_link(obj.catalogue_entry)
    catalogue_entry_link.short_description = 'Catalogue Entry'


class GeoServerPoolAdmin(reversion.admin.VersionAdmin):
    """Custom Django Admin for GeoServer Pool."""
    # This provides a better interface for `ManyToMany` fields
    # See: https://stackoverflow.com/questions/5385933/a-better-django-admin-manytomany-field-widget
    search_fields = ('id', 'name', 'url',)
    list_display = ('id', 'name', 'url_link', 'version', 'num_of_layers', 'username', 'enabled', 'created_at')
    list_filter = ('enabled',)
    list_display_links = ('id', 'name',)
    ordering = ('id', 'name')

    def num_of_layers(self, obj):
        return f'{obj.total_active_layers} ({obj.total_layers})'
    num_of_layers.short_description = 'active layers (total layers)'

    def url_link(self, obj):
        return format_html(f'<a href="{obj.url}" target="_blank">{obj.url}</a>')
    url_link.short_description = 'URL'

    def version(self, obj):
        try:
            version = obj.get_about_version()
            for resource in version['about']['resource']:
                if resource['@name'] == "GeoServer":
                    return resource['Version']
            return '---'
        except Exception as e:
            return '---'
    version.short_description = 'Geoserver Version'


class GeoServerPublishChannelAdmin(reversion.admin.VersionAdmin):
    search_fields = ('id', 'publish_entry__catalogue_entry__name', 'geoserver_pool__name', 'workspace__name',)
    list_display = ('id', 'publish_entry_link', 'geoserver_pool_link', 'store_type', 'mode', 'frequency', 'workspace_link', 'active',)
    list_filter = ('geoserver_pool', 'store_type', 'mode', 'frequency', 'workspace', 'active',)
    raw_id_fields = ('publish_entry',)

    def publish_entry_link(self, obj):
        # publish_entry = obj.publish_entry
        # return format_html(f'<a href="/admin/publisher/publishentry/{publish_entry.id}/change/">{publish_entry.name}</a>')
        return construct_publish_entry_link(obj.publish_entry)
    publish_entry_link.short_description = 'Publish Entry'

    def geoserver_pool_link(self, obj):
        return format_html(f'<a href="/admin/publisher/geoserverpool/{obj.geoserver_pool.id}/change/">{obj.geoserver_pool.name}</a>') if obj.geoserver_pool else '-'
    geoserver_pool_link.short_description = 'Geoserver Pool'

    def workspace_link(self, obj):
        return format_html(f'<a href="/admin/publisher/workspace/{obj.workspace.id}/change/">{obj.workspace.name}</a>') if obj.workspace else '-'
    workspace_link.short_description = 'Workspace'


class CDDPPublishChannelAdmin(reversion.admin.VersionAdmin):
    search_fields = ('id', 'publish_entry__description',)
    list_display = ('id', 'publish_entry_link', 'format', 'mode', 'frequency', 'path', 'xml_path', 'published_at',)
    list_filter = ('format', 'mode', 'frequency',)
    raw_id_fields = ('publish_entry',)
    
    def publish_entry_link(self, obj):
        return construct_publish_entry_link(obj.publish_entry)
    publish_entry_link.short_description = 'Publish Entry'


class GeoServerQueueAdmin(reversion.admin.VersionAdmin):
    """Custom Django Admin for GeoServer Queue."""
    # This provides a better interface for `ManyToMany` fields
    # See: https://stackoverflow.com/questions/5385933/a-better-django-admin-manytomany-field-widget
    search_fields = ('id', 'publish_entry__catalogue_entry__name', 'submitter__email',)
    list_display = ('id', 'publish_entry_link', 'symbology_only', 'status', 'success', 'submitter_link','started_at', 'completed_at', 'created_at')
    list_filter = ('symbology_only', 'status', 'success',)
    ordering = ('-id',)
    raw_id_fields = ('submitter', 'publish_entry')

    def publish_entry_link(self, obj):
        return construct_publish_entry_link(obj.publish_entry)
    publish_entry_link.short_description = 'Publish Entry'

    def submitter_link(self, obj):
        return format_html(f'<a href="/admin/auth/user/{obj.submitter.id}/change">{obj.submitter}</a>') if obj.submitter else '-'
    submitter_link.short_description = 'Submitter'


class FTPPublishChannelAdmin(reversion.admin.VersionAdmin):
    """Custom Django Admin for GeoServer Pool."""
    # This provides a better interface for `ManyToMany` fields
    # See: https://stackoverflow.com/questions/5385933/a-better-django-admin-manytomany-field-widget
    list_display = ('id', 'name', 'ftp_server', 'format', 'frequency','published_at','publish_entry','created')
    ordering = ('id',)
    raw_id_fields = ('ftp_server','publish_entry')


class GeoServerRolePermissionInline(admin.TabularInline):
    model = models.geoserver_roles_groups.GeoServerRolePermission
    extra = 1  # Number of empty forms to display
    # fields = ['workspace', 'read', 'write', 'admin', 'active']
    fields = ['geoserver_role', 'active', 'read', 'write', 'admin']


class GeoServerGroupRoleInline(admin.TabularInline):
    model = models.geoserver_roles_groups.GeoServerGroupRole
    extra = 1  # Number of empty forms to display
    fields = ['geoserver_role', 'active',]


class GeoServerGroupUserInline(admin.TabularInline):
    model = models.geoserver_roles_groups.GeoServerGroupUser
    extra = 1  # Number of empty forms to display
    fields = ['geoserver_group', 'user',]


class GeoServerRoleUserInline(admin.TabularInline):
    model = models.geoserver_roles_groups.GeoServerRoleUser
    extra = 1  # Number of empty forms to display
    fields = ['geoserver_role', 'user',]


class GeoServerRoleAdmin(reversion.admin.VersionAdmin):
    search_fields = ('id', 'name',)
    list_display = ('id', 'name', 'get_geoserver_users', 'active', 'created_at',)
    exclude = ('parent_role',)  # API doesn't support to handle parent role.  Hide this field for now.
    list_filter = ('active', )
    list_display_links = ('id', 'name')
    inlines = [GeoServerRoleUserInline,]

    def get_geoserver_users(self, obj):
        geoserver_role_users = GeoServerRoleUser.objects.filter(geoserver_role=obj)
        users = '<br>'.join([geoserver_role_user.user.email for geoserver_role_user in geoserver_role_users])
        return format_html(users)
    get_geoserver_users.short_description = 'users'


class WorkspaceAdmin(reversion.admin.VersionAdmin):
    search_fields = ('id', 'name',)
    list_display = ('id', 'name', 'display_geoserver_roles')
    list_display_links = ('id', 'name')
    inlines = [GeoServerRolePermissionInline,]

    def display_geoserver_roles(self, obj):
        geoserver_role_permissions = models.geoserver_roles_groups.GeoServerRolePermission.objects.filter(workspace=obj)
        table_rows = []
        true_icon = '<img src="/static/admin/img/icon-yes.svg" alt="True">'
        false_icon = '<img src="/static/admin/img/icon-no.svg" alt="False">'
        if not geoserver_role_permissions:
            return 'No related geoserver roles found.'
        for index, perm in enumerate(geoserver_role_permissions):
            if index == 0:
                table_rows.append('<tr><th style="width: 25%;text-align: center;">Permission Active</th><th style="">Role Status and Name</th><th style="width: 10%;text-align: center;">Read</th><th style="width: 10%;text-align: center;">Write</th><th style="width: 10%;text-align: center;">Admin</th></tr>')
            perm_active_icon = true_icon if perm.active else false_icon
            role_active_icon = true_icon if perm.geoserver_role.active else false_icon
            role_name = perm.geoserver_role.name
            role_id = perm.geoserver_role.id
            read_icon = true_icon if perm.read else false_icon
            write_icon = true_icon if perm.write else false_icon
            admin_icon = true_icon if perm.admin else false_icon
            table_row = f'<tr><td style="text-align: center;">{perm_active_icon}</td><td>{role_active_icon} <a href="/admin/publisher/geoserverrole/{role_id}/change">{role_name}</a></td><td style="text-align: center;">{read_icon}</td><td style="text-align: center;">{write_icon}</td><td style="text-align: center;">{admin_icon}</td></tr>'
            table_rows.append(table_row)
        table_html = f'<table>{"".join(table_rows)}</table>'
        return mark_safe(table_html)
    display_geoserver_roles.short_description = 'Geoserver Roles and Permissions'


class GeoServerGroupForm(forms.ModelForm):
    # Meta class to specify the model and fields to include in the form
    class Meta:
        model = models.geoserver_roles_groups.GeoServerGroup  # The model associated with this form
        fields = '__all__'  # Include all fields from the GeoServerGroup model

    # A field for selecting multiple GeoServerRole instances
    geoserver_roles = forms.ModelMultipleChoiceField(
        queryset=models.geoserver_roles_groups.GeoServerRole.objects.all(),  # Queryset of GeoServerRole objects to choose from
        required=False,  # This field is optional
        widget=FilteredSelectMultiple(verbose_name='GeoServer Roles', is_stacked=False)  # Use a widget with a filterable multiple select interface
    )


class GeoServerGroupAdmin(reversion.admin.VersionAdmin):
    search_fields = ('id', 'name',)
    list_display = ('id', 'name', 'get_geoserver_roles', 'get_geoserver_users', 'geoserver_usergroup_service','active', 'created_at',)
    readonly_fields = ('geoserver_usergroup_service',)
    list_filter = ('active',)
    list_display_links = ('id', 'name')
    # form = GeoServerGroupForm  # <== This line adds the FilteredSelectMultiple widget.
    inlines = [GeoServerGroupRoleInline, GeoServerGroupUserInline,]

    def get_geoserver_roles(self, obj):
        roles = '<br>'.join([role.name for role in obj.geoserver_roles.all()])
        return format_html(roles)
    get_geoserver_roles.short_description = 'roles'

    def get_geoserver_users(self, obj):
        geoserver_group_users = GeoServerGroupUser.objects.filter(geoserver_group=obj)
        users = '<br>'.join([geoserver_group_user.user.email for geoserver_group_user in geoserver_group_users])
        return format_html(users)
    get_geoserver_users.short_description = 'users'


class EmailNotificationAdmin(reversion.admin.VersionAdmin):
    search_fields = ('id','name','email',)
    list_display = ('id', 'name', 'type', 'email', 'active', 'publish_entry_link')
    list_filter = ('type', 'active',)
    raw_id_fields = ('publish_entry',)
    ordering = ('id',)

    def publish_entry_link(self, obj):
        return construct_publish_entry_link(obj.publish_entry)
    publish_entry_link.short_description = 'Publish Entry'


# class GeoserverGroupUserAdmin(reversion.admin.VersionAdmin):
#     list_display = ('id', 'user_link', 'geoserver_group_link', 'created_at',)
#     raw_id_fields = ('user',)

#     def geoserver_group_link(self, obj):
#         if obj.geoserver_group:
#             return format_html(f'<a href="/admin/publisher/geoservergroup/{obj.geoserver_group.id}/change">{obj.geoserver_group}</a>')
#         else:
#             return '-'
#     geoserver_group_link.short_description = 'Geoserver Group'

#     def user_link(self, obj):
#         if obj.user:
#             return format_html(f'<a href="/admin/auth/user/{obj.user.id}/change">{obj.user}</a>')
#         else:
#             return '-'
#     user_link.short_description = 'User'


# class GeoserverRoleUserAdmin(reversion.admin.VersionAdmin):
#     list_display = ('id', 'user', 'geoserver_role', 'created_at',)
#     raw_id_fields = ('user',)


admin.site.register(models.publish_channels.FTPServer, reversion.admin.VersionAdmin)
admin.site.register(models.publish_channels.FTPPublishChannel, FTPPublishChannelAdmin)
admin.site.register(models.publish_channels.CDDPPublishChannel, CDDPPublishChannelAdmin)
admin.site.register(models.publish_channels.GeoServerPublishChannel, GeoServerPublishChannelAdmin)
admin.site.register(models.publish_entries.PublishEntry, PublishEntryAdmin)
admin.site.register(models.notifications.EmailNotification, EmailNotificationAdmin)
admin.site.register(models.workspaces.Workspace, WorkspaceAdmin)
admin.site.register(models.geoserver_pools.GeoServerPool, GeoServerPoolAdmin)
admin.site.register(models.geoserver_queues.GeoServerQueue, GeoServerQueueAdmin)
admin.site.register(models.geoserver_roles_groups.GeoServerRole, GeoServerRoleAdmin)
admin.site.register(models.geoserver_roles_groups.GeoServerGroup, GeoServerGroupAdmin)
