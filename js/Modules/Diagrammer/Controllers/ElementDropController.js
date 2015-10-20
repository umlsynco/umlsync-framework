define(['marionette',
        'Views/framework'
    ],
    function (Marionette, Framework) {
        var DropController = Marionette.Controller.extend({
            initialize: function (options) {
                this.elements = options.view.elementsView;
                this.connectors = options.view.connectorsView;
                this.model = options.model;
                this.elements.on("element:select", _.bind(this.onElementSelect, this));
                this.elements.on("element:drag:start", _.bind(this.onDragStart, this));
                this.elements.on("element:drag:do", _.bind(this.onDragDo, this));
                this.elements.on("element:drag:stop", _.bind(this.onDragStop, this));
                this.elements.on("element:resize:stop", _.bind(this.onResizeStop, this));
            },
            skipOneSelect: false,
            onElementSelect: function(itemView, event) {
				// Skip selection DND completion
				if (this.skipOneSelect) {
					this.skipOneSelect = false;
					return;
				}

				if (event && event.ctrlKey) {
					itemView.onSelect(!itemView.selected);
					return;
				}
				var that = this;
                _.each(this.elements.children._views, function(item) {
                   if (item != itemView) {
                       item.onSelect(false);
                   }
                });
                itemView.onSelect(true);
			},
            // Droppable
            draggableElements: [],
            draggableConnectors: [],
            onDragDo: function(itemView, ui) {
                _.each(this.draggableElements, function(element, idx) {
                    if (element != itemView)
                        element.onDragDo(ui);
                });
                _.each(this.draggableConnectors, function(connector, idx) {
					connector.onDragDo(ui);
				});
            },
            onDragStart: function(itemView, ui) {
				// Skip one select on DND completion
				this.skipOneSelect = true;

                //this.draggableElements = itemView.$el.parent().find('.dropped-' + itemView.cid);
                this.draggableElements = new Array();
                this.draggableConnectors = new Array();
                
                var queued = new Array();

                var that = this;
                _.each(this.elements.children._views, function(item) {
                   if (item != itemView && item.selected) {
                       that.draggableElements.push(item);
                       queued.push(item.model.cid);
                   }
                });

                queued.push(itemView.model.cid);
                _.each(this.draggableElements, function(element, idx) {
                   element.onDragStart(ui);
                });

                // Trigger drag start
                _.each(this.connectors.children._views, function(connector, idx) {
					if (queued.indexOf(connector.fromModel.cid) >= 0
					  && queued.indexOf(connector.toModel.cid) >= 0) {
				      // Connector drag start
                      connector.onDragStart(ui);
                      // Push connectors
                      that.draggableConnectors.push(connector);
			        }
                });

            },
            onDragStop: function(itemView, ui) {
                _.each(this.draggableElements, function(element, idx) {
                    element.onDragStop(ui);
                });
                _.each(this.draggableConnectors, function(connector, idx) {
					connector.onDragStop(ui);
				});
                if (this.draggableElements.length > 0) {
                    // empty list
                    this.draggableElements = [];
                    this.draggableConnectors = [];
                }

                if (itemView.droppable) {
                    // TODO: _.pick(model.attributes, left, top ...
                    var inner = {left:itemView.model.get("left"), top:itemView.model.get("top"), width:itemView.model.get("width"), height:itemView.model.get("height")};

                    this.elements.children.each(function(element) {
                        if (element == itemView) {
                            return;
                        }
                        var elem = element.model;
                        var outer = {left:elem.get("left"), top:elem.get("top"), width:elem.get("width"), height:elem.get("height")};

                        if (outer.top < inner.top && inner.top + inner.height < outer.top + outer.height
                            && outer.left < inner.left && outer.left + outer.width > inner.left + inner.width) {
                            itemView.$el.addClass('dropped-' + element.cid);
                        }
                    });
                }
            },
            onResizeStop: function(itemView) {
//                alert("Stop resize controller");
            }
        });
        return DropController;
    }
);
