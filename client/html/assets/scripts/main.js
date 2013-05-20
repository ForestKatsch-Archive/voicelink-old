
var VERSION=[0,0,1];

var modules=["main","ui","view","mic"];
var module_number=0;
var module_start_time;

function loaded(module) {
    if(!(module in modules))
	throw "ModuleError: nonexistent module '"+module+"'";
    if(modules[module] == true)
	throw "ModuleError: module '"+module+"' was loaded multiple times";
    console.log("Loaded "+module);
    module_number+=1;
    modules[module]=true;
    for(var i in modules) {
	if(modules[i] == false)
	    return;
    }
    done();
}

function init() {
    module_start_time=new Date().getTime();
    var m={};
    for(var i=0;i<modules.length;i++)
	m[modules[i]]=false;
    modules=m;
}

function start() {
    init();
    setTimeout(function() {
	mic_init();
	ui_init();
	view_init();
	voicelink.init();
	loaded("main");
    },0);
}

$(document).ready(function() {
    voicelink.bind("verify_session",function() {
	update();
	setInterval(update,10000);
    });
    voicelink.bind("start_session",function() {
	update();
	setInterval(update,10000);
    });
    start();
});

function done() {
    done_loading();
    var time=new Date().getTime()-module_start_time;
    time=(time/1000).toFixed(3);
    console.log("Loaded "+module_number+" module"+s(module_number)+" in "+time+" second"+s(time))
}

function update() {
    view_update_messages("inbox",[]);
    view_update_messages("sent",[]);
    view_update_messages("drafts",[]);
    if(!voicelink.verified()) {
	console.log("Not verified.");
	return;
    }
//    console.log("updating...");
    voicelink.update(function(r) {
	return;
	if(r.folders.inbox > 0)
	    voicelink.get_messages("inbox");
	if(r.folders.sent > 0)
	    voicelink.get_messages("sent");
	if(r.folders.drafts > 0)
	    voicelink.get_messages("drafts");
    },function(r,n) {
	console.log(r,n);
    });
}

function done_loading() {
    ui_done();
    view_done();
}