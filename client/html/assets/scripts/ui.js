
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
	this.html.find("input").val("");
	this.html.find("[autofocus]").focus();
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
    ui_locale_init();
    voicelink.bind("start_session",function() {
	console.log("Start session");
	ui_logged_in();
    });
    voicelink.bind("end_session",function() {
	console.log("End session");
	ui_logged_out();
    });
    voicelink.bind("verify_session",function() {
	console.log("Session verified");
	ui_logged_in();
    });
    voicelink.bind("session_dead",function() {
	console.log("Session dead");
	ui_logged_out();
    });
    voicelink.bind("change_name",function() {
	$("#handle").text(voicelink.get_name());
	$("#handle").attr("title",voicelink.session.handle);
    });
    $("#login-show").bind("click",ui_show_login);
    $("#register-show").bind("click",ui_show_register);
    $("#folders .settings").bind("click",view_settings);
    $("#folders .inbox").bind("click",view_inbox);
    $("#folders .sent").bind("click",view_sent);
    $("#folders .drafts").bind("click",view_drafts);
    $("#folders .help").bind("click",view_help);
    $("#new #record-button").bind("click",ui_start_record);
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
    $("#new #record-button").text(_("start_record"));
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
    ui.modal.windows["confirm-delete"]=new Modal("confirm-delete",_("enter_password_to_delete"),"\
<p class='text'>"+_("after_delete_account")+"</p>\n\
<input type='password' id='confirm-delete-password' name='password' placeholder='"+_("confirm_password")+"' autofocus />\n\
<div class='error-message hidden'></div>\n\
<div id='confirm-button' class='button action'>"+_("confirm")+"</button>\n\
");
    ui.modal.windows["confirm-delete"].html.keydown(function(e) {
	if(e.which == 13)
	    ui_confirm_delete();
    });
    ui.modal.windows["confirm-delete"].html.find("#confirm-button").click(function(e) {
	ui_confirm_delete();
    });
    ui.modal.windows["change-name"]=new Modal("change-name",_("change_name"),"\
<input type='text' id='change-name-to' name='change-name-to' placeholder='"+_("new_name")+"' autofocus />\n\
<div id='change-name-button' class='button action'>"+_("change_name")+"</button>\n\
");
    ui.modal.windows["change-name"].html.keydown(function(e) {
	if(e.which == 13)
	    ui_change_name_final();
    });
    ui.modal.windows["change-name"].html.find("#change-name-button").click(function(e) {
	ui_change_name_final();
    });
    ui_create_overlay();
}

function ui_delete_user() {
    ui_show_confirm_delete();
}

function ui_show_confirm_delete() {
    ui_show_modal("confirm-delete");
}

function ui_confirm_delete() {
    var password=$("#modal-confirm-delete #confirm-delete-password").val();
    voicelink.delete_user(password,function(r) {
	ui_logged_out();
    },function(r,n) {
	console.log(r,n);
	$("#modal-confirm-delete .error-message").removeClass("hidden");
	$("#modal-confirm-delete .error-message").text(_("incorrect_password"))
    });
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
    voicelink.start_session(handle,password,function(r) {
	view_inbox();
	ui_logged_in();
    },function(r,n) {
	console.log(r,n);
	$("#modal-login .error-message").removeClass("hidden");
	if(r == "invalid") {
	    if(n == "handle")
		$("#modal-login .error-message").text(_("incorrect_handle_or_password"));
	    else if(n == "handle-chars")
		$("#modal-login .error-message").text(_("only_alphanumeric"));
	    else if(n == "handle-length")
		$("#modal-login .error-message").text(_("handle_too_short"));
	    else if(n == "password-length")
		$("#modal-login .error-message").text(_("password_too_short"));
	} else if(r == "auth") {
	    $("#modal-login .error-message").text(_("incorrect_handle_or_password"));
	} else {
	    console.log("THIS IS BAD: ",r,n);
	    $("#modal-login .error-message").text(_("this_is_bad"));
	}
	return false;
    });
}

function ui_logout() {
    voicelink.end_session(function(r) {
	ui_logged_out();
    });
}

function ui_register() {
    var handle=$("#modal-register #register-handle").val();
    var password=$("#modal-register #register-password").val();
    var repeat_password=$("#modal-register #register-repeat-password").val();
    voicelink.register(handle,password,repeat_password,function(r) {
	voicelink.start_session(handle,password,ui_logged_in);
	ui_hide_register();
	view_inbox();
    },function(r,n) {
	$("#modal-register .error-message").removeClass("hidden");
	if(r == "invalid" && n == "handle") {
	    $("#modal-register .error-message").text(_("already_taken"));
	} else if(n == "handle-chars") {
	    $("#modal-register .error-message").text(_("only_alphanumeric"));
	} else if(r == "invalid" && n == "handle-length") {
	    $("#modal-register .error-message").text(_("handle_too_short"));
	} else if(r == "invalid" && n == "password-repeat") {
	    $("#modal-register .error-message").text(_("passwords_dont_match"));
	} else if(r == "invalid" && n == "password-length") {
	    $("#modal-register .error-message").text(_("password_too_short"));
	} else {
	    console.log("THIS IS BAD: ",r,n);
	    $("#modal-register .error-message").text(_("this_is_bad"));
	}
	return false;
    });
}

function ui_change_name() {
    ui_show_modal("change-name");
    if(voicelink.session.name != null)
	$("#modal-change-name #change-name-to").val(voicelink.session.name);
}

function ui_change_name_final() {
    var name=$("#modal-change-name #change-name-to").val();
    voicelink.change_name(name,function(r) {
	ui_hide_modal("change-name");
    },function(r,n) {
	console.log(r,n);
    });
}

function ui_logged_in() {
    $("body").addClass("logged-in");
    $("#login-show").text(_("logout"));
    $("#login-show").unbind("click");
    $("#login-show").bind("click",ui_logout);
    view_restore("inbox");
    ui_hide_login();
}

function ui_logged_out() {
    $("body").removeClass("logged-in");
    $("#login-show").text(_("login"));
    $("#login-show").unbind("click");
    $("#login-show").bind("click",ui_show_login);
    $("#modal-login input").each(function() {
	$(this).val("");
    });
    ui_hide_modal_final("*");
    view_help();
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
//    view_restore_immediate();
}

function ui_start_record() {
    mic_record_start(function(data) {
	$("#new #record-button").text(_("stop_record"));
	$("#new #record-button").unbind("click");
	$("#new #record-button").bind("click",ui_stop_record);
    },function() {
	console.log("Hey, you denied VoiceLink microphone access!");
    });
}

function ui_stop_record() {
    mic_record_stop(function(data) {
	$("#new #record-button").text(_("start_record"));
	$("#new #record-button").unbind("click");
	$("#new #record-button").bind("click",ui_start_record);
	voicelink.new_message(data.blob,function(data) {
	    voicelink.recipients(data.message_id,$("#new #recipients-input").val(),function(r) {

	    },function(r,n) {

	    });
	});
	console.log(data);
    });
}

function ui_play_message(id) {
    if(!voicelink.is_message(id))
	return;
    var url=voicelink.get_message_url(id);
    location.href=url;
}

function ui_format_date(timestamp) {
    var date=new Date((timestamp)*1000);
    var difference=day_difference(date,new Date());
    var t=date.format("h\\:i a");
    var d=date.format("l\\, F j, Y");
    return {
	date:d,
	time:t,
	day:(difference>1?false:true),
	full_time:date.format("l\\, F j, Y \\a\\t h\\:i\\:s a")
    };
}

function ui_edit_message(id) {
    if(!voicelink.is_message(id))
	return;
    if(voicelink.message_folder(id) != "drafts")
	return;
    var m=voicelink.get_message(id);
    $("#new .from").text(voicelink.get_name());
    console.log(m.duration);
    $("#new .duration").text(m.duration);
    var d=ui_format_date(m.composed);
    var title_time=d.full_time;
    if(d.day)
	d="<span class='time'>"+d.time+"</span>";
    else
	d="<span class='date'>"+date+"</span><span class='time'>"+d.time+"</span>";
    $("#new .composed").attr("title",title_time);
    $("#new .composed").empty();
    $("#new .composed").append(d);
}

function ui_delete_message(id) {
    if(!voicelink.is_message(id))
	return;
    voicelink.delete_message(id,function(r) {
	view_update();
    },function(r,n) {
	
    });
}