
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
	    ui_hide_modal(that.name);
	});
	this.html.keydown(function(e) {
	    if(e.which == 27)
		ui_hide_modal(that.name);
	});
    };
    this.create();
    this.show=function() {
	this.html.fadeIn(ui.modal.fade_time);
	$("*").blur();
	this.html.find("[autofocus]")[0].focus();
    };
    this.hide=function() {
	this.html.fadeOut(ui.modal.fade_time);
	this.html.find(".error-message").addClass("hidden");
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
	ui_show_login();
    });
    $("#register-show").click(function() {
	ui_show_register();
    });
    loaded("ui");
}

function ui_show_modal(modal) {
    history.pushState(null,null,view.url+"#"+modal);
    ui_show_modal_final(modal);
}

function ui_show_modal_final(modal) {
    $(".modal").fadeOut(ui.modal.fade_time);
    ui.modal.windows[modal].show();
    ui_show_overlay();
}

function ui_hide_modal(modal) {
    history.pushState(null,null,view.url+"#");
    ui_hide_modal_final(modal);
}

function ui_hide_modal_final(modal) {
    if(modal == "*") {
	for(var i in ui.modal.windows)
	    ui_hide_modal(i);
    } else {
	ui.modal.windows[modal].hide();
    }
    ui_hide_overlay();
}

function ui_show_overlay() {
    ui.modal.overlay.fadeIn(ui.modal.fade_time);
}

function ui_hide_overlay() {
    ui.modal.overlay.fadeOut(ui.modal.fade_time);
}

function ui_create_modals() {
    ui.modal.windows.login=new Modal("login","Login","<input type='text' id='login-handle' name='username' placeholder='Handle' autofocus />\n\
<input type='password' id='login-password' name='password' placeholder='Password' />\n\
<div class='error-message hidden'>Now THAT'S an error!</div>\n\
<div id='login-button' class='button action'>Login</button>\n\
");
    ui.modal.windows.login.html.keydown(function(e) {
	if(e.which == 13)
	    ui_login();
    });
    ui.modal.windows.login.html.find("#login-button").click(function(e) {
	ui_login();
    });
    ui.modal.windows.register=new Modal("register","Register","<input type='text' id='register-handle' name='username' placeholder='Handle' autofocus />\n\
<input type='password' id='register-password' name='password' placeholder='Password' />\n\
<input type='password' id='register-repeat-password' name='repeat-password' placeholder='Repeat password' />\n\
<div class='error-message hidden'>Now THAT'S an error!</div>\n\
<div id='register-button' class='button action'>Register</button>\n\
");
    ui.modal.windows.register.html.keydown(function(e) {
	if(e.which == 13)
	    ui_register();
    });
    ui.modal.windows.register.html.find("#register-button").click(function(e) {
	ui_register();
    });
    ui_create_overlay();
}

function ui_create_overlay() {
    ui.modal.overlay=$(document.createElement("div"));
    ui.modal.overlay.attr("id","overlay");
    ui.modal.overlay.click(function() {
	ui_hide_modal_final("*");
    });
    $("body").append(ui.modal.overlay);
}

function ui_login() {
    var handle=$("#modal-login #login-handle").val();
    var password=$("#modal-login #login-password").val();
    voicelink_push_error(function(r,n) {
	$("#modal-login .error-message").removeClass("hidden");
	if(r == "invalid" && n == "handle") {
	    $("#modal-login .error-message").text("Incorrect handle or password.");
	} else if(r == "auth") {
	    $("#modal-login .error-message").text("Incorrect handle or password.");
	} else {
	    return;
	}
	voicelink_pop_error();
	return false;
    });
    voicelink_start_session(handle,password,function(r) {
	ui_logged_in();
    });
}

function ui_logged_in() {
    $("#login-button").text("Logout");
    ui_hide_login();
    voicelink_pop_error();
}

function ui_register() {
    var handle=$("#modal-register #register-handle").val();
    var password=$("#modal-register #register-password").val();
    var repeat_password=$("#modal-register #register-repeat-password").val();
    if(handle.length <= 2) {
	$("#modal-register .error-message").removeClass("hidden");
	$("#modal-register .error-message").text("The handle must be three or more characters long.");
    } else if(/^[\w\-\.]+$/.test(handle) == false) {
	$("#modal-register .error-message").removeClass("hidden");
	$("#modal-register .error-message").text("The handle must consist only of a-z, A-Z, underscores, and hyphens.");
    } else if(password != repeat_password) {
	$("#modal-register .error-message").removeClass("hidden");
	$("#modal-register .error-message").text("The passwords don't match.");
    } else if(password.length == 0) {
	$("#modal-register .error-message").removeClass("hidden");
	$("#modal-register .error-message").text("You must specify a password.");
    } else {
	ui.modal.windows.register.html.find(".error-message").addClass("hidden");
	voicelink_push_error(function(r,n) {
	    $("#modal-register .error-message").removeClass("hidden");
	    if(r == "invalid" && n == "handle") {
		$("#modal-register .error-message").text("That handle has already been taken.");
	    } else if(r == "invalid" && n == "password") {
		$("#modal-register .error-message").text("The passwords don't match.");
	    } else {
		return;
	    }
	    voicelink_pop_error();
	    return false;
	});
	voicelink_register(handle,password,repeat_password,function(r) {
	    console.log("Registered!");
	    ui_hide_register();
	    voicelink_pop_error();
	});
    }
}

function ui_show_login() {
    ui_show_modal("login");
}

function ui_hide_login() {
    ui_hide_modal("login");
}

function ui_show_register() {
    ui_show_modal("register");
}

function ui_hide_register() {
    ui_hide_modal("register");
}

function ui_done() {
    $("title").text("VoiceLink");
}