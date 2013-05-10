
var Request=function(action,args,callback) {
    this.action=action;
    this.args=args;
    this.callback=callback;
    this.waiting=false;
    this.go=function(callback) {
	var that=this;
	this.waiting=true;
	voicelink_post(this.action,this.args,function(r) {
	    callback(r);
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
	session_hash:null
    }
};

function voicelink_init() {
    voicelink_push_error(function(r,n) {
	throw "VoicelinkError: "+r+": "+n+".";
    });
    voicelink_poke(function(r) {
	
    });
    loaded("voicelink");
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

function voicelink_poke(callback) {
    voicelink.requests.push(new Request("poke",{},callback));
    voicelink_requests();
}

function voicelink_register(handle,password,repeat_password,callback) {
    voicelink.requests.push(new Request("register",{handle:handle,password:password,repeat_password:password},callback));
    voicelink_requests();
}

function voicelink_start_session(handle,password,callback) {
    voicelink.requests.push(new Request("start_session",{handle:handle,password:password},function(r) {
	voicelink.session_id=r.session_id;
	voicelink.session_hash=r.session_hash;
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