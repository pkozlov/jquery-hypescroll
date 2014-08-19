;(function ( $, window, document, undefined ) {
	// Defaults
	var pluginName = "hypescroll",
		defaults = {
			timeline: "Main Timeline",
			documentName: null,
			hypeDocument: null,
			offset: {
				start: 0,
				end: 0
			}
		};

	// Constructor
	function HypeScroll ( element, options ) {
		if (typeof HYPE === "undefined" || HYPE === null) {
			throw "HypeScroll: HYPE is not defined";
		}
		this.element = $(element);
		this.options = $.extend( {}, defaults, options );
		this._defaults = defaults;
		this._name = pluginName;

		// Initialize animation config

		if (this.options.documentName !== null) {
			this.documentName = this.options.documentName;
			this.hypeDocument = HYPE.documents[this.documentName];
			if (typeof this.hypeDocument !== "undefined" && this.hypeDocument !== null) {

			} else {
				throw "HypeScroll: HYPE document with documentName '" + this.documentName + "' is not found";
			}
		} else if (this.options.hypeDocument !== null) {
			this.hypeDocument = this.options.hypeDocument;
		} else {
			throw "HypeScroll: documentName or hypeDocument is required";
		}

		this.height = this.element.height();
		this.startpoint = this.options.offset.start;
		this.endpoint = this.startpoint + this.height + this.options.offset.end;
		this.duration = this.hypeDocument.durationForTimelineNamed(this.options.timeline);

		// time per pixel
		this.tpp = this.duration / (this.height + this.options.offset.end);

		this.init();
	}

	HypeScroll.prototype = {
		init: function () {
			$(window).scroll((function(_this) {
				return function() {
					return _this.onScroll();
				};
			})(this));
		},

		// Play animation on scroll
		onScroll: function () {
			var window_offset = this.element.offset().top - $(window).scrollTop() + this.options.offset.end,
				position, animationPosition;

			if (this.duration && window_offset > this.startpoint && window_offset < this.endpoint) {
				position = window_offset - this.startpoint;
				animationPosition = this.duration - (position * this.tpp);
				this.hypeDocument.goToTimeInTimelineNamed(animationPosition, this.options.timeline);
			} else if (window_offset < this.startpoint) {
				this.hypeDocument.goToTimeInTimelineNamed(0, this.options.timeline);
			} else if (window_offset > this.endpoint) {
				this.hypeDocument.goToTimeInTimelineNamed(this.duration, this.options.timeline);
			}
		}
	};

	$.fn[ pluginName ] = function ( options ) {
		return this.each(function() {
			if ( !$.data( this, "plugin_" + pluginName ) ) {
				$.data( this, "plugin_" + pluginName, new HypeScroll( this, options ) );
			}
		});
	};

})( jQuery, window, document );
