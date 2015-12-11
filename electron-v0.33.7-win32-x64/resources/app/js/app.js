var fs = require('fs');
var rest = require('restler');
var async = require('async');
var moment = require('moment');

var settingFilepath = "input_data.json";
var historyFilepath = "history.json";

var currentPath = fs.realpathSync('./');
console.log("currentPath:" + currentPath);

$( function (){

    $( "#dialog" ).dialog(open);

    load_setting();

    load_history();


    $("#send").click(function(){

        $("#tab2-message").html("");

        write_setting();

        if(login()){
            pubOps = new PublishOptions({
                publisherId: $("#publisher-id").val(),
                subtopic : $("#subtopic").val(),
                headers: {
                    "android-ticker-text": $("#android-ticker-text").val(),
                    "android-content-title": $("#android-content-title").val(),
                    "android-content-text": $("#android-content-text").val(),
                    "ios-alert": $("#ios-alert").val(),
                    "ios-badge": $("#ios-badge").val(),
                    "ios-sound": $("#ios-sound").val()
                }
            });


            var confirm_message = "";
            var broadcast = new Array();
            if($("#ios").prop('checked')) {
                broadcast.push("1");
                confirm_message = "iOS " + confirm_message;
            }
            if($("#android").prop('checked')) {
                broadcast.push("2");
                confirm_message = "Android " + confirm_message;
            }
            var broadcast_str = broadcast.join("|");

            deliveryOps = new DeliveryOptions();

            if($('#push').is(':checked')){
                deliveryOps.pushPolicy = "ONLY";
            }
            if($('#pub-sub').is(':checked')){
                deliveryOps.pushPolicy = "ALSO";
            }

            if($('#device-id').val()){
                deliveryOps.pushSinglecast = $('#device-id').val().split(",");
                confirm_message = "デバイスID " + $('#device-id').val() + "に単独メッセージを送信します。よろしいですか。";
            }else{
                deliveryOps.pushBroadcast = broadcast_str;
                confirm_message = confirm_message + "にブロードキャストメッセージを送ります。よろしいですか。";
            }

            var message = "No Message";
            if($("#message").val()){
                message = $("#message").val();
            }

            if(window.confirm(confirm_message)){
                try {
                    var response = Backendless.Messaging.publish( $("#channel").val(), message, pubOps, deliveryOps );
                    console.log("response.status:" + response.status);
                    console.log("response.errorMessage" + response.errorMessage);
                    $("#tab2-message").html("送信結果: " + response.status);

                    async.waterfall([
                        function(callback){
                            write_history(pubOps, response);
                            callback(null);
                        },
                        function(callback){
                            load_history();
                            callback(null);
                        }
                    ], function(err, result){
                    });
                } catch (e) {
                    alert("Messaging publish failed. "  + e.message);
                    console.log("Messaging publish failed. "  + e.message);
                }
            }
        }
    });
});

function login(){
    Backendless.serverURL = $("#base-url").val();
    Backendless.initApp($("#app-id").val(), $("#key").val(), $("#version").val());
    try {
        var user = Backendless.UserService.login($("#email").val(), $("#password").val());
        if (user != null){
            console.log("Login successful");
            $("#send").prop("disabled", false);
            $("#tab1-message").html("ログインしました");
            $("#tab3-message").html("");
            load_history();
            return 1;
        } else {
            alert("Login failed!");
            console.log("Login failed");
        }
    }
    catch (e) {
        alert("Login failed. "  + e.message);
        console.log("Login failed. "  + e.message);
    }
    return 0;
}

function write_setting(){
    var data = {};
    if (fs.existsSync(settingFilepath)) {
        data = JSON.parse(fs.readFileSync(settingFilepath, 'utf8'));
    }

    data = inject_data_object(data);

    fs.writeFileSync(settingFilepath, JSON.stringify(data, null, '    '));
}

function inject_data_object(data){
    data.base_url = $("#base-url").val();
    data.app_id = $("#app-id").val();
    data.key = $("#key").val();
    data.version = $("#version").val();
    data.email = $("#email").val();
    data.password = $("#password").val();
    data.channel = $("#channel").val();

    data.android_ticker_text = $("#android-ticker-text").val();
    data.android_content_title = $("#android-content-title").val();
    data.android_content_text = $("#android-content-text").val();
    data.ios_alert = $("#ios-alert").val();
    if($('#push').is(':checked')){
        data.push = 1;
    }else{
        data.push = 0;
    }
    if($('#pub-sub').is(':checked')){
        data.pub_sub = 1;
    }else{
        data.pub_sub = 0;
    }
    data.ios_badge = $("#ios-badge").val();
    data.ios_sound = $("#ios-sound").val();
    if($("#android").prop('checked')) {
        data.android = 1;
    }else{
        data.android = 0;
    }
    if($("#ios").prop('checked')) {
        data.ios = 1;
    }else{
        data.ios = 0;
    }
    data.publisher_id = $("#publisher-id").val();
    data.subtopic = $("#subtopic").val();
    data.message = $("#message").val();
    data.device_id = $("#device-id").val();
    return data;
}

function load_setting(){
    if (fs.existsSync(settingFilepath)) {
        var data = JSON.parse(fs.readFileSync(settingFilepath, 'utf8'));

        if(data.base_url){
            $("#base-url").val(data.base_url);
        }else{
            /* デフォルト値 */
            $("#base-url").val("http://api.backendless.com");
        }
        $("#app-id").val(data.app_id);
        $("#key").val(data.key);
        $("#version").val(data.version);
        $("#email").val(data.email);
        $("#password").val(data.password);
        $("#channel").val(data.channel);

        $("#android-ticker-text").val(data.android_ticker_text);
        $("#android-content-title").val(data.android_content_title);
        $("#android-content-text").val(data.android_content_text);
        $("#ios-alert").val(data.ios_alert);
        if(data.android == "1") {
            $("#android").prop("checked",true);
        }
        if(data.ios == "1") {
            $("#ios").prop("checked",true);
        }
        $("#ios-badge").val(data.ios_badge);
        $("#ios-sound").val(data.ios_sound);
        if(data.push == "1"){
            $('#push').attr('checked', 'checked');
        }

        if(data.pub_sub == "1"){
            $('#pub-sub').attr('checked', 'checked');
        }
        $("#publisher-id").val(data.publisher_id);
        $("#subtopic").val(data.subtopic);
        $("#message").val(data.message);
        $("#device-id").val(data.device_id);

    }else{
        /* デフォルト値 */
        $("#base-url").val("http://api.backendless.com");
        $("#channel").val("default");
        $("#publisher-id").val("default");
    }

}

function write_history(pubOps, response){
    async.waterfall([
        function(callback){
            console.log("write history.");
            var data = {};

            data = inject_data_object(data);
            data.created_at = moment().format('YYYY-MM-DD HH:mm:ss');
            data.headers = pubOps.headers;
            data.response_status = response.status;
            data.response_errorMessage = response.errorMessage;

            callback(null, data);
        },
        function(data, callback){
            if (fs.existsSync(historyFilepath)) {
                var history = JSON.parse(fs.readFileSync(historyFilepath, 'utf8'));
                history.unshift(data);
                fs.writeFileSync(historyFilepath, JSON.stringify(history, null, '    '));
                callback(null);
            }else{
                var history = new Array();
                history.push(data);
                fs.writeFileSync(historyFilepath, JSON.stringify(history, null, '    '));
                callback(null);
            }
        }
    ], function(err, result){
    });
}
function load_history(){
    if (fs.existsSync(historyFilepath)) {
        async.waterfall([
            function(callback){
                console.log("load history.");
                var history = JSON.parse(fs.readFileSync(historyFilepath, 'utf8'));
                callback(null, history);
            },
            function(history, callback){
                var buff = "※送信履歴の行をクリックすると、送信内容をロードします<br/>";
                buff = buff + "<table class=\"table table-striped table-bordered\"><tr>";
                buff = buff + "<th>Android</th><th>iOS</th><th>送信方法</th><th>送信先</th>";
                buff = buff + "<th>message header text</th><th>送信日時</th><th>送信結果</th></tr>";

                history.forEach(function(e, i, a){
                    buff = buff + "<tr id=\"history-" + i + "\">";
                    buff = buff + "<td>" + e.android + "</td>";
                    buff = buff + "<td>" + e.ios + "</td>";
                    if(e.push == "1"){
                        buff = buff + "<td>" + "Push通知" + "</td>";
                    }
                    else if(e.pub_sub == "1"){
                        buff = buff + "<td>" + "Push通知とメッセージ" + "</td>";
                    }
                    if(e.device_id){
                        buff = buff + "<td>" + e.device_id + "</td>";
                    }
                    else {
                        buff = buff + "<td>ブロードキャスト</td>";
                    }
                    buff = buff + "<td>" + JSON.stringify(e.headers) + "</td>";
                    buff = buff + "<td>" + e.created_at + "</td>";
                    buff = buff + "<td>" + e.response_status + "</td>";
                    buff = buff + "</tr>";
                    $(document).on('click', '#history-' + i, function() {

                        $("#base-url").val(e.base_url);
                        $("#app-id").val(e.app_id);
                        $("#key").val(e.key);
                        $("#version").val(e.version);
                        $("#email").val(e.email);
                        $("#password").val(e.password);
                        $("#channel").val(e.channel);

                        $("#android-ticker-text").val(e.android_ticker_text);
                        $("#android-content-title").val(e.android_content_title);
                        $("#android-content-text").val(e.android_content_text);
                        $("#ios-alert").val(e.ios_alert);
                        if(e.android == "1") {
                            $("#android").prop("checked",true);
                        }else{
                            $("#android").prop("checked",false);
                        }
                        if(e.ios == "1") {
                            $("#ios").prop("checked",true);
                        }else{
                            $("#ios").prop("checked",false);
                        }
                        $("#ios-badge").val(e.ios_badge);
                        $("#ios-sound").val(e.ios_sound);
                        if(e.push == "1"){
                            $('#push').attr('checked', 'checked');
                        }else{
                            $('#push').removeAttr('checked');
                        }
                        if(e.pub_sub == "1"){
                            $('#pub-sub').attr('checked', 'checked');
                        }else{
                            $('#pub-sub').removeAttr('checked');
                        }
                        $("#publisher-id").val(e.publisher_id);
                        $("#subtopic").val(e.subtopic);
                        $("#message").val(e.message);
                        $("#device-id").val(e.device_id);

                        if($('body').data('selected_message') != null){
                            $('#history-' + $('body').data('selected_message')).css("color", "black");
                        }
                        $('#history-' + i).css("color", "blue");
                        $('body').data('selected_message', i );
                    });
                });
                buff = buff + "</table>";
                callback(null, buff);
            },
            function(buff, callback){
                $("#history-table").html(buff);
                callback(null);
            }
        ], function(err, result){
        });
    }
}

