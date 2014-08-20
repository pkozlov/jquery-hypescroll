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
			},
			reversed: false
		};

	// Constructor
	function HypeScroll ( element, options ) {
		this.element = $(element);
		this.options = $.extend( {}, defaults, options );
		this._defaults = defaults;
		this._name = pluginName;

		// Initialize animation config

		this.height = this.element.height();
		this.startpoint = this.options.offset.start;
		this.endpoint = this.startpoint + this.height + this.options.offset.end;

		if (typeof HYPE !== "undefined" && HYPE !== null) {
			this.init();
		} else {
			if("HYPE_eventListeners" in window === false) {
				window.HYPE_eventListeners = Array();
			}

			window.HYPE_eventListeners.push({
				"type": "HypeDocumentLoad",
				"callback": (function(_this) {
					return function(hypeDocument, element, event) {
						return _this.init(hypeDocument, element, event);
					};
				})(this)
			});
		}
	}

	HypeScroll.prototype = {
		init: function (hypeDocument) {
			if (this.options.documentName !== null) {
				if (hypeDocument && hypeDocument.documentName() === this.options.documentName) {
					this.documentName = this.options.documentName;
					this.hypeDocument = hypeDocument;
				} else {
					this.documentName = this.options.documentName;
					this.hypeDocument = HYPE.documents[this.documentName];
				}

				if (typeof this.hypeDocument === "undefined" || this.hypeDocument === null) {
					throw "HypeScroll: HYPE document with documentName '" + this.documentName + "' is not found";
				}
			} else if (this.options.hypeDocument !== null) {
				if (hypeDocument && this.options.hypeDocument.documentName() === hypeDocument.documentName()) {
					this.hypeDocument = hypeDocument;
				} else {
					this.hypeDocument = this.options.hypeDocument;
				}
				this.documentName = this.hypeDocument.documentName();
			} else {
				throw "HypeScroll: documentName or hypeDocument is required";
			}

			setTimeout((function(_this) {
				return function() {
					return _this.afterInit();
				};
			})(this), 0);
		},

		afterInit: function () {
			this.hypeDocument.pauseTimelineNamed(this.options.timeline);
			this.duration = this.hypeDocument.durationForTimelineNamed(this.options.timeline);

			// time per pixel
			this.tpp = this.duration / (this.height + this.options.offset.end);

			this.onScroll();

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
			console.log(window_offset);
			if (this.duration && window_offset > this.startpoint && window_offset < this.endpoint) {
				position = window_offset - this.startpoint;
				animationPosition = position * this.tpp;
				if (!this.options.reversed) {
					animationPosition = this.duration - animationPosition;
				}
				this.hypeDocument.goToTimeInTimelineNamed(animationPosition, this.options.timeline);
			} else if (window_offset < this.startpoint) {
				this.hypeDocument.goToTimeInTimelineNamed(this.options.reversed ? 0 : this.duration, this.options.timeline);
			} else if (window_offset > this.endpoint) {
				this.hypeDocument.goToTimeInTimelineNamed(this.options.reversed ? this.duration : 0, this.options.timeline);
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
