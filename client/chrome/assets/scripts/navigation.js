
var page_stack=[];
var page_slide_time=200;

function nav_show_page(p) {
    page_stack.push(p);
    $(".open.page").animate({left:-$(window).width()});
    $("#"+p+"-page").css({left:$(window).width()});
    $("#"+p+"-page").animate({left:0},page_slide_time);
    $(".open.page").removeClass("open");
    $("#"+p+"-page").addClass("open");
}

function nav_back() {
    page_stack.pop();
    var p=page_stack[page_stack.length-1];
    console.log(p);
    $("#"+p+"-page").css({left:-$(window).width()});
    $("#"+p+"-page").animate({left:0},page_slide_time);
    $(".open.page").animate({left:$(window).width()},page_slide_time);
    $(".open.page").removeClass("open");
    $("#"+p+"-page").addClass("open");
}

$(document).ready(function() {
    $(".page").css({left:-$(window).width()});
    $("#main-page").css({left:0});
    $("#main-page").addClass("open");
    page_stack.push("main");
    $("a").each(function() {
	if($(this).hasClass("back")) {
	    $(this).click(function(e) {
		nav_back();
		e.preventDefault();
	    });
	} else {
	    $(this).click(function(e) {
		var href=$(this).attr("href");
		nav_show_page(href.substr(1,href.indexOf("-page")-1));
		e.preventDefault();
	    });
	}
    });
});