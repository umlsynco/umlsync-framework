define(['marionette'],
    function(Marionette) {
        var Controller = Marionette.Controller.extend({
            initialize: function (options) {
                this.contextMenuRegion = options.region;
                this.handlers = {};
            },
            addContextMenuHandler: function(type, handlerView) {
                if (!type || !handlerView) return;
                if (!handlerView.getDataView) { alert("You should declare handlerView::getDataView"); return;}

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
                 if (!data || !data.type || !this.handlers[data.type]) {
                     this.contextMenuRegion.$el.hide();
                     return false;
                 }

                // Initialize handler 
                var view = this.handlers[data.type].getDataView(data);
                if (view) {
                    // render and show view !!!
                    this.contextMenuRegion.show(view);
                    this.contextMenuRegion.$el.css({top:data.event.pageY, left:data.event.pageX, visibility:'visible'}).show();
                }
                else {
                    this.contextMenuRegion.$el.hide();
                }
            }
        });
        return Controller;
    }
);// define
