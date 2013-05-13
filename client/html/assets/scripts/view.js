
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

function view_generate_message(m) {
    return "From "+m.from_handle+" timestamp "+m.date+", "+m.duration+" seconds long.";
}

function view_update_messages(folder,message_list) {
    $("#view-"+folder+" .wrapper").empty();
    if(message_list.length == 0) {
	$("#view-"+folder+" .wrapper").append("<div class='no-messages'>No messages.</div>")
    } else {
	$("#view-"+folder+" .wrapper").append("<ul></ul>");
    }
    for(var i=0;i<message_list.length;i++) {
	$("#view-"+folder+" .wrapper ul").append("<li>"+view_generate_message(message_list[i])+"</li>");
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
<header>\n\
<h1>"+_("account")+"</h1>\n\
<ul>\n\
<li><a class='button change-name' title='"+_("change_name")+"'>"+_("change_name")+"</a></li>\n\
<li><a class='button delete' title='"+_("delete_account")+"'>"+_("delete_account")+"</a></li>\n\
</ul>\n\
</div>\n\
");
    v.html.find(".delete.button").click(ui_delete_user);
    v.html.find(".change-name.button").click(ui_change_name);
    view.views.settings=v;
    v=new View("help","There's no help.");
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
    if(!("view" in localStorage))
	view_save();
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