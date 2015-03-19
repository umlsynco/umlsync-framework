define(['marionette'],
    function(Marionette) {
        var Controller = Marionette.Controller.extend({
            initialize: function (options) {
				this.contextMenuRegion = options.region;
				this.handler = {};
			},
			addContextMenuHandler: function(type, handlerView) {
				if (!type || !handler) return;
				if (!handlerView.update) { alert("You should declare handlerView::update"); return;}

				this.handlers[type] = handlerView;
		    },
		    removeContextMenuHandler: function(type, handler) {
				if (!type || !handler) return;
				this.handlers[type]
				
			},
			// @param data - {type, event, context} 
			//             type - handler type
			//             event - jQuery event object
			//             context - handleView context
			//
			show:function(data) {
				if (!data || data.type) return false;
				if (!this.handlers[data.type]) return false;
				// Initialize handler 
				this.handlers[type].update(data);
			}
		});
		return Controller;
	}
);// define
