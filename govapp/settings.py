"""Django settings for the Kaartdijin Boodja project.

Generated by `django-admin startproject` using Django 3.2.16.

For more information on this file, see
https://docs.djangoproject.com/en/3.2/topics/settings/

For the full list of settings and their values, see
https://docs.djangoproject.com/en/3.2/ref/settings/
"""


# Standard
import os
import pathlib
import platform
import json 
import sys

# Third-Party
import decouple
import dj_database_url


# Build paths inside the project like this: BASE_DIR / "subdir".
BASE_DIR = pathlib.Path(__file__).resolve().parent.parent
STATIC_ROOT = BASE_DIR / "staticfiles"

# Project specific settings
PROJECT_TITLE = "Kaartdijin Boodja"
PROJECT_DESCRIPTION = "DBCA CDDP Catalogue and Publishing Django REST API"
PROJECT_VERSION = "v1"

# Quick-start development settings - unsuitable for production
# See https://docs.djangoproject.com/en/3.2/howto/deployment/checklist/
# SECURITY WARNING: keep the secret key used in production secret!
# SECURITY WARNING: don't run with debug turned on in production!
# SECURITY WARNING: don't allow all hosts in production!
SECRET_KEY = decouple.config("SECRET_KEY")
DEBUG = decouple.config("DEBUG", default=False, cast=bool)
ALLOWED_HOSTS=[""]
if DEBUG is True:
    ALLOWED_HOSTS=["*"]
else: 
    ALLOWED_HOSTS_STRING = decouple.config("ALLOWED_HOSTS", default='[""]')
    ALLOWED_HOSTS = json.loads(ALLOWED_HOSTS_STRING)

# Application definition
INSTALLED_APPS = [
    "django.contrib.admin",
    "django.contrib.auth",
    "django.contrib.contenttypes",
    "django.contrib.sessions",
    "django.contrib.messages",
    "django.contrib.staticfiles",
    "webtemplate_dbca",
    "govapp",
    "govapp.apps.accounts",
    "govapp.apps.catalogue",
    "govapp.apps.emails",
    "govapp.apps.logs",
    "govapp.apps.publisher",
    "govapp.apps.swagger",
    "rest_framework",
    "rest_framework_datatables",
    "drf_spectacular",
    "django_filters",
    "reversion",
    "django_cron",
    "appmonitor_client",
    "django_extensions",
]
REST_FRAMEWORK = {
    'DEFAULT_RENDERER_CLASSES': (
        'rest_framework.renderers.JSONRenderer',
        'rest_framework.renderers.BrowsableAPIRenderer',
        'rest_framework_datatables.renderers.DatatablesRenderer',
    ),
    'DEFAULT_FILTER_BACKENDS': (
        'rest_framework_datatables.filters.DatatablesFilterBackend',
    ),
    'DEFAULT_PAGINATION_CLASS': 'rest_framework_datatables.pagination.DatatablesPageNumberPagination',
    'PAGE_SIZE': 50,
}
MIDDLEWARE = [
    "django.middleware.security.SecurityMiddleware",
    "django.contrib.sessions.middleware.SessionMiddleware",
    "django.middleware.common.CommonMiddleware",
    "django.middleware.csrf.CsrfViewMiddleware",
    "django.contrib.auth.middleware.AuthenticationMiddleware",
    "django.contrib.messages.middleware.MessageMiddleware",
    "django.middleware.clickjacking.XFrameOptionsMiddleware",
    "dbca_utils.middleware.SSOLoginMiddleware",
    "whitenoise.middleware.WhiteNoiseMiddleware",
    "govapp.middleware.CacheControl",
    'django.middleware.locale.LocaleMiddleware',
]
ROOT_URLCONF = "govapp.urls"
TEMPLATES = [
    {
        "BACKEND": "django.template.backends.django.DjangoTemplates",
        "DIRS": [
            BASE_DIR / "govapp/templates",
        ],
        "APP_DIRS": True,
        "OPTIONS": {
            "context_processors": [
                "django.template.context_processors.debug",
                "django.template.context_processors.request",
                "django.contrib.auth.context_processors.auth",
                "django.contrib.messages.context_processors.messages",
                "govapp.context_processors.variables",
            ],
        },
    },
]
WSGI_APPLICATION = "govapp.wsgi.application"

# Database
# https://docs.djangoproject.com/en/3.2/ref/settings/#databases
DATABASES = {
    "default": decouple.config("DATABASE_URL", cast=dj_database_url.parse, default="sqlite://memory"),
}

# Password validation
# https://docs.djangoproject.com/en/3.2/ref/settings/#auth-password-validators
AUTH_PASSWORD_VALIDATORS = [
    {"NAME": "django.contrib.auth.password_validation.UserAttributeSimilarityValidator"},
    {"NAME": "django.contrib.auth.password_validation.MinimumLengthValidator"},
    {"NAME": "django.contrib.auth.password_validation.CommonPasswordValidator"},
    {"NAME": "django.contrib.auth.password_validation.NumericPasswordValidator"},
]

# Internationalization
# https://docs.djangoproject.com/en/3.2/topics/i18n/
LANGUAGE_CODE = "en-au"
#TIME_ZONE = "UTC"
USE_I18N = True
USE_L10N = True
USE_TZ = True

# Static files (CSS, JavaScript, Images)
# https://docs.djangoproject.com/en/3.2/howto/static-files/
STATIC_URL = "/static/"
STATICFILES_DIRS = [
    BASE_DIR / "govapp/static",  # Look for static files in the frontend
    # BASE_DIR / "govapp/frontend/node_modules"  # node modules that are collected and used in the frontend
]

# Default primary key field type
# https://docs.djangoproject.com/en/3.2/ref/settings/#default-auto-field
DEFAULT_AUTO_FIELD = "django.db.models.BigAutoField"

# Caching settings
# https://docs.djangoproject.com/en/3.2/ref/settings/#caches
CACHES = {
    "default": {
        "BACKEND": "django.core.cache.backends.filebased.FileBasedCache",
        "LOCATION": BASE_DIR / "cache",
        "OPTIONS": {"MAX_ENTRIES": 10000},
    }
}

# DBCA Template Settings
# https://github.com/dbca-wa/django-base-template/blob/main/govapp/settings.py
DEV_APP_BUILD_URL = decouple.config("DEV_APP_BUILD_URL", default=None)
ENABLE_DJANGO_LOGIN = decouple.config("ENABLE_DJANGO_LOGIN", default=False, cast=bool)
LEDGER_TEMPLATE = "bootstrap5"
GIT_COMMIT_HASH = os.popen(f"cd {BASE_DIR}; git log -1 --format=%H").read()  # noqa: S605
GIT_COMMIT_DATE = os.popen(f"cd {BASE_DIR}; git log -1 --format=%cd").read()  # noqa: S605
VERSION_NO = "2.00"

# Django REST Framework Settings
# https://www.django-rest-framework.org/api-guide/settings/
REST_FRAMEWORK = {
    "DEFAULT_SCHEMA_CLASS": "drf_spectacular.openapi.AutoSchema",
    "DEFAULT_FILTER_BACKENDS": [
        "django_filters.rest_framework.DjangoFilterBackend",
        "rest_framework.filters.SearchFilter",
    ],
    "DEFAULT_PAGINATION_CLASS": "rest_framework.pagination.LimitOffsetPagination",
    "PAGE_SIZE": 100,
}

# DRF Spectacular Settings
# https://drf-spectacular.readthedocs.io/en/latest/settings.html
SPECTACULAR_SETTINGS = {
    "TITLE": PROJECT_TITLE,
    "DESCRIPTION": PROJECT_DESCRIPTION,
    "VERSION": PROJECT_VERSION,
    "SERVE_INCLUDE_SCHEMA": True,
    "POSTPROCESSING_HOOKS": [],
    "COMPONENT_SPLIT_REQUEST": True,
}

path_to_logs = os.path.join(BASE_DIR, 'logs')
if not os.path.exists(path_to_logs):
    os.mkdir(path_to_logs)

# Logging
# https://docs.djangoproject.com/en/3.2/topics/logging/
LOGGING = {
    "version": 1,
    'formatters': {
        'verbose2': {
            "format": "%(levelname)s %(asctime)s %(name)s [Line:%(lineno)s][%(funcName)s] %(message)s"
        }
    },
    "disable_existing_loggers": False,
    "handlers": {
        "console": {
            'level': 'DEBUG',
            'class': 'logging.StreamHandler',
            'formatter': 'verbose2',
        },
        'file': {
            'level': 'INFO',
            'class': 'logging.handlers.RotatingFileHandler',
            'filename': os.path.join(BASE_DIR, 'logs', 'kaartdijin_boodja.log'),
            'formatter': 'verbose2',
            'maxBytes': 5242880
        },
        'file_for_sql': {
            'level': 'DEBUG',
            'class': 'logging.handlers.RotatingFileHandler',
            'filename': os.path.join(BASE_DIR, 'logs', 'kaartdijin_boodja_sql.log'),
            'formatter': 'verbose2',
            'maxBytes': 5242880
        },
    },
    'loggers': {
        '': {
            'handlers': ['file', 'console'],
            'level': 'DEBUG',
            'propagate': True
        },
        # Log SQL
        # 'django.db.backends': {
        #     'level': 'DEBUG',
        #     'handlers': ['file_for_sql'],
        #     'propagate': False,
        # },
    }
}
ENABLE_SQL_LOGGING = decouple.config("ENABLE_SQL_LOGGING", default=False, cast=bool)
if ENABLE_SQL_LOGGING:
    LOGGING['loggers']['django.db.backends'] = {
        'level': 'DEBUG',
        'handlers': ['file_for_sql'],
        'propagate': False,
    }


# Sharepoint Settings
# Sharepoint Input settings are for the Catalogue (Input)
SHAREPOINT_INPUT_URL = decouple.config("SHAREPOINT_INPUT_URL", default="https://dpaw.sharepoint.com/teams/KaartdijinBoodja-dev")  # noqa: E501
SHAREPOINT_INPUT_USERNAME = decouple.config("SHAREPOINT_INPUT_USERNAME", default=None)
SHAREPOINT_INPUT_PASSWORD = decouple.config("SHAREPOINT_INPUT_PASSWORD", default=None)
SHAREPOINT_INPUT_LIST = decouple.config("SHAREPOINT_INPUT_LIST", default="Shared Documents")
SHAREPOINT_INPUT_STAGING_AREA = decouple.config("SHAREPOINT_INPUT_STAGING_AREA", default="KaartdijinBoodjaLayerSubmissionStagingArea")  # noqa: E501
SHAREPOINT_INPUT_ARCHIVE_AREA = decouple.config("SHAREPOINT_INPUT_ARCHIVE_AREA", default="KaartdijinBoodjaLayerSubmissionArchive")  # noqa: E501
# Sharepoint Output settings are for the Publisher (Output)
SHAREPOINT_OUTPUT_URL = decouple.config("SHAREPOINT_OUTPUT_URL", default="https://dpaw.sharepoint.com/teams/oim-cddp-UAT")  # noqa: E501
SHAREPOINT_OUTPUT_USERNAME = decouple.config("SHAREPOINT_OUTPUT_USERNAME", default=None)
SHAREPOINT_OUTPUT_PASSWORD = decouple.config("SHAREPOINT_OUTPUT_PASSWORD", default=None)
SHAREPOINT_OUTPUT_LIST = decouple.config("SHAREPOINT_OUTPUT_LIST", default="Shared Documents")
SHAREPOINT_OUTPUT_PUBLISH_AREA = decouple.config("SHAREPOINT_OUTPUT_PUBLISH_AREA", default="GIS1-Corporate/Data")  # noqa: E501

# Azure Settings
# Azure Output settings are for the Publisher (Output) CDDP
AZURE_OUTPUT_SYNC_DIRECTORY = decouple.config("AZURE_OUTPUT_SYNC_DIRECTORY", default="sync")
if not os.path.exists(AZURE_OUTPUT_SYNC_DIRECTORY):
    os.mkdir(AZURE_OUTPUT_SYNC_DIRECTORY)

# Email
#DISABLE_EMAIL = decouple.config("DISABLE_EMAIL", default=False, cast=bool)
#EMAIL_BACKEND = "django.core.mail.backends.smtp.EmailBackend"
EMAIL_BACKEND = "wagov_utils.components.utils.email_backend.EmailBackend"
EMAIL_HOST = decouple.config("EMAIL_HOST", default="smtp.lan.fyi")
EMAIL_PORT = decouple.config("EMAIL_PORT", default=25, cast=int)
DEFAULT_FROM_EMAIL = "no-reply@dbca.wa.gov.au"
EMAIL_INSTANCE = decouple.config("EMAIL_INSTANCE", default="PROD")
NON_PROD_EMAIL = decouple.config("NON_PROD_EMAIL", default="")
PRODUCTION_EMAIL= decouple.config("PRODUCTION_EMAIL", default=False, cast=bool)
EMAIL_DELIVERY = decouple.config("EMAIL_DELIVERY", default="off")

# Group Settings
# This must match what is in the database
# GROUP_ADMINISTRATOR_ID = 1
# GROUP_ADMINISTRATOR_NAME = "Administrators"
# GROUP_CATALOGUE_EDITOR_ID = 2
# GROUP_CATALOGUE_EDITOR_NAME = "Catalogue Editors"
GROUP_ADMINISTRATORS = 'Administrators'
GROUP_CATALOGUE_EDITORS = 'Catalogue Editors'
GROUP_CATALOGUE_ADMIN = 'Catalogue Admin'
GROUP_API_USER = 'API User'
CUSTOM_GROUPS = [
    # Groups in this list are created automatically if not exist.
    # This is not the geoserver usergroup
    GROUP_ADMINISTRATORS,
    GROUP_CATALOGUE_EDITORS,
    GROUP_CATALOGUE_ADMIN,
    GROUP_API_USER,
]

# Cron Jobs
# https://django-cron.readthedocs.io/en/latest/installation.html
# https://django-cron.readthedocs.io/en/latest/configuration.html
#CRON_SCANNER_CLASS = "govapp.apps.catalogue.cron.ScannerCronJob"
POSTGRES_SCANNER_PERIOD_MINS = decouple.config('POSTGRES_SCANNER_PERIOD_MINS', default=2)
SHAREPOINT_SCANNER_PERIOD_MINS = decouple.config('SHAREPOINT_SCANNER_PERIOD_MINS', default=2)
DIRECTORY_SCANNER_PERIOD_MINS = decouple.config('DIRECTORY_SCANNER_PERIOD_MINS', default=2)
PUBLISH_GEOSERVER_QUEUE_PERIOD_MINS = decouple.config('PUBLISH_GEOSERVER_QUEUE_PERIOD_MINS', default=2)
GEOSERVER_LAYER_HEALTH_CHECK_PERIOD_MINS = decouple.config('GEOSERVER_LAYER_HEALTH_CHECK_PERIOD_MINS', default=2)
GEOSERVER_SYNC_LAYERS_PERIOD_MINS = decouple.config('GEOSERVER_SYNC_LAYERS_PERIOD_MINS', default=2)
GEOSERVER_SYNC_RULES_PERIOD_MINS = decouple.config('GEOSERVER_SYNC_RULES_PERIOD_MINS', default=2)
GEOSERVER_SYNC_USERS_PERIOD_MINS = decouple.config('GEOSERVER_SYNC_USERS_PERIOD_MINS', default=2)
CRON_CLASSES = [
    "govapp.apps.catalogue.cron.PostgresScannerCronJob",
    "govapp.apps.catalogue.cron.SharepointScannerCronJob",
    "govapp.apps.catalogue.cron.DirectoryScannerCronJob",
    "govapp.apps.publisher.cron.PublishGeoServerQueueCronJob",
    "govapp.apps.publisher.cron.GeoServerLayerHealthcheckCronJob",
    "govapp.apps.publisher.cron.GeoServerSyncLayersCronJob", # layers
    "govapp.apps.publisher.cron.GeoServerSyncRulesCronJob", # rules
    "govapp.apps.accounts.cron.GeoServerSyncUsersCronJob", # users
    'appmonitor_client.cron.CronJobAppMonitorClient'
]
MANAGEMENT_COMMANDS_PAGE_ENABLED = decouple.config('MANAGEMENT_COMMANDS_PAGE_ENABLED', default=False)

# GeoServer Settings
GEOSERVER_URL = decouple.config("GEOSERVER_URL", default="http://127.0.0.1:8600/geoserver")
GEOSERVER_USERNAME = decouple.config("GEOSERVER_USERNAME", default="admin")
GEOSERVER_PASSWORD = decouple.config("GEOSERVER_PASSWORD", default="geoserver")
GEOSERVER_SECURITY_FILE_PATH=decouple.config("GEOSERVER_SECURITY_FILE_PATH", default="./config/geoserver_security/")

# Users, Groups, Roles
DEFAULT_USERS_IN_GEOSERVER = ['admin']
DEFAULT_ROLES_IN_GEOSERVER = ['ADMIN', 'GROUP_ADMIN', 'ROLE_AUTHENTICATED', 'ROLE_ANONYMOUS',]
DEFAULT_USER_ROLES = [{'admin': ['ADMIN',]},]  # default user: 'admin' has a default role 'ADMIN'
DEFAULT_USERGROUPS_IN_GEOSERVER = []
NON_DELETABLE_USERS = decouple.config("NON_DELETABLE_USERS", default='admin').split(',') + DEFAULT_USERS_IN_GEOSERVER
NON_DELETABLE_ROLES = decouple.config("NON_DELETABLE_ROLES", default='').split(',') + DEFAULT_ROLES_IN_GEOSERVER # .env example: ROLES_TO_KEEP=ADMIN,GROUP_ADMIN,ROLE1
NON_DELETABLE_USERGROUPS = decouple.config("NON_DELETABLE_USERGROUPS", default='').split(',') + DEFAULT_USERGROUPS_IN_GEOSERVER  # .env example: USERGROUPS_TO_KEEP=ADMIN_GROUP,GROUP1,GROUP2
GEOSERVER_USERGROUP_SERVICE_NAME_DEFAULT=decouple.config("GEOSERVER_DEFAULT_USERGROUP_SERVICE_NAME", "default")
GEOSERVER_USERGROUP_SERVICE_NAME_CUSTOM=decouple.config("GEOSERVER_CUSTOM_USERGROUP_SERVICE_NAME", "dbca")
GEOSERVER_USERGROUP_SERVICE_NAMES = [GEOSERVER_USERGROUP_SERVICE_NAME_DEFAULT, GEOSERVER_USERGROUP_SERVICE_NAME_CUSTOM,]

GEOSERVER_CUSTOM_AUTHENTICATION_PROVIDER_NAME=decouple.config("GEOSERVER_CUSTOM_AUTHENTICATION_PROVIDER_NAME", "dbca")

# Temporary Fix for ARM Architecture
if platform.machine() == "arm64":
    GDAL_LIBRARY_PATH = "/opt/homebrew/opt/gdal/lib/libgdal.dylib"
    GEOS_LIBRARY_PATH = "/opt/homebrew/opt/geos/lib/libgeos_c.dylib"

# Local Storage Paths
PENDING_IMPORT_PATH=decouple.config("PENDING_IMPORT_PATH", default="./pending_imports/")
if not os.path.exists(PENDING_IMPORT_PATH):
    os.makedirs(PENDING_IMPORT_PATH)
DATA_STORAGE=decouple.config("DATA_STORAGE", default="./data_storage/")

# Django Timezone
TIME_ZONE = 'Australia/Perth'
# DATE_FORMAT = 'dd/mm/YYYY'
# DATETIME_FORMAT = 'dd/mm/YYYY HH:ii:ss'
# SHORT_DATE_FORMAT = 'dd/mm/YY'
# SHORT_DATETIME_FORMAT = 'dd/mm/YY HH:ii'

# Layer Subscription
WMS_URL = "https://mesonet.agron.iastate.edu/cgi-bin/wms/us/mrms.cgi?"
WMS_CACHE_KEY = "wms native layer names"
WFS_URL = "https://mesonet.agron.iastate.edu/cgi-bin/wms/us/mrms.cgi?"
WFS_CACHE_KEY = "wfs native layer names"
POST_GIS_CACHE_KEY = "post gis table names"
SUBSCRIPTION_CACHE_TTL = 3600

APPLICATION_VERSION = decouple.config("APPLICATION_VERSION", default="1.0.0" + "-" + GIT_COMMIT_HASH[:7])
RUNNING_DEVSERVER = len(sys.argv) > 1 and sys.argv[1] == "runserver"

CSRF_TRUSTED_ORIGINS_STRING = decouple.config("CSRF_TRUSTED_ORIGINS", default='[]')
CSRF_TRUSTED_ORIGINS = json.loads(str(CSRF_TRUSTED_ORIGINS_STRING))


# Sentry settings
SENTRY_DSN = decouple.config("SENTRY_DSN", default=None)
SENTRY_SAMPLE_RATE = decouple.config("SENTRY_SAMPLE_RATE", default=1.0)  # Error sampling rate
SENTRY_TRANSACTION_SAMPLE_RATE = decouple.config("SENTRY_TRANSACTION_SAMPLE_RATE", default=0.0)  # Transaction sampling

WEBHOOK_ENABLED = decouple.config("WEBHOOK_ENABLED", default=False)

# Catalogue entry type to be displayed on the catalogue entry list page
CATALOGUE_ENTRY_TYPE_TO_DISPLAY = decouple.config("CATALOGUE_ENTRY_TYPE_TO_DISPLAY", default='1,2,3,4,5')
                                                                                                            # SPATIAL_FILE = 1
                                                                                                            # SUBSCRIPTION_WFS = 2
                                                                                                            # SUBSCRIPTION_WMS = 3
                                                                                                            # SUBSCRIPTION_POSTGIS = 4
                                                                                                            # SUBSCRIPTION_QUERY = 5
CDDP_USER_PATH = decouple.config("CDDP_USER_PATH", "V:/GIS1-Corporate/Data/")


if not RUNNING_DEVSERVER and SENTRY_DSN and EMAIL_INSTANCE:
    import sentry_sdk

    sentry_sdk.init(
        dsn=SENTRY_DSN,
        sample_rate=SENTRY_SAMPLE_RATE,
        traces_sample_rate=SENTRY_TRANSACTION_SAMPLE_RATE,
        environment=EMAIL_INSTANCE.lower(),
        release=APPLICATION_VERSION,
    )
