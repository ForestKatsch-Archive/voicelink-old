
var View=function(name,content) {
    this.content=content;
    if(typeof content == typeof []) {
	this.content="";
	for(var i=0;i<content.length;i++) {
	    this.content+="<p>"+content[i]+"</p>";
	}
    }
    this.name=name;
    this.html=$(document.createElement("div"));
    this.html.attr("id","view-"+this.name);
    this.html.addClass("view");
    this.create=function() {
	this.html.append("<div class='wrapper'>"+this.content+"</div>");
	$("#view>.wrapper").append(this.html);
    };
    this.create();
    this.show=function() {
	this.html.fadeIn(view.fade_time);
    };
    this.show_immediate=function() {
	this.html.fadeIn(0);
    };
    this.hide=function() {
	this.html.fadeOut(view.fade_time);
    };
};

var view={
    fade_time:200,
    url:"",
    view:"help",
    views:{

    },
};

function view_generate_message(m,folder) {
    var d=ui_format_date(m.composed);
    var time_title=d[1];
    d=d[0];
    var del="";
    var to="";
    if(folder == "drafts") {
	var from=voicelink.get_name();
	var duration=m.duration;
	del="<a class='link delete' onclick='javascript:ui_delete_message("+m.message_id+")'>\
<img src='assets/img/delete.png' alt='"+_("delete_message")+"' title='"+_("delete_message")+"' /></a>";
	var t="";
	for(var i=0;i<m.to.length;i++)
	    t+=m.to[i]+" ";
	t=t.substr(0,t.length-3);
	to="<input class='to' onblur='javascript:ui_update_to("+m.message_id+")' value='"+t+"' placeholder='To' />";
    }
    return "<a class='link play' onclick='javascript:ui_toggle_play_message("+m.message_id+")'>\
<img src='assets/img/play.png' alt='"+_("play_message")+"' title='"+_("play_message")+"' /></a>\
<span class='from' title='"+m.from_handle+"'>"+from+"</span>\
"+to+"\
<span class='sent' title='"+time_title+"'>"+d+"</span>\
<a class='link send' onclick='javascript:ui_send_message("+m.message_id+")'>\
Send</a>\
<span class='duration'>"+duration+"</span>\
"+del+"";
}

function view_update() {
    if(view.view == "inbox")
	view_update_messages("inbox");
    else if(view.view == "sent")
	view_update_messages("sent");
    else if(view.view == "drafts")
	view_update_messages("drafts");
}

function view_update_all() {
    view_update_messages("inbox");
    view_update_messages("sent");
    view_update_messages("drafts");
}

function view_update_messages(folder) {
    $("#view-"+folder+" .wrapper").empty();
    var messages=voicelink.get_folder(folder);
    if(messages.length == 0) {
	$("#view-"+folder+" .wrapper").append("<div class='folder no-messages'>"+_("no_messages")+"</div>")
    } else {
	$("#view-"+folder+" .wrapper").append("<ul class='folder'></ul>");
    }
    for(var i=0;i<messages.length;i++) {
	var m=messages[i];
	$("#view-"+folder+" .wrapper ul").append("<li id='message-number-"+m.message_id+"' class='message'>"+view_generate_message(m,folder)+"</li>");
    }
}

function view_history(e) {
    var url=parseUri(location.href);
    var hash="";
    if(url.relative.indexOf("#") >= 0)
	hash=url.relative.split("#")[1];
    ui_hide_modal_final("*");
    if(hash != "")
	ui_show_modal(hash);
    var v=url.query;
    view_set_final(v);
}

function view_update_time() {
    for(var i in voicelink.messages) {
	var m=voicelink.messages[i];
	var d="";
	if(m.folder == "drafts")
	    d=ui_format_date(m.composed);
	var time_title=d[1];
	d=d[0];
	var time_title=d[1];
	$("#view-"+m.folder+" #message-number-"+m.message_id+" .sent").text(d);
	$("#view-"+m.folder+" #message-number-"+m.message_id+" .sent").attr("title",time_title);
    }
}

function view_init() {
    view_create_views();
    $(window).bind("popstate",view_history);
    setTimeout(function() {
	if(view.url == "")
	    view_history();
    },100);
    view_update_all();
    voicelink.bind("messages_changed",function() {
	view_update_all();
    });
    setInterval(view_update_time,8000);
    loaded("view");
}

function view_done() {

}

function view_create_views() {
    var v=new View("inbox","<ul></ul>");
    view.views.inbox=v;
    v=new View("sent","<ul></ul>");
    view.views.sent=v;
    v=new View("drafts","<ul></ul>");
    view.views.drafts=v;
    v=new View("settings","\
<div class='account pane'>\n\
<h1>"+_("account")+"</h1>\n\
<li><a class='link change-name' title='"+_("change_name")+"'>"+_("change_name")+"</a></li>\n\
<li><a class='link delete' title='"+_("delete_account")+"'>"+_("delete_account")+"</a></li>\n\
</ul>\n\
</div>\n\
");
    v.html.find(".delete").click(ui_delete_user);
    v.html.find(".change-name").click(ui_change_name);
    view.views.settings=v;
    v=new View("help",_("help_text"));
    view.views.help=v;
}

function view_set(v) {
    if(view.views[v] == undefined)
	return;
    if(view.view == v)
	return;
    view_set_final(v);
    view_save(v);
    view_push_url(v);
}

function view_push_url(v) {
    history.pushState(null,null,view.url+"#");
}

function view_before_switch(v) {
    if(v == "")
	v="help";
    $("#folders *").removeClass("open");
    if($("#folders").find("."+v).length != 0)
	$("#folders ."+v).addClass("open");
    view.view=v;
    for(var i in view.views) {
	view.views[i].hide();
    }
    return v;
}

function view_set_final(v) {
    v=view_before_switch(v);
    view.views[v].show();
    view.url="?"+v;
}

function view_set_final_immediate(v) {
    v=view_before_switch(v);
    view.views[v].show_immediate();
    view.url="?"+v;
}

function view_save() {
    localStorage["view"]=view.view;
}

function view_restore() {
    if(!("view" in localStorage)) {
	view_set("help");
    } else {
	view.view=localStorage["view"];
	view_push_url(view.view);
	view_set_final_immediate(view.view);
    }
}

function view_restore_immediate() {
    if(!("view" in localStorage))
	view_save();
    view.view=localStorage["view"];
    view_push_url(view.view);
    view_set_final_immediate(view.view);
}

function view_settings() {
    view_set("settings");
}

function view_inbox() {
    view_set("inbox");
}

function view_sent() {
    view_set("sent");
}

function view_drafts() {
    view_set("drafts");
}

function view_help() {
    view_set("help");
}