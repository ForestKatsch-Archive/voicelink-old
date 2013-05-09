
var Modal=function(name,title,content) {
    this.content=content;
    this.title=title;
    this.name=name;
    this.html=$(document.createElement("div"));
    this.html.attr("id","modal-"+this.name);
    this.html.addClass("modal");
    this.create=function() {
	this.html.append("<header>\n\
<h1>"+this.title+"</h1>\n\
<a class='close link'><img src='assets/img/close.png' alt='close' /></a>\n\
</header>\n\
<div class='wrapper'>"+this.content+"</div>");
	$("#modals").append(this.html);
	var that=this;
	this.html.find("header .close").click(function(e) {
	    that.hide();
	});
	this.html.keydown(function(e) {
	    if(e.which == 27)
		that.hide();
	});
    };
    this.create();
    this.show=function() {
	this.html.addClass("visible");
	this.html.fadeIn(ui.modal.fade_time);
	$("*").blur();
	this.html.find("[autofocus]")[0].focus();
	ui_show_overlay();
    };
    this.hide=function() {
	this.html.removeClass("visible");
	this.html.fadeOut(ui.modal.fade_time);
	ui_hide_overlay();
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
    modal:{
	fade_time:100,
	overlay:null,
	number:0,
	windows:{
	
	}
    },
};

function ui_init() {
    ui_create_modals();
    $("#login-show").click(function() {
	ui_toggle_login();
    });
    ui_show_login();
    loaded("ui");
}

function ui_show_modal(modal) {
    $(".modal").removeClass("visible");
    $(".modal").fadeOut(ui.modal.fade_time);
    ui.modal.windows[modal].show();
}

function ui_hide_modal(modal) {
    if(modal == "*") {
	for(var i in ui.modal.windows)
	    ui_hide_modal(i);
    } else {
	ui.modal.windows[modal].hide();
    }
}

function ui_toggle_modal(modal) {
    ui.modal.windows[modal].toggle();
}

function ui_show_overlay() {
    ui.modal.number+=1;
    ui.modal.overlay.fadeIn(ui.modal.fade_time);
}

function ui_hide_overlay() {
    ui.modal.number-=1;
    if(ui.modal.number == 0)
	ui.modal.overlay.fadeOut(ui.modal.fade_time);
}

function ui_create_modals() {
    ui.modal.windows.login=new Modal("login","Login","<input type='text' id='login-handle' name='username' autofocus />\n\
<input type='password' id='login-password' name='password' />\n\
<div class='error-message hidden'></div>\n\
<div id='login-button' class='button action'>Login</button>\n\
");
    ui.modal.windows.login.html.keydown(function(e) {
	if(e.which == 13)
	    ui_login();
    });
    ui.modal.overlay=$(document.createElement("div"));
    ui.modal.overlay.attr("id","overlay");
    ui.modal.overlay.click(function() {
	ui_hide_modal("*");
    });
    $("body").append(ui.modal.overlay);
}

function ui_login() {
    var handle=$("#modal-login #login-handle").val();
    var password=$("#modal-login #login-password").val();
    if(handle == "bob" && password == "foo") {
	ui_hide_login();
    } else {
	
    }
}

function ui_show_login() {
    ui_show_modal("login");
}

function ui_hide_login() {
    ui_hide_modal("login");
}

function ui_toggle_login() {
    ui_toggle_modal("login");
}

function ui_done() {
    $("title").text("VoiceLink");
}