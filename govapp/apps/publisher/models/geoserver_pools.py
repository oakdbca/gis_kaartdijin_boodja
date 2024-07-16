"""Kaartdijin Boodja Publisher Django Application GeoserverPool Models."""


# Third-Party
from django.db import models
from django.forms import ValidationError
import reversion
import logging
import httpx
import json
import urllib

# Local
from govapp import settings
from govapp.apps.publisher.models.geoserver_roles_groups import GeoServerGroupUser, GeoServerRoleUser
from govapp.common import mixins
from govapp.common.utils import handle_http_exceptions


log = logging.getLogger(__name__)


def encode(s):
    # s = urllib.parsquote(s, safe='')
    s = urllib.parse.quote(s) 
    return s


@reversion.register()
class GeoServerPool(mixins.RevisionedMixin):
    """Model for an Geoserver Pool."""
    name = models.CharField(max_length=200, null=True)
    url = models.URLField()
    username = models.TextField()
    password = models.TextField()
    enabled = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        """Geoserver Pool Model Metadata."""
        verbose_name = "Geoserver Pool"
        verbose_name_plural = "Geoserver Pools"

    def __str__(self) -> str:
        """Provides a string representation of the object.

        Returns:
            str: Human readable string representation of the object.
        """
        # Generate String and Return
        return f"{self.id}: {self.name}" if self.name else f'{self.id}'
    
    @property
    def base_url(self):
        return f"{self.url}/rest/security"
    
    @property
    def auth(self):
        return (self.username, self.password)

    @property
    def total_active_layers(self):
        return self.geoserverpublishchannel_set.filter(active=True).count()

    @property
    def total_inactive_layers(self):
        return self.geoserverpublishchannel_set.exclude(active=True).count()

    @property
    def total_layers(self):
        return self.total_active_layers + self.total_inactive_layers

    def synchronize_groups(self, group_name_list):
        existing_groups = self.get_all_groups()

        # Determine groups to delete (existing groups not in group_name_list)
        groups_to_delete = set(existing_groups) - set(group_name_list)
        for group in groups_to_delete:
            self.delete_existing_group(group)

        # Determine groups to create (groups in group_name_list not in existing groups)
        groups_to_create = set(group_name_list) - set(existing_groups)
        for group in groups_to_create:
            self.create_new_group(group)

    def synchronize_roles(self, role_name_list):
        try:
            # Fetch existing roles from GeoServer
            existing_roles = self.get_all_role()

            # Determine roles to delete (existing roles not in role_name_list)
            roles_to_delete = set(existing_roles) - set(role_name_list)
            for role in roles_to_delete:
                self.delete_existing_role(role)

            # Determine roles to create (roles in role_name_list not in existing roles)
            roles_to_create = set(role_name_list) - set(existing_roles)
            for role in roles_to_create:
                self.create_new_role(role)
        except Exception as e:
            log.error(f'An error occurred during synchronization: {e}')

    ### User
    @handle_http_exceptions(log)
    def get_all_users(self, service_name=''):
        url = f"{self.base_url}/usergroup/service/{encode(service_name)}/users/" if service_name else f"{self.base_url}/usergroup/users/"
        response = httpx.get(
            url=url,
            headers={"Accept": "application/json"},
            auth=self.auth
        )
        response.raise_for_status()
        existing_users = response.json()
        return existing_users['users']

    @handle_http_exceptions(log)
    def update_existing_user(self, user_data, service_name=''):
        url = f"{self.base_url}/usergroup/service/{encode(service_name)}/user/{encode(user_data['user']['userName'])}.json" if service_name else f"{self.base_url}/usergroup/user/{encode(user_data['user']['userName'])}.json"
        response = httpx.post(
            url=url,
            headers={"Content-Type": "application/json"},
            content=json.dumps(user_data),
            auth=self.auth
        )
        response.raise_for_status()
        log.info(f"User: [{user_data['user']['userName']}] has been updated successfully in GeoServer: [{self}].")
        return response

    @handle_http_exceptions(log)
    def create_new_user(self, user_data, service_name=''):
        url = f"{self.base_url}/usergroup/service/{encode(service_name)}/users/" if service_name else f"{self.base_url}/usergroup/users/"
        response = httpx.post(
            url=url,
            headers={"Content-Type": "application/json"},
            content=json.dumps(user_data),
            auth=self.auth
        )
        response.raise_for_status()
        log.info(f"User: [{user_data['user']['userName']}] has been created successfully in the GeoServer: [{self}].")
        return response

    def check_variable(self, variable, variable_name):
        if not variable:
            raise ValidationError(f'{variable_name} cannot be empty string.')

    @handle_http_exceptions(log)
    def delete_existing_user(self, username, service_name=''):
        self.check_variable(username, 'Username')
        url = f"{self.base_url}/usergroup/service/{encode(service_name)}/user/{encode(username)}.json" if service_name else f"{self.base_url}/usergroup/user/{encode(username)}.json"
        response = httpx.delete(
            url=url,
            auth=self.auth
        )
        response.raise_for_status()
        log.info(f"User: [{username}] has been deleted successfully from the GeoServer: [{self}].")
        return response

    @handle_http_exceptions(log)
    def get_about_version(self):
        response = httpx.get(
            url=f"{self.url}/rest/about/version",
            headers={"Accept": "application/json"},
            auth=self.auth
        )
        response.raise_for_status()
        res = response.json()
        return res

    ### Group
    @handle_http_exceptions(log)
    def get_all_groups(self, service_name=''):
        url = f"{self.base_url}/usergroup/service/{encode(service_name)}/groups/" if service_name else f"{self.base_url}/usergroup/groups/"
        response = httpx.get(
            url=url,
            headers={"Accept": "application/json"},
            auth=self.auth
        )
        response.raise_for_status()
        existing_groups = response.json()
        return existing_groups['groups']

    @handle_http_exceptions(log)
    def get_all_groups_for_user(self, username, service_name=''):
        self.check_variable(username, 'Username')
        url = f"{self.base_url}/usergroup/service/{encode(service_name)}/user/{encode(username)}/groups" if service_name else f"{self.base_url}/usergroup/user/{encode(username)}/groups"
        response = httpx.get(
            url=url,
            headers={"Accept": "application/json"},
            auth=self.auth
        )
        response.raise_for_status()
        groups_for_user = response.json()
        return groups_for_user['groups']

    @handle_http_exceptions(log)
    def create_new_group(self, group_name, service_name=''):
        self.check_variable(group_name, 'Group name')
        url = f"{self.base_url}/usergroup/service/{encode(service_name)}/group/{encode(group_name)}.json" if service_name else f"{self.base_url}/usergroup/group/{encode(group_name)}.json"
        response = httpx.post(
            url=url,
            auth=self.auth
        )
        log.info(f"Group: [{group_name}] has been created successfully in the GeoServer: [{self}].")
        return response

    @handle_http_exceptions(log)
    def delete_existing_group(self, group_name, service_name=''):
        self.check_variable(group_name, 'Group name')
        if group_name in settings.NON_DELETABLE_USERGROUPS:
            log.info(f'Group: [{group_name}] cannot be deleted from the geoserver: [{self}]. (USERGROUPS_TO_KEEP: [{settings.NON_DELETABLE_USERGROUPS}])')
            return
        
        url = f"{self.base_url}/usergroup/service/{encode(service_name)}/group/{encode(group_name)}.json" if service_name else f"{self.base_url}/usergroup/group/{encode(group_name)}.json"
        response = httpx.delete(
            url=url,
            auth=self.auth
        )
        response.raise_for_status()
        log.info(f"Group: [{group_name}] has been deleted successfully from the GeoServer: [{self}].")
        return response

    @handle_http_exceptions(log)
    def associate_user_with_group(self, username, group_name, service_name=''):
        self.check_variable(username, 'Username')
        self.check_variable(group_name, 'Group name')
        url = f"{self.base_url}/usergroup/service/{encode(service_name)}/user/{encode(username)}/group/{encode(group_name)}.json" if service_name else f"{self.base_url}/usergroup/user/{encode(username)}/group/{encode(group_name)}.json"
        response = httpx.post(
            url=url,
            auth=self.auth
        )
        response.raise_for_status()
        log.info(f"User: [{username}] has been successfully associated with the group: [{group_name}] in the GeoServer: [{self}].")
        return response

    @handle_http_exceptions(log)
    def disassociate_user_from_group(self, username, group_name, service_name=''):
        self.check_variable(username, 'Username')
        self.check_variable(group_name, 'Group name')
        url = f"{self.base_url}/usergroup/service/{encode(service_name)}/user/{encode(username)}/group/{encode(group_name)}.json" if service_name else f"{self.base_url}/usergroup/user/{encode(username)}/group/{encode(group_name)}.json"
        response = httpx.delete(
            url=url,
            auth=self.auth
        )
        response.raise_for_status()
        log.info(f"User: [{username}] has been successfully unassociated from the group: [{group_name}] in the GeoServer: [{self}].")
        return response

    ### Role
    @handle_http_exceptions(log)
    def get_all_roles(self):
        response = httpx.get(
            url=f"{self.base_url}/roles/",
            headers={"Accept": "application/json"},
            auth=self.auth
        )
        response.raise_for_status()
        existing_roles = response.json()
        return existing_roles['roles']
    
    def get_all_roles_for_user(self, username):
        self.check_variable(username, 'Username')
        response = httpx.get(
            url=f"{self.base_url}/roles/user/{encode(username)}.json",
            headers={"Accept": "application/json"},
            auth=self.auth
        )
        response.raise_for_status()
        roles_for_user = response.json()
        return roles_for_user['roles']

    def get_all_roles_for_group(self, group_name):
        self.check_variable(group_name, 'Group name')
        response = httpx.get(
            url=f"{self.base_url}/roles/group/{encode(group_name)}.json",
            headers={"Accept": "application/json"},
            auth=self.auth
        )
        response.raise_for_status()
        roles_for_group = response.json()
        return roles_for_group['roles']

    def create_new_role(self, role_name):
        self.check_variable(role_name, 'Role name')
        response = httpx.post(
            url=f"{self.base_url}/roles/role/{encode(role_name)}.json",
            auth=self.auth
        )
        response.raise_for_status()
        log.info(f"Role: [{role_name}] has been created successfully in the GeoServer: [{self}].")
        return response

    def delete_existing_role(self, role_name):
        self.check_variable(role_name, 'Role name')
        if role_name in settings.NON_DELETABLE_ROLES:  # We don't want to delete the default group 'ADMIN'
            log.info(f'Role: [{role_name}] cannot be deleted from the geoserver: [{self}]. (ROLES_TO_KEEP: [{settings.NON_DELETABLE_ROLES}])')
            return

        response = httpx.delete(
            url=f"{self.base_url}/roles/role/{encode(role_name)}.json",
            auth=self.auth
        )
        response.raise_for_status()
        log.info(f"Role: [{role_name}] has been deleted successfully in the GeoServer: [{self}].")
        return response

    def associate_role_with_user(self, username, role_name):
        self.check_variable(username, 'Username')
        self.check_variable(role_name, 'Role name')
        response = httpx.post(
            url=f"{self.base_url}/roles/role/{encode(role_name)}/user/{encode(username)}.json",
            auth=self.auth
        )
        response.raise_for_status()
        log.info(f"Role: [{role_name}] has been associated successfully with the user: [{username}] in the GeoServer: [{self}].")
        return response

    def disassociate_role_from_user(self, username, role_name):
        self.check_variable(username, 'Username')
        self.check_variable(role_name, 'Role name')
        response = httpx.delete(
            url=f"{self.base_url}/roles/role/{encode(role_name)}/user/{encode(username)}.json",
            auth=self.auth
        )
        response.raise_for_status()
        log.info(f"Role: [{role_name}] has been disassociated successfully from the user: [{username}] in the GeoServer: [{self}].")
        return response

    def associate_role_with_group(self, role_name, group_name):
        self.check_variable(role_name, 'Role name')
        self.check_variable(group_name, 'Group name')
        response = httpx.post(
            url=f"{self.base_url}/roles/role/{encode(role_name)}/group/{encode(group_name)}.json",
            auth=self.auth
        )
        response.raise_for_status()
        log.info(f"Role: [{role_name}] has been associated successfully with the group: [{group_name}] in the GeoServer: [{self}].")
        return response

    def disassociate_role_from_group(self, role_name, group_name):
        self.check_variable(role_name, 'Role name')
        self.check_variable(group_name, 'Group name')
        response = httpx.delete(
            url=f"{self.base_url}/roles/role/{encode(role_name)}/group/{encode(group_name)}.json",
            auth=self.auth
        )
        response.raise_for_status()
        log.info(f"Role: [{role_name}] has been disassociated successfully from the group: [{group_name}] in the GeoServer: [{self}].")
        return response

    def associate_user_with_groups(self, user):
        group_user_in_kb = GeoServerGroupUser.objects.filter(user=user, geoserver_group__active=True)
        groups_for_user_in_kb = [obj.geoserver_group for obj in group_user_in_kb]
        if groups_for_user_in_kb:
            log.info(f'Group(s): [{groups_for_user_in_kb}] found for the user: [{user.email}] in the KB')
        else:
            log.info(f'No groups found for the user: [{user.email}] in the KB')

        all_groups_in_geoserver = self.get_all_groups(settings.GEOSERVER_USERGROUP_SERVICE_NAME_CUSTOM)
        if all_groups_in_geoserver:
            log.info(f'Group(s): [{all_groups_in_geoserver}] found in the geoserver: [{self}].')
        else:
            log.info(f'No groups found in the geoserver: [{self}].')

        groups_for_user_in_geoserver = self.get_all_groups_for_user(user.email, settings.GEOSERVER_USERGROUP_SERVICE_NAME_CUSTOM)
        if groups_for_user_in_geoserver:
            log.info(f'Group(s): [{groups_for_user_in_geoserver}] for the user: [{user.email}] found in the geoserver: [{self}].')
        else:
            log.info(f'No groups for the user: [{user.email}] found in the geoserver: [{self}].')

        for group_in_kb in groups_for_user_in_kb:
            group_associated = any(group_in_kb.name == group_in_geoserver for group_in_geoserver in groups_for_user_in_geoserver)
            if group_associated:
                log.info(f'Group: [{group_in_kb.name}] is already associated with the user: [{user.email}] in the geoserver: [{self}].')
            else:
                log.info(f'Group: [{group_in_kb.name}] is not associated with the user: [{user.email}] in the geoserver: [{self}].')
                group_exists = any(group_in_kb.name == group_in_geoserver for group_in_geoserver in all_groups_in_geoserver)
                if not group_exists:
                    log.info(f'Group: [{group_in_kb.name}] does not exist in the geoserver: [{self}].')
                    self.create_new_group(group_in_kb.name, settings.GEOSERVER_USERGROUP_SERVICE_NAME_CUSTOM)
                self.associate_user_with_group(user.email, group_in_kb.name, settings.GEOSERVER_USERGROUP_SERVICE_NAME_CUSTOM)
        return groups_for_user_in_kb

    def disassociate_user_from_groups(self, user, groups_for_user_in_kb):
        all_groups_in_geoserver = self.get_all_groups(settings.GEOSERVER_USERGROUP_SERVICE_NAME_CUSTOM)
        if all_groups_in_geoserver:
            log.info(f'Group(s): [{all_groups_in_geoserver}] found in the geoserver: [{self}].')
        else:
            log.info(f'No groups found in the geoserver: [{self}].')

        groups_for_user_in_geoserver = self.get_all_groups_for_user(user.email, settings.GEOSERVER_USERGROUP_SERVICE_NAME_CUSTOM)
        if groups_for_user_in_geoserver:
            log.info(f'Group(s): [{groups_for_user_in_geoserver}] for the user: [{user.email}] found in the geoserver: [{self}].')
        else:
            log.info(f'No groups for the user: [{user.email}] found in the geoserver: [{self}].')

        for group_in_geoserver in groups_for_user_in_geoserver:
            group_associated = any(group_in_geoserver == group_in_kb.name for group_in_kb in groups_for_user_in_kb)
            if not group_associated:
                log.info(f'Group: [{group_in_geoserver}] is associated with the user: [{user.email}] in the geoserver: [{self}], but not in KB')
                self.disassociate_user_from_group(user.email, group_in_geoserver, settings.GEOSERVER_USERGROUP_SERVICE_NAME_CUSTOM)

    def disassociate_user_from_roles(self, user, roles_for_user_in_kb):
        all_roles_in_geoserver = self.get_all_roles()
        log.info(f'Role(s): [{all_roles_in_geoserver}] found in the geoserver: [{self}].')

        roles_for_user_in_geoserver = self.get_all_roles_for_user(user.email)
        log.info(f'Role(s): [{roles_for_user_in_geoserver}] found for the user: [{user.email}] in the geoserver: [{self}].')

        for role_in_geoserver in roles_for_user_in_geoserver:
            role_associated = any(role_in_geoserver == role_in_kb.name for role_in_kb in roles_for_user_in_kb)
            if not role_associated:
                log.info(f'Role: [{role_in_geoserver}] is associated with the user: [{user.email}] in the geoserver: [{self}], but not in KB')
                self.disassociate_role_from_user(user.email, role_in_geoserver)

    def associate_user_with_roles(self, user):
        role_user_in_kb = GeoServerRoleUser.objects.filter(user=user, geoserver_role__active=True)
        roles_for_user_in_kb = [obj.geoserver_role for obj in role_user_in_kb]
        log.info(f'Role(s): [{roles_for_user_in_kb}] found for the user: [{user.email}] in the geoserver: [{self}].')

        all_roles_in_geoserver = self.get_all_roles()
        log.info(f'Role(s): [{all_roles_in_geoserver}] found in the geoserver: [{self}].')

        roles_for_user_in_geoserver = self.get_all_roles_for_user(user.email)
        log.info(f'Role(s): [{roles_for_user_in_geoserver}] for the user: [{user.email}] found in the geoserver: [{self}].')

        for role_in_kb in roles_for_user_in_kb:
            role_associated = any(role_in_kb.name == role_in_geoserver for role_in_geoserver in roles_for_user_in_geoserver)
            if role_associated:
                log.info(f'Role: [{role_in_kb.name}] is already associated with the user: [{user.email}] in the geoserver: [{self}].')
            else:
                log.info(f'Role: [{role_in_kb.name}] is not associated with the user: [{user.email}] in the geoserver: [{self}].')
                role_exists = any(role_in_kb.name == role_in_geoserver for role_in_geoserver in all_roles_in_geoserver)
                if not role_exists:
                    log.info(f'Role: [{role_in_kb.name}] does not exist in the geoserver: [{self}].')
                    self.create_new_role(role_in_kb.name)
                self.associate_role_with_user(user.email, role_in_kb.name)
        return roles_for_user_in_kb