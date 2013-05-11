
var View=function(name,content) {
    this.content=content;
    if(typeof content == typeof []) {
	this.content="";
	for(var i=0;i<content.length;i++) {
	    this.content+="<article>"+content[i]+"</article>";
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
    view:"about",
    views:{

    },
};

function view_init() {
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
    view_create_views();
    loaded("view");
}

function view_done() {

}

function view_create_views() {
    var v=new View("inbox","DIS IS DA INBOX");
    view.views.inbox=v;
    v=new View("sent","YOU SENT THESE YOU DUMBASS");
    view.views.sent=v;
    v=new View("drafts","HEY DESE BE TINGS YOU 'FRAID TO SEND");
    view.views.drafts=v;
    v=new View("settings","\
<div class='account pane'>\n\
<header>\n\
<h1>"+_("account")+"</h1>\n\
<a class='button delete' title='"+_("delete_account")+"'>"+_("delete_account")+"</a>\n\
</div>\n\
");
    view.views.settings=v;
    v=new View("about",_("about_voicelink_text"));
    view.views.about=v;
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
    if((v == "inbox") ||
       (v == "sent") ||
       (v == "drafts") ||
       (v == "help") ||
       (v == "settings")) {
	$("#folders *").removeClass("open");
	$("#folders ."+v).addClass("open");
    }
    if(v == "about") {
	$("#folders").addClass("hidden");
    } else {
	$("#folders").removeClass("hidden");
    }
    view.view=v;
    for(var i in view.views) {
	view.views[i].hide();
    }
}

function view_set_final(v) {
    view_before_switch(v);
    view.views[v].show();
    view.url="?"+v;
}

function view_set_final_immediate(v) {
    view_before_switch(v);
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

function view_about() {
    view_set("about");
}

function view_help() {
    view_set("help");
}