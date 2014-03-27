/*
 * jQuery firefly plugin 0.1
 *
 * http://docs.jquery.com/Plugins/firefly
 *
 * Copyright (c) 2010 Dharmveer Motyar
 * http://motyar.blogspot.com
 * http://motyar.com
 *
 * $Id$
 * 
 * licensed under the MIT licenses:
 *   http://www.opensource.org/licenses/mit-license.php
 *  
 *
 * Creates a firefly effect.
 *
 * @example $.firefly();
 *
 * @name firefly
 * @type jQuery
 * @cat Plugins/firefly
 */
 (function($) {
	/*
	 * Plugin defaults 
	 */
	var defaults = {
			images : [''],
			total : 40
	};
	

	$.firefly = function(settings) {
			$.firefly.settings = $.extend({}, defaults, settings);
        
			return;
	};
	
	/*
	 * Public Functions
	 */

     $.firefly.start = function(){
         for (i = 0; i < $.firefly.settings.total; i++){
            $.firefly.fly($.firefly.create($.firefly.settings.images[_.random(0, $.firefly.settings.images.length)]));
        }
     }
     
	 $.firefly.create = function(img){
         
                    //create NOM
					spark = $('<img>').attr({'src' : img}).hide();
					 $($.firefly.settings.on).append(spark);
							return spark.css({
								            'position':'absolute',
										    'z-index': 0,
											top: _.random($(window).height()-150),	//offsets
											left:  _.random($(window).width()-150) //offsets
											}).show();		
	 }
    


$.firefly.fly = function(sp) {
  $(sp).animate({
	  top: _.random(0, $(window).height()-150),	//offsets
	  left: _.random($(window).width()-150)
  }, {queue: false, duration:(_.random(5, 10) * 1100), complete: function(){  $.firefly.fly(sp) }} );
};
		
})(jQuery);

