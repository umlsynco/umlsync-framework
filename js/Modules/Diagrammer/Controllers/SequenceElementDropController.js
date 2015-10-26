define(['marionette',
        'Views/framework'
    ],
    function (Marionette, Framework) {
        var DropController = Marionette.Controller.extend({
            initialize: function (options) {
                this.elements = options.view.elementsView;
                this.connectors = options.view.connectorsView;
                this.model = options.model;

                this.elements.on("add:child", _.bind(this.onElementAdd, this));
                this.elements.on("element:select", _.bind(this.onElementSelect, this));
                this.elements.on("element:drag:start", _.bind(this.onDragStart, this));
                this.elements.on("element:drag:do", _.bind(this.onDragDo, this));
                this.elements.on("element:drag:stop", _.bind(this.onDragStop, this));
                this.elements.on("element:resize:stop", _.bind(this.onResizeStop, this));

                this.connectors.on("add:child", _.bind(this.onNewConnector, this));
                this.elements.on("connector:drag:start", _.bind(this.onConnectorDragStart, this));
                this.elements.on("connector:drag:do", _.bind(this.onConnectorDragDo, this));
                this.elements.on("connector:drag:stop", _.bind(this.onConnectorDragStop, this));

            },
            onElementAdd: function(element) {
				this.elements.children.each(function(child) {
					if (child != element)
					  child.dropDone(element);
				});
			},
            onConnectorDragStart: function(conView) {
			},
			onConnectorDragDo: function(conView) {
			},
			onConnectorDragStop: function(conView) {
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
			onNewConnector: function(connector) {
				if (connector.model.get("temporary")) return;

				var fid = connector.model.get("fromId");
				var tid = connector.model.get("toId");
				$.log("LF: " + tid + " ; " + fid);
				this.elements.children.each(function(item) {
					$.log("CHILD: " + item.model.cid);
					if (item.model.get("id") == fid) {
						fid = item;
					}
					else if (item.model.get("id") == tid) {
						tid = item;
					}
				});

// tOdO:
// 1. always create epoint for the sequence connectors
// 2. if objinstance => 
// 2.1 Check if llport exists and rop on it
// 2.2 Check if there is no llport => create a new one
// 3. if llport:
// 3.1 If dropped out of port => 2.1 & 2.2

				if (fid.model && (fid.model.get("type") == "objinstance")) {
					var y = connector.toModel.get("top");
					var fromModel = new Backbone.DiagramModel({type:"llport", width:15, height:25, left: fid.model.get("left") + fid.model.get("width")/2, top: y});
					this.elements.collection.add(fromModel);
					connector.fromModel = fromModel;
					connector.model.set({fromId: fromModel.get("id")});
				}
				
				// 1. If connector from objinstance then create from port or attach to existing one
				// 2. if connector dropped on objinstance then crea llport and drop it on
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
                this.connectors.children.each(function(connector, idx) {
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
