
var tested_browsers=[
    ["Chrome",["28"],""]
];

var browsers="";

browsers+="<tr class='header'><th class='name'>Browser</th><th class='versions'>Versions</th><th class='issues'>Issues</th></tr>";

for(var i=0;i<tested_browsers.length;i++) {
    var b=tested_browsers[i];
    var l="";
    if(b[1].length >= 1)
    for(var x=0;x<b[1].length-1;x++) {
	l+=b[1][x]+", "
    }
    if(b[1].length == 1)
	l+=""+b[1][b[1].length-1];
    else if(b[1].length >= 1)
	l+="and "+b[1][b[1].length-1];
    var iss=b[2];
    if(iss == "")
	iss="<span class='none'>none</span>";
    browsers+="<tr><td class='name'>"+b[0]+"</td><td class='versions'>"+l+"</td><td class='issues'>"+iss+"</td></tr>";
}

var locale={
    about_voicelink:"About VoiceLink",
    account:"Account",
    after_delete_account:"After you delete your account, you will not be able to recover any\n\
of your sent or recieved messages. Your messages will not be deleted and anyone who has access\n\
to them now still will. (You may want to <a href='#wipe-user'>wipe</a> your account instead.)",
    already_taken:"That handle has already been taken.",
    change_name:"Change name",
    confirm:"Confirm",
    confirm_password:"Confirm password",
    close:"Close",
    delete_account:"Delete account",
    drafts:"Drafts",
    edit_message:"Edit message",
    enter_password_to_delete:"Confirm account deletion",
    handle:"Handle",
    handle_too_short:"The handle must be three or more characters long.",
    help:"Help",
    help_text:"\<article class='pane' id='getting-started'>\
<h1>Getting started</h1>\
<p>Welcome to VoiceLink. To get started,\
 <a href='#register' title='Register with VoiceLink'>register</a>.</p>\
</article>\
<article class='pane' id='help-disclaimer'>\
<h1>Disclaimer</h1>\
<p>VoiceLink is currently an <strong>alpha</strong> product, and that's being nice to it. Do <strong>not</strong> expect \
everything to work correctly. Do <strong>not</strong> put anything on here that you wouldn't like any random Joe to see. \
That said, if there are any problems with this, please "+feedback("send feedback")+".</p>\
</article><article class='pane' id='browser-supprot'>\
<h1>Browser support</h1>\
<p>Unfortunately, the HTML5 technology to record messages needs either Chrome 28 and up or Firefox version 22 and up. We're planning \
to add support for older browsers (using a Flash recorder or a browser plugin) but for now, you'll need to have a compatible browser. \
You'll still be able to listen to messages, though.</p>\
<h2>Tested browsers</h2>\
<p>Here's a list of browsers that have been tested with the VoiceLink website.</p>\
<table>"+browsers+"</table>\
</article>\
<article class='pane'>\
<h1>Feedback / problems</h1>\
<p>Found a problem with VoiceLink or have a feature request? \
Submit it "+feedback("here")+". Thanks.</p>\
</article>\
<footer><span class='copyright'></span></footer>",
    inbox:"Inbox",
    incorrect_handle_or_password:"Incorrect handle or password.",
    incorrect_password:"Incorrect password.",
    login:"Login",
    logout:"Logout",
    new_name:"New name",
    no_messages:"No messages",
    only_alphanumeric:"The handle must consist only of alphanumeric characters, underscores, hyphens, and periods.",
    password:"Password",
    passwords_dont_match:"The passwords don't match.",
    password_too_short:"The password must be one or more characters long.",
    register:"Register",
    repeat_password:"Repeat password",
    sent:"Sent",
    settings:"Settings",
    start_record:"New message",
    stop_record:"Stop recording",
    this_is_bad:"ERRORS. THIS IS BAD. (Check out the dev console.)",
    three_or_more:"The handle must be three or more characters long.",
    voicelink:"VoiceLink"
};

function _(s) {
    if(s in locale) {
	return locale[s];
    } else {
	console.log("Warning to translators: '"+s+"' needs a translation!");
	return s;
    }
}