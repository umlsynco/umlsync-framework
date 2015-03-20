define(['marionette'],
    function(Marionette) {
        var Controller = Marionette.Controller.extend({
            initialize: function (options) {
				this.contextMenuRegion = options.region;
				this.handler = {};
			},
			addContextMenuHandler: function(type, handlerView) {
				if (!type || !handlerView) return;
				if (!handlerView.getDataView) { alert("You should declare handlerView::getDataView"); return;}
alert("addContextMenuHandler: " + type);
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
				this.handlers[type].getDataView(data);
			}
		});
		return Controller;
	}
);// define
