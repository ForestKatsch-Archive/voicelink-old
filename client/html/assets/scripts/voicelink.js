
var Request=function(action,args,callback) {
    this.action=action;
    this.args=args;
    this.callback=callback;
    this.waiting=false;
    var session_info=false;
    if((this.action == "end_session") ||
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
	});
    };
};

var voicelink={
    error:[],
    requests:[],
    href:"http://localhost/api.php",
    session:{
	handle:null,
	session_id:-1,
	session_hash:null,
	verified:false
    }
};

function voicelink_init() {
    voicelink_restore_session();
    voicelink_push_error(function(r,n) {
	throw "VoicelinkError: "+r+": "+n+".";
    });
    if(!voicelink_verified())
	voicelink_verify_session(function(r) {
	    if(r.active == "false")
		ui_logged_out();
	    else
		ui_logged_in();
	});
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
    console.log("Saved session information.");
    localStorage["voicelink_session"]=JSON.stringify(voicelink.session);
    console.log(localStorage["voicelink_session"]);
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

function voicelink_poke(callback) {
    voicelink.requests.push(new Request("poke",{},callback));
    voicelink_requests();
}

function voicelink_verify_session(callback) {
    voicelink.requests.push(new Request("verify_session",{},callback));
    voicelink_requests();
}

function voicelink_register(handle,password,repeat_password,callback) {
    voicelink.requests.push(new Request("register",{handle:handle,password:password,repeat_password:password},callback));
    voicelink_requests();
}

function voicelink_start_session(handle,password,callback) {
    voicelink.session.handle=handle;
    voicelink.requests.push(new Request("start_session",{handle:handle,password:password},function(r) {
	console.log("Whee, we're starting a new session!",r);
	voicelink.session.session_id=r.session_id;
	voicelink.session.session_hash=r.session_hash;
	voicelink_save_session();
	callback(r);
    }));
    voicelink_requests();
}

function voicelink_end_session(callback) {
    voicelink.requests.push(new Request("end_session",{},function(r) {
	callback(r);
    }));
    voicelink_requests();
}

function voicelink_push_error(callback) {
    voicelink.error.push(callback);
}

function voicelink_pop_error() {
    voicelink.error.pop();
}

function voicelink_raise_error(reason,noun) {
    for(var i=voicelink.error.length-1;i>=0;i--) {
	if(voicelink.error[i](reason,noun) == false)
	    return;
    }
}

function voicelink_post(action,args,callback) {
    $.post(voicelink.href+"?action="+encodeURIComponent(action),args,function(r) {
	r=JSON.parse(r);
	console.log(r);
	if(r.status == "error")
	    voicelink_raise_error(r.reason,r.noun);
	else
	    callback(r);
    }).error(function(e,status) {
	console.log(e,status);
	if(status != "error")
	    voicelink_raise_error("http",status);
	else
	    voicelink_raise_error("http",e.statusCode().status);
//	callback();
    });
}

function voicelink_done() {
    
}