/*
 * cssSearch
 *
 * Copyright (c) 2013 David COtelessa
 * http://motyar.blogspot.com
 * http://motyar.com
 *
 * $Id$
 * 
 * licensed under the MIT licenses:
 *   http://www.opensource.org/licenses/mit-license.php
 *  
 *
 * Creates a fcssSearch
 *
 * @example cssSearch
 *
 * @name cssSearch
 */
$cssSearch = function() {
        //singleton
        if ( arguments.callee._singletonInstance )
            return arguments.callee._singletonInstance;

        arguments.callee._singletonInstance = this;

        var _styles = [];

        //store all styles in one array
        _.each(document.styleSheets, function(s){
            _.each(s.cssRules, function(s2){
                _styles.push(s2);
            });
        });
        this.styles = _styles;
        return;
};
	
	/*
	 * Public Functions
	 */

	 $cssSearch.prototype.search = function(s, v, f){
            if (s === undefined){
                return false;
            }
            
            var fo = _.filter(this.styles, _.bind(function(o){
                if (o.selectorText == undefined){
                        return false;
                }
                return (_.indexOf(o.selectorText.split(","), this.s) != -1);
            }, {s:s}));
            
         //set style 
         
         if (fo === undefined){
             return false;
         }
         
         var fs = '';
         _.each(fo, function(g){
             fs = fs != ''? fs : g.style[v];
             //console.log(s + " " + v + " : " + fs + "/" + (g.style[v]==''));
         });
         
         if (fs === undefined){
             return false;
         }
         
         //strip letters if only want number
         
         if (f === "number"){
             fs = Number(fs.replace(/\D/g,''));
         }
         
            return fs;
	 }
