var kblayersubmission = { 
    var: {
         "layersubmission_data_url": "/api/catalogue/layers/submissions/",
         "layersubmission_symbology_url": "/api/catalogue/layers/submissions/",
         log_communication_type_url:"/api/logs/communications/type/",
         layersubmission_date_format: "dd/mm/yyyy",
         catalogue_table_date_format: "DD MMM YYYY HH:mm:ss",
         communication_type:null,    // will be filled during initiation
    },
    init_dashboard: function() { 

        $('#layer-submission-submitted-from').datepicker({ dateFormat: this.var.layersubmission_date_format, 
            format: this.var.layersubmission_date_format,
        });
        $('#layer-submission-submitted-to').datepicker({  dateFormat: this.var.layersubmission_date_format, 
                format: this.var.layersubmission_date_format,
        });


        $( "#layer-submission-filter-btn" ).click(function() {
            kblayersubmission.get_layer_submissions();
        });
        $( "#layer-submission-limit" ).change(function() {
            common_pagination.var.current_page=0;
            kblayersubmission.get_layer_submissions();
        });
        $( "#layer-submission-order-by" ).change(function() {
            common_pagination.var.current_page=0;
            kblayersubmission.get_layer_submissions();
        });
        $( "#layer-submission-status" ).change(function() {
            kblayersubmission.get_layer_submissions();
        });

        utils.enter_keyup($('#layer-submission-name'), kblayersubmission.get_layer_submissions);

        kblayersubmission.get_layer_submissions();
    },
    init_submission_view:function(){
        $("#log_actions_show").click(kblayersubmission.show_action_log);
        $("#log_communication_show").click(kblayersubmission.show_communication_log);
        $("#log_communication_add").click(kblayersubmission.add_communication_log);
        $("#file_download").click(kblayersubmission.download_file);

        kblayersubmission.retrieve_communication_types();
    },
    retrieve_communication_types: function(){
        $.ajax({
            url: kblayersubmission.var.log_communication_type_url,
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
                this.var.communication_type = communication_type;
            },
            error: (error)=> {
                common_entity_modal.show_alert("An error occured while getting retrieve communication types.");
                // console.error(error);
            },
        });
    },
    get_layer_submissions: function(params_str) {
        console.log("Reload layer submission page.");
        params = {
            status:                 $('#layer-submission-status').val(),
            limit:                  $('#layer-submission-limit').val(),
            order_by:               $('#layer-submission-order-by').val(),
            submitted_after:        utils.convert_date_format($('#layer-submission-submitted-from').val(), kblayersubmission.var.layersubmission_date_format, hh="00", mm="00", ss="00"),
            submitted_before:       utils.convert_date_format($('#layer-submission-submitted-to').val(), kblayersubmission.var.layersubmission_date_format,hh="23", mm="59", ss="59"),
            catalogue_entry__name__icontains:  $('#layer-submission-name').val(),
        }

        if (!params_str){
            params_str = utils.make_query_params(params);
        }

        $.ajax({
            url: kblayersubmission.var.layersubmission_data_url+"?"+params_str,
            method: 'GET',
            dataType: 'json',
            contentType: 'application/json',
            success: function (response) {
                var html = '';
                
                if (response != null) {
                    if (response.results.length > 0) {
                        for (let i = 0; i < response.results.length; i++) {
                            let layer_submission = response.results[i]
                            console.log(layer_submission)
                            assigned_to_friendly = ""

                            if (layer_submission.first_name != null) {
                                assigned_to_friendly = layer_submission.first_name;
                                if (layer_submission.last_name != null) {
                                    assigned_to_friendly += " "+layer_submission.last_name;
                                }
                            } 
                            
                            if (assigned_to_friendly.replace(" ","").length == 0) {
                                if (layer_submission.email != null) {
                                    assigned_to_friendly = layer_submission.email;
                                }
                            }

                            const date = new Date(layer_submission.submitted_at);
                            const year = date.getFullYear();
                            const month = String(date.getMonth() + 1).padStart(2, '0');
                            const day = String(date.getDate()).padStart(2, '0');
                            const hours = String(date.getHours()).padStart(2, '0');
                            const minutes = String(date.getMinutes()).padStart(2, '0');
                            const seconds = String(date.getSeconds()).padStart(2, '0');
                            
                            const formattedDate = `${day}-${month}-${year} ${hours}:${minutes}:${seconds}`;

                            // let lock_icon = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512" width="13" height="13" style="fill: gray;"><path d="M144 144l0 48 160 0 0-48c0-44.2-35.8-80-80-80s-80 35.8-80 80zM80 192l0-48C80 64.5 144.5 0 224 0s144 64.5 144 144l0 48 16 0c35.3 0 64 28.7 64 64l0 192c0 35.3-28.7 64-64 64L64 512c-35.3 0-64-28.7-64-64L0 256c0-35.3 28.7-64 64-64l16 0z"/></svg>'
                            // let restricted_icon = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512" width="13" height="13" style="fill: gray;"><path d="M144 144l0 48 160 0 0-48c0-44.2-35.8-80-80-80s-80 35.8-80 80zM80 192l0-48C80 64.5 144.5 0 224 0s144 64.5 144 144l0 48 16 0c35.3 0 64 28.7 64 64l0 192c0 35.3-28.7 64-64 64L64 512c-35.3 0-64-28.7-64-64L0 256c0-35.3 28.7-64 64-64l16 0z"/></svg>'
                            // let public_icon = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 576 512" width="16" height="13" style="fill: gray;"><path d="M352 144c0-44.2 35.8-80 80-80s80 35.8 80 80l0 48c0 17.7 14.3 32 32 32s32-14.3 32-32l0-48C576 64.5 511.5 0 432 0S288 64.5 288 144l0 48L64 192c-35.3 0-64 28.7-64 64L0 448c0 35.3 28.7 64 64 64l320 0c35.3 0 64-28.7 64-64l0-192c0-35.3-28.7-64-64-64l-32 0 0-48z"/></svg>'
                            let restricted_icon = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="16" height="16" style="fill: gray;"><!--!Font Awesome Free 6.6.0 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2024 Fonticons, Inc.--><path d="M367.2 412.5L99.5 144.8C77.1 176.1 64 214.5 64 256c0 106 86 192 192 192c41.5 0 79.9-13.1 111.2-35.5zm45.3-45.3C434.9 335.9 448 297.5 448 256c0-106-86-192-192-192c-41.5 0-79.9 13.1-111.2 35.5L412.5 367.2zM0 256a256 256 0 1 1 512 0A256 256 0 1 1 0 256z"/></svg>'
                            let public_icon = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="16" height="16" style="fill: gray;"><path d="M352 256c0 22.2-1.2 43.6-3.3 64l-185.3 0c-2.2-20.4-3.3-41.8-3.3-64s1.2-43.6 3.3-64l185.3 0c2.2 20.4 3.3 41.8 3.3 64zm28.8-64l123.1 0c5.3 20.5 8.1 41.9 8.1 64s-2.8 43.5-8.1 64l-123.1 0c2.1-20.6 3.2-42 3.2-64s-1.1-43.4-3.2-64zm112.6-32l-116.7 0c-10-63.9-29.8-117.4-55.3-151.6c78.3 20.7 142 77.5 171.9 151.6zm-149.1 0l-176.6 0c6.1-36.4 15.5-68.6 27-94.7c10.5-23.6 22.2-40.7 33.5-51.5C239.4 3.2 248.7 0 256 0s16.6 3.2 27.8 13.8c11.3 10.8 23 27.9 33.5 51.5c11.6 26 20.9 58.2 27 94.7zm-209 0L18.6 160C48.6 85.9 112.2 29.1 190.6 8.4C165.1 42.6 145.3 96.1 135.3 160zM8.1 192l123.1 0c-2.1 20.6-3.2 42-3.2 64s1.1 43.4 3.2 64L8.1 320C2.8 299.5 0 278.1 0 256s2.8-43.5 8.1-64zM194.7 446.6c-11.6-26-20.9-58.2-27-94.6l176.6 0c-6.1 36.4-15.5 68.6-27 94.6c-10.5 23.6-22.2 40.7-33.5 51.5C272.6 508.8 263.3 512 256 512s-16.6-3.2-27.8-13.8c-11.3-10.8-23-27.9-33.5-51.5zM135.3 352c10 63.9 29.8 117.4 55.3 151.6C112.2 482.9 48.6 426.1 18.6 352l116.7 0zm358.1 0c-30 74.1-93.6 130.9-171.9 151.6c25.5-34.2 45.2-87.7 55.3-151.6l116.7 0z"/></svg>'

                            // Number, Name, Submitted Date, Time, Catalogue, Status, Action
                            html += "<tr>";
                            html += "<td>LM" + layer_submission.id + "</td>";
                            html += "<td><a href='/catalogue/entries/" + layer_submission.catalogue_entry + "/details/' style='text-decoration: none;'>CE" + layer_submission.catalogue_entry + ": " + layer_submission.name + "</a></td>";
                            // html += "<td>" + layer_submission.permission_type + "</td>";
                            html += "<td>" + (layer_submission.permission_type == 1 ? public_icon + ' ' + layer_submission.permission_type_str : restricted_icon + ' ' + layer_submission.permission_type_str) + "</td>"
                            html += "<td>" + formattedDate + "</td>";
                            if (layer_submission.status == 1){  // 1: Submitted
                                html += "<td><span class='badge bg-secondary'>" + layer_submission.status_name + "</span></td>";
                            } else if (layer_submission.status == 2){  // 2: Accepted
                                html += "<td><span class='badge bg-success'>" + layer_submission.status_name + "</span></td>";
                            } else if (layer_submission.status == 3){  // 3: Declined
                                html += "<td><span class='badge bg-danger'>" + layer_submission.status_name + "</span></td>";
                            } else { // Should not reach here
                                html += "<td>a</td>";
                            }
                            html += "<td class='text-end'>";
                            html += "<a class='btn btn-primary btn-sm' href='/layer/submission/" + layer_submission.id + "/details'>View</a>";
                            html += "</td>";
                            html += "<tr>";
                        }

                        $('#layersubmission-tbody').html(html);
                        $('.layersubmission-table-button').hide();

                    } else {
                        $('#layersubmission-tbody').html("<tr><td colspan='7' class='text-center'>No results found</td></tr>");
                    }
                    common_pagination.init(response.count, params, kblayersubmission.get_layer_submissions, $('#paging_navi'));
                } else {
                      $('#layersubmission-tbody').html("<tr><td colspan='7' class='text-center'>No results found</td></tr>");
                }               
            },
            error: function (error) {
                $('#save-layersubmission-popup-error').html("Error Loading publish data");
                $('#save-layersubmission-popup-error').show();
                $('#save-layersubmission-tbody').html('');
            },
        });    
    },
    show_action_log: function(){
        common_entity_modal.init("Action log", "info");
        common_entity_modal.init_talbe();
        let thead = common_entity_modal.get_thead();
        table.set_thead(thead, {Who:3, What:5, When:4});
        common_entity_modal.get_limit().change(()=>kblayersubmission.get_action_log());
        common_entity_modal.get_search().keyup((event)=>{
            if (event.which === 13 || event.keyCode === 13){
                event.preventDefault();
                kblayersubmission.get_action_log()
            }
        });
        common_entity_modal.show();

        kblayersubmission.get_action_log();
    },
    get_action_log: function(params_str){
        if(!params_str){
            params = {
                limit:  common_entity_modal.get_limit().val(),
                search: common_entity_modal.get_search().val(),
            }

            params_str = utils.make_query_params(params);
        }
    
        var catalogue_entry_id = $('#catalogue_entry_id').val();
        $.ajax({
            url: kbcatalogue.var.catalogue_data_url+catalogue_entry_id+"/logs/actions/?"+params_str,
            method: 'GET',
            dataType: 'json',
            contentType: 'application/json',
            success: function (response) {
                if(!response || !response.results){
                    table.message_tbody(common_entity_modal.get_tbody(), "No results found");
                    return;
                }
                for(let i in response.results){
                    response.results[i]['when'] = utils.convert_datetime_format(response.results[i].when, kblayersubmission.var.catalogue_table_date_format); 
                }
                table.set_tbody(common_entity_modal.get_tbody(), response.results, [{username:"text"}, {what:'text'}, {when:'text'}]);
                common_pagination.init(response.count, params, kblayersubmission.get_action_log, common_entity_modal.get_page_navi());
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
        common_entity_modal.get_limit().change(()=>kblayersubmission.get_communication_log());
        common_entity_modal.get_search().keyup((event)=>{
            if (event.which === 13 || event.keyCode === 13){
                event.preventDefault();
                kblayersubmission.get_communication_log()
            }
        });
        common_entity_modal.show();

        kblayersubmission.get_communication_log();
    },
    get_communication_log: function(params_str){
        if(!params_str){
            params = {
                limit:  common_entity_modal.get_limit().val(),
                search: common_entity_modal.get_search().val(),
            }

            params_str = utils.make_query_params(params);
        }
    
        var catalogue_entry_id = $('#catalogue_entry_id').val();
        $.ajax({
            url: kbcatalogue.var.catalogue_data_url+catalogue_entry_id+"/logs/communications/?"+params_str,
            method: 'GET',
            dataType: 'json',
            contentType: 'application/json',
            success: function (response) {
                if(!response || !response.results){
                    table.message_tbody(common_entity_modal.get_tbody(), "No results found");
                    return;
                }
                for(let i in response.results){
                    response.results[i]['created_at'] = utils.convert_datetime_format(response.results[i].created_at, kblayersubmission.var.catalogue_table_date_format); 
                }
                table.set_tbody(common_entity_modal.get_tbody(), response.results, 
                                [{username:"text"}, {to:'text'}, {cc:'text'}, {from:'text'}, {subject:'text'}, {text:'text'}]);
                common_pagination.init(response.count, params, kblayersubmission.get_action_log, common_entity_modal.get_page_navi());
            },
            error: function (error){
                common_entity_modal.show_error_modal(error);
            }
        });
    },
    add_communication_log: function(){
        common_entity_modal.init("Add New Communication log", "submit");
        let type_id = common_entity_modal.add_field(label="Communication Type", type="select", value=null, option_map=kblayersubmission.var.communication_type);
        let to_id = common_entity_modal.add_field(label="To", type="text");
        let cc_id = common_entity_modal.add_field(label="Cc", type="text");
        let from_id = common_entity_modal.add_field(label="From", type="text");
        let subject_id = common_entity_modal.add_field(label="Subject", type="text");
        let text_id = common_entity_modal.add_field(label="Text", type="text_area");

        common_entity_modal.add_callbacks(submit_callback=(success_callback, error_callback)=> 
                        kblayersubmission.create_communication_log(success_callback, error_callback, type_id, to_id, cc_id, from_id, subject_id, text_id));
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
        var url = kbcatalogue.var.catalogue_data_url+$('#catalogue_entry_id').val()+"/logs/communications/";
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
    download_file: function(){
        common_entity_modal.show_progress();
        $.ajax({
            url: kblayersubmission.var.layersubmission_data_url+$('#layer_submission_obj_id').val()+'/file',
            method: 'GET',
            xhrFields: {
                responseType: 'blob'
            },
            success: function(data, textStatus, jqXHR) {
                var a = $('<a></a>');
                var url = window.URL.createObjectURL(data);
    
                a.attr('href', url);
                a.attr('download', jqXHR.getResponseHeader('Filename'));
                $('body').append(a);
                a[0].click();
                window.URL.revokeObjectURL(url);
                a.remove();
                common_entity_modal.hide_progress();
            },
            error: function(xhr, status, error) {
                common_entity_modal.show_alert("The target file does not exists.");
                console.error(error);
            }
        });
    }
}
