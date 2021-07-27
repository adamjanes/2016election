/**
 * Created by Adam on 5/1/2016.
 */



    //jQuery to collapse the navbar on scroll
$(window).scroll(function() {
    if ($(".navbar").offset().top > 50) {
        $(".navbar-fixed-top").removeClass("custom-nav");
        $(".picture").removeClass("pic-top");

    } else {
        $(".navbar-fixed-top").addClass("custom-nav");
        $(".picture").addClass("pic-top");
    }
});

$(function() {
    $('a.page-scroll').bind('click', function(event) {
        var $anchor = $(this);
        $('html, body').stop().animate({
            scrollTop: $($anchor.attr('href')).offset().top
        }, 1500, 'easeInOutExpo');
        event.preventDefault();
    });
});

(function ($) {

    new WOW().init();

    jQuery(window).load(function() {
        jQuery("#preloader").delay(100).fadeOut("slow");
        jQuery("#load").delay(100).fadeOut("slow");
    });


    //parallax
    if ($('#parallax1').length  || $('#parallax2').length || $('#parallax3').length || $('#parallax4').length)
    {
        $(window).stellar({
            responsive:true,
            scrollProperty: 'scroll',
            parallaxElements: false,
            horizontalScrolling: false,
            horizontalOffset: 0,
            verticalOffset: 0
        });

    }

})(jQuery);