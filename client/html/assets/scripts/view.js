
var View=function(name,content) {
    this.content=content;
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
	if(url.query != undefined) {
	    view_set_final(url.query);
	}
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
    v=new View("settings","HOW YOU MESS UP THE ENTIRE SERVER FOR EVERYBODY");
    view.views.settings=v;
    v=new View("about","<h1>About VoiceLink</h1>\n\
<p>Ever wanted to send a short message to someone but didn't want to call them, just to\n\
talk for ten seconds? That's what VoiceLink does. It makes it easy to send short messsages to\n\
people.</p>\n\
\n\
");
    view.views.about=v;
}

function view_set(v) {
    if(view.views[v] == undefined)
	return;
    view_set_final(v);
    history.pushState(null,null,view.url+"#");
}

function view_set_final(v) {
    if((v == "inbox") ||
       (v == "sent") ||
       (v == "drafts") ||
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
    view.views[v].show();
    view.url="?"+v;
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