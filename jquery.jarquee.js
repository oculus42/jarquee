/*
 * Jarquee jQuery Plug-in
 * Simple Marquee using .animate()
 *
 * Copyright (c) 2011-2012 Samuel Rouse
 * Dual licensed under the MIT and GPL licenses.
 * http://docs.jquery.com/License
 * Requires jQuery 1.4+, tested with 1.4.2
 *
 * Date: 2010-05-13
 * Revision: 1
 * Options: 
 *	- speed ( rough characters per second )
 *	- baseWidth ( integer width to briefly set the inner to make sure the content is on one line )
 *	- pause ( true offers pause on mouseenter, resume on mouseleave )
 *	- center ( true centers content if narrower than marquee container )
 *
 * Date: 2011-06-23 - 2011-06-28
 * Revision: 3 (Added JSON fetch)
 * New Options:
 *  - URL ( URL for fetching contents via AJAX )
 *  - ##  ( replace ## in URL with REL from object for fetch )
 *
 * Date: 2011-12-28
 * Revision: 4 (Added Load Content Callback for Cufon, etc)
 * New Options:
 *  - onLoad ( function that will be called when content is loaded )
 *
 * Date: 2012-04-17
 * Revision: 5 (Added init delay and left offset)
 *  - delay (amount of time to wait before the banner starts moving, defaults to 500ms)
 *  - offset (number of pixels from the left to start the text; defaults to 50)
 *
 * Date: 2013-10-11
 * Revision: 6 (Updated for JQuery 1.10+ by Sam T)
 *  - replaced deprecated calls to .bind() with calls to .on() for compatibility with JQuery 1.10 and above.
 *
 * Date: 2014-03-11
 * Revision: 7 (Updated for JSHint and general cleanup)
 *  - better formatted for Google Closure Compiler
 * 
 */
 /*global jQuery*/ 
(function ($) {
	"use strict";
    $.fn.jarquee = function (options) {

		var self = $.fn.jarquee;
	
        // Set the options.
        options = $.extend({}, self.defaults, options);
        self.options = options;
        self.object = this;

        if (options.URL !== '') {
            

            // If there is "##" in the URL, replace it with the Rel
            var myURL = options.URL;

            if (myURL.indexOf("##") > -1) {
                myURL = myURL.replace('##', $(this).attr('rel'));
            }

            // Add the callback reference to the URL
            if (myURL.indexOf("callback=?") === -1) {
                myURL += (myURL.indexOf("?") === -1 ? "?callback=?" : "&callback=?");
            }

			// Switch to promise style.
            $.getJSON(myURL).done(function (data) {
                if (options.debug === true) { console.log(data); }
                if (data.status_code >= 0) {
                    self.content = data.data_object;
                    return self.init(self.object, true);
                }
            }).fail(function (ev, req) {
				if (options.debug === true) {
					console.log("Error: " + req.responseText); 
				}
			});
			
            // pass back the jQuery object regardless of outcome
            return this;

        } else {
            // If not loading content, go ahead and init the banner
            return self.init(this, false);
        }
    };

    $.fn.jarquee.init = function (jqArr, useLoadedContent) {
        // Go through the matched elements and return the jQuery object.
		var self = $.fn.jarquee,
			options = self.options,
			content = self.content;

        return $(jqArr).each(function () {
            var $obj = $(this),
				active = true,
				marqueeWidth,
				contentWidth;

            // Check for missing descendants DIV and Span. Create if needed.
            if (!$obj.find('div span').size()) {
                // Pack everything inside.
                $obj.wrapInner('<span class="jarquee_content_wrapper" />').wrapInner('<div class="jarquee_inner" />');
            }

            // Handle loaded content (if needed)
            if (useLoadedContent && $.fn.jarquee.content !== '') {
                var bannerID = $obj.attr('rel');
                if (options.debug === true) {
                    console.log("UseLoaded, Need Banner " + bannerID);
                }
                // Some way to only run a loaded banner if needed.
                active = false;

                // Loop through the loaded content to see if there's a match.
                for (var inc in content) {
                    // Make sure that it exists before we try anything
                    if (parseInt(content[inc].id) == bannerID) {
                        // Load the data.

                        // Check for empty content
                        if (content[inc].content !== "") {
                            // Replace the content on the page
                            $obj.find('span').html(content[inc].content);
                            // Let us know it's there to animate.
                            active = true;
                        }
                        if (active) {
                            // Check for onLoad and run it if available
                            if (options.onLoad !== null) {
                                options.onLoad();
                            }

                            // Make sure the banner is visible (might be hidden if empty)
                            if (!$obj.is(':visible')) {
                                $obj.show();
                            }

                            // Also check if the parent is visible (most banners are wrapped).
                            if (!$obj.parent().is(':visible')) {
                                $obj.parent().show();
                            }
                        }
                    }
                }
            }

            // Important variables.
            marqueeWidth = $obj.width();		// Inner width of the banner.
				
            $obj.children('.jarquee_inner').width(options.baseWidth).css("position", "absolute"); // Widen to make sure span is on one line;
            contentWidth = $obj.find('div span').outerWidth();		// Width of content, including padding & border.

            //Check for start centered
            if (options.center && marqueeWidth > contentWidth) {
                $obj.children('.jarquee_inner').css('left', (parseInt(marqueeWidth - contentWidth) >> 1));
            } else {
                if (options.offset) {
                    // Use the offset option
                    $obj.children('.jarquee_inner').css('left', options.offset);
                }
            }

            $obj.css({ 'position': 'relative', 'overflow': 'hidden' });
            $obj.find('.jarquee_inner').width(contentWidth + 20).css({ 'width': ('' + (contentWidth + 20)), 'position': 'absolute' });

			// No support for multiple marquees.
            self.object = $obj;
            self.settings = {
                mW: marqueeWidth,
                cW: contentWidth
            };

            if (active === true) {
                if (options.pause) {
                    $obj.on('mouseenter', function () { self.action.stop(); })
						.on('mouseleave', function () { self.move(); });
                }

                if (options.delay) {
                  setTimeout(function(){ self.move(); }, options.delay);
                } else {
                    self.move();
                }
            }
        });
    };

    // Public Values
    $.fn.jarquee.defaults = {
        delay: 500,
        offset: 50,
        speed: 5,
        baseWidth: 5000,
        debug: false,
        URL: ''
    };
    $.fn.jarquee.action = "";
    $.fn.jarquee.object = "";
    $.fn.jarquee.options = "";
    $.fn.jarquee.settings = "";
    $.fn.jarquee.content = "";
    // Public Functions	
    $.fn.jarquee.move = function () {
		var self = $.fn.jarquee,
			$obj = self.object,
			options = self.options,
			settings = self.settings,
			
			innerLeft = $obj.find('div.jarquee_inner').css('left'),
			endGoal, duration;
			
        innerLeft = isNaN(innerLeft.replace('px', '')) ? 0 : innerLeft.replace('px', '');
        endGoal = (-1 * (settings.cW * -1 - innerLeft));
        duration = ((settings.cW - (innerLeft * -1)) / (options.speed * 20)) * 1000;
        
		if (duration % endGoal > endGoal / 2) {
            duration += parseInt(endGoal >> 1);
        }

        self.action = $obj.children('.jarquee_inner').animate({ left: '-=' + endGoal }, duration, 'linear', function () {
            $obj.find('.jarquee_inner').css('left', settings.mW);
            self.move();
        });
    };
})(jQuery);
