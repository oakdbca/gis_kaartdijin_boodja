let catalogue_entry_type = {
    SPATIAL_FILE: 1,
    SUBSCRIPTION_WFS: 2,
    SUBSCRIPTION_WMS: 3,
    SUBSCRIPTION_POSTGIS: 4,
    SUBSCRIPTION_QUERY: 5
}
var kbpublish = {
    var: {
            publish_data_url: "/api/publish/entries/",
            publish_save_url: "/api/publish/entries/", 
            publish_data_geoserver_url: "/api/publish/channels/geoserver/",
            publish_save_geoserver_url: "/api/publish/channels/geoserver/",
            publish_data_cddp_url: "/api/publish/channels/cddp/",                       
            publish_save_cddp_url: "/api/publish/channels/cddp/",
            publish_data_ftp_url: "/api/publish/channels/ftp/",                       
            publish_save_ftp_url: "/api/publish/channels/ftp/",            
            publish_email_notification_url: "/api/publish/notifications/emails/",
            publish_email_notification_type_url: "/api/publish/notifications/emails/type/",
            ftp_server_url : "/api/publish/channels/ftp-server/",
            log_communication_type_url:"/api/logs/communications/type/",
            publish_status: {
                1: "Locked",
                2: "Unlocked"
            },
            publish_geoserver_format: {
                1: "WMS",  
                2: "WMS & WFS"
            },
            publish_geoserver_pools: {

            },
            publish_geoserver_frequency: {
                1: "OnChange"
            },
            publish_workspace_list: [],
            publish_workspace_map: {},
            has_edit_access: false,
            publish_cddp_format: {
                1: "Geopackage",
                2: "Shapefile",
                3: "Geodatabase",
                4: "GeoJSON"
            },
            publish_cddp_mode: {
                1: "Azure",
                2: "Azure and Sharepoint"
            },
            publish_cddp_frequency: {
                1: "OnChange"
            },
            publish_ftp_format: {
                1: "Geopackage",
                2: "Shapefile",
                3: "Geodatabase",
                4: "GeoJSON"
            },
            publish_ftp_frequency: {
                1: "OnChange"
            },
            catalogue_entry_list: null,
            catalogue_entry_map: {},
            catalogue_entry_type_allowed_for_cddp: [
                catalogue_entry_type.SPATIAL_FILE,
                catalogue_entry_type.SUBSCRIPTION_QUERY
            ],
            catalogue_entry_type_allowed_for_ftp: [
                catalogue_entry_type.SPATIAL_FILE,
                catalogue_entry_type.SUBSCRIPTION_QUERY
            ],
            publish_date_format: "dd/mm/yyyy",
            publish_table_date_format: "DD MMM YYYY HH:mm:ss",
            publish_email_notification_type:null,    // will be filled during initiation
            communication_type:null,    // will be filled during initiation
            ftp_servers: []
    },
    variable: {
        overlay_checkmark: $('<div class="overlay">' +
            '<svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" class="bi bi-check check-mark" viewBox="0 0 16 16">' +
            '<path d="M13.485 1.929a.5.5 0 0 1 .072.638l-.072.084L6.118 10l-3.535-3.536a.5.5 0 0 1 .638-.765l.084.073L6.5 8.879l6.485-6.486a.5.5 0 0 1 .707 0z"/>' +
            '</svg>' +
            '</div>'),
        overlay_crossmark: $('<div class="overlay">' +
            '<svg xmlns="http://www.w3.org/2000/svg" class="bi bi-x cross-mark" viewBox="0 0 16 16">' +
            '<path d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708z" stroke="currentColor" stroke-width="2" fill="none"/>' +
            '</svg>' +
            '</div>'),
        overlay_loading: $('<div class="overlay">' +
            '<div class="spinner-border text-light" role="status"></div>' +
            '</div>')
    },
    init_dashboard: function() {    
        $('#publish-custodian').select2({
            placeholder: 'Select an option',
            minimumInputLength: 2,
            allowClear: true,
            width: $( this ).data( 'width' ) ? $( this ).data( 'width' ) : $( this ).hasClass( 'w-100' ) ? '100%' : 'style',
            theme: 'bootstrap-5',
            ajax: {
                url: "/api/catalogue/custodians/",
                dataType: 'json',
                quietMillis: 100,
                data: function (params, page) {
        
                    return {
                        search: params.term,                        
                    };
                },    
                  processResults: function (data) {
                    // Transforms the top-level key of the response object from 'items' to 'results'
                    var results = [];
                    $.each(data.results, function(index, item){
                      results.push({
                        id: item.id,
                        text: item.name
                      });
                    });
                    return {
                        results: results
                    };
                  }                  
            },
        });
        
        $('#publish-assignedto').select2({
            placeholder: 'Select an option',
            minimumInputLength: 2,
            allowClear: true,
            width: $( this ).data( 'width' ) ? $( this ).data( 'width' ) : $( this ).hasClass( 'w-100' ) ? '100%' : 'style',
            theme: 'bootstrap-5',
            ajax: {
                url: "/api/accounts/users/",
                dataType: 'json',
                quietMillis: 100,
                data: function (params, page) {
                    return {
                        q: params.term,                        
                    };
                },          
                  processResults: function (data) {
                    // Transforms the top-level key of the response object from 'items' to 'results'
                    var results = [];
                    $.each(data.results, function(index, item){
                      results.push({
                        id: item.id,
                        text: item.first_name+' '+item.last_name
                      });
                    });
                    return {
                        results: results
                    };
                  }                  
            },
        });


        

        $('#publish-lastupdatedfrom').datepicker({ dateFormat: this.var.publish_date_format, 
            format: this.var.publish_date_format,
        });
        $('#publish-lastupdatedto').datepicker({  dateFormat: this.var.publish_date_format, 
                format: this.var.publish_date_format,
        });


        $( "#publish-filter-btn" ).click(function() {
            console.log("Reload Publish Table");
            kbpublish.get_publish();
        });
        $( "#publish-new-btn" ).click(function() {
            common_entity_modal.init("New Publish", "submit");
            // let name_id = common_entity_modal.add_field(label="Name", type="text");
            let catalogue_entry_id = common_entity_modal.add_field(label="Catalogue Entry", type="select", value=null, option_map=kbpublish.var.catalogue_entry_map);
            let description_id = common_entity_modal.add_field(label="Description", type="text");
            common_entity_modal.add_callbacks(submit_callback=(success_callback, error_callback)=> 
                                                kbpublish.create_publish(success_callback, error_callback, catalogue_entry_id, description_id),
                                                success_callback=(response)=>{location.href = '/publish/'+response.id;});
            common_entity_modal.show();
        });           
        $( "#publish-limit" ).change(function(){
            common_pagination.var.current_page=0;
            kbpublish.get_publish();
        });
        $( "#publish-order-by" ).change(function(){
            common_pagination.var.current_page=0;
            kbpublish.get_publish();
        });

        const catalogue_entry_list = $('#catalogue_entry_list').data('list');
        if(catalogue_entry_list && typeof catalogue_entry_list == 'string' && catalogue_entry_list.length > 0){
            this.var.catalogue_entry_list = JSON.parse(catalogue_entry_list.replaceAll("'", '"'));
        } else if(catalogue_entry_list instanceof Array){
            this.var.catalogue_entry_list = catalogue_entry_list;
        }
        if(this.var.catalogue_entry_list){
            for(let i in this.var.catalogue_entry_list){
                let entry = this.var.catalogue_entry_list[i];
                this.var.catalogue_entry_map[entry.id] = entry.name;
            }
        }

        utils.enter_keyup($('#publish-name'), kbpublish.get_publish);
        utils.enter_keyup($('#publish-description'), kbpublish.get_publish);
        utils.enter_keyup($('#publish-number'), kbpublish.get_publish);

        kbpublish.get_publish();
    },
    init_publish_item: function() {    
        $.ajax({
            url: kbpublish.var.ftp_server_url,
            type: 'GET',           
            contentType: 'application/json',
            success: function (response) {
                var ftp_server_options = "";
                for(let i in response.results){
                    const row = response.results[i];
                    kbpublish.var.ftp_servers.push({"id": row.id, "name": row.name});
                    ftp_server_options+= "<option value='"+row.id+"'>"+row.name+"</option>";
                }    
                
                $('#new-publish-ftp-server-format').html(ftp_server_options);
            },
            error: function (error) {
                common_entity_modal.show_alert("ERROR");
            },
        });

        $( "#publish-btn-save" ).click(function() {
            kbpublish.save_publish('save');
        });
        $( "#publish-btn-save-exit" ).click(function() {
            kbpublish.save_publish('save-and-exit');
        });       
        $( "#publish-lock" ).click(function() {
            kbpublish.change_publish_status('lock');
        });
        $( "#publish-unlock" ).click(function() {
            kbpublish.change_publish_status('unlock');
        });
        $("#publish-to-ftp").click(function(){
            let publish_entry_id = $('#publish_id').val();
            kbpublish.publish_to_ftp(publish_entry_id, $(this));
        });
        $("#publish-to-geoserver").click(function(){
            let publish_entry_id = $('#publish_id').val();
            kbpublish.publish_to_geoserver(publish_entry_id, $(this));
        });
        $("#publish-to-cddp").click(function(){
            let publish_entry_id = $('#publish_id').val();
            kbpublish.publish_to_cddp(publish_entry_id, $(this));
        });
        $( "#publish-assigned-to-btn" ).click(function() {
            kbpublish.set_assigned_to();
        });    
        $( "#publish-manage-editors-btn" ).click(function() {
            kbpublish.get_publish_editors();
            $('#ManageEditorsModal').modal('show');
        });           
        $( "#publish-new-geoserver-btn" ).click(function() {
            // SPATIAL_FILE = 1, SUBSCRIPTION = 2
            if($('#catalogue-type').val() == '1'){
                $('#new-publish-spatial-format').removeAttr('disabled');
                $('#new-publish-frequency-type').removeAttr('disabled');
                $('#new-publish-workspace').removeAttr('disabled');  
                            
                $('#new-publish-spatial-format').val('');
                $('#new-publish-frequency-type').val('');
                $('#new-publish-workspace').val('');             

                $('#PublishNewGeoserverModal').modal('show');
            } else {
                kbpublish.show_write_geoserver_subscription_modal();
                // $('#PublishNewGeoserverSubscriptionModal').modal('show');
            }
        });      
        $( "#publish-new-cddp-btn" ).click(function() {
            console.log("New CDDP");             
            $('#new-publish-cddp-spatial-format').removeAttr('disabled');
            $('#new-publish-cddp-frequency-type').removeAttr('disabled');
            $('#new-publish-cddp-spatial-mode').removeAttr('disabled');  
            $('#new-publish-cddp-path').removeAttr('disabled'); 

            $("#new-publish-cddp-xml-path-div").hide();

            $('#new-publish-cddp-spatial-format').val('');
            $('#new-publish-cddp-frequency-type').val('');
            $('#new-publish-cddp-spatial-mode').val('');
            $('#new-publish-cddp-path').val(''); 
            $("#new-publish-cddp-xml-path").val('');
            
            $('#new-publish-cddp-spatial-format').change(function(){
                $('#new-publish-cddp-xml-path-div').hide();
                if($('#new-publish-cddp-spatial-format').val() == 3){
                    $('#new-publish-cddp-xml-path-div').show();
                }
            });
           
            $('#PublishNewCDDPModal').modal('show');
        });            


        $( "#publish-new-ftp-btn" ).click(function() {
            console.log("New FTP");  

            $('#new-publish-ftp-name').removeAttr('disabled');
            $('#new-publish-ftp-server-format').removeAttr('disabled');                
            $('#new-publish-ftp-spatial-format').removeAttr('disabled');
            $('#new-publish-ftp-frequency-type').removeAttr('disabled');
            $('#new-publish-ftp-spatial-mode').removeAttr('disabled');  
            $('#new-publish-ftp-path').removeAttr('disabled'); 

            $('#new-publish-ftp-spatial-format').val('');
            $('#new-publish-ftp-frequency-type').val('');
            $('#new-publish-ftp-spatial-mode').val('');
            $('#new-publish-ftp-path').val(''); 
           
            $('#PublishNewFTPModal').modal('show');
        });  

        $( "#create-publish-geoserver-btn" ).click(function() {
            console.log("Create new geoserver");             
            kbpublish.create_publish_geoserver();
        });

        $( "#create-publish-cddp-btn" ).click(function() {
            console.log("Create new CDDP");

            kbpublish.create_publish_cddp();
        });
        $( "#create-publish-ftp-btn" ).click(function() {
            console.log("Create new FTP");;
            kbpublish.create_publish_ftp();
        });
        
        var has_edit_access = $('#has_edit_access').val();
        if (has_edit_access == 'True') {
            kbpublish.var.has_edit_access = true;
        }

        $('#publish-btn-add-notification').click(function(){
            kbpublish.show_add_email_notification_modal();
        })

        $('#publish-notification-order-by').change(()=>table.refresh(this.get_email_notification));
        $('#publish-notification-limit').change(()=>table.refresh(this.get_email_notification));

        const publish_workspace_list = $('#publish_workspace_list').data('list');
        if(publish_workspace_list && typeof publish_workspace_list == 'string' && publish_workspace_list.length > 0){
            this.var.publish_workspace_list = JSON.parse(publish_workspace_list.replaceAll("'", '"'));
        } else if(publish_workspace_list instanceof Array){
            this.var.publish_workspace_list = publish_workspace_list
        }
        if(this.var.publish_workspace_list){
            for(let i in this.var.publish_workspace_list){
                let entry = this.var.publish_workspace_list[i];
                this.var.publish_workspace_map[entry.id] = entry.name;
            }
        }

        $("#log_actions_show").click(kbpublish.show_action_log);
        $("#log_communication_show").click(kbpublish.show_communication_log);
        $("#log_communication_add").click(kbpublish.add_communication_log);
        

        $('#manage-editors-search').select2({
            placeholder: 'Select an option',
            minimumInputLength: 2,
            allowClear: true,
            dropdownParent: $('#ManageEditorsModal'),
            width: $( this ).data( 'width' ) ? $( this ).data( 'width' ) : $( this ).hasClass( 'w-100' ) ? '100%' : 'style',
            theme: 'bootstrap-5',
            ajax: {
                url: "/api/accounts/users/",
                dataType: 'json',
                quietMillis: 100,
                data: function (params, page) {
                    return {
                        q: params.term,                        
                    };
                },          
                  processResults: function (data) {
                    // Transforms the top-level key of the response object from 'items' to 'results'
                    var results = [];
                    $.each(data.results, function(index, item){
                      results.push({
                        id: item.id,
                        text: item.first_name+' '+item.last_name
                      });
                    });
                    return {
                        results: results
                    };
                  }                  
            },
        });

        $('#manage-editors-add-btn').click(function(e){
            kbpublish.add_publish_editor($('#manage-editors-search').val());
        });

        kbpublish.get_publish_geoservers();
        kbpublish.get_publish_cddp();
        kbpublish.get_publish_ftp();
        kbpublish.retrieve_communication_types();
        this.retrieve_noti_types(()=>table.refresh(this.get_email_notification));
    },
    retrieve_noti_types: function(post_callback){
        $.ajax({
            url: kbpublish.var.publish_email_notification_type_url,
            type: 'GET',
            contentType: 'application/json',
            success: (response) => {
                var noti_type = {}
                for(let i in response.results){
                    const type = response.results[i];
                    noti_type[type.id] = type.label;
                }
                kbpublish.var.publish_email_notification_type = noti_type;
                post_callback();
            },
            error: (error)=> {
                common_entity_modal.show_alert("An error occured while getting email notification type.");
                // console.error(error);
            },
        });
    },
    retrieve_communication_types: function(){
        $.ajax({
            url: kbpublish.var.log_communication_type_url,
            type: 'GET',
            contentType: 'application/json',
            success: (response) => {
                if(!response){
                    common_entity_modal.show_alert("An error occured while getting retrieve communication types.");
                    return;    
                }
                var communication_type = {};
                for(let i in response.results){
                    const type = response.results[i];
                    communication_type[type.id] = type.label;
                }
                kbpublish.var.communication_type = communication_type;
            },
            error: (error)=> {
                common_entity_modal.show_alert("An error occured while getting retrieve communication types.");
                // console.error(error);
            },
        });
    },
    search_accounts_for_editor: function() { 
        
        
    },
    delete_publish_editor: function(user_id) {        
        var publish_id = $('#publish_id').val();
        var csrf_token = $("#csrfmiddlewaretoken").val();

        $.ajax({
            url: kbpublish.var.publish_save_url+publish_id+"/editors/delete/"+user_id+"/",
            type: 'DELETE',
            headers: {'X-CSRFToken' : csrf_token},
            contentType: 'application/json',
            success: function (response) {
                // console.log(response);
                kbpublish.get_publish_editors();
            },
            error: function (error) {
                common_entity_modal.show_alert("ERROR");
            },
        });


    },
    add_publish_editor: function(user_id) {        
        var publish_id = $('#publish_id').val();
        var csrf_token = $("#csrfmiddlewaretoken").val();

        $.ajax({
            url: kbpublish.var.publish_save_url+publish_id+"/editors/add/"+user_id+"/",
            type: 'POST',
            headers: {'X-CSRFToken' : csrf_token},
            contentType: 'application/json',
            success: function (response) {
                // console.log(response);
                kbpublish.get_publish_editors();
            },
            error: function (error) {
                 common_entity_modal.show_alert("ERROR");
            },
        });
    },
    delete_publish_geoserver: function(geoserver_publish_id) {        
        var publish_id = $('#publish_id').val();
        var csrf_token = $("#csrfmiddlewaretoken").val();

        $.ajax({
            url: kbpublish.var.publish_data_geoserver_url+geoserver_publish_id+"/",
            type: 'DELETE',
            headers: {'X-CSRFToken' : csrf_token},
            contentType: 'application/json',
            success: function (response, status_code) {
                kbpublish.get_publish_geoservers();                    
            },
            error: function (error) {
                 common_entity_modal.show_alert("ERROR");
            },
        });
    },
    delete_publish_cddp: function(cddp_publish_id) {        
        var publish_id = $('#publish_id').val();
        var csrf_token = $("#csrfmiddlewaretoken").val();

        $.ajax({
            url: kbpublish.var.publish_save_cddp_url+cddp_publish_id+"/",
            type: 'DELETE',
            headers: {'X-CSRFToken' : csrf_token},
            contentType: 'application/json',
            success: function (response, status_code) {               
                kbpublish.get_publish_cddp();                    
            },
            error: function (error) {
                common_entity_modal.show_alert("ERROR");
            },
        });
    },

    delete_publish_ftp: function(ftp_publish_id) {        
        var publish_id = $('#publish_id').val();
        var csrf_token = $("#csrfmiddlewaretoken").val();

        $.ajax({
            url: kbpublish.var.publish_save_ftp_url+ftp_publish_id+"/",
            type: 'DELETE',
            headers: {'X-CSRFToken' : csrf_token},
            contentType: 'application/json',
            success: function (response, status_code) {               
                kbpublish.get_publish_ftp();                    
            },
            error: function (error) {
                common_entity_modal.show_alert("ERROR");
            },
        });
    },    
    set_assigned_to: function() { 
        var publishassignedto = $('#publish-assigned-to').val();
        var publish_id = $('#publish_id').val();
        var csrf_token = $("#csrfmiddlewaretoken").val();

        if (publishassignedto.length > 0) {  
            $.ajax({
                url: kbpublish.var.publish_save_url+publish_id+"/assign/"+publishassignedto+"/",
                type: 'POST',
                headers: {'X-CSRFToken' : csrf_token},
                contentType: 'application/json',
                success: function (response) {
                    window.location = "/publish/"+publish_id;
                },
                error: function (error) {
                    common_entity_modal.show_alert("ERROR Setting assigned person.");
    
            
                },
            });
    
            
        } else {
            common_entity_modal.show_alert("Please select an assigned to person first.");

        }

    },
    change_publish_status: function(status) {        
        var status_url = "lock";
        if (status == 'unlock') {
            status_url = 'unlock';
        }

        var publish_id = $('#publish_id').val();
        var csrf_token = $("#csrfmiddlewaretoken").val();

        $.ajax({
            url: kbpublish.var.publish_save_url+publish_id+"/"+status_url+"/",
            type: 'POST',
            headers: {'X-CSRFToken' : csrf_token},
            contentType: 'application/json',
            success: function (response) {
                window.location = "/publish/"+publish_id;
            },
            error: function (error) {
                common_entity_modal.show_alert("ERROR Changing Status");
            },
        });
    },
    create_publish_geoserver: function() {
        var publish_id = $('#publish_id').val();
        var newpublishspatialformat = $('#new-publish-spatial-format').val();
        var newpublishfrequencytype = $('#new-publish-frequency-type').val();
        var newpublishworkspace = $('#new-publish-workspace').val();
        var newpublishgeoserverpool = $('#new-publish-geoserver-pool').val();

        var post_data = {
            "mode": newpublishspatialformat,
            "frequency": newpublishfrequencytype,
            "workspace": newpublishworkspace,
            "publish_entry": publish_id,
            "geoserver_pool": newpublishgeoserverpool
        };
        var csrf_token = $("#csrfmiddlewaretoken").val();
       
        $('#new-publish-new-geoserver-popup-error').html("");
        $('#new-publish-new-geoserver-popup-error').hide();
        $('#new-publish-new-geoserver-success').html("");
        $('#new-publish-new-geoserver-success').hide();
        
        if (newpublishspatialformat.length < 1) {
            $('#new-publish-new-geoserver-popup-error').html("Please choose a spatial format.");
            $('#new-publish-new-geoserver-popup-error').show();
            return false;
        }

        if (newpublishfrequencytype.length < 1) {
            $('#new-publish-new-geoserver-popup-error').html("Please choose a frequency type.");
            $('#new-publish-new-geoserver-popup-error').show();
            return false;
        }

        if (newpublishworkspace.length < 1) {
            $('#new-publish-new-geoserver-popup-error').html("Please choose a workspace.");
            $('#new-publish-new-geoserver-popup-error').show();
            return false;
        }
       
        if (newpublishgeoserverpool.length < 1) {
            $('#new-publish-new-geoserver-popup-error').html("Please choose a geoserver pool.");
            $('#new-publish-new-geoserver-popup-error').show();
            return false;
        }

        $('#new-publish-spatial-format').attr('disabled','disabled');
        $('#new-publish-frequency-type').attr('disabled','disabled');
        $('#new-publish-workspace').attr('disabled','disabled');
        $('#new-publish-geoserver-pool').attr('disabled','disabled');

        
        $.ajax({
            url: kbpublish.var.publish_save_geoserver_url,        
            type: 'POST',
            headers: {'X-CSRFToken' : csrf_token},
            data: JSON.stringify(post_data),
            contentType: 'application/json',
            success: function (response) {
                    var html = '';
                
                    $('#new-publish-new-geoserver-popup-success').html("Successfully created publish entry");
                    $('#new-publish-new-geoserver-popup-success').show();                
                    setTimeout("$('#PublishNewGeoserverModal').modal('hide');",1000);
                    kbpublish.get_publish_geoservers();

                    //$('#new-publish-spatial-format').removeAttr('disabled');
                    //$('#new-publish-frequency-type').removeAttr('disabled');
                    //$('#new-publish-workspace').removeAttr('disabled');                                       

            },
            error: function (response) {
                var jsonresponse = {};
                if (response.hasOwnProperty('responseJSON')) { 
                    jsonresponse = response.responseJSON;
                }

                if (jsonresponse.hasOwnProperty('publish_entry')) {
                    $('#new-publish-new-geoserver-popup-error').html(jsonresponse['publish_entry']);
                    $('#new-publish-new-geoserver-popup-error').show();        
                } else {
                    $('#new-publish-new-geoserver-popup-error').html("Error create to publish.");
                    $('#new-publish-new-geoserver-popup-error').show();        
                }
                $('#new-publish-spatial-format').removeAttr('disabled');
                $('#new-publish-frequency-type').removeAttr('disabled');
                $('#new-publish-workspace').removeAttr('disabled');  
                $('#new-publish-geoserver-pool').removeAttr('disabled');  
            },
        });


    },
    create_publish_subscription_geoserver: function() {
        var publish_id = $('#publish_id').val();
        var workspace = utils.validate_empty_input($('#new-publish-subscription-workspace').val());
        var srs = $('#new-publish-subscription-srs').val();

        var post_data = {
            "publish_entry": publish_id, 
            "mode": "1", 
            "frequency": "1", 
            "workspace": workspace, 
            "srs":srs, 
        };
        var csrf_token = $("#csrfmiddlewaretoken").val();
       
        $('#new-publish-new-geoserver-popup-error').html("");
        $('#new-publish-new-geoserver-popup-error').hide();
        $('#new-publish-new-geoserver-success').html("");
        $('#new-publish-new-geoserver-success').hide();
        
        if (newpublishspatialformat.length < 1) {
            $('#new-publish-new-geoserver-popup-error').html("Please choose a spatial format.");
            $('#new-publish-new-geoserver-popup-error').show();
            return false;
        }

        if (newpublishfrequencytype.length < 1) {
            $('#new-publish-new-geoserver-popup-error').html("Please choose a frequency type.");
            $('#new-publish-new-geoserver-popup-error').show();
            return false;
        }

        if (newpublishworkspace.length < 1) {
            $('#new-publish-new-geoserver-popup-error').html("Please choose a workspace.");
            $('#new-publish-new-geoserver-popup-error').show();
            return false;
        }
       
        $('#new-publish-spatial-format').attr('disabled','disabled');
        $('#new-publish-frequency-type').attr('disabled','disabled');
        $('#new-publish-workspace').attr('disabled','disabled');

        
        $.ajax({
            url: kbpublish.var.publish_save_geoserver_url,        
            type: 'POST',
            headers: {'X-CSRFToken' : csrf_token},
            data: JSON.stringify(post_data),
            contentType: 'application/json',
            success: function (response) {
                    var html = '';
                
                    $('#new-publish-new-geoserver-popup-success').html("Successfully created publish entry");
                    $('#new-publish-new-geoserver-popup-success').show();                
                    setTimeout("$('#PublishNewGeoserverModal').modal('hide');",1000);
                    kbpublish.get_publish_geoservers();

                    //$('#new-publish-spatial-format').removeAttr('disabled');
                    //$('#new-publish-frequency-type').removeAttr('disabled');
                    //$('#new-publish-workspace').removeAttr('disabled');                                       

            },
            error: function (response) {
                console.log(response);
                var jsonresponse = {};
                if (response.hasOwnProperty('responseJSON')) { 
                    jsonresponse = response.responseJSON;
                }

                if (jsonresponse.hasOwnProperty('publish_entry')) {
                    $('#new-publish-new-geoserver-popup-error').html(jsonresponse['publish_entry']);
                    $('#new-publish-new-geoserver-popup-error').show();        
                } else {
                    $('#new-publish-new-geoserver-popup-error').html("Error create to publish.");
                    $('#new-publish-new-geoserver-popup-error').show();        
                }
                $('#new-publish-spatial-format').removeAttr('disabled');
                $('#new-publish-frequency-type').removeAttr('disabled');
                $('#new-publish-workspace').removeAttr('disabled');  
            },
        });
    },
    create_publish_cddp: function() {
        var publish_id = $('#publish_id').val();
        var newpublishname = $('#new-publish-cddp-name').val();
        var newpublishspatialformat = $('#new-publish-cddp-spatial-format').val();
        var newpublishspatialmode = $('#new-publish-cddp-spatial-mode').val();
        var newpublishfrequencytype = $('#new-publish-cddp-frequency-type').val();        
        var newpublishcddppath =  $('#new-publish-cddp-path').val();      
        var newpublishcddpxmppath = $('#new-publish-cddp-xml-path').val();

        var post_data = {
            "format": newpublishspatialformat, 
            "name" : newpublishname, 
            "mode": newpublishspatialmode, 
            "frequency": newpublishfrequencytype, 
            "path": newpublishcddppath, 
            "publish_entry": publish_id,
            "xml_path": newpublishcddpxmppath
        };
        var csrf_token = $("#csrfmiddlewaretoken").val();
       
        $('#new-publish-new-cddp-popup-error').html("");
        $('#new-publish-new-cddp-popup-error').hide();
        $('#new-publish-new-cddp-success').html("");
        $('#new-publish-new-cddp-success').hide();
        
        if (newpublishspatialformat.length < 1) {
            $('#new-publish-new-cddp-popup-error').html("Please choose a spatial format.");
            $('#new-publish-new-cddp-popup-error').show();
            return false;
        }

        if (newpublishspatialmode.length < 1) {
            $('#new-publish-new-cddp-popup-error').html("Please choose a Spatial Mode.");
            $('#new-publish-new-cddp-popup-error').show();
            return false;
        }

        if (newpublishfrequencytype.length < 1) {
            $('#new-publish-new-cddp-popup-error').html("Please choose a frequency type.");
            $('#new-publish-new-cddp-popup-error').show();
            return false;
        }

        if (newpublishcddppath.length < 3) {
            $('#new-publish-new-cddp-popup-error').html("Please choose a path");
            $('#new-publish-new-cddp-popup-error').show();
            return false;
        }

        if (newpublishspatialformat == 3 && newpublishcddpxmppath.length < 1) {
            $('#new-publish-new-cddp-popup-error').html("Please choose a xml path");
            $('#new-publish-new-cddp-popup-error').show();
            return false;
        }
        
       
        $('#new-publish-cddp-spatial-format').attr('disabled','disabled');
        $('#new-publish-cddp-frequency-type').attr('disabled','disabled');
        $('#new-publish-cddp-spatial-mode').attr('disabled','disabled');
        $('#new-publish-cddp-path').attr('disabled','disabled');
        
        $.ajax({
            url: kbpublish.var.publish_save_cddp_url,        
            type: 'POST',
            headers: {'X-CSRFToken' : csrf_token},
            data: JSON.stringify(post_data),
            contentType: 'application/json',
            success: function (response) {
                    var html = '';           
                    $('#new-publish-new-cddp-popup-success').html("Successfully created publish entry");
                    $('#new-publish-new-cddp-popup-success').show();                
                    setTimeout("$('#PublishNewCDDPModal').modal('hide');",1000);
                    kbpublish.get_publish_cddp();                                      
            },
            error: function (response) {
                var jsonresponse = {};
                if (response.hasOwnProperty('responseJSON')) { 
                    jsonresponse = response.responseJSON;
                }

                if (jsonresponse.hasOwnProperty('publish_entry')) {
                    $('#new-publish-new-cddp-popup-error').html(jsonresponse['publish_entry']);
                    $('#new-publish-new-cddp-popup-error').show();        
                } else {
                    $('#new-publish-new-cddp-popup-error').html("Error create to publish.");
                    $('#new-publish-new-cddp-popup-error').show();        
                }

                $('#new-publish-cddp-spatial-format').removeAttr('disabled');
                $('#new-publish-cddp-frequency-type').removeAttr('disabled');
                $('#new-publish-cddp-spatial-mode').removeAttr('disabled');  
                $('#new-publish-cddp-path').removeAttr('disabled');  

            },
        });


    },    
    create_publish_ftp: function() {
        var publish_id = $('#publish_id').val();
        var newpublishname = $('#new-publish-ftp-name').val();
        var newpublishftpserver = $('#new-publish-ftp-server-format').val();
        var newpublishspatialformat = $('#new-publish-ftp-spatial-format').val();
        var newpublishfrequencytype = $('#new-publish-ftp-frequency-type').val();        
        var newpublishftppath =  $('#new-publish-ftp-path').val();      

        var post_data = {"format": newpublishspatialformat, "name" : newpublishname, "frequency": newpublishfrequencytype, "path": newpublishftppath, "publish_entry": publish_id, 'ftp_server': newpublishftpserver};
        var csrf_token = $("#csrfmiddlewaretoken").val();
       
        $('#new-publish-new-ftp-popup-error').html("");
        $('#new-publish-new-ftp-popup-error').hide();
        $('#new-publish-new-ftp-success').html("");
        $('#new-publish-new-ftp-success').hide();
        
        if (newpublishspatialformat.length < 1) {
            $('#new-publish-new-ftp-popup-error').html("Please choose a spatial format.");
            $('#new-publish-new-ftp-popup-error').show();
            return false;
        }

        if (newpublishfrequencytype.length < 1) {
            $('#new-publish-new-ftp-popup-error').html("Please choose a frequency type.");
            $('#new-publish-new-ftp-popup-error').show();
            return false;
        }

        if (newpublishftppath.length < 3) {
            $('#new-publish-new-ftp-popup-error').html("Please choose a path");
            $('#new-publish-new-ftp-popup-error').show();
            return false;
        }
      
        $('#new-publish-ftp-name').attr('disabled','disabled');
        $('#new-publish-ftp-server-format').attr('disabled','disabled');
        $('#new-publish-ftp-spatial-format').attr('disabled','disabled');
        $('#new-publish-ftp-frequency-type').attr('disabled','disabled');
        $('#new-publish-ftp-spatial-mode').attr('disabled','disabled');
        $('#new-publish-ftp-path').attr('disabled','disabled');
        
        $.ajax({
            url: kbpublish.var.publish_save_ftp_url,        
            type: 'POST',
            headers: {'X-CSRFToken' : csrf_token},
            data: JSON.stringify(post_data),
            contentType: 'application/json',
            success: function (response) {
                    var html = '';
              
                    $('#new-publish-new-ftp-popup-success').html("Successfully created FTP publish entry");
                    $('#new-publish-new-ftp-popup-success').show();                
                    setTimeout("$('#PublishNewFTPModal').modal('hide');",1000);
                    kbpublish.get_publish_ftp();             
                      
            },
            error: function (response) {
                var jsonresponse = {};
                if (response.hasOwnProperty('responseJSON')) { 
                    jsonresponse = response.responseJSON;
                }

                if (jsonresponse.hasOwnProperty('publish_entry')) {
                    $('#new-publish-new-ftp-popup-error').html(jsonresponse['publish_entry']);
                    $('#new-publish-new-ftp-popup-error').show();        
                } else {
                    $('#new-publish-new-ftp-popup-error').html("Error create to publish.");
                    $('#new-publish-new-ftp-popup-error').show();        
                }

                $('#new-publish-ftp-name').removeAttr('disabled');
                $('#new-publish-ftp-server-format').removeAttr('disabled');
                $('#new-publish-ftp-spatial-format').removeAttr('disabled');
                $('#new-publish-ftp-frequency-type').removeAttr('disabled');
                $('#new-publish-ftp-path').removeAttr('disabled');  

            },
        });
    },    
    create_publish: function(success_callback, error_callback, catalogue_entry_id, description_id){
        // get & validation check
        // const name = utils.validate_empty_input('name', $('#'+name_id).val());
        const catalogue_entry = utils.validate_empty_input('catalogue_entry', $('#'+catalogue_entry_id).val());
        const description = utils.validate_empty_input('description', $('#'+description_id).val());
        
        // make data body
        var publish_data = {
            // name:name,
            catalogue_entry:catalogue_entry,
            description:description,
        };

        // set request
        var url = this.var.publish_save_url;
        var method = 'POST';
        var csrf_token = $("#csrfmiddlewaretoken").val();

        // call POST API
        $.ajax({
            url: url,
            method: method,
            dataType: 'json',
            contentType: 'application/json',
            headers: {'X-CSRFToken' : csrf_token},
            data: JSON.stringify(publish_data),
            success: success_callback,
            error: error_callback,
        });
    },
    save_publish: function(save_status) {        
        var publish_id = $('#publish_id').val();
        var publishname = $('#publish-name').val();
        var publishcatalogueentry_id = $('#publish-catalogue-entry').val();
        var publishdescription = $('#publish-description').val();
        var post_data = {"name": publishname, "description": publishdescription, "catalogue_entry": publishcatalogueentry_id};
        var csrf_token = $("#csrfmiddlewaretoken").val();

        $.ajax({
            url: kbpublish.var.publish_save_url+publish_id+"/",
            //method: 'POST',
            type: 'PUT',
            //dataType: 'json',
            headers: {'X-CSRFToken' : csrf_token},
            data: JSON.stringify(post_data),
            contentType: 'application/json',
            success: function (response) {

                if (save_status == 'save-and-exit') {
                    window.location = '/publish/';
                } else {
                   window.location = "/publish/"+publish_id;
                }
            },
            error: function (error) {
                common_entity_modal.show_alert("ERROR Saving.");

        
            },
        });


    },
    get_publish: function(params_str) {
        params = {
            catalogue_entry__name__icontains:        $('#publish-name').val(),
            status:                 $('#publish-status').val(),
            description__icontains: $('#publish-description').val(),
            catalogue_entry__custodian: +$('#publish-custodian').val(),
            assigned_to:            +$('#publish-assignedto').val(),
            updated_after:          utils.convert_date_format($('#publish-lastupdatedfrom').val(), kbpublish.var.publish_date_format, hh="00", mm="00", ss="00"),
            updated_before:         utils.convert_date_format($('#publish-lastupdatedto').val(), kbpublish.var.publish_date_format, hh="23", mm="59", ss="59"),
            id:                     $('#publish-number').val().replace("PE", ""),
            limit:                  $('#publish-limit').val(),
            order_by:               $('#publish-order-by').val()
        }

        if (!params_str){
            params_str = utils.make_query_params(params);
        }

        //order_by=&limit=10" 
        $.ajax({
            url: kbpublish.var.publish_data_url+"?"+params_str,
            method: 'GET',
            dataType: 'json',
            contentType: 'application/json',
            success: function (response) {
                var html = '';

                console.log({response})
                
                if (response != null) {
                    if (response.results.length > 0) {
                        for (let i = 0; i < response.results.length; i++) {
                            assigned_to_friendly = "";
                            if (response.results[i].first_name != null) {

                                console.log ("HERE");
                                
                                assigned_to_friendly = response.results[i].first_name;

                                if (response.results[i].last_name != null) {
                                    assigned_to_friendly += " "+response.results[i].last_name;
    
                                }

                            } 
                            
                            if (assigned_to_friendly.replace(" ","").length == 0) {
                                if (response.results[i].email != null) {
                                    assigned_to_friendly = response.results[i].email;
                                }

                            }


                            button_json = '{"id": "'+response.results[i].id+'"}'

                            html+= "<tr>";
                            html+= " <td>PE"+response.results[i].id+"</td>";
                            html+= " <td>"+response.results[i].name+"</td>";


                            html+= " <td>";
                            if (response.results[i].custodian_name != null) { 
                                html+= response.results[i].custodian_name;
                            } else {
                                html+= "";
                            }
                            html+= "</td>";                            
                            html+= " <td>"+kbpublish.var.publish_status[response.results[i].status]+"</td>";
                            html+= " <td>"+response.results[i].updated_at+"</td>";
                            html+= " <td>"+assigned_to_friendly+"</td>";
                            // html+= " <td class='text-end'>";
                            html+= " <td>";
                            html+= "<div class='row justify-content-center align-items-center'>";
                            if (response.results[i].status == 1) {
                                if($('#is_administrator').val() == 'True'){
                                    html += '<div class="col-sm-2" style="position: relative;">'
                                    if (kbpublish.var.catalogue_entry_type_allowed_for_ftp.includes(response.results[i].catalogue_type)){
                                        html += " <button class='btn btn-primary btn-sm publish-to-ftp-btn' id='publish-to-ftp-btn-"+response.results[i].id+"' data-json='"+button_json+"' >Publish<br/>FTP</button>";
                                    }
                                    html += '</div>'

                                    html += '<div class="col-sm-3" style="position: relative;">'
                                    html += "<button class='btn btn-primary btn-sm publish-to-geoserver-btn' id='publish-to-geoserver-btn-"+response.results[i].id+"' data-json='"+button_json+"' >Publish<br/>Geoserver</button>";
                                    html += '</div>'

                                    html += '<div class="col-sm-3" style="position: relative;">'
                                    if (kbpublish.var.catalogue_entry_type_allowed_for_cddp.includes(response.results[i].catalogue_type)){
                                        html += " <button class='btn btn-primary btn-sm publish-to-cddp-btn' id='publish-to-cddp-btn-"+response.results[i].id+"' data-json='"+button_json+"'>Publish<br/>CDDP</button>";
                                    }
                                    html += '</div>'
                                } else {
                                    html += '<div class="col-sm-8"></div>'
                                }
                            } else {
                                html += '<div class="col-sm-8"></div>'
                            }
                            html+= '<div class="col-sm-2">'
                            html+="  <a class='btn btn-primary btn-sm' href='/publish/"+response.results[i].id+"'>View</a>";
                            html += '</div>'

                            html+= '<div class="col-sm-2">'
                            html+="  <button class='btn btn-secondary btn-sm'>History</button>";
                            html += '</div>'


                            html+="</div>";
                            html+="  </td>";
                            html+= "<tr>";
                        }
                                           
                        $('#publish-tbody').html(html);
                        $('.publish-table-button').hide();

                    } else {
                        $('#publish-tbody').html("<tr><td colspan='7' class='text-center'>No results found<td></tr>");
                    }
                    common_pagination.init(response.count, params, kbpublish.get_publish, $('#paging_navi'));
                } else {
                      $('#publish-tbody').html("<tr><td colspan='7' class='text-center'>No results found<td></tr>");
                }

                $( ".publish-to-geoserver-btn" ).click(function() {
                    var btndata_json = $(this).attr('data-json');
                    var btndata = JSON.parse(btndata_json);
                    kbpublish.publish_to_geoserver(btndata.id, $(this));
                });     
                
                $( ".publish-to-cddp-btn" ).click(function() {
                    var btndata_json = $(this).attr('data-json');
                    var btndata = JSON.parse(btndata_json);
                    kbpublish.publish_to_cddp(btndata.id, $(this));
                });    
                
                $( ".publish-to-ftp-btn" ).click(function() {
                    var btndata_json = $(this).attr('data-json');
                    var btndata = JSON.parse(btndata_json);
                    kbpublish.publish_to_ftp(btndata.id, $(this));
                });

       
            },
            error: function (error) {
                $('#save-publish-popup-error').html("Error Loading publish data");
                $('#save-publish-popup-error').show();
                $('#save-publish-tbody').html('');

                console.log('Error Loading publish data');
            },
        });    
    },
    disable_buttons: function(btn_id){
        $('#publish-to-geoserver-btn-'+btn_id).attr('disabled','disabled');
        $('#publish-to-cddp-btn-'+btn_id).attr('disabled','disabled');
        $('#publish-to-ftp-btn-'+btn_id).attr('disabled','disabled');
    },
    enable_buttons: function(btn_id){
        $('#publish-to-geoserver-btn-'+btn_id).removeAttr('disabled');
        $('#publish-to-cddp-btn-'+btn_id).removeAttr('disabled');
        $('#publish-to-ftp-btn-'+btn_id).removeAttr('disabled');                
    },
    ajax_publish_request: function(url, csrf_token, successCallback, errorCallback, completeCallback) {
        $.ajax({
            url: url,
            type: 'POST',
            headers: {'X-CSRFToken': csrf_token},
            data: JSON.stringify({}),
            contentType: 'application/json',
            success: successCallback,
            error: errorCallback,
            complete: completeCallback
        });
    },
    publish_to_cddp: function(publish_entry_id, button) { 
        var kbpublish = this
        var csrf_token = $("#csrfmiddlewaretoken").val();

        var position = button.position();

        var overlay_checkmark = this.variable.overlay_checkmark.clone();
        var overlay_crossmark = this.variable.overlay_crossmark.clone();
        var overlay_loading = this.variable.overlay_loading.clone();

        button.parent().append(overlay_loading);
        overlay_loading.css({ top: position.top, left: position.left, width: button.outerWidth(), height: button.outerHeight() }).show();
        kbpublish.disable_buttons(publish_entry_id)

        kbpublish.ajax_publish_request(
            kbpublish.var.publish_data_url + publish_entry_id + "/publish/cddp/?symbology_only=false",
            csrf_token,
            function(response) {
                overlay_loading.remove();
                button.parent().append(overlay_checkmark);
                overlay_checkmark.css({ top: position.top, left: position.left, width: button.outerWidth(), height: button.outerHeight() }).show();
            },
            function(error) {
                overlay_loading.remove();
                button.parent().append(overlay_crossmark);
                overlay_crossmark.css({ top: position.top, left: position.left, width: button.outerWidth(), height: button.outerHeight() }).show();
            },
            function(xhr, status) {
                kbpublish.enable_buttons(publish_entry_id);
            }
        ); 
    },
    publish_to_geoserver: function(publish_entry_id, button) { 
        var kbpublish = this
        var csrf_token = $("#csrfmiddlewaretoken").val();

        var position = button.position();

        var overlay_checkmark = this.variable.overlay_checkmark.clone();
        var overlay_crossmark = this.variable.overlay_crossmark.clone();
        var overlay_loading = this.variable.overlay_loading.clone();

        button.parent().append(overlay_loading);
        overlay_loading.css({ top: position.top, left: position.left, width: button.outerWidth(), height: button.outerHeight() }).show();
        kbpublish.disable_buttons(publish_entry_id);

        kbpublish.ajax_publish_request(
            kbpublish.var.publish_data_url+publish_entry_id+"/publish/geoserver/?symbology_only=false",
            csrf_token,
            function (response) {
                overlay_loading.remove();
                button.parent().append(overlay_checkmark);
                overlay_checkmark.css({ top: position.top, left: position.left, width: button.outerWidth(), height: button.outerHeight() }).show();
                common_pagination.var.current_page=0;
            },
            function (error) {
                overlay_loading.remove();
                button.parent().append(overlay_crossmark);
                overlay_crossmark.css({ top: position.top, left: position.left, width: button.outerWidth(), height: button.outerHeight() }).show();
                if(error.status == 409){
                    common_entity_modal.show_alert("This geoserver publish is already in a queue.", "Duplicated");
                } else if(error.status == 412){
                    common_entity_modal.show_alert("No geoserver publish has been set for this publish entry.", "Target Not Found");
                }
            },
            function(xhr, status){
                kbpublish.enable_buttons(publish_entry_id);
            }
        );        
    },    
    publish_to_ftp: function(publish_entry_id, button) { 
        var kbpublish = this
        var csrf_token = $("#csrfmiddlewaretoken").val();

        var position = button.position();

        var overlay_checkmark = this.variable.overlay_checkmark.clone();
        var overlay_crossmark = this.variable.overlay_crossmark.clone();
        var overlay_loading = this.variable.overlay_loading.clone();

        button.parent().append(overlay_loading);
        overlay_loading.css({ top: position.top, left: position.left, width: button.outerWidth(), height: button.outerHeight() }).show();
        kbpublish.disable_buttons(publish_entry_id);

        kbpublish.ajax_publish_request(
            kbpublish.var.publish_data_url+publish_entry_id+"/publish/ftp/?symbology_only=false",
            csrf_token,
            function (response) {
                overlay_loading.remove();
                button.parent().append(overlay_checkmark);
                overlay_checkmark.css({ top: position.top, left: position.left, width: button.outerWidth(), height: button.outerHeight() }).show();
            },
            function (error) {
                overlay_loading.remove();
                button.parent().append(overlay_crossmark);
                overlay_crossmark.css({ top: position.top, left: position.left, width: button.outerWidth(), height: button.outerHeight() }).show();
            },
            function(xhr, status){
                kbpublish.enable_buttons(publish_entry_id);
            }
        );        
    },
    get_publish_editors: function() {
        var publish_id = $('#publish_id').val();
        $.ajax({
            url: kbpublish.var.publish_data_url+publish_id+"/editors/",
            method: 'GET',
            dataType: 'json',
            contentType: 'application/json',
            success: function (response) {
                var html = '';
                
                if (response != null) {
                    if (response.length > 0) {
                        for (let i = 0; i < response.length; i++) {
                            // assigned_to_friendly = "";
                            // if (response.results[i].first_name != null) {

                            //     assigned_to_friendly = response.results[i].first_name;

                            //     if (response.results[i].last_name != null) {
                            //         assigned_to_friendly += " "+response.results[i].last_name;
    
                            //     }

                            // } 
                            
                            // if (assigned_to_friendly.replace(" ","").length == 0) {
                            //     if (response.results[i].email != null) {
                            //         assigned_to_friendly = response.results[i].email;
                            //     }

                            // }
                            button_json = '{"id": "'+response[i].id+'"}'

                            html+= "<tr>";
                            html+= " <td>"+response[i].id+"</td>";
                            html+= " <td>"+response[i].first_name+"</td>";
                            html+= " <td>"+response[i].last_name+"</td>";                        
                            html+= " <td>"+response[i].email+"</td>";                                                    
                            html+= " <td class='text-end'><button class='btn btn-danger btn-sm manage-editors-delete' data-json='"+button_json+"' >Delete</button></td>";
                            html+= "<tr>";
                        }
                                                                   
                        $('#manage-editors-tbody').html(html);
                        $( ".manage-editors-delete" ).click(function() {
                            console.log($(this).attr('data-json'));
                            var btndata_json = $(this).attr('data-json');
                            var btndata = JSON.parse(btndata_json);
                            kbpublish.delete_publish_editor(btndata.id);
                            
                            
                        });                         
                    } else {
                        $('#manage-editors-tbody').html("<tr><td colspan='7' class='text-center'>No results found<td></tr>");

                    }
                } else {
                      $('#manage-editors-tbody').html("<tr><td colspan='7' class='text-center'>No results found<td></tr>");
                }

       
            },
            error: function (error) {
                $('#manage-popup-error').html("Error Loading manage data");
                $('#manage-popup-error').show();
                $('#manage-editors-tbody').html('');

                console.log('Error Loading manage data');
            },
        });
    },
    get_publish_geoservers: function() {
        var publish_id = $('#publish_id').val();
        $.ajax({
            url: kbpublish.var.publish_data_url+publish_id+"/geoserver/",
            method: 'GET',
            dataType: 'json',
            contentType: 'application/json',
            success: function (response) {
                var html = '';
                
                if (response != null) {
                    if (response.length > 0) {
                        var responsejson = response;
                        for (let i = 0; i < responsejson.length; i++) {
                            console.log({responsejson})
                            
                            button_json = '{"id": "'+responsejson[i].id+'"}'

                            html+= "<tr>";
                            html+= " <td>"+responsejson[i].id+"</td>";                        
                            html+= " <td><a href='"+responsejson[i].geoserver_pool_url+"'>"+responsejson[i].geoserver_pool_name+"</a></td>";                        
                            html+= " <td>"+kbpublish.var.publish_geoserver_format[responsejson[i].mode]+"</td>";                        
                            html+= " <td>"+kbpublish.var.publish_geoserver_frequency[responsejson[i].frequency]+"</td>";                                                    
                            html+= " <td>"+responsejson[i].workspace_name+"</td>"; 
                            html+= " <td>";
                            if (responsejson[i].published_at == null) {
                                html+= "Not Published";   
                            } else {
                                html+= responsejson[i].published_at;
                            }
                            html+= "</td>";
                            html+= " <td class='text-end'>";
                            if (kbpublish.var.has_edit_access == true) {
                                html+= "<button class='btn btn-primary btn-sm publish-geoserver-update' data-json='"+button_json+"' >Update</button> ";
                                html+= "<button class='btn btn-danger btn-sm publish-geoserver-delete' data-json='"+button_json+"' >Delete</button>";
                            }
                            html+= "</td>";
                            html+= "<tr>";                                    
                            $('#publish-geoserver-tbody').html(html);
                            $( ".publish-geoserver-delete" ).click(function() {
                                var btndata_json = $(this).attr('data-json');
                                var btndata = JSON.parse(btndata_json);
                                kbpublish.delete_publish_geoserver(btndata.id);                                                        
                            });
                            $( ".publish-geoserver-update" ).click(function() {
                                let data = $(this).data('json')
                                let selected_id = parseInt(data.id)
                                let selected_obj = null
                                for(let response of responsejson){
                                    if (response.id == selected_id){
                                        selected_obj = response
                                    }
                                }

                                if($('#catalogue-type').val() == catalogue_entry_type.SPATIAL_FILE){
                                    kbpublish.show_update_geoserver_modal(selected_obj);
                                } else if([catalogue_entry_type.SUBSCRIPTION_WFS, catalogue_entry_type.SUBSCRIPTION_WMS, catalogue_entry_type.SUBSCRIPTION_POSTGIS, catalogue_entry_type.SUBSCRIPTION_QUERY].includes($('#catalogue-type').val())){
                                    kbpublish.show_write_geoserver_subscription_modal(selected_obj);
                                }
                            });
                        }
                    } else {
                        $('#publish-geoserver-tbody').html("<tr><td colspan='7' class='text-center'>No results found<td></tr>");
                    }
                } else {
                      $('#publish-geoserver-tbody').html("<tr><td colspan='7' class='text-center'>No results found<td></tr>");
                }
            },
            error: function (error) {
                $('#save-publish-popup-error').html("Error Loading publish data");
                $('#save-publish-popup-error').show();
                $('#save-publish-tbody').html('');

                console.log('Error Loading publish data');
            },
        });
    },
    show_write_geoserver_subscription_modal: function(prev){
        console.log({prev})
        let workspace = prev ? prev.workspace : null;
        let geoserver_pool = prev ? prev.geoserver_pool : null;
        let srs = prev ? prev.srs : null;
        let override_bbox = prev ? prev.override_bbox : false;
        let native_crs = prev ? prev.native_crs : null;
        let nbb = { minx : prev ? prev.nbb_minx : null, 
                    maxx : prev ? prev.nbb_maxx : null, 
                    miny : prev ? prev.nbb_miny : null, 
                    maxy : prev ? prev.nbb_maxy : null, 
                    crs  : prev ? prev.nbb_crs : null
                };
        let llb = { minx : prev ? prev.llb_minx : null, 
                    maxx : prev ? prev.llb_maxx : null, 
                    miny : prev ? prev.llb_miny : null, 
                    maxy : prev ? prev.llb_maxy : null, 
                    crs  : prev ? prev.llb_crs : null
                };
        let active = prev ? prev.active : null;
        let prev_id = prev ? prev.id : null;

        ids = {}
        override_bbox_ids=[]

        common_entity_modal.init("Publish New Geoserver", "submit");
        common_entity_modal.add_field(label="Name", type="text", value=$('#catalogue-name-id').val(), option_map=null, disabled=true);
        ids.geoserver_pool = common_entity_modal.add_field(label="GeoServer Pool", type="select", value=geoserver_pool, option_map=kbpublish.var.publish_geoserver_pools);
        ids.workspace = common_entity_modal.add_field(label="Workspace", type="select", value=workspace, option_map=kbpublish.var.publish_workspace_map);
        ids.srs = common_entity_modal.add_field(label="SRS", type="text", value=srs);

        ids.override_bbox = common_entity_modal.add_field(label="Override_bbox", type="switch", value=override_bbox);
        ids.native_crs = common_entity_modal.add_field(label="Native CRS", type="text", value=native_crs, option_map=null, disabled=!override_bbox);
        override_bbox_ids.push(ids.native_crs);

        const nbb_info = kbpublish.make_bbox_div(nbb, 'nbb', !override_bbox);
        common_entity_modal.add_div("Native Bounding Box(Optional)", nbb_info[0], nbb_info[1]);
        ids = {...ids, ...nbb_info[2]};
        override_bbox_ids = [...override_bbox_ids, ...nbb_info[3]];

        const llb_info = kbpublish.make_bbox_div(llb, 'llb', !override_bbox);
        common_entity_modal.add_div("Lat Lon Bounding Box(Optional)", llb_info[0], llb_info[1]);
        ids = {...ids, ...llb_info[2]};
        override_bbox_ids = [...override_bbox_ids, ...llb_info[3]];

        ids.active = common_entity_modal.add_field(label="Active", type="switch", value=active);

        common_entity_modal.add_callbacks(submit_callback=(success_callback, error_callback)=> 
                                            this.write_geoserver_subscription(success_callback, error_callback, ids, prev_id),
                                            success_callback=this.get_publish_geoservers);

        // make all bbox fields disable
        $('#'+ids.override_bbox).change(() => common_entity_modal.change_disabled(override_bbox_ids));
        common_entity_modal.show();
    },
    make_bbox_div: function(bbox, bbox_keyword, override_bbox){
        let bbox_div = common_entity_modal.maker.div();
        let labels_fields = [];
        let ids = {};
        let ids_list = [];

        const bounding_keywords = ['minx', 'maxx', 'miny', 'maxy', 'crs'];
        const bounding_labels = ['Min X', 'Max X', 'Min Y', 'Max Y', 'CRS'];

        bbox_div.attr('class', bbox_div.attr('class') + ' col-12');
        let bbox_row_div = common_entity_modal.maker.div();
        bbox_row_div.attr('class', bbox_row_div.attr('class') + ' row');
        for(let i in bounding_keywords){
            const keyword = 'new-publish-subscription-'+bbox_keyword+bounding_keywords[i];
            const label = $('<label>').text(bounding_labels[i]);
            const field = common_entity_modal.maker.text(keyword, bbox[bounding_keywords[i]], override_bbox);
            const div = common_entity_modal.maker.div();
            div.attr('class', 'col-2');
            div.append(label);
            div.append(field);
            bbox_row_div.append(div);
            labels_fields.push({label:label, field:field});
            ids[bbox_keyword+'_'+bounding_keywords[i]] = field.attr('id');
            ids_list.push(field.attr('id'));
        }
        bbox_div.append(bbox_row_div);
        return [bbox_div, labels_fields, ids, ids_list];
    },
    show_update_geoserver_modal: function(prev){
        common_entity_modal.init("Publish Update Geoserver", "submit");
        common_entity_modal.add_field(label="Name", type="text", value=$('#catalogue-name-id').val(), option_map=null, disabled=true);
        let geoserver_pool_id = common_entity_modal.add_field(label="GeoServer Pool", type="select", value=prev.geoserver_pool, option_map=kbpublish.var.publish_geoserver_pools);
        let format_id = common_entity_modal.add_field(label="Spatial Format", type="select", value=prev.mode, option_map=kbpublish.var.publish_geoserver_format);
        let frequency_id = common_entity_modal.add_field(label="Frequency Type", type="select", value=prev.frequency, option_map=kbpublish.var.publish_geoserver_frequency);
        // let workspace_id = common_entity_modal.add_field(label="Workspace", type="select", value=prev.workspace_id, option_map=kbpublish.var.publish_workspace_map);
        let workspace_id = common_entity_modal.add_field(label="Workspace", type="select", value=prev.workspace, option_map=kbpublish.var.publish_workspace_map);
        
        common_entity_modal.add_callbacks(submit_callback=(success_callback, error_callback)=> 
                                            this.write_geoserver(success_callback, error_callback, geoserver_pool_id, format_id, frequency_id, workspace_id, prev.id),
                                            success_callback=this.get_publish_geoservers);
        common_entity_modal.show();
    },
    write_geoserver_subscription: function(success_callback, error_callback, ids, geoserver_id){
        const publish_id = $('#publish_id').val(); 
        // prefixed. could be changed in the future
        var geoserver_data = {
            mode:"1",
            frequency:"1",
            publish_entry: publish_id
        };

        for(let key in ids){
            let val;
            if(['active', 'override_bbox'].includes(key)){
                val = $('#'+ids[key]).prop('checked');
            } else {
                val = $('#'+ids[key]).val();
                if(!val){
                    val = null;
                }
            }
            // validation check mandatories
            if(key in ['workspace', 'srs']){
                val = utils.validate_empty_input(key, val);
            }
            geoserver_data[key] = val;
        }

        var url = this.var.publish_save_geoserver_url;
        var method = 'POST';
        if(geoserver_id){
            url += geoserver_id+'/';
            method = 'PUT';
        }

        // call POST API
        $.ajax({
            url: url,
            method: method,
            dataType: 'json',
            contentType: 'application/json',
            headers: {'X-CSRFToken' : $("#csrfmiddlewaretoken").val()},
            data: JSON.stringify(geoserver_data),
            success: success_callback,
            error: error_callback
        });
    },
    write_geoserver: function(success_callback, error_callback, geoserver_pool_id, format_id, frequency_id, workspace_id, publish_id){
        // get & validation check
        const mode = utils.validate_empty_input('format', $('#'+format_id).val());
        const frequency = utils.validate_empty_input('frequency', $('#'+frequency_id).val());
        const workspace = utils.validate_empty_input('workspace', $('#'+workspace_id).val());
        const geoserver_pool = utils.validate_empty_input('geoserver_pool', $('#'+geoserver_pool_id).val());
        
        // make data body
        var geoserver_data = {
            geoserver_pool: geoserver_pool,
            mode:mode,
            frequency:frequency,
            workspace:workspace,
            publish_entry:$('#publish-entry-id').val()
        };
        var url = this.var.publish_save_geoserver_url;
        var method = 'POST';
        if(publish_id){
            delete geoserver_data['publish_entry'];
            url += publish_id+'/';
            method = 'PUT';
        }

        // call POST API
        $.ajax({
            url: url,
            method: method,
            dataType: 'json',
            contentType: 'application/json',
            headers: {'X-CSRFToken' : $("#csrfmiddlewaretoken").val()},
            data: JSON.stringify(geoserver_data),
            success: success_callback,
            error: error_callback
        });
    },

    get_publish_cddp: function() {
        var publish_id = $('#publish_id').val();
        $.ajax({
            url: kbpublish.var.publish_data_url+publish_id+"/cddp/",
            method: 'GET',
            dataType: 'json',
            contentType: 'application/json',
            success: function (response) {
                var html = '';
                
                if (response != null) {
                    if (response.length > 0) {
                        var responsejson = response;
                        for (let i = 0; i < responsejson.length; i++) {
                            
                            button_json = '{"id": "'+responsejson[i].id+'"}'

                            html+= "<tr>";
                            html+= " <td>"+responsejson[i].id+"</td>";                        
                            html+= " <td>"+kbpublish.var.publish_cddp_format[responsejson[i].format]+"</td>";                        
                            html+= " <td>"+kbpublish.var.publish_cddp_mode[responsejson[i].mode]+"</td>";     
                            html+= " <td>"+kbpublish.var.publish_cddp_frequency[responsejson[i].frequency]+"</td>";                                                    
                            html+= " <td>"+responsejson[i].path+"</td>"; 
                            html+= " <td>";
                            if (responsejson[i].published_at == null) {
                                html+= "Not Published";   
                            } else {
                                html+= responsejson[i].published_at;
                            }
                            html+= "</td>";
                            html+= " <td class='text-end'>";
                            if (kbpublish.var.has_edit_access == true) {
                                html+= "<button class='btn btn-primary btn-sm publish-cddp-update' data-json='"+button_json+"' >Update</button> ";
                                html+= "<button class='btn btn-danger btn-sm publish-cddp-delete' data-json='"+button_json+"' >Delete</button>";
                            }
                            html+= "</td>";
                            html+= "<tr>";                                      
                            $('#publish-cddp-tbody').html(html);
                            $( ".publish-cddp-delete" ).click(function() {

                                var btndata_json = $(this).attr('data-json');
                                var btndata = JSON.parse(btndata_json);
                                kbpublish.delete_publish_cddp(btndata.id);                                                        
                            });
                            $( ".publish-cddp-update" ).click(function() {
                                kbpublish.show_update_cddp_modal(responsejson[i]);
                            });
                        }
                    } else {
                        $('#publish-cddp-tbody').html("<tr><td colspan='7' class='text-center'>No results found<td></tr>");

                    }
                } else {
                      $('#publish-cddp-tbody').html("<tr><td colspan='7' class='text-center'>No results found<td></tr>");
                }

       
            },
            error: function (error) {
                $('#save-publish-popup-error').html("Error Loading publish data");
                $('#save-publish-popup-error').show();
                $('#save-publish-tbody').html('');

                console.log('Error Loading publish data');
            },
        });
    },
    get_publish_ftp: function() {
        var publish_id = $('#publish_id').val();
        $.ajax({
            url: kbpublish.var.publish_data_url+publish_id+"/ftp/",
            method: 'GET',
            dataType: 'json',
            contentType: 'application/json',
            success: function (response) {
                var html = '';
                
                if (response != null) {
                    if (response.length > 0) {
                        var responsejson = response;
                        for (let i = 0; i < responsejson.length; i++) {
                            
                            button_json = '{"id": "'+responsejson[i].id+'"}'
                            button_json_data = '{"id": "'+responsejson[i].id+'", "name" : "'+responsejson[i].name.replaceAll('"','<-Quote->')+'", "format" : "'+responsejson[i].format+'", "frequency" : "'+responsejson[i].frequency+'" , "path" : "'+responsejson[i].path+'", "ftp_server_id":"'+responsejson[i].ftp_server_id+'" }'
                            html+= "<tr>";
                            html+= " <td>"+responsejson[i].id+"</td>";         
                            html+= " <td>"+responsejson[i].name.replaceAll('"','&quot;')+"</td>";                 
                            html+= " <td>"+responsejson[i].ftp_server_name+"</td>"; 
                            html+= " <td>"+kbpublish.var.publish_ftp_format[responsejson[i].format]+"</td>";                                                
                            html+= " <td>"+kbpublish.var.publish_ftp_frequency[responsejson[i].frequency]+"</td>";                                                    
                            html+= " <td>"+responsejson[i].path+"</td>"; 
                            html+= " <td>";
                            if (responsejson[i].published_at == null) {
                                html+= "Not Published";   
                            } else {
                                html+= responsejson[i].published_at;
                            }
                            html+= "</td>";
                            html+= " <td class='text-end'>";
                            if (kbpublish.var.has_edit_access == true) {
                                html+= "<button class='btn btn-primary btn-sm publish-ftp-update' data-json='"+button_json+"' >Update</button> ";
                                html+= "<button class='btn btn-danger btn-sm publish-ftp-delete' data-json='"+button_json+"' >Delete</button>";
                                html+= "<textarea style='display:none' id='publish-ftp-data-"+responsejson[i].id+"'>"+button_json_data+"</textarea>"
                            }
                            html+= "</td>";
                            html+= "<tr>";

                            $('#publish-ftp-tbody').html(html);
                            $( ".publish-ftp-delete" ).click(function() {
                                var btndata_json = $(this).attr('data-json');
                                var btndata = JSON.parse(btndata_json);
                                kbpublish.delete_publish_ftp(btndata.id);                                                        
                            });
                            $( ".publish-ftp-update" ).click(function() {
                                var btndata_json = $(this).attr('data-json');
                                var btndata = JSON.parse(btndata_json);
                                kbpublish.show_update_ftp_modal(btndata);                                
                                //kbpublish.show_update_ftp_modal(responsejson[i]);
                            });
                        }
                    } else {
                        $('#publish-ftp-tbody').html("<tr><td colspan='7' class='text-center'>No results found<td></tr>");

                    }
                } else {
                      $('#publish-ftp-tbody').html("<tr><td colspan='7' class='text-center'>No results found<td></tr>");
                }

       
            },
            error: function (error) {
                $('#save-publish-popup-error').html("Error Loading publish data");
                $('#save-publish-popup-error').show();
                $('#save-publish-tbody').html('');

                console.log('Error Loading publish data');
            },
        });
    },
    show_update_cddp_modal: function(prev){
        common_entity_modal.init("Update Cddp Notification", "submit");
        let name_id = common_entity_modal.add_field(label="Name", type="text", value=prev.name);
        let format_id = common_entity_modal.add_field(label="Spatial Format", type="select", value=prev.format, option_map=kbpublish.var.publish_cddp_format);
        let mode_id = common_entity_modal.add_field(label="Spatial Mode", type="select", value=prev.mode, option_map=kbpublish.var.publish_cddp_mode);
        let frequency_id = common_entity_modal.add_field(label="Frequency Type", type="select", value=prev.frequency, option_map=kbpublish.var.publish_cddp_frequency);
        let path_id = common_entity_modal.add_field(label="Path", type="text", value=prev.path);
        let xml_path_id = common_entity_modal.add_field(label="XML Path", type="text", value=prev.xml_path);
        if(prev.format != 3){
            $('#'+xml_path_id).hide();
        }
        $('#'+format_id).change(function(){
            common_entity_modal.hide_entity(xml_path_id);
            if($('#'+format_id).val() == 3){
                common_entity_modal.show_entity(xml_path_id);
            }
        })

        common_entity_modal.add_callbacks(submit_callback=(success_callback, error_callback)=> 
                                            this.write_cddp(success_callback, error_callback, name_id, format_id, mode_id, frequency_id, path_id, xml_path_id, prev.id),
                                            success_callback=this.get_publish_cddp);
        common_entity_modal.show();
    },


    write_cddp: function(success_callback, error_callback, name_id, format_id, mode_id, frequency_id, path_id, xml_path_id, cddp_id){
        // get & validation check
        const name = utils.validate_empty_input('name', $('#'+name_id).val());
        const format = utils.validate_empty_input('format', $('#'+format_id).val());
        const mode = utils.validate_empty_input('mode', $('#'+mode_id).val());
        const frequency = utils.validate_empty_input('frequency', $('#'+frequency_id).val());
        const path = utils.validate_empty_input('path', $('#'+path_id).val());
        let xml_path = null;
        if(format == 3){
            xml_path = utils.validate_empty_input('xml_path', $('#'+xml_path_id).val());
        }
        
        // make data body
        var cddp_data = {
            name:name,
            format:format,
            mode:mode,
            frequency:frequency,
            path:path,
            xml_path:xml_path,
            publish_entry:$('#publish-entry-id')
        };
        var url = this.var.publish_save_cddp_url;
        var method = 'POST';
        if(cddp_id){
            delete cddp_data['publish_entry'];
            url += cddp_id+'/';
            method = 'PUT';
        }

        // call POST API
        $.ajax({
            url: url,
            method: method,
            dataType: 'json',
            contentType: 'application/json',
            headers: {'X-CSRFToken' : $("#csrfmiddlewaretoken").val()},
            data: JSON.stringify(cddp_data),
            success: success_callback,
            error: error_callback
        });
    },

    show_update_ftp_modal: function(btn_data){       
        var btn_data_ta = $('#publish-ftp-data-'+btn_data.id).val();
        var prev = JSON.parse(btn_data_ta);
        common_entity_modal.init("Update FTP ", "submit");
        ftp_server_map = {}
        for(let i in kbpublish.var.ftp_servers){
            const row = kbpublish.var.ftp_servers[i];
            ftp_server_map[row.id] = row.name;
        }
        // 


        let name_id = common_entity_modal.add_field(label="Name", type="text", value=prev.name.replaceAll('<-Quote->','"'));
        let ftp_server_id = common_entity_modal.add_field(label="FTP Server", type="select", value=prev.ftp_server_id, option_map=ftp_server_map);
        let format_id = common_entity_modal.add_field(label="Spatial Format", type="select", value=prev.format, option_map=kbpublish.var.publish_cddp_format);
        let frequency_id = common_entity_modal.add_field(label="Frequency Type", type="select", value=prev.frequency, option_map=kbpublish.var.publish_cddp_frequency);
        let path_id = common_entity_modal.add_field(label="Path", type="text", value=prev.path);

        common_entity_modal.add_callbacks(submit_callback=(success_callback, error_callback)=> 
                                            this.write_ftp(success_callback, error_callback, name_id,ftp_server_id, format_id, frequency_id, path_id, prev.id),
                                            success_callback=this.get_publish_ftp);
        common_entity_modal.show();
    },

    write_ftp: function(success_callback, error_callback, name_id, ftp_server_id, format_id, frequency_id, path_id, ftp_id){
        // get & validation check
        const name = utils.validate_empty_input('name', $('#'+name_id).val());
        const format = utils.validate_empty_input('format', $('#'+format_id).val());
        const ftp_server = utils.validate_empty_input('ftp_server_id', $('#'+ftp_server_id).val());
        const frequency = utils.validate_empty_input('frequency', $('#'+frequency_id).val());
        const path = utils.validate_empty_input('path', $('#'+path_id).val());
        
        // make data body
        var ftp_data = {
            name:name,
            format:format,
            frequency:frequency,
            ftp_server: ftp_server,
            path:path,
            publish_entry:$('#publish-entry-id')
        };
        var url = this.var.publish_save_ftp_url;
        var method = 'POST';
        if(ftp_id){
            delete ftp_data['publish_entry'];
            url += ftp_id+'/';
            method = 'PUT';
        }

        // call POST API
        $.ajax({
            url: url,
            method: method,
            dataType: 'json',
            contentType: 'application/json',
            headers: {'X-CSRFToken' : $("#csrfmiddlewaretoken").val()},
            data: JSON.stringify(ftp_data),
            success: success_callback,
            error: error_callback
        });
    },

    show_add_email_notification_modal: function(){
        common_entity_modal.init("Add New Email Notification", "submit");
        let name_id = common_entity_modal.add_field(label="Name", type="text");
        let type_id = common_entity_modal.add_field(label="Type", type="select", value=null, option_map=this.var.publish_email_notification_type);
        let email_id = common_entity_modal.add_field(label="Email", type="email");
        let active_id = common_entity_modal.add_field(label="Active", type="switch");
        common_entity_modal.add_callbacks(submit_callback=(success_callback, error_callback)=> 
                                            this.write_email_notification(success_callback, error_callback, name_id, type_id, email_id, active_id),
                                            success_callback=()=>table.refresh(this.get_email_notification));
        common_entity_modal.show();
    },
    show_update_email_notification_modal: function(prev){
        common_entity_modal.init("Update Email Notification", "submit");
        let name_id = common_entity_modal.add_field(label="Name", type="text", value=prev.name);
        let type_id = common_entity_modal.add_field(label="Type", type="select", value=prev.type, option_map=this.var.publish_email_notification_type);
        let email_id = common_entity_modal.add_field(label="Email", type="email", value=prev.email);
        let active_id = common_entity_modal.add_field(label="Active", type="switch", value=prev.active);
        common_entity_modal.add_callbacks(submit_callback=(success_callback, error_callback)=> 
                                            this.write_email_notification(success_callback, error_callback, name_id, type_id, email_id, active_id, prev.id),
                                            success_callback=()=>table.refresh(this.get_email_notification));
        common_entity_modal.show();
    },
    write_email_notification: function(success_callback, error_callback, name_id, type_id, email_id, active_id, noti_id){
        // get & validation check
        const name = utils.validate_empty_input('name', $('#'+name_id).val());
        const type = utils.validate_empty_input('type', $('#'+type_id).val());
        const email = utils.validate_empty_input('email', $('#'+email_id).val());
        utils.validate_email(email);
        const active = $('#'+active_id).prop('checked');
        
        // make data body
        var email_noti_data = {
            name:name,
            type:type,
            email:email,
            active:active,
            publish_entry:$('#publish-entry-id').val()
        };
        var url = this.var.publish_email_notification_url;
        var method = 'POST';
        if(noti_id){
            delete email_noti_data['publish_entry'];
            url += noti_id+'/';
            method = 'PUT';
        }

        // call POST API
        $.ajax({
            url: url,
            method: method,
            dataType: 'json',
            contentType: 'application/json',
            headers: {'X-CSRFToken' : $("#csrfmiddlewaretoken").val()},
            data: JSON.stringify(email_noti_data),
            success: success_callback,
            error: error_callback
        });
    },

    show_delete_email_notification_modal: function(target){
        common_entity_modal.init("Delte Email Notification", "delete");
        common_entity_modal.add_field(label="Name", type="text", value=target.name);
        common_entity_modal.add_field(label="Type", type="select", value=target.type, option_map=this.var.publish_email_notification_type);
        common_entity_modal.add_field(label="Email", type="email", value=target.email);
        common_entity_modal.add_field(label="Active", type="switch", value=target.active);
        common_entity_modal.add_callbacks(submit_callback=(success_callback, error_callback)=> 
                                            this.delete_email_notification(success_callback, error_callback, target.id),
                                            success_callback=()=>table.refresh(this.get_email_notification));
        common_entity_modal.show();
    },

    delete_email_notification: function(success_callback, error_callback, noti_id){
        $.ajax({
            url: kbpublish.var.publish_email_notification_url+noti_id+"/",
            method: 'DELETE',
            contentType: 'application/json',
            headers: {'X-CSRFToken' : $("#csrfmiddlewaretoken").val()},
            success: success_callback, 
            error: error_callback
        });
    },
    get_email_notification: function(params_str) {
        if (!params_str){
            params = {
                publish_entry:  $('#publish_id').val(),
                limit:          $('#publish-notification-limit').val(),
                order_by:       $('#publish-notification-order-by').val(),
            }

            params_str = utils.make_query_params(params);
        }

        $.ajax({
            url: kbpublish.var.publish_email_notification_url+"?"+params_str,
            method: 'GET',
            dataType: 'json',
            contentType: 'application/json',
            success: function (response) {
                if(!response){
                    $('#publish-notification-tbody').html("<tr><td colspan='7' class='text-center'>No results found<td></tr>");
                    return;
                }
                // change type number to name
                let buttons={};
                for(let i in response.results){
                    response.results[i].type_str = kbpublish.var.publish_email_notification_type[response.results[i].type];
                }

                if(kbpublish.var.has_edit_access){
                    buttons = {Update:(noti)=>kbpublish.show_update_email_notification_modal(noti),
                               Delete:(noti)=>kbpublish.show_delete_email_notification_modal(noti)};
                }

                table.set_tbody($('#publish-notification-tbody'), response.results, 
                                columns=[{id:'text'}, {name:'text'}, {type_str:'text'}, {email:'text'}, {active:'switch'}], 
                                buttons=buttons);
                common_pagination.init(response.count, params, kbpublish.get_email_notification, $('#notification-paging-navi'));
            },
            error: function (error) {
                common_entity_modal.show_alert("Error occured.");
                // console.log('Error occured.'+ error);
            },
        });
    },
    show_action_log: function(){
        common_entity_modal.init("Action log", "info");
        common_entity_modal.init_talbe();
        let thead = common_entity_modal.get_thead();
        table.set_thead(thead, {Who:3, What:5, When:4});
        common_entity_modal.get_limit().change(()=>kbpublish.get_action_log());
        common_entity_modal.get_search().keyup((event)=>{
            if (event.which === 13 || event.keyCode === 13){
                event.preventDefault();
                kbpublish.get_action_log()
            }
        });
        common_entity_modal.show();

        kbpublish.get_action_log();
    },
    get_action_log: function(params_str){
        if(!params_str){
            params = {
                limit:  common_entity_modal.get_limit().val(),
                search: common_entity_modal.get_search().val(),
            }

            params_str = utils.make_query_params(params);
        }
    
        var catalogue_entry_id = $('#publish-entry-id').val();
        $.ajax({
            url: kbpublish.var.publish_data_url+catalogue_entry_id+"/logs/actions/?"+params_str,
            method: 'GET',
            dataType: 'json',
            contentType: 'application/json',
            success: function (response) {
                if(!response || !response.results){
                    table.message_tbody(common_entity_modal.get_tbody(), "No results found");
                    return;
                }
                for(let i in response.results){
                    response.results[i]['when'] = utils.convert_datetime_format(response.results[i].when, kbpublish.var.publish_table_date_format); 
                }
                table.set_tbody(common_entity_modal.get_tbody(), response.results, [{username:"text"}, {what:'text'}, {when:'text'}]);
                common_pagination.init(response.count, params, kbpublish.get_action_log, common_entity_modal.get_page_navi());
            },
            error: function (error){
                common_entity_modal.show_error_modal(error);
            }
        });
    },
    show_communication_log: function(){
        common_entity_modal.init("Communication log", "info");
        common_entity_modal.init_talbe();
        let thead = common_entity_modal.get_thead();
        table.set_thead(thead, {User:2, To:2, Cc:2, From:2, Subject:2, Text:2});
        common_entity_modal.get_limit().change(()=>kbpublish.get_communication_log());
        common_entity_modal.get_search().keyup((event)=>{
            if (event.which === 13 || event.keyCode === 13){
                event.preventDefault();
                kbpublish.get_communication_log()
            }
        });
        common_entity_modal.show();

        kbpublish.get_communication_log();
    },
    get_communication_log: function(params_str){
        if(!params_str){
            params = {
                limit:  common_entity_modal.get_limit().val(),
                search: common_entity_modal.get_search().val(),
            }
            
            params_str = utils.make_query_params(params);
        }
    
        var publish_entry_id = $('#publish-entry-id').val();
        $.ajax({
            url: kbpublish.var.publish_data_url+publish_entry_id+"/logs/communications/?"+params_str,
            method: 'GET',
            dataType: 'json',
            contentType: 'application/json',
            success: function (response) {
                if(!response || !response.results){
                    table.message_tbody(common_entity_modal.get_tbody(), "No results found");
                    return;
                }
                for(let i in response.results){
                    response.results[i]['created_at'] = utils.convert_datetime_format(response.results[i].created_at, kbpublish.var.publish_table_date_format); 
                }
                table.set_tbody(common_entity_modal.get_tbody(), response.results, 
                                [{username:"text"}, {to:'text'}, {cc:'text'}, {from:'text'}, {subject:'text'}, {text:'text'}]);
                common_pagination.init(response.count, params, kbpublish.get_communication_log, common_entity_modal.get_page_navi());
            },
            error: function (error){
                common_entity_modal.show_error_modal(error);
            }
        });
    },
    add_communication_log: function(){
        common_entity_modal.init("Add New Communication log", "submit");
        let type_id = common_entity_modal.add_field(label="Communication Type", type="select", value=null, option_map=kbpublish.var.communication_type);
        let to_id = common_entity_modal.add_field(label="To", type="text");
        let cc_id = common_entity_modal.add_field(label="Cc", type="text");
        let from_id = common_entity_modal.add_field(label="From", type="text");
        let subject_id = common_entity_modal.add_field(label="Subject", type="text");
        let text_id = common_entity_modal.add_field(label="Text", type="text_area");

        common_entity_modal.add_callbacks(submit_callback=(success_callback, error_callback)=> 
                            kbpublish.create_communication_log(success_callback, error_callback, type_id, to_id, cc_id, from_id, subject_id, text_id));
        common_entity_modal.show();
    },
    create_communication_log: function(success_callback, error_callback, type_id, to_id, cc_id, from_id, subject_id, text_id){
        // get & validation check
        const type = utils.validate_empty_input('type', $('#'+type_id).val());
        const to = utils.validate_empty_input('to', $('#'+to_id).val());
        const cc = utils.validate_empty_input('cc', $('#'+cc_id).val());
        const from = utils.validate_empty_input('from', $('#'+from_id).val());
        const subject = utils.validate_empty_input('subject', $('#'+subject_id).val());
        const text = utils.validate_empty_input('text', $('#'+text_id).val());
        
        // make data body
        var communication_log_data = {
            type:type,
            to:to,
            cc:cc,
            from:from,
            subject:subject,
            text:text,
            user:$('#current-user').val(),
        };
        
        var url = kbpublish.var.publish_data_url+$('#publish-entry-id').val()+"/logs/communications/";
        var method = 'POST';

        // call POST API
        $.ajax({
            url: url,
            method: method,
            dataType: 'json',
            contentType: 'application/json',
            headers: {'X-CSRFToken' : $("#csrfmiddlewaretoken").val()},
            data: JSON.stringify(communication_log_data),
            success: success_callback,
            error: error_callback
        });
    },
}
