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
            dragAlsoElements: [],
            draggableConnectors: [],
            onDragDo: function(itemView, ui) {
                _.each(this.dragAlsoElements, function(element, idx) {
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

                //this.dragAlsoElements = itemView.$el.parent().find('.dropped-' + itemView.cid);
                this.dragAlsoElements = new Array();
                this.draggableConnectors = new Array();
                
                var queued = new Array();
                queued.push(itemView.model.cid);

                var that = this;
                this.elements.children.each(function(item) {
                   if (item != itemView && item.selected) {
                       that.dragAlsoElements.push(item);
                       queued.push(item.model.cid);
                   }
                });

                // itemView is not a part of drag also
                // Therefore it is no in the list of dragAlsoElements
                _.each(itemView.droppedElements, function(e3) {
                     if (!_.contains(that.dragAlsoElements, e3)) {
                         that.dragAlsoElements.push(e3);
                     }
                });

                // Include all containments
                _.each(this.dragAlsoElements, function(e2) {
                     _.each(e2.droppedElements, function(e3) {
                        if (!_.contains(that.dragAlsoElements, e3)) {
                            that.dragAlsoElements.push(e3);
                        }
                     });
                });

                _.each(this.dragAlsoElements, function(element, idx) {
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
                var that = this;
                // Sync up model on drag stop
                _.each(this.dragAlsoElements, function(element, idx) {
                    element.onDragStop(ui);
                });
                // Sync up epoints on drag stop
                _.each(this.draggableConnectors, function(connector, idx) {
                    connector.onDragStop(ui);
                });

                //
                // Check the droppable relation for the dragged element
                // and which was not drag
                // Note: as a result do nothing if was dragged all elements
                //
                that.dragAlsoElements.push(itemView); // it is not in the list of dragAlsoElements, because it is the list of dragAlsoElements
                this.elements.children.each(function(itemView2) {
                    if (!(itemView2 in that.dragAlsoElements)) {
                        _.each(that.dragAlsoElements, function (droppedElemement) {
                            itemView2.dropDone(droppedElemement);
                        });
                    }
                });

                if (this.dragAlsoElements.length > 0) {
                    // empty list
                    this.dragAlsoElements = [];
                    this.draggableConnectors = [];
                }

            },
            onResizeStop: function(itemView) {
//                alert("Stop resize controller");
            }
        });
        return DropController;
    }
);
