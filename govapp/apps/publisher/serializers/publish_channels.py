"""Kaartdijin Boodja Publisher Django Serializers."""


# Third-Party
import pytz
from rest_framework import serializers

# Local
from govapp.apps.publisher import models


class CDDPPublishChannelSerializer(serializers.ModelSerializer):
    """CDDP Publish Channel Model Serializer."""

    class Meta:
        """CDDP Publish Channel Model Serializer Metadata."""
        model = models.publish_channels.CDDPPublishChannel
        fields = (
            "id",
            "name",
            #"description",
            "published_at",
            "format",
            "mode",
            "frequency",
            "path",
            "xml_path",
            "publish_entry",
        )
        read_only_fields = (
            "id",        
            "published_at",
            "publish_entry",
        )


class CDDPPublishChannelCreateSerializer(serializers.ModelSerializer):
    """CDDP Publish Channel Model Create Serializer."""
    class Meta:
        """CDDP Publish Channel Model Create Serializer Metadata."""
        model = CDDPPublishChannelSerializer.Meta.model
        fields = CDDPPublishChannelSerializer.Meta.fields
        # No read only fields on this serializer
        # This allows the `create` action to specify a Publish Entry
        read_only_fields = (
            "id",
            "published_at",
        )


class GeoServerPublishChannelSerializer(serializers.ModelSerializer):
    """GeoServer Publish Channel Model Serializer."""
    workspace_name = serializers.ReadOnlyField(source='workspace.name')
    geoserver_pool_name = serializers.ReadOnlyField(source='geoserver_pool.name')
    geoserver_pool_url = serializers.SerializerMethodField()
    store_type_name = serializers.ReadOnlyField(source='get_store_type_display')
    published_at = serializers.SerializerMethodField()
    
    class Meta:
        """GeoServer Publish Channel Model Serializer Metadata."""
        model = models.publish_channels.GeoServerPublishChannel
        fields = "__all__"
        read_only_fields = (
            "id",
            "name",
            "published_at",
            "publish_entry",
            "workspace_name",
            "store_type_name",
            "name",
            "description",
            "geoserver_pool_name",
            "geoserver_pool_url",
        )

    def get_published_at(self, obj):
        """Convert published_at to the desired format."""
        if obj.published_at:
            # Convert to local time
            local_time = obj.published_at.astimezone(pytz.timezone('Australia/Perth'))
            # Return formatted string
            return local_time.strftime('%d %b %Y %I:%M %p')
        return None

    def get_geoserver_pool_url(self, obj):
        url = ''
        if obj.geoserver_pool:
            url = f'{obj.geoserver_pool.url}/web/'
        return url
        
    def validate(self, data):
        _validate_bbox(data)
        return data
        


class GeoServerPublishChannelCreateSerializer(serializers.ModelSerializer):
    """GeoServer Publish Channel Model Create Serializer."""
    class Meta:
        """GeoServer Publish Channel Model Create Serializer Metadata."""
        model = GeoServerPublishChannelSerializer.Meta.model
        fields = GeoServerPublishChannelSerializer.Meta.fields
        # No read only fields on this serializer
        # This allows the `create` action to specify a Publish Entry
        read_only_fields = (
            "id",
            "name",
            "published_at",
        )
    
    def validate(self, data):
        _validate_bbox(data)
        return data

def _validate_bbox(data):
    if 'override_bbox' not in data or data['override_bbox'] == False:
        return
    if _has_null(data['native_crs'], 
                    data['nbb_minx'], data['nbb_maxx'], data['nbb_miny'], data['nbb_maxy'], data['nbb_crs'],
                    data['llb_minx'], data['llb_maxx'], data['llb_miny'], data['llb_maxy'], data['llb_crs']):
        raise serializers.ValidationError("'If override_bbox is True, every related fields must be filled.")
        
def _has_null(*args):
    for arg in args:
        if arg == None:
            return True
    return False




class FTPPublishChannelSerializer(serializers.ModelSerializer):
    """FTP Publish Channel Model Serializer."""
    #workspace_name = serializers.ReadOnlyField(source='workspace.name')
    
    class Meta:
        """FTP Publish Channel Model Serializer Metadata."""
        model = models.publish_channels.FTPPublishChannel
        fields = "__all__"
        read_only_fields = (
            "id",
            # "name",
            # "ftp_server",
            # "format",
            # "frequency",
             "published_at",
            # "publish_entry",
            # "path",
            # "description"
        )


class FTPPublishChannelCreateSerializer(serializers.ModelSerializer):
    """FTP Publish Channel Model Create Serializer."""
    class Meta:
        """FTP Publish Channel Model Create Serializer Metadata."""
        model = FTPPublishChannelSerializer.Meta.model
        fields = FTPPublishChannelSerializer.Meta.fields
        # No read only fields on this serializer
        # This allows the `create` action to specify a Publish Entry
        read_only_fields = (
            "id",
            "published_at",
        )




class FTPServerSerializer(serializers.ModelSerializer):
    """FTP Publish Channel Model Serializer."""

    class Meta:
        """CDDP Publish Channel Model Serializer Metadata."""
        model = models.publish_channels.FTPServer
        fields = (
            "id",
            "name",
        )
        read_only_fields = (
            "id",        
            "created"
        )
        
        
class GeoServerQueueSerializer(serializers.ModelSerializer):
    """GeoServer Queue Model Serializer."""
    name = serializers.CharField(source='publish_entry.name')
    status = serializers.SerializerMethodField()
    submitter = serializers.SerializerMethodField()

    class Meta:
        """GeoServer Queue Model Serializer Metadata."""
        model = models.geoserver_queues.GeoServerQueue
        fields = "__all__"
        
    def get_status(self, obj):
        for status in models.geoserver_queues.GeoServerQueueStatus:
            if status == obj.status:
                return status.name
            
    def get_submitter(self, obj):
        first_name = obj.submitter.first_name if hasattr(obj.submitter, 'first_name') else ""
        last_name = obj.submitter.last_name if hasattr(obj.submitter, 'last_name') else ""
        return f"{first_name} {last_name}"