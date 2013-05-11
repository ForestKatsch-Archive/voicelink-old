
var Request=function(action,args,callback,error) {
    this.action=action;
    this.args=args;
    this.callback=callback;
    this.error=error;
    this.waiting=false;
    var session_info=false;
    if((this.action == "end_session") ||
       (this.action == "delete_user") ||
       (this.action == "verify_session")
      )
	session_info=true;
    if(session_info == true) {
	this.args["session_id"]=voicelink.session.session_id;
	this.args["session_hash"]=voicelink.session.session_hash;
    }
    this.go=function(callback) {
	var that=this;
	this.waiting=true;
	voicelink_post(this.action,this.args,function(r) {
	    if(callback)
		callback(r);
	    if(that.callback)
		that.callback(r);
	    that.waiting=false;
	},function(r,n) {
	    if(((r == "invalid") && (n == "session")) ||
	       ((r == "auth") && (n == "needed"))) {
		voicelink_end_session_final();
	    } else {
		if(that.error)
		    that.error(r,n);
	    }
	});
    };
};

var voicelink={
    handle_re:/^[\w\-\.]+$/,
    href:"http://localhost/api.php",
    requests:[],
    session:{
	handle:null,
	session_id:-1,
	session_hash:null,
	verified:false
    }
};

function voicelink_init() {
    voicelink_restore_session();
    if(!voicelink_verified()) {
	if(voicelink.session.session_id != -1) {
	    voicelink_verify_session(function(r) {
		if(r.active == "false")
		    ui_logged_out();
		else
		    ui_logged_in();
	    },function(r) {
		voicelink_end_session_final();
		view_about();
	    });
	}
    }
    loaded("voicelink");
}

function voicelink_verified() {
    return voicelink.session.verified;
}

function voicelink_requests() {
    for(var i=0;i<voicelink.requests.length;i++) {
	if(voicelink.requests[i].waiting)
	    return;
    }
    if(voicelink.requests.length != 0) {
	var v=voicelink.requests[0];
	voicelink.requests.splice(0,1);
	v.go(function() {
	    voicelink_requests();
	});
    }
}

function voicelink_save_session() {
    localStorage["voicelink_session"]=JSON.stringify(voicelink.session);
}

function voicelink_restore_session() {
    if("voicelink_session" in localStorage) {
	var verified=voicelink.session.verified; // make sure we don't accidentally allow year-old sessions to open (at first).
	voicelink.session=JSON.parse(localStorage["voicelink_session"]);
	voicelink.session.verified=verified;
    } else {
	voicelink_save_session();
    }
}

function voicelink_poke(callback,error) {
    voicelink.requests.push(new Request("poke",{},callback,error));
    voicelink_requests();
}

function voicelink_delete_user(callback,error) {
    voicelink.requests.push(new Request("delete_user",{},function(r) {
	voicelink_end_session_final();
	callback(r);
    },error));
    voicelink_requests();
}

function voicelink_verify_session(callback,error) {
    voicelink.requests.push(new Request("verify_session",{},function(r) {
	voicelink.session.verified=false;
	voicelink_save_session();
	if(callback)
	    callback(r);
    },error));
    voicelink_requests();
}

function voicelink_register(handle,password,repeat_password,callback,error) {
    voicelink.requests.push(new Request("register",{handle:handle,password:password,repeat_password:password},callback,error));
    voicelink_requests();
}

function voicelink_start_session(handle,password,callback,error) {
    voicelink.session.handle=handle;
    voicelink.requests.push(new Request("start_session",{handle:handle,password:password},function(r) {
	voicelink.session.session_id=r.session_id;
	voicelink.session.session_hash=r.session_hash;
	voicelink.session.verified=true;
	voicelink_save_session();
	callback(r);
    },error));
    voicelink_requests();
}

function voicelink_end_session_final() {
    voicelink.session.verified=false;
    voicelink.session.session_id=-1;
    voicelink.session.session_hash=null;
    voicelink.session.handle=null;
    voicelink_save_session();
    ui_logged_out();
}

function voicelink_end_session(callback,error) {
    voicelink.requests.push(new Request("end_session",{},function(r) {
	voicelink_end_session_final();
	callback(r);
    },function(r,n) {
	if(r == "auth")
	    voicelink_end_session_final();
	if(error)
	    error(r,n);
    }));
    voicelink_requests();
}

function voicelink_post(action,args,callback,error) {
    $.post(voicelink.href+"?action="+encodeURIComponent(action),args,function(r) {
	r=JSON.parse(r);
	if(r.status == "error") {
	    if(error)
		error(r.reason,r.noun);
	    else
		throw "VoicelinkError: "+r.reason+": "+r.noun;
	} else {
	    callback(r);
	}
    }).error(function(e,status) {
	console.log(e,status);
	if(status != "error")
	    error("http",status)
	else
	    error("http",e.statusCode().status);
//	callback();
    });
}

function voicelink_done() {
    
}