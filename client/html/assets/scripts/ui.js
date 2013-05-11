
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
<a class='close link' title='"+_("close")+"'><img src='assets/img/close.png' alt='close' /></a>\n\
</header>\n\
<div class='wrapper'>"+this.content+"</div>");
	$("#modal").append(this.html);
	var that=this;
	this.html.find("header .close").click(function(e) {
	    ui_hide_modal(that.name);
	});
	this.html.keydown(function(e) {
	    if(e.which == 27)
		ui_hide_modal(that.name);
	});
    };
    this.set_title=function(t) {
	this.title=t;
	this.html.find("h1").text(t);
    };
    this.create();
    this.show=function() {
	this.html.fadeIn(ui.modal.fade_time);
	$("*").blur();
	this.html.find("[autofocus]").focus();
	console.log("show");
    };
    this.hide=function() {
	this.html.fadeOut(ui.modal.fade_time);
	this.html.find(".error-message").addClass("hidden");
    };
};

var ui={
    confirm_callback:null,
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
    ui_locale_init();
    $("#login-show").bind("click",ui_show_login);
    $("#register-show").bind("click",ui_show_register);
    $("#folders .settings").bind("click",view_settings);
    $("#folders .inbox").bind("click",view_inbox);
    $("#folders .sent").bind("click",view_sent);
    $("#folders .drafts").bind("click",view_drafts);
    $("#folders .help").bind("click",view_help);
    loaded("ui");
}

function ui_locale_init() {
    $("#register-show").text(_("register"));
    $("#login-show").text(_("login"));
    $("#folders .inbox").text(_("inbox"));
    $("#folders .sent").text(_("sent"));
    $("#folders .drafts").text(_("drafts"));
    $("#folders .settings").text(_("settings"));
    $("#folders .help").text(_("help"));
}


function ui_show_modal(modal) {
    if(ui.modal.windows[modal] == undefined)
	return;
    history.pushState(null,null,view.url+"#"+modal);
    ui_show_modal_final(modal);
}

function ui_show_modal_final(modal) {
    $(".modal").fadeOut(ui.modal.fade_time);
    ui.modal.windows[modal].show();
    ui_show_overlay();
}

function ui_hide_modal(modal) {
    if(ui.modal.windows[modal] == undefined)
	return;
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
    ui.modal.windows.login=new Modal("login",_("login"),"\
<input type='text' id='login-handle' name='username' placeholder='"+_("handle")+"' autofocus />\n\
<input type='password' id='login-password' name='password' placeholder='"+_("password")+"' />\n\
<div class='error-message hidden'></div>\n\
<div id='login-button' class='button action'>"+_("login")+"</button>\n\
");
    ui.modal.windows.login.html.keydown(function(e) {
	if(e.which == 13)
	    ui_login();
    });
    ui.modal.windows.login.html.find("#login-button").click(function(e) {
	ui_login();
    });
    ui.modal.windows.register=new Modal("register",_("register"),"\
<input type='text' id='register-handle' name='username' placeholder='"+_("handle")+"' autofocus />\n\
<input type='password' id='register-password' name='password' placeholder='"+_("password")+"' />\n\
<input type='password' id='register-repeat-password' name='repeat-password' placeholder='"+_("repeat_password")+"' />\n\
<div class='error-message hidden'></div>\n\
<div id='register-button' class='button action'>"+_("register")+"</button>\n\
");
    ui.modal.windows.register.html.keydown(function(e) {
	if(e.which == 13)
	    ui_register();
    });
    ui.modal.windows.register.html.find("#register-button").click(function(e) {
	ui_register();
    });
    ui.modal.windows.confirm=new Modal("confirm",_("confirm_password"),"\
<p class='text'></p>\n\
<input type='password' id='confirm-password' name='password' placeholder='"+_("confirm_password")+"' />\n\
<div class='error-message hidden'></div>\n\
<div id='confirm-button' class='button action'>"+_("confirm")+"</button>\n\
");
    ui.modal.windows.confirm.html.keydown(function(e) {
	if(e.which == 13)
	    ui_confirm();
    });
    ui.modal.windows.confirm.html.find("#confirm-button").click(function(e) {
	ui_confirm();
    });
    ui_create_overlay();
}

function ui_delete_account() {
    ui_show_confirm(_("enter_password_to_delete"),_("after_delete_account"));
}

function ui_show_confirm(t,p,callback) {
    ui.confirm_callback=callback;
    ui.modal.windows.confirm.set_title(t);
    ui.modal.windows.confirm.html.find("p.text").html(p);
    ui_show_modal("confirm");
}

function ui_confirm() {
    voice
    ui.confirm_callback=callback;
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
    if(handle.length <= 2) {
	$("#modal-login .error-message").removeClass("hidden");
	$("#modal-login .error-message").text(_("incorrect_handle_or_password"));
    } else if(voicelink.handle_re.test(handle) == false) {
	$("#modal-login .error-message").removeClass("hidden");
	$("#modal-login .error-message").text(_("only_alphanumeric"));
    } else if(password.length == 0) {
	$("#modal-login .error-message").removeClass("hidden");
	$("#modal-login .error-message").text(_("password_too_short"));
    } else {
	voicelink_start_session(handle,password,function(r) {
	    view_inbox();
	    ui_logged_in();
	},function(r,n) {
	    console.log(r,n);
	    $("#modal-login .error-message").removeClass("hidden");
	    if(r == "invalid" && n == "handle") {
		$("#modal-login .error-message").text(_("incorrect_handle_or_password"));
	    } else if(r == "auth") {
		$("#modal-login .error-message").text(_("incorrect_handle_or_password"));
	    } else {
		$("#modal-login .error-message").text(_("this_is_bad"));
	    }
	    return false;
	});
    }
}

function ui_logout() {
    voicelink_end_session(function(r) {
	ui_logged_out();
    });
}

function ui_register() {
    var handle=$("#modal-register #register-handle").val();
    var password=$("#modal-register #register-password").val();
    var repeat_password=$("#modal-register #register-repeat-password").val();
    if(handle.length <= 2) {
	$("#modal-login .error-message").removeClass("hidden");
	$("#modal-register .error-message").text(_("three_or_more"));
    } else if(voicelink.handle_re.test(handle) == false) {
	$("#modal-register .error-message").removeClass("hidden");
	$("#modal-register .error-message").text(_("only_alphanumeric"));
    } else if(password != repeat_password) {
	$("#modal-register .error-message").removeClass("hidden");
	$("#modal-register .error-message").text(_("passwords_dont_match"));
    } else if(password.length == 0) {
	$("#modal-register .error-message").removeClass("hidden");
	$("#modal-register .error-message").text(_("password_too_short"));
    } else {
	ui.modal.windows.register.html.find(".error-message").addClass("hidden");
	voicelink_register(handle,password,repeat_password,function(r) {
	    voicelink_start_session(handle,password,ui_logged_in);
	    ui_hide_register();
	    view_inbox();
	},function(r,n) {
	    $("#modal-register .error-message").removeClass("hidden");
	    if(r == "invalid" && n == "handle") {
		$("#modal-register .error-message").text(_("already_taken"));
	    } else if(r == "invalid" && n == "password") {
		$("#modal-register .error-message").text(_("passwords_dont_match"));
	    } else {
		$("#modal-register .error-message").text(_("this_is_bad"));
	    }
	    return false;
	});
    }
}

function ui_logged_in() {
    $("#login-show").text(_("logout"));
    $("#login-show").unbind("click");
    $("#login-show").bind("click",ui_logout);
    $("#register-show").addClass("hidden");
    $("#folders .settings").removeClass("hidden");
    ui_hide_login();
}

function ui_logged_out() {
    $("#login-show").text(_("login"));
    $("#login-show").unbind("click");
    $("#login-show").bind("click",ui_show_login);
    $("#register-show").removeClass("hidden");
    $("#folders .settings").addClass("hidden");
    $("#modal-login input").each(function() {
	$(this).val("");
    });
    view_about();
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
    $("title").text(_("voicelink"));
//    view.views.about.show_immediate();
    view_restore_immediate();
}