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
                this.connectors.on("connector:drag:start", _.bind(this.onConnectorDragStart, this));
                this.connectors.on("connector:drag:do", _.bind(this.onDragDo, this));
                this.connectors.on("connector:drag:stop", _.bind(this.onConnectorDragStop, this));

                var that = this;
                this.elements.children.each(function(elem) {
                    if (elem.model.get("type") == "llport")
                      that.onElementAdd(elem);
                });

                this.connectors.children.each(function(con) {
                    that.onNewConnector(con);
                });
            },
            onElementAdd: function(element) {
                // Do nothing for the temporary elements (DND)
                if (element.model.get("temporary")) return;

                $.log("ADD element: " + element.model.get("type") + " : " + element.model.cid);

                // avoid iteration for the not droppable elements
                if ((!element.droppable) && (element.acceptDrop.length == 0)) return;

                if (element.droppedElements.length >0) {
                  $.log("ADD element: REFRESH");
                  //TODO: Work-around. There is no way to get dropped elements before new element creation
                  //      but somhow it is not empty. Most likely it is an issue of backbone or marionette
                  element.droppedElements = new Array();
                }

                this.elements.children.each(function(child) {
                  if (child != element) {
                      element.dropDone(child);
                  }
                });

                if (element.droppedElements.length >0) {
                  $.log("HAS DROPPED ELEMENTS: " + element.model.get("type"));
                }
                else if (element.model.get("type") == "llport") {
                    //
                    // Create parent for the llport element
                    //
                    if (element.dropParent == null) {
                        element.model.collection.add(new Backbone.DiagramModel({name:"Class2",type:"objinstance", left: (element.model.get("left") - 100), "width":150, "height": element.model.get("top") + 150}));
                    }
                }
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

                // HANDLE FROM ID ELEMENT
                var parentFid;
                if (fid.model && (fid.model.get("type") == "objinstance")) {
                    parentFid = fid;
                }
                else if (fid.model && (fid.model.get("type") == "llport")) {
                    parentFid = fid.dropParent
                }
                
                if (parentFid) {
                    var y = connector.model.umlepoints.models[0].get("y");
                    var cfid;
                    // 1. Check that connector was dropped in scope of llport
                    if (parentFid.droppedElements) {
                        _.each(parentFid.droppedElements, function(llport) {
                            var top = llport.model.get("top");
                            // Connector was dropped over this llport element
                            if (y > top && y < top + llport.model.get("height")) {
                                cfid = llport;
                            }
                        });
                    }
                    
                    // IF NOT Found fromID element for connector, than create a llport element
                    var cfid_model;
                    if (!cfid) {
                      // 2. create a new one llport 
                      cfid_model = new Backbone.DiagramModel({type:"llport", width:15, height:25, left: parentFid.model.get("left") + parentFid.model.get("width")/2 -5, top: y});
                      this.elements.collection.add(cfid_model);
                    }
                    else {
                        cfid_model = cfid.model;
                    }
  
                    connector.fromModel = cfid_model;
                    connector.model.set({fromId: cfid_model.get("id")});
                }


                // HANDLE TO ID element
                if (tid.model && (tid.model.get("type") == "objinstance")) {
                    // umlepoints is Backbone collection
                    var y = connector.model.umlepoints.models[0].get("y");
                    var ctid;
                    // 1. Check that connector was dropped in scope of llport
                    if (tid.droppedElements) {
                        _.each(tid.droppedElements, function(llport) {
                            var top = llport.model.get("top");
                            // Connector was dropped over this llport element
                            if (y > top && y < top + llport.model.get("height")) {
                                ctid = llport;
                            }
                        });
                    }
                    
                    // IF NOT Found fromID element for connector, than create a llport element
                    var ctid_model;
                    if (!ctid) {
                      // 2. create a new one llport 
                      ctid_model = new Backbone.DiagramModel({type:"llport", width:15, height:25, left: tid.model.get("left") + tid.model.get("width")/2 -5, top: y});
                      this.elements.collection.add(ctid_model);
                    }
                    else {
                        ctid_model = ctid.model;
                    }
  
                    connector.toModel = ctid_model;
                    connector.model.set({toId: ctid_model.get("id")});
                }

                
                // 1. If connector from objinstance then create from port or attach to existing one
                // 2. if connector dropped on objinstance then creat llport and drop it on
            },
            onConnectorDragStart: function(conView, ui) {
                this.dragAlsoElements = new Array();
                this.draggableConnectors = new Array();

                var that = this, hasSingleConnector;
                this.elements.children.each(function(item) {
                   if (conView.fromModel == item.model || item.model == conView.toModel) {
                       hasSingleConnector = true;
                       that.connectors.children.each(function(connector) {
                           if (connector != conView && (connector.fromModel == item.model || connector.toModel == item.model)) {
                               hasSingleConnector = false;
                           }
                       });

                       if (hasSingleConnector) {
                         that.dragAlsoElements.push(item);
                         item.onDragStart(ui);
                       }
                   }
                });

                _.each(this.dragAlsoElements, function(element, idx) {
                   element.onDragStart(ui);
                });
            },
            onConnectorDragDo: function(conView) {
                // use common dragDo
            },
            //
            // Helper method to get views by model
            //
            _get_connector_views: function(connector) {
                var ftv = {from: null, to:null};
                this.elements.children.each(function(item) {
                    if (item.model == connector.fromModel) {
                        ftv.from = item;
                    }
                    else if (item.model == connector.toModel) {
                        ftv.to = item;
                    }
                });
                return ftv;
            },
            //
            // Helper metod to drop connector on objinstance
            //
            _drop_or_create_port: function(dropParent, connector) {
                var item;
                if (dropParent) {
                    var y = connector.model.umlepoints.models[0].get("y");
                    _.each(dropParent.droppedElements, function(element, idx) {
                        var pos = element.$el.position(),
                            height = element.$el.height();
                            if (pos.top - 5 <=  y && y <= pos.top + height +5) {
                                item = element.model;
                            }
                    });
                }
                
                if (!item) {
                    $.log("CREATE NEW LL PORT ON CONNECTOR DND");
                    item = new Backbone.DiagramModel({type:"llport", width:15, height:25, left: dropParent.model.get("left") + dropParent.model.get("width")/2 -5, top: y-2});
                    this.elements.collection.add(item);
                }
                
                return item;
            },
            //
            // Merge ll ports and aligne them
            //
            _merge: function(e1, e2) {
                var p1 = e1.$el.position().top, h1 = e1.$el.height() + p1,
                p2 = e2.$el.position().top, h2 = e2.$el.height() + p2,
                merge = ((p1 <= p2 && p2 <= h1) || (p2 <= p1 && p1 <= h2));
                
                if (!merge) return false;
                $.log("MERGE: " + e1.model.cid + " : " + e2.model.cid);
                //
                // Keep e1 only, change connectors from e2->e1
                //                
                this.connectors.children.each(function(connector) {
                    if (connector.fromModel == e2.model) {
                        $.log("CONNECTOR: " + connector.model.cid  + "CHANGE FROM : " + e2.model.cid + " -> " + e1.model.cid);
                         connector.fromModel = e1.model;
                         connector.model.set({fromId: e1.model.get("id")});
                     }
                    if (connector.toModel == e2.model) {
                        $.log("CONNECTOR: " + connector.model.cid +"CHANGE TO : " + e2.model.cid + " -> " + e1.model.cid);
                         connector.toModel = e1.model;
                         connector.model.set({toId: e1.model.get("id")});
                     }
                });
                
                if (h2 > h1) h1 = h2;
                if (p1 > p2) p1 = p2;
                
                e1.$el.css({top: p1, height: h1-p1});
                e1.model.set({top: p1, height: h1-p1});

                return true;
                
            },
            _merge_and_align: function(view) {
                // Wrong element type
                if (view.model.get("type") != "objinstance") return;
                // Nothing to merge or drop
                if (view.droppedElements.length == 0) return;

                var left = view.$el.position().left + view.$el.width()/2 - 5;

                var that = this, dropList = new Array(), checkList = new Array();
                _.each(view.droppedElements, function(e1) {
                    $.log("DROP 1 : " + e1.model.cid);
                  // Fix the position of the llport element
                  if (!_.contains(dropList, e1)) {
                    e1.$el.css({left:left});
                    _.each(view.droppedElements, function(e2) {
                        $.log("DROP 2 : " + e2.model.cid);
                        if (e1 != e2 && !_.contains(dropList, e2) && !_.contains(checkList, e2) && that._merge(e1, e2)) {
                            $.log("DROP LIST : " + e2.model.cid);
                            dropList.push(e2);
                        }
                    });
                    checkList.push(e1);
                  }
                });

                // Clean up dropped elements list
                view.droppedElements = checkList;
                var that = this;
                // Destroy ui views
                _.each(dropList, function(element) {
                    $.log("REMOVE: " + element.model.cid);
                    that.elements.collection.remove(element.model);
                });
            },
            onConnectorDragStop: function(conView, ui) {
                
                //////////////////////////// COMPLETE DROP OF EACH ELEMENT AND SYNC UP MODELS
                _.each(this.dragAlsoElements, function(element, idx) {
                   element.onDragStop(ui);
                });

                // Sync up epoints on drag stop
                _.each(this.draggableConnectors, function(connector, idx) {
                    connector.onDragStop(ui);
                });

                // Refresh droppable relations
                var that = this;
                this.elements.children.each(function(itemView2) {
                    //
                    // There is one to one relation between llport and objinstance
                    //
                    if (itemView2.model.get("type") != "llport" && itemView2.model.get("type") != "objinstance") {
                      if (!(itemView2 in that.dragAlsoElements)) {
                        _.each(that.dragAlsoElements, function (droppedElemement) {
                            itemView2.dropDone(droppedElemement);
                        });
                      }
                    }
                });

                //
                // Now all models are synchronized with view and we could check them
                // CREATE A NEW LLPORT if REQUIRED for FROM element OR toElement
                //
                this.draggableConnectors.push(conView);
                var obj_inst_array = new Array();
                _.each(this.draggableConnectors, function(connector, idx) {
                    var ftv = that._get_connector_views(connector), r;
                    //
                    // If connected to llport
                    //

                    if (ftv.from && ftv.from.dropParent) {
                      // Add to the list of changeable
                      if (!_.contains(obj_inst_array, ftv.from.dropParent)) obj_inst_array.push(ftv.from.dropParent);

                      r = that._drop_or_create_port(ftv.from.dropParent, connector);
                      if (r) {
                        connector.fromModel = r;
                        connector.model.set({fromId: r.get("id")});
                      }
                    }
                    //
                    // If connected to llport
                    //
                    if (ftv.to && ftv.to.dropParent) {
                      // Add to the lkist of changeable
                      if (!_.contains(obj_inst_array, ftv.to.dropParent)) obj_inst_array.push(ftv.to.dropParent);

                      r = that._drop_or_create_port(ftv.to.dropParent, connector);
                      if (r) {
                        connector.toModel = r;
                        connector.model.set({toId: r.get("id")});
                      }
                    }
                });

                _.each(obj_inst_array, function(view, index) {
                    that._merge_and_align(view);
                });
                this.dragAlsoElements = new Array();
                this.draggableConnectors = new Array();
            },
            // Droppable
            dragAlsoElements: [],
            draggableConnectors: [],
            onDragDo: function(itemView, ui) {
                if (ui && ui.x)
                  $.log("DRAG DO " + ui.x + " Y: " + ui.y);
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

                // Do not support drag also for the not dropped connector
                if (itemView.model.get("type") == "llport" && itemView.dropParent == null) {
                    // Emulate element select, to prevent wrong expectation from user
                    this.onElementSelect(itemView, {ctrlKey:false});
                    return;
                }
                
                var queued = new Array();
                queued.push(itemView.model.cid);

                var that = this,
                isObjInstance = itemView.model.get("type") == "objinstance",
                isLlport =  itemView.model.get("type") == "llport";
                
                
                this.elements.children.each(function(item) {
                   if (item != itemView && item.selected) {
                            
                       if ((isLlport && item.model.get("type") == "llport")
                         || (isObjInstance && item.model.get("type") != "llport")) {
                         that.dragAlsoElements.push(item);
                         queued.push(item.model.cid);
                     }
                   }
                });

                // itemView is not a part of drag also
                // Therefore it is no in the list of dragAlsoElements
                _.each(itemView.droppedElements, function(e3) {
                     if (!_.contains(that.dragAlsoElements, e3)) {
                         that.dragAlsoElements.push(e3);
                     }
                });
                
                if (isLlport) {
                    var secondStageModels = new Array();
                    // Check outgoing connectors
                    this.connectors.children.each(function(connector, idx) {
                        if (connector.fromModel == itemView.model) {
                            secondStageModels.push(connector.toModel);
                        }
                        else if (connector.toModel == itemView.model) {
                            secondStageModels.push(connector.fromModel);
                        }
                    });
                    $.log("OUTGOING: " + secondStageModels.length);
                    if (secondStageModels.length > 0) {
                        var nextStageModels = new Array();
                        _.each(secondStageModels, function(m4) {
                            var hasMoreConnectors = false;
                           that.connectors.children.each(function(c4) {
                               if ((c4.fromModel == m4 && c4.toModel != itemView.model)
                                 || (c4.toModel == m4 && c4.fromModel != itemView.model)) {
                                 hasMoreConnectors = true;
                               }
                           });
                           if (!hasMoreConnectors) {
                               nextStageModels.push(m4);
                           }
                       });

                        that.elements.children.each(function(e4) {
                           _.each(nextStageModels, function(ns) {
                               if (e4.model == ns) {
                                   if (!_.contains(that.dragAlsoElements, e4)) {
                                     that.dragAlsoElements.push(e4);
                                     queued.push(e4.model.cid);
                                   }
                               }
                           });
                       });

                    }
                    
                }

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
                            // Prevent self drop checking
                            if (droppedElemement != itemView2) {
                              itemView2.dropDone(droppedElemement);
                            }
                        });
                    }
                });

                // Merge and align elements
                _.each(that.dragAlsoElements, function(view, index) {
                    if (view.model.get("type") == "llport" && view.dropParent) {
                      that._merge_and_align(view.dropParent);
                    }
                    else if (view.model.get("type") == "objinstance") {
                        that._merge_and_align(view);
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
