/*
 * jsonLoader - based off another jsonLoader online, used by permission.
 * David Cotelessa
 * The change was to remove as much jQuery reliance, and instead use underscore.js
 * to increase speed, and remove unneeded DOM manipulation, using faster Javascript
 * calls instead via underscore.
 * 
 * The result is a faster, smootherpreloader to allow jQuery to focus on watching
 *asset loading, as underscore to handle list/array manipulation.
 * 
 */

;(function($){

	"use strict";

	$.jsonPreloader = function (customOptions) {
		var defaults = {
			filesToLoad:		null,										/* set the path to the JSON or pass an object containing the files to preload */
			debugMode:          false,										/* debugger */
			onBeforeLoad:       function () {},								/* this functions is triggered before the preloader starts loading the sources */
            onJsonLoad:       function (obj) {},								/* this functions is triggered before the preloader starts loading the sources */
			onComplete:         function (obj, map) {},								/* set the onComplete is triggered when everything is loaded */
			onElementLoaded:    function ( obj, elm) { },					/* this Callback is triggered anytime an object is loaded */
			onUpdate:           function ( percentage ) {}					/* this function returns alway the current percentage */
		},
		// merging the custom options with the default ones
		options = _.extend(defaults, customOptions);

		/*
		*
		* PUBLIC VAR
		* Configuration
		*
		*/
		var filesToLoad			= options.filesToLoad,
			debugMode           = options.debugMode,
			onBeforeLoad        = options.onBeforeLoad,
			onJsonLoad           = options.onJsonLoad,
			onComplete          = options.onComplete,
			onElementLoaded     = options.onElementLoaded,
			onUpdate            = options.onUpdate;

		/*
		*
		* PRIVATE VAR
		*
		*/
		var _bytesLoaded        = 0,
			_bytesTotal         = 0,
			_files              = [],
			_filesidx           = {},
            _json                = null;
		/*
		*
		* PRIVATE METHODS
		*
		*/


		/*
		*
		* @description Used to debug the application
		* @param msg: {string, object, function, array} anything we need to log in the console
		*
		*/

		var log = function ( msg ) {
			if (debugMode && console) {
				console.log( msg );
			}
		};

		/*
		*
		* @description Output the current percentage using the onUpdate function passed as parameter to the loader
		*
		*/

		var updatePercentage = function () {
			var currPercentage = 0;
			log("_bytesTotal = " + _bytesTotal);
			log("_bytesLoaded = " + _bytesLoaded);
			currPercentage = Math.round((_bytesLoaded / _bytesTotal) * 100);

			log('Percentage: ' + currPercentage + '%');

			onUpdate (currPercentage);

			if (!_files.length) {
				onComplete(_json);
			}

		};

		/*
		*
		* @description Populate the _files array increasing the _bytesTotal var
		* @param index: file index
		* @param obj: the json node representing the file properties
		*
		*/

		var arrangeData = function ( obj , i) {

			var file = obj;

			if (file){
				_bytesTotal += file.size;
				_files.push(file);
				_filesidx[file.name] = i;
			}

		};
        
        var onJsonError = function ( j, status, err ) {
			console.log("json: " + j.responseText);
			console.log("json status: " + status);
			console.log("json error: " + err);
		};


		/*
		*
		* @description Deal with data received from the json loaded
		* @param data: object
		*
		*/

		var onJsonLoaded = function ( data ) {
			log("json loaded");
            //json is reference to DOM/jQUERY
            _json = $(data)[0];
            onJsonLoad(_json);
            
            // run after arranging Data
            _.defer(updatePercentage);
            _.defer(loadingLoop);
            
			_.each(data.files, arrangeData);
		};

		/*
		*
		* @description Load any kind of image
		* @param file: object
		*
		*/

		var loadImage = function ( file, i ) {
            
            //json is reference to DOM/jQUERY img
				var size  = file.size,
				img = new Image();
            

            //json is reference to DOM/jQUERY; checks on load in DOM
            
			img.onload = function () {
				log('File Loaded:' + file.src);

				_bytesLoaded += size;

				onElementLoaded(file, img);

				// preventing a memory leak
				img = null;
				// removing the file from the array
				_files.splice(0,1);
				updatePercentage();
			};

			img.src = file.src;
		};

		var loadScript = function ( file, key ) {
           /* size  = file.size;
			$.getScript(file.source, function(data){

				log('File Loaded:' + file.src);

				_bytesLoaded += size;

				onElementLoaded( file, key, data);

				// removing the file from the array
				_files.splice(0,1);
				updatePercentage();
			});*/
		};

		/*
		*
		* @description start loading all the files
		*
		*/

		var loadingLoop = function () {

			var filesArray = _files.slice();
			// if there are still files to load we keep looping

			_.each(filesArray,function(file, i){

				log("preloading files");

				log("file to preload:"+ file.src);

				switch (file.type) {
					case "IMAGE":
						_.defer(loadImage, file, _filesidx[i]);
					break;
					case "SCRIPT":
						_.defer(loadScript, file, _filesidx[i]);
					break;
					default:
						return false;
				}

			});

		};

		/*
		*
		* PUBLIC METHODS
		*
		*/

		/*
		*
		* @description Start preloading the page
		*
		*/

		this.init = function () {
			log("plugin initialized");
            
            // before load
			onBeforeLoad();
            
            var aload = {dataType: "json", error: onJsonError, success: onJsonLoaded}
            
			if (typeof filesToLoad === "object") {       
			     // ready to preload all the files
                //_.defer(onJsonLoaded, filesToLoad);
                aload.data = filesToLoad;
			} else {
                //$.getJSON(filesToLoad, onJsonLoaded);
                aload.url = filesToLoad;
			}
            
            $.ajax(aload);
            

		};
        
        this.getFileByName = function (name) {
            return _json.files[_filesidx[name]];  
        }
        
        
        this.getJson = function (name) {
            return _json;  
        }

		this.init();

		// make the public methos accessible from the extern
		return this;

	};

})(jQuery);