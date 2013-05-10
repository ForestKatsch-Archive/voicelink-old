
var view={
    url:""
};
parseUri.options.strictMode = true;

function view_init() {
    $(window).bind("popstate",function(e) {
	var url=parseUri(location.href);
	var hash="";
	if(url.relative.indexOf("#") >= 0)
	    hash=url.relative.split("#")[1];
	ui_hide_modal_final("*");
	if(hash != "")
	    ui_show_modal(hash);
    });
    loaded("view");
}

function view_done() {

}