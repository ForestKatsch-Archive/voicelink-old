
var voicelink={
    actions:{
	session_needed:[
	    "end_session",
	    "delete_message",
	    "verify_session",
	    "get_messages",
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
    folders:["inbox","sent","drafts"],
    requests:[],
    messages:{},
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

voicelink.Message=function(message_id,from_handle,to_handles,reply_to,composed,sent,duration) {
    this.message_id=message_id;
    this.from_handle=from_handle;
    this.to_handles=to_handles;
    this.composed=composed;
    this.sent=sent;
    this.duration=duration/1000;
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
    this.get="";
    for(var i=0;i<voicelink.actions.session_needed.length;i++)
	if(voicelink.actions.session_needed[i] == this.action)
	    session_info=true;
    if(session_info == true) {
	this.get+="&session_id="+voicelink.session.session_id;
	this.get+="&session_hash="+voicelink.session.session_hash;
    }
    this.go=function(callback) {
	var that=this;
	this.waiting=true;
	//	console.log("Sending "+this.action+" with",this.args)
	action=this.action+this.get;
	voicelink.post_request(action,this.args,function(r) {
	    //	    console.log("Done: ",r);
	    if(callback)
		callback(r);
	    if(that.callback)
		that.callback(r);
	    that.waiting=false;
	    voicelink.event(that.action,r);
	},function(r,n) {
	    console.log("Voicelink error: ",r,n);
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
    if(voicelink.session.session_id != -1) {
	voicelink.verify_session(function() {},function(r,n) {
	    voicelink.event("session_dead");
	});
    } else {
	voicelink.event("session_dead");
    }
};

voicelink.verified=function() {
    return voicelink.session.verified;
};

voicelink.get_message=function(id) {
    if(voicelink.messages[id] != undefined)
	return voicelink.messages[id];
    return null;
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

voicelink.message_number=function() {
    var n=0;
    for(var i in voicelink.messages)
	n++;
    return n;
}

voicelink.update=function(callback,error) {
    voicelink.requests.push(new voicelink.Request("update",{},function(r) {
	if(callback)
	    callback(r);
	if(r.message_number != undefined) {
	    if(r.message_number != voicelink.message_number())
		voicelink.get_messages();
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

voicelink.get_folder=function(folder) {
    var correct_folder=false;
    for(var i=0;i<voicelink.folders.length;i++)
	if(folder == voicelink.folders[i])
	    correct_folder=true;
    if(!correct_folder)
	return [];
    var messages=[];
    for(var i in voicelink.messages) {
	var m=voicelink.messages[i];
	messages.push(m);
    }
    messages=messages.sort(function(a,b) {
	return b.composed-a.composed;
    });
    console.log(messages);
    return messages;
};

voicelink.get_messages=function(callback,error) {
    voicelink.requests.push(new voicelink.Request("get_messages",{},function(r) {
	if(r.messages) {
	    voicelink.messages={};
	    for(var i=0;i<r.messages.length;i++) {
		var m=r.messages[i];
		voicelink.messages[m.message_id]=new voicelink.Message(m.message_id,
								       m.from,
								       m.to,
								       m.reply_to,
								       m.composed,
								       m.sent,
								       m.duration);
	    }
	}
	voicelink.event("messages_changed");
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
    $.post(voicelink.api+"?action="+action,args,function(r) {
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
    var xhr=new XMLHttpRequest();
    xhr.onload=function(e) {
	if(this.readyState === 4) {
	    voicelink.update();
	}
    };
    var fd=new FormData();
    fd.append("data",blob);
    xhr.open("POST","/api.php?action=upload&session_id="+voicelink.session.session_id+
	     "&session_hash="+voicelink.session.session_hash+"",true);
    xhr.send(fd);
};

voicelink.delete_message=function(message_id,callback,error) {
    voicelink.requests.push(new voicelink.Request("delete_message",{
	message_id:message_id
    },function(r) {
	if(callback)
	    callback(r);
    },function(r,n) {
	if(error)
	    error(r,n);
    }));
    voicelink.process_requests();
};

voicelink.message_folder=function(message_id) {
    return null;
};

voicelink.is_message=function(id) {
    if(voicelink.message_folder(id))
	return true;
    return false;
}

voicelink.send_message=function(message_id,recipients,callback,error) {
    if(voicelink.message_folder(message_id) != "drafts") {
	error("invalid","folder");
    } else {
	voicelink.requests.push(new voicelink.Request("send_message",{
	    message_id:message_id,
	    recipients:recipients
	},function(r) {
	    voicelink.update();
	    if(callback)
		callback(r);
	},function(r,n) {
	    if(error)
		error(r,n);
	}));
	voicelink.process_requests();
    }
};

voicelink.get_name=function() {
    return (voicelink.session.name?voicelink.session.name:voicelink.session.handle);
};

voicelink.get_message_url=function(id) {
    return "/api.php?action=message&message_id="+id+"&session_id="+voicelink.session.session_id+
	"&session_hash="+voicelink.session.session_hash;
};