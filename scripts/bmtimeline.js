/**
 * bm-timeline.js v1.0.0
 * 
 * Copyright 2013, Heavenspot
 * Created by David Cotelessa.
 */

    var language = "en",
        translation = null,
        j = null,
        cS = new $cssSearch();
        
        /*  variables for splash page  */
        
        introdelay = 7000,
        introbigimgfade = 1500,
        introimgfade = 2000,
        introfade = 600,
        grid_rows = 10,
        img_x = cS.search('.galleryimage', 'width', "number"), /* px */
        img_y = cS.search('.galleryimage', 'height', "number"), /* px */
        mid_width = 546,  /* px */
        
        /* variables to be filled upon json load */
        
        grid_cols = 6,
        g_i = 0,
        spacegrid = [],
        samplegrid = [],
    
        
        /*  variables for gallery  */
        
        column_time = 600,
        
        biggallery_width = cS.search('.biggallery', 'width', "number"),
        biggallery_height = cS.search('.biggallery', 'height', "number"),
        container_max = cS.search('.container', 'width', "number") + img_x, /*px*/
        gallery_header_height = cS.search('.galleryheader-hilight', 'height', "number"),
        
        /* placeholders for gallery selection */
    
        o_select = 0,
        i_select = 0,
        c_start = -1,
            
        firefly_img = null,
        firefly_loaded = 0;
    
        //clear
        cS = null;
        var json_loader = null;

$( document ).ready(function() {    
    json_loader = $.jsonPreloader({
        
            filesToLoad: 'scripts/timeline.json',
        
            onBeforeLoad: function() {
                console.log("The Best Man Holiday Timeline.");
            },
        
            onJsonLoad: function(json){
        
                $(".gallerybuttons").hide();
                
                j = json_loader.getJson();
                
                //set number of columns for grid
                //grid_cols = Math.floor(j.files.length/grid_rows);
                
                //set translation early on
                translation = j.translations[language];
                
                //load firefly
                
                firefly_img = _.pluck(_.filter(j.files, function(v){ return _.contains(v.dest, "firefly");}), "src");
                
                $.firefly({
                          images : firefly_img, /* images defined from json */
                          total : 10,
                          on: '.background' // id of div
               });
                
                //
                loadSplash();
                //
                loadFooter();
            },
            
            onElementLoaded: function(ej) {
              if (_.contains(ej.dest, "splashpage" )){
                fillSplashPage(ej); 
              } else if (_.contains(ej.dest, "firefly" )) {
                checkFirefly(); 
              }
            },
        
            onComplete: function () {
                fillSamplePage(); 
                fadeToTimeline();
            },
            debugMode: false
    });
});

/*
 * Load Info from JSON
 */

var checkFirefly = function(){
    //load another firefly
    firefly_loaded++;
    
    //check if all loaded
    if (firefly_loaded == firefly_img.length){
        $.firefly.start();
    }
}

var fillSamplePage = function(){
    _.each(samplegrid, function(sg, k){
        appendTags(".samplegrid", '<div id="sa_<%= name %>" class="sampleimage-container"><img class="sampleimage" src="<%= src %>" /></div>', {name: k, src: sg.src});
    //
        $('#sa_' +  k).css("margin-top", 600);
        $('#sa_' +  k).delay(k*1000).animate({"opacity": 1, "margin-top": 100}, {queue: true, duration: introimgfade});
    });
}

var fillSplashPage = function(ej){
    var w_side = (spacegrid[g_i].x >= grid_cols/2);
    
    appendTags(j.splashpage.tags, '<div id="s_<%= name %>" class="splashimage-container" style="margin-top: <%= y %>px; margin-left: <%= x %>px"><img class="splashimage" src="<%= src %>" /></div>', {name: ej.name, y: spacegrid[g_i].y*img_y, x: spacegrid[g_i++].x*img_x + (w_side ? mid_width : 0), src: ej.src});
    //
    $('#s_' +  ej.name).css("top", 500);
    $('#s_' +  ej.name).delay(_.random(0, 5000)).animate({opacity: 0.4, top: 0}, {queue: true, duration: introimgfade});
}

var loadSplash = function(){
    
    //replace logo
    appendTags(translation.splash_logo.tags, '<img src="<%= src %>" /><br />', {src: translation.splash_logo.src});

    //replace txt
    appendTags(translation.splash_description.tags, translation.splash_description.txt);

    //replace txt
    appendTags(translation.splash_navigation.tags, translation.splash_navigation.txt);
    
    //get grid columns
    for( var a = 0; a < grid_rows; a++) {
        for( var b = 0; b < grid_cols; b++) {
            spacegrid.push({x: b, y: a});
        }
    }
    
    // sample the placements
    var splashfiles = _.filter(j.files, function(v){ return _.contains(v.dest, "splashpage")});
    
    spacegrid = _.sample(spacegrid, splashfiles.length);
    
    samplegrid = _.sample(splashfiles, 4);
};

var loadMenu = function() {
    
    //replace logo
    appendTags(translation.menu_logo.tags, '<img src="<%= src %>" />', {src: translation.menu_logo.src});
        
    //replace text
    appendTags(translation.menu_description.tags, translation.menu_description.txt);
        
    _.each( j.filters.menu, function(value) {
        appendTags(j.filters.tags, '<li id="c_<%= id %>" class="character"><div class="menu"></div><div class="menucircle" style="background: url(\'<%= src %>\')" ></div><p><%= name %></p></li>\r', {id: value.id, src: json_loader.getFileByName(value.asset).src, name: value.name});
    
    $('#c_'+value.id).delay( i+=100 ).fadeIn('300');
        
        
    }); // each
};

var menuHandlerIn = function() {
    $( this).find(".menucircle").animate({width: 66, height: 66, "border-width": 2}, {duration: 50, queue: false});
}

var menuHandlerOut = function() {
    $( this).find(".menucircle").animate({width: 70, height: 70, "border-width": 0}, {duration: 50, queue: false});
}

var menuHandlerClick = function(){
    var iteration=$(this).data('iteration')||1;
    switch ( iteration) {
        case 1:
            _.bind(menuHandlerClickIn, this)();
            break;
        
        case 2:
            _.bind(menuHandlerClickOut, this)();
            break;
    }
    
    iteration = iteration === 2 ? 1 : 2;
    
    //set data
    $(this).data('iteration',iteration);
    
    
    filterTimeline();
}

var menuHandlerClickIn = function() {
    $( this).animate({opacity:.5}, {duration: 200, queue: false});
}

var menuHandlerClickOut = function() {
    $( this).animate({opacity:1}, {duration: 200, queue: false});
}

var loadTimeline = function(j) {
        /**
         * Loads timeline into gallery
        */
    
        var column_pos = 0;
        var i = 0;
    
        _.each( j.timeline.dates, function(value, f) {
            //
            // set columns
            //
            appendTags(j.timeline.tags, '<div id="d_<%= sname %>" class="gallerycolumn"><div class="galleryheader"><div class="galleryheader-hilight hilight"></div><%= sname %></div></div>\r', {sname:value.sectionname});
            
            
            // grab all imgs for column
            if (value.assets.length > 0){
                
                _.each(value.assets, function(v,s){
                    appendTags( ["#d_" + value.sectionname], '<div id="i_<%= id %>" class="galleryimage-container"><div id="h_<%= id %>" class="gallerytext-container hilight"><h1><%= header %></h1><p><%= desc %></p></div><img id="<%= id %>" class="galleryimage" src="<%= src %>" /></div>\r', {src: json_loader.getFileByName(v.asset).src, header: translation[v.txt].teaserheadline, desc: translation[v.txt].teaser, id: v.asset} );
                    
                    
                    appendTags( ["#d_" + value.sectionname], '<div id="b_<%= id %>" class="biggallery" ><img src="<%= src %>" /><h1><%= bheader %></h1><p><%= bdesc %></p></div>', {src: json_loader.getFileByName(v.asset).src, bheader: translation[v.txt].headline, bdesc: translation[v.txt].txt, id: v.asset} );
                  
                   $('#b_'+v.asset).css('margin-top', s*5);
                   $('#b_'+v.asset).css('z-index', 100000-s-1);      
        
                }); // each
                
            };
            
        }); // each
    
    
        $('.galleryheader').hover( imgHandlerIn, imgHandlerOut);
        $('.galleryheader').click( colHandlerClick );
            
        $('.galleryimage-container').hover( imgHandlerIn, imgHandlerOut);
        $('.galleryimage-container').click( imgHandlerClick );
    
        $('.biggallery').mouseover( handlerIn);
        $('.gallerybuttons-more .gallerybutton').mouseover( handlerIn2);
        $('.gallerybuttons-more .gallerybutton.up').click( upHandlerClick2);
        $('.gallerybuttons-more .gallerybutton.down').click( downHandlerClick2);
    
    
    //get the max of the timeline dates' assets, and use it to set max height
       /*$(".gallery").css("height",gallery_header_height +  img_y*_.max(_.keys(_.groupBy(j.timeline.dates, function(d){ return d.assets.length; }))));*/
                
       // selectColumn(_.random(0, j.timeline.dates.length-1));
        i_select = 0;
        _.delay(selectImg, column_time, i_select, true);
        //console.log("***:" , i_select);
        o_select = selectColumn(_.random(0, j.timeline.dates.length-1), true);

        //fadein order    
        var col_order = o_select === 0 ? j.timeline.dates : j.timeline.dates.slice(c_start).concat (j.timeline.dates.slice(0,c_start));
    
        _.each(col_order, function(a, b){
            $('#d_'+a.sectionname).css("opacity", 0);
            $('#d_'+a.sectionname).delay( b*100).animate({opacity: 1}, {queue: true, duration: 300});
            _.each(a.assets, function(v,s){
                $('#i_'+v.asset).css("margin-top", 200);
            $('#i_'+v.asset).delay( (b*100) + s*100).animate({'margin-top': 0}, {queue: true, duration:500});
            });
            
        });
};

var colHandlerClick = function() {
    var foundCol = _.indexOf(j.timeline.dates, _.findWhere(j.timeline.dates, {sectionname : $(this).parent().attr("id").split("d_")[1]}) );
    o_select = selectColumn(foundCol);
    i_select = selectImg(0, true);
}

var imgHandlerIn = function() {
    $( this).find(".hilight").fadeIn(300);
}
var imgHandlerOut = function() {
    $( this).find(".hilight").fadeOut(300);
}
var handlerIn = function() {
    if (j.timeline.dates[o_select].assets.length > 1 && !($('.gallerycolumn').is(':animated') || $('.biggallery').is(':animated'))){
        $('.gallerybuttons-container').css('z-index', 5);
        //console.log($('.gallerybuttons-container').css('z-index'));
        $('.gallerybuttons-more').find('.gallerybutton').animate({opacity:.5}, {queue: false, duration: 300});
    }
}
var handlerIn2 = function() {
    if (j.timeline.dates[o_select].assets.length > 1 && !($('.gallerycolumn').is(':animated') || $('.biggallery').is(':animated'))){
        $('.gallerybuttons-container').css('z-index', 5);
        //console.log($('.gallerybuttons-container').css('z-index'));
        $('.gallerybuttons-more').find('.gallerybutton').animate({opacity:.75}, {queue: false, duration: 300});
    }
}
var handlerOut = function() {
    $('.gallerybuttons-container').css('z-index', -1);
    $('.gallerybuttons-more').find('.gallerybutton').animate({opacity:0}, {queue: false, duration: 300});
}


var imgHandlerClick = function() {
    //set column
    var foundCol = _.indexOf(j.timeline.dates, _.findWhere(j.timeline.dates, {sectionname : $(this).parent().attr("id").split("d_")[1]}) );
    
    o_select = selectColumn(foundCol, false);
    
    var foundImg = _.indexOf(j.timeline.dates[foundCol].assets, _.findWhere(j.timeline.dates[foundCol].assets, {asset : $(this).attr("id").split("i_")[1]}) );
     
    i_select = selectImg(foundImg, true);
    handlerOut();
}

var loadFooter = function() {
        //add links
    if (j.footer.menu.length > 0){
        _.each( j.footer.menu, function(value) {
            appendTags(j.footer.tags, '<li class="link"><a href="<%= hrf %>" target="<%= trgt %>"><%= txt %></a></li>\r', {hrf:translation[value.txt].hrf , txt:translation[value.txt].txt , trgt: value.target});
        }); // each
    }
}

var leftHandlerClick = function() {
        //handler
        buttonFlash(".gallerybutton.left");
    
        o_select = selectColumn(o_select === 0 ? j.timeline.dates.length -1 : o_select-1);
        i_select = selectImg(0, true);
        
}

var rightHandlerClick = function() {
        //handler
         buttonFlash(".gallerybutton.right");
    
        o_select = selectColumn(o_select === j.timeline.dates.length-1 ? 0 : o_select+1);
        i_select = selectImg(0, true);
}
var upHandlerClick = function() {
      buttonFlash(".gallerybuttons .gallerybutton.up");
      upHandlerClick2();
}

var downHandlerClick = function() {
      buttonFlash(".gallerybuttons .gallerybutton.down");
      downHandlerClick2();
}
var upHandlerClick2 = function() {
      i_select = selectImg(i_select > 0 ? i_select - 1 : j.timeline.dates[o_select].assets.length-1);
}

var downHandlerClick2 = function() {
      i_select = selectImg(i_select < j.timeline.dates[o_select].assets.length-1 ? i_select + 1 : 0);
}

var buttonFlash = function(tag){
        //to handle IE's layering problem
        $(".gallerybuttons").css("z-index", 10);
        $(tag).animate( {opacity: 0.4}, {duration: 200, complete: function(){$(tag).animate( {opacity: 0}, {duration: 200, complete: function(){$(".gallerybuttons").css("z-index", -1)}, queue: false})}, queue: false});
}

var selectImg = function(ass, im) {
    var v = 0;
    im = typeof im !== 'undefined' ? im : false;
    
    var aj = j.timeline.dates[o_select].assets;
    if (aj.length > 0){
        _.each(aj, function(a, u){
            if (u < ass){
                im ? $("#b_" + a.asset).css('margin-top', -biggallery_height):
                    $("#b_" + a.asset).animate({'margin-top' : -biggallery_height}, 300);
            } else if (u >= ass){
                im ? $("#b_" + a.asset).css('margin-top', v*5):
                    $("#b_" + a.asset).animate({'margin-top' : v*5}, 300);
                v++;
            }
            
            if (im){
                $("#b_" + a.asset).css('top', biggallery_height);
                $("#b_" + a.asset).css('display', "block");
                
                $("#b_" + a.asset).delay((aj.length - u)*200).animate({'top' : 0, opacity: 1}, {queue: true, duration : column_time});
            }
        });
    }
    
    /*if (ass >= j.timeline.dates[o_select].assets.length-1){
        $('.galleryimage-more').hide();
    } else {
        $('.galleryimage-more').show();
    }
    
    
    if (ass <= 0){
        $('.galleryimage-less').hide();
    } else {
        $('.galleryimage-less').show();
    }*/
    
    //console.log(ass);
    
    
    return ass;
}


/*
 * Set Animations
 */

var fadeToTimeline = function() {
    
    $('.splashpage').delay( introdelay ).fadeOut( introfade );
        
    $('.header').delay( introdelay ).fadeIn( introfade );
        
    
    $('.sparebar').delay( introdelay ).fadeIn( introfade, function(){
        loadMenu(j);
        $('.gallerycontainer').delay( introfade ).fadeIn( introfade );
        $('.gallerybuttons').fadeIn( introfade , function(){
            loadTimeline(j);
            });
        
        //
        setBehavior(j);
        });  
    
}

var setBehavior = function() {
        $(".gallerybuttons").show();
    
        //MouseEvents
    
        //apply hover
        $('.character').hover( menuHandlerIn, menuHandlerOut);
          
        //apply toggle
        $('.character').click( menuHandlerClick);
    
        $('.gallerybuttons-more').mouseout( handlerOut);
        $('.gallerybuttons-more').mouseout( handlerOut);
    
        //Keystrokes
        $(document).keydown (function(e) {
        /*   
         * if any galleryheader is being animated
         */
        if($('.gallerycolumn').is(':animated') || $('.biggallery').is(':animated')){
            
        // if here default is not triggered
        e.preventDefault();
            
        } else {
            if (e.which === 37) { // key 
                leftHandlerClick();
                return false;
            }
            
            if (e.which === 38){ // key up
                upHandlerClick();
                return false;
            }
            
            if (e.which === 39){ // key right
                rightHandlerClick();
                return false;
            }
            
            if (e.which === 40){ // key down
                downHandlerClick();
                return false;
            }
        }
        //console.log( e.which);
        // if here default is not triggered
        e.preventDefault();
    });
}

var filterTimeline = function(){
    /*
     *  After toggling one of the filters, close/open all pictures that relate to filter.
     */   
    
    //get array of
    var filtered = [];
    $('.character').each(function(){
        if ($(this).data('iteration') != 2){ 
            var f_name = _.findWhere(j.filters.menu, {id: this.id.split('c_')[1]}).filtername;
            if (!(_.contains(filtered, f_name))){
                 filtered.push(f_name);
            }
        }
    });
    
    //console.log(filtered);
    
    _.each( j.timeline.dates, function(value, f) {
            
            // grab all imgs for column
            if (value.assets.length > 0){
                _.each(value.assets, function(v){
                    //if selected items are in v.filter, slideUp
                    //else, slideDown
                    if (_.difference(v.filter, filtered).length > 0){
                        $( "#" + v.asset + ".galleryimage" ).slideUp( 200 , finishSlideUp);
                    } else {
                        $( "#" + v.asset + ".galleryimage" ).slideDown( 200 , finishSlideDown );
                    }
                }); // each
            };
            
            
        }); // each
}


var finishSlideUp = function(){
    $(this).parent().off( "mouseenter mouseleave" );
}


var finishSlideDown = function(){
    $(this).parent().hover(imgHandlerIn, imgHandlerOut);
}


var selectColumn = function(c_select, im){
    
    im = typeof im !== 'undefined' ? im : false;
    /*
     *  Expand timeline column to include a gallery pertaining to that year
     */   
    
    var col_order = c_select === 0 ? j.timeline.dates 
                    : j.timeline.dates.slice(c_select).concat (j.timeline.dates.slice(0,c_select));
    
    var g;
    var column = null;
     
    if (o_select != c_select){
        _.each( col_order, function(v, f) {
            column = $('#d_'+v.sectionname);
            column_header = $('#d_'+v.sectionname + ' .galleryheader');
            column_hilight = $('#d_'+v.sectionname + ' .galleryheader-hilight');
            column_images = $('#d_'+v.sectionname + ' .galleryimage-container');
            
            if (f > 0){
                g = getAdjustColumnMargins((img_x*(f-1))+biggallery_width, ((j.timeline.dates.length-1)*img_x)+biggallery_width);
                column.animate({width : img_x}, {duration: column_time, queue: false}); 
                column_header.animate({width : img_x-17},{duration: column_time, queue: false});  
                column_hilight.animate({width : img_x},{duration: column_time, queue: false});  
                column_images.animate({"opacity" : 1},{duration: column_time, queue: false});
                _.each( v.assets, function(z, q) {
                    $('#b_'+z.asset).delay((v.assets.length-q)*50).animate({"top" : biggallery_height, "opacity": 0},{duration: column_time, queue: true, complete: _.bind(completeBig, $('#b_'+z.asset))});
                });
               // column_bigmore.animate({"left" : biggallery_width}, {duration: column_time, queue: false});
                
            } else {
                g = getAdjustColumnMargins(img_x*f, ((j.timeline.dates.length-1)*img_x)+biggallery_width);
                
                if (im){
                    column.css("width", biggallery_width); 
                    column_header.css("width", (biggallery_width)-16); 
                    column_hilight.css("width", biggallery_width);
                    column_images.css("opacity", 0);
                    
                } else {
                    column.animate({width : biggallery_width}, {duration: column_time, queue: false}); 
                    column_header.animate({width : (biggallery_width)-16}, {duration: column_time, queue: false}); 
                    column_hilight.animate({width : biggallery_width}, {duration: column_time, queue: false});  
                    column_images.animate({"opacity" : 0}, {duration: column_time, queue: false});
                }
                
            }
            
            //console.log(biggallery_width);
            
            if (g < 0 && c_start === -1){
                c_start = _.indexOf(j.timeline.dates, v);
            }
            
            //animate columns
           //var skip = (Math.abs(column.position().left - g) >= container_max);
            im  ? column.css("left", g) : column.animate({left : g},
                                                                {
  step: function( now, fx ) {
      
      //if we go past a certain point, adjust immediately.
      if (Math.abs(now - fx.end) >= $(document).width()){
            $(this).stop(true, true);
      }
  }, duration: column_time, queue: false
                                                                });  
            
            //set indexes so no overlap
            column.css("z-index", f);
        });
    }
    
//save old
   return c_select;
}

var completeBig = function(){
    this.css("display", "none");   
}

var getAdjustColumnMargins = function(a, l){
    //set left by midpoint with space in middle  
        column_pos = a;
            
        //if over max timeline, swap back    
        column_pos += column_pos > container_max  ? -l : 0;
        
        return column_pos;
}

var appendTags = function(t, str, obj, mthd){
    /*
     *  append template
     */ 
    mthd = typeof mthd !== 'undefined' ? mthd : "append";
    
    tags = _.isArray(t) ? t : [t];
    
    _.each(tags, function(tag) {
        if (typeof obj === "object"){
            var compiled = _.template(str);
            $(tag)['append'](compiled(obj));
        } else {
            $(tag)['append'](str);
        }
    });
}