
var logged_out_pages=[
    "main",
    "register",
    "login",
];

function generate_verification_code(length) {
    var characters="abcdefghijklmnopqrstuvwxyz";
    var result="";
    for(var i=0;i<length;i++) {
        var c=characters.charAt(Math.floor(Math.random()*characters.length));
	if(Math.floor(Math.random()*2) == 0)
	    c=c.toUpperCase();
	result+=c;
    }
    return result;
}

$(document).ready(function() {
    $("label").addClass("ui-hidden-accessible");
    voicelink.bind("start_session",function(r) {
	console.log("Session started!");
	logged_in();
    });
    voicelink.bind("verify_session",function(r) {
//	logged_in();
    });
    voicelink.bind("end_session",function(r) {
	logged_out();
    });
    voicelink.bind("session_dead",function(r) {
	logged_out();
    });
    voicelink.bind("register",function(r) {
	logged_in();
    });
    voicelink.bind("change_name",function(r) {
	$("#change-name-to").val(voicelink.session.name);
	$(".login-name").text(voicelink.session.name);
    });
    voicelink.init();
});

function logged_in() {
    console.log("Changing page");
    $.mobile.changePage("#menu");
}

function logged_out() {
    $.mobile.changePage("#main");
}

function loading_start() {
    $.mobile.loading("show");
}

function loading_stop() {
    $.mobile.loading("hide");
}

function error(e,t) {
    $("#"+e+"-error").text(t);
}

function login(handle,password) {
    loading_start();
    if(handle == undefined)
	handle=$("#login-handle").val();
    if(password == undefined)
	password=$("#login-password").val();
    voicelink.start_session(handle,password,function() {
	loading_stop();
    },function(r,n) {
	loading_stop();
	if(r == "invalid") {
	    if(n == "handle-length")
		error("login","The handle must be three or more characters long.");
	    else if(n == "password-length")
		error("login","You must enter a password.");
	    else
		error("login","Incorrect handle or password.");
	}
	error("login","Incorrect handle or password.");
    });
}

function register() {
    loading_start();
    var handle=$("#register-handle").val();
    var password=$("#register-password").val();
    var repeat_password=$("#register-repeat-password").val();
    voicelink.register(handle,password,repeat_password,function() {
	login(handle,password);
    },function(r,n) {
	loading_stop();
	if(r == "invalid") {
	    if(n == "handle-length")
		error("register","The handle must be three or more characters long.");
	    else if(n == "password-length")
		error("register","You must enter a password.");
	    else if(n == "repeat-password")
		error("register","The passwords don't match.");
	    else if(n == "handle")
		error("register","That handle has already been taken.");
	    else
		error("register","Incorrect handle or password.");
	} else {
	    error("register","Incorrect handle or password.");
	}
    });
}

function logout() {
    loading_start();
    voicelink.end_session(function() {
	loading_stop();
    },function(r,n) {
	loading_stop();
    });
}

function delete_account() {
    var password=$("#delete-account-password").val();
    loading_start();
    voicelink.delete_user(password,function() {
	logged_out();
	loading_stop();
    },function(r,n) {
	if(r == "invalid") {
	    if(n == "password-length")
		error("delete-account","You must enter a password.");
	    else
		error("delete-account","Incorrect password.");
	} else {
	    error("delete-account","Incorrect password.");
	}
	loading_stop();
    });
}

function change_name() {
    var name=$("#change-name-to").val();
    loading_start();
    voicelink.change_name(name,function() {
	$.mobile.changePage("#settings");
	loading_stop();
    },function(r,n) {
	console.log("HOW DID THIS HAPPEN???");
	loading_stop();
    });
}

function view_message(m) {
    $.mobile.changePage("#message");
}

function start_playing_message(m) {
    if(currently_playing != null) {
	stop_playing_message(currently_playing);
    }
    $("#play-message-number-"+m).buttonMarkup({icon:"pause"});
    currently_playing=m;
}

function stop_playing_message(m) {
    $("#play-message-number-"+m).buttonMarkup({icon:"play"});
    currently_playing=null;
}

var currently_playing=null;

function leave_messages() {
    history.back();
    stop_playing_message(currently_playing);
}

function play_message(m) {
    $("#play-message-number-"+m).toggleClass("playing");
    if($("#play-message-number-"+m).hasClass("playing"))
	start_playing_message(m);
    else
	stop_playing_message(m);
}