
var locale={
    about_voicelink:"About VoiceLink",
    about_voicelink_text:["Phone calls and emails both have their uses; phone calls are good for long conversations,\n\
and emails provide longer, more delayed conversations. What if you could take the simplicity and speed of phone calls\n\
and make them as succinct as emails? You'll have to take the chance that the other party is next to his phone; otherwise\n\
you'll often find yourself responding to voicemail.",
			  "VoiceLink is a service that makes phone calls as easy as email."],
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
    enter_password_to_delete:"Confirm account deletion",
    handle:"Handle",
    handle_too_short:"The handle must be three or more characters long.",
    help:"Help",
    inbox:"Inbox",
    incorrect_handle_or_password:"Incorrect handle or password.",
    incorrect_password:"Incorrect password.",
    login:"Login",
    logout:"Logout",
    only_alphanumeric:"The handle must consist only of alphanumeric characters, underscores, hyphens, and periods.",
    password:"Password",
    passwords_dont_match:"The passwords don't match.",
    password_too_short:"The password must be one or more characters long.",
    record_allow:"Allow mic access",
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