
var Dialog=function(name,title,content) {
    this.content=content;
    this.title=title;
    this.name=name;
    this.html=$(document.createElement("div"));
    this.html.attr("id","dialog-"+this.name);
    this.html.addClass("dialog");
    this.created=false;
    this.create=function() {
	this.html.append("<header>\n\
<h1>"+this.title+"</h1>\n\
</header>\n\
<div class='wrapper'>"+this.content+"</div>");
	$("#dialogs").append(this.html);
	this.created=true;
    };
    this.show=function() {
	if(!this.created)
	    this.create();
	this.html.addClass("visible");
    };
    this.hide=function() {
	if(!this.created)
	    this.create();
	this.html.removeClass("visible");
    };
    this.toggle=function() {
	if(this.html.hasClass("visible"))
	    this.hide();
	else
	    this.show();

    };
};

var ui={
    login:{
	html:null,
    },
    dialogs:{
	
    },
    modal:{
	overlay:null,
	number:0,
	windows:[]
    },
};

function ui_init() {
    ui_create_dialogs();
    ui_create_login();
    $("#login-button").click(function() {
	ui_show_login();
    });
    loaded("ui");
}

function ui_show_dialog(dialog) {
    ui.dialogs[dialog].show();
}

function ui_toggle_dialog(dialog) {
    ui.dialogs[dialog].toggle();
}

function ui_create_dialogs() {
    
}

function ui_show_login() {
    $("#login").show();
}

function ui_done() {
    $("title").text("VoiceLink");
}