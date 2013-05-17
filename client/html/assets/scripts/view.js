
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
    if(folder == "drafts") {
	var date=new Date(m.composed*1000);
	var difference=day_difference(date,new Date());
	var d="";
	if(difference < 1) {
	    var time=date.format("h\\:i a");
	    d="<span class='time'>"+time+"</span>";
	} else {
	    var date=date.format("l\\, F j, Y");
	    var time=date.format("h\\:i a");
	    d="<span class='date'>"+date+"</span><span class='time'>"+time+"</span>";
	}
	var time_title=date.format("l\\, F j, Y \\a\\t h\\:i\\:s a");
	var from=voicelink.get_name();
	var duration=m.duration;
	return "<a class='link play' onclick='javascript:ui_play_message("+m.message_id+")'>Play</a> <span class='from' title='"+m.from_handle+"'>"+from+"</span>\
<span class='sent' title='"+time_title+"'>"+d+"</span>\
<span class='duration'>"+duration+"</span>";
    } else {
	return "errors. this is BAD!!!";
    }
}

function view_update_messages(folder) {
    var messages=voicelink.folders[folder].messages;
    $("#view-"+folder+" .wrapper").empty();
    if(messages.length == 0) {
	$("#view-"+folder+" .wrapper").append("<div class='folder no-messages'>"+_("no_messages")+"</div>")
    } else {
	$("#view-"+folder+" .wrapper").append("<ul class='folder'></ul>");
    }
    for(var i=0;i<messages.length;i++) {
	var m=messages[i];
	$("#view-"+folder+" .wrapper ul").append("<li id='message-number-"+m.message_id+"'>"+view_generate_message(m,folder)+"</li>");
    }
}

function view_init() {
    view_create_views();
    $(window).bind("popstate",function(e) {
	var url=parseUri(location.href);
	var hash="";
	if(url.relative.indexOf("#") >= 0)
	    hash=url.relative.split("#")[1];
	ui_hide_modal_final("*");
	if(hash != "")
	    ui_show_modal(hash);
	var v=url.query;
	view_set_final(v);
    });
    voicelink.bind("get_folder",function(f) {
	if(f.folder == view.view)
	    view_update_messages(f.folder);
    });
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
    if(!voicelink.verified()) {
	$("#folders li.login").addClass("hidden");
	if(v != "help") {
	    v="help";
	    history.pushState(null,null,"?help#");
	}
    } else {
	$("#folders li.login").removeClass("hidden");
    }
    $("#folders *").removeClass("open");
    if($("#folders").find("."+v).length != 0)
	$("#folders ."+v).addClass("open");
    view.view=v;
    for(var i in view.views) {
	view.views[i].hide();
    }
    if(v in voicelink.folders)
	view_update_messages(v);
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
	view.view="inbox";
	view_save();
    }
    view.view=localStorage["view"];
    view_push_url(view.view);
    view_set_final(view.view);
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