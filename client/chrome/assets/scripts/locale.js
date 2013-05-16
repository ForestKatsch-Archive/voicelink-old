
var en_us={
    back:"Back",
    login:"Login",
    register:"Register"
}

var locale=en_us;

function _(n) {
    if(locale[n] != undefined)
	return locale[n];
    log.locale("");
    return n;
}

$(document).ready(function() {
    $(".translate").each(function() {
	$(this).text(_($(this).text()));
    });
});