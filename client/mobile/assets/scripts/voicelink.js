
var voicelink={
    actions:{
	session_needed:[
	    "end_session",
	    "verify_session",
	    "get_folder",
	    "verify_user",
	    "update",
	    "change_name",
	    "delete_user",
	]
    },
    api:"http://localhost/api.php",
    events:{
    },
    regexp:{
	handle:/^[\w\-\.]+$/
    },
    requests:[],
    folders:{
	inbox:{
	    "messages":[],
	    "unread_messages":0,
	},
	sent:{
	    "messages":[],
	    "unread_messages":0,
	},
	drafts:{
	    "messages":[],
	    "unread_messages":0,
	},
    },
    session:{
	handle:null,
	name:null,
	session_id:-1,
	session_hash:null,
	verified:false
    },
    users:{
	
    }
}

voicelink.Message=function(message_id,from_handle,to_handle,reply_to,date,duration) {
    this.message_id=message_id;
    this.from_handle=from_handle;
    this.to_handle=to_handle;
    this.date=date;
    this.duration=duration;
};

voicelink.bind=function(e,c) {
    if(voicelink.events[e] == undefined)
	voicelink.events[e]=[];
    voicelink.events[e].push(c);
};

voicelink.unbind=function(e) {
    voicelink.events[e]=[];
};

voicelink.event=function(e,d) {
    if(e in voicelink.events) {
	for(var i=0;i<voicelink.events[e].length;i++) {
	    voicelink.events[e][i](d);
	}
    }
};

voicelink.Request=function(action,args,callback,error) {
    this.action=action;
    this.args=args;
    this.callback=callback;
    this.error=error;
    this.waiting=false;
    var session_info=false;
    for(var i=0;i<voicelink.actions.session_needed.length;i++)
	if(voicelink.actions.session_needed[i] == this.action)
	    session_info=true;
    if(session_info == true) {
	this.args["session_id"]=voicelink.session.session_id;
	this.args["session_hash"]=voicelink.session.session_hash;
    }
    this.go=function(callback) {
	var that=this;
	this.waiting=true;
//	console.log("Sending "+this.action+" with",this.args)
	voicelink.post_request(this.action,this.args,function(r) {
//	    console.log("Done: ",r);
	    if(callback)
		callback(r);
	    if(that.callback)
		that.callback(r);
	    that.waiting=false;
	    voicelink.event(that.action,r);
	},function(r,n) {
//	    console.log("Error: ",r,n);
	    if(((r == "invalid") && (n == "session")) ||
	       ((r == "auth") && (n == "needed"))) {
		voicelink.end_session_final();
	    } else {
		if(that.error)
		    that.error(r,n);
	    }
	});
    };
};

voicelink.init=function() {
    $(document).unload(voicelink.save);
    voicelink.restore_session();
    if(voicelink.session.session_id != -1)
	voicelink.verify_session();
    else
	voicelink.event("session_dead");
};

voicelink.verified=function() {
    return voicelink.session.verified;
};

voicelink.process_requests=function() {
    for(var i=0;i<voicelink.requests.length;i++) {
	if(voicelink.requests[i].waiting)
	    return;
    }
    if(voicelink.requests.length != 0) {
	var v=voicelink.requests[0];
	voicelink.requests.splice(0,1);
	v.go(function() {
	    voicelink.process_requests();
	});
    }
};

voicelink.save_session=function() {
    localStorage["voicelink_session"]=JSON.stringify(voicelink.session);
    localStorage["voicelink_users"]=JSON.stringify(voicelink.users);
};

voicelink.restore_session=function() {
    if("voicelink_session" in localStorage) {
	var verified=voicelink.session.verified;
	voicelink.session=JSON.parse(localStorage["voicelink_session"]);
	voicelink.session.verified=verified;
	voicelink.users=JSON.parse(localStorage["voicelink_users"]);
    } else {
	voicelink.save_session();
    }
    voicelink.event("change_name");
};

voicelink.poke=function(callback,error) {
    voicelink.requests.push(new voicelink.Request("poke",{},callback,error));
    voicelink.process_requests();
};

voicelink.delete_user=function(password,callback,error) {
    if(password.length == 0)
	error("invalid","password-length");
    voicelink.requests.push(new voicelink.Request("delete_user",{
	handle:voicelink.session.handle,
	password:password
    },function(r) {
	voicelink.end_session_final();
	if(callback)
	    callback(r);
    },function(r,n) {
	if(error)
	    error(r,n);
    }));
    voicelink.process_requests();
}

voicelink.update=function(callback,error) {
    voicelink.requests.push(new voicelink.Request("update",{},function(r) {
	if(callback)
	    callback(r);
	if(r.folders != undefined) {
	    if(r.folders.inbox != undefined) {
		if(r.folders.inbox.number != voicelink.folders.inbox.messages.length) {
		    console.log("Fetching inbox.");
		    voicelink.get_folder("inbox",function(r) {
//			console.log(r);
		    },function(r,n) {
			console.log(r,n);
		    });
		}
		if(r.folders.drafts.number != voicelink.folders.drafts.messages.length) {
		    console.log("Fetching drafts.");
		    voicelink.get_folder("drafts",function(r) {
//			console.log("Contents of drafts: ",r);
		    },function(r,n) {
//			console.log(r,n);
		    });
		}
	    }
	}
	if(r.user != undefined) {
	    if(r.user.name != undefined) {
		voicelink.session.name=r.user.name;
		voicelink.event("change_name");
	    }
	}
    },error));
    voicelink.process_requests();
}

voicelink.get_folder=function(folder,callback,error) {
    voicelink.requests.push(new voicelink.Request("get_folder",{
	folder:folder,
	number:100
    },function(r) {
	r.folder=folder;
	if(folder == "drafts") {
	    if(r.messages != undefined) {
		voicelink.folders.drafts.messages=[];
		for(var i=0;i<r.messages.length;i++) {
		    var m=r.messages[i];
		    m.from_handle=voicelink.session.handle;
		    voicelink.folders.drafts.messages.push(m);
		}
	    }
	}
	if(callback)
	    callback(r);
    },error));
    voicelink.process_requests();
}

voicelink.change_name=function(name,callback,error) {
    voicelink.requests.push(new voicelink.Request("change_name",{name:name},function(r) {
	if(callback)
	    callback(r);
	voicelink.session.name=name;
	voicelink.save_session();
    },error));
    voicelink.process_requests();
}

voicelink.verify_user=function(password,callback,error) {
    voicelink.requests.push(new voicelink.Request("verify_user",{
	handle:voicelink.session.handle,
	password:password
    },function(r) {
	if(callback)
	    callback(r);
    },error));
    voicelink.process_requests();
}

voicelink.verify_session=function(callback,error) {
    voicelink.requests.push(new voicelink.Request("verify_session",{},function(r) {
	voicelink.session.verified=true;
	voicelink.save_session();
	if(callback)
	    callback(r);
	voicelink.event("change_name");
    },error));
    voicelink.process_requests();
}

voicelink.register=function(handle,password,repeat_password,callback,error) {
    if(handle.length <= 2) {
	error("invalid","handle-length");
    } else if(voicelink.regexp.handle.test(handle) == false) {
	error("invalid","handle-chars");
    } else if(password.length == 0) {
	error("invalid","password-length");
    } else if(password != repeat_password) {
	error("invalid","repeat_password");
    } else {
	voicelink.requests.push(new voicelink.Request("register",{
	    handle:handle,
	    password:password,
	    repeat_password:password
	},callback,error));
	voicelink.process_requests();
    }
}

voicelink.start_session=function(handle,password,callback,error) {
    if(handle.length <= 2) {
	error("invalid","handle-length");
    } else if(voicelink.regexp.handle.test(handle) == false) {
	error("invalid","handle");
    } else if(password.length == 0) {
	error("invalid","password-length");
    } else {
	voicelink.requests.push(new voicelink.Request("start_session",{handle:handle,password:password},function(r) {
	    if((r.session_id == undefined) || (r.session_hash == undefined))
		error("server","args");
	    voicelink.session.session_id=r.session_id;
	    voicelink.session.session_hash=r.session_hash;
	    voicelink.session.verified=true;
	    voicelink.session.handle=handle,
	    voicelink.session.name=r.name;
	    voicelink.save_session();
	    if(callback)
		callback(r);
	    voicelink.event("change_name");
	},error));
	voicelink.process_requests();
    }
}

voicelink.end_session_final=function() {
    voicelink.session.verified=false;
    voicelink.session.session_id=-1;
    voicelink.session.session_hash=null;
    voicelink.session.handle=null;
    voicelink.save_session();
}

voicelink.end_session=function(callback,error) {
    voicelink.requests.push(new voicelink.Request("end_session",{},function(r) {
	voicelink.end_session_final();
	if(callback)
	    callback(r);
    },function(r,n) {
	if(r == "auth")
	    voicelink.end_session_final();
	if(error)
	    error(r,n);
    }));
    voicelink.process_requests();
}

voicelink.post_request=function(action,args,callback,error) {
    $.post(voicelink.api+"?action="+encodeURIComponent(action),args,function(r) {
	r=JSON.parse(r);
	if(r.status == "error") {
	    if(error)
		error(r.reason,r.noun);
	    else
		throw "VoicelinkError: "+r.reason+": "+r.noun;
	} else {
	    if(callback)
		callback(r);
	}
    }).error(function(e,status) {
	if(status != "error")
	    error("http",status)
	else
	    error("http",e.statusCode().status);
    });
}

voicelink.new_message=function(blob,callback,error) {
    console.log(blob);
    var xhr=new XMLHttpRequest();
    xhr.onload=function(e) {
	if(this.readyState === 4) {
	    console.log(JSON.parse(e.target.responseText));
	    voicelink.update();
	}
    };
    var fd=new FormData();
    fd.append("session_id",voicelink.session.session_id);
    fd.append("session_hash",voicelink.session.session_hash);
    fd.append("data",blob);
    xhr.open("POST","/api.php?action=upload",true);
    xhr.send(fd);
};