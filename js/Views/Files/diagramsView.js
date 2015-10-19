define(
    ['backbone',
     'Views/framework',
     'Models/contentModel',
     'Modules/Diagrammer/Models/Diagram',
     'Modules/Diagrammer/Controllers/OperationManager',
        'Modules/Diagrammer/Controllers/ElementDropController',
     'Modules/Diagrammer/Views/umldiagram'
    ],
    function (Backbone, Framework, ContentModel, Diagram, OperationManager, ElementDropController, UmlDiagram) {
        var diagramView = Backbone.Marionette.ItemView.extend({
			//
			// Pre-load of elements
			//
            initialize: function () {
                this.model.on('change:status', this.render);
                // TODO: handle the lazy load of these modules
                // UML Elements
                require(['Modules/Diagrammer/Views/Elements/umlclass', 'Modules/Diagrammer/Views/Elements/umlpackage', 'Modules/Diagrammer/Views/Elements/umlcomponent',
                    'Modules/Diagrammer/Views/Elements/umlinterface', 'Modules/Diagrammer/Views/Elements/umlport', 'Modules/Diagrammer/Views/Elements/umlinstance',
                    'Modules/Diagrammer/Views/Elements/umlnote',
                    'Modules/Diagrammer/Views/Elements/umlobjinstance',
                    'Modules/Diagrammer/Views/Elements/umlmessage',
                    'Modules/Diagrammer/Views/Elements/umlllport',
                    'Modules/Diagrammer/Views/Elements/umllldel',
                    'Modules/Diagrammer/Views/Elements/umlllalt',
                    'Modules/Diagrammer/Views/Elements/umlactor']);
                // UML connectors
                require(["Modules/Diagrammer/Views/Connectors/umlaggregation", 
                    "Modules/Diagrammer/Views/Connectors/umldependency", "Modules/Diagrammer/Views/Connectors/umlcomposition",
                    "Modules/Diagrammer/Views/Connectors/umlassociation", "Modules/Diagrammer/Views/Connectors/umlanchor",
                    "Modules/Diagrammer/Views/Connectors/umlnested", "Modules/Diagrammer/Views/Connectors/umlgeneralization",
                    "Modules/Diagrammer/Views/Connectors/umlrealization",
                    "Modules/Diagrammer/Views/Connectors/umlllsequence",
                    "Modules/Diagrammer/Views/Connectors/umlllreturn"]);
                //    
                // Sync-up content on model save
                //
                this.model.on("syncup", this.syncUpBeforeClose, this);
            },
            ui: {
                'editButton' : "#us-diagram-edit",
                'getLink': 'div#getLink'

            },
            events: {
                'click @ui.editButton': 'toggleEditMode',
                'click @ui.getLink' : 'onGetLink'
            },
            toggleEditMode: function() {
                var text = this.ui.editButton.text();
                if (text == 'Edit') {
                    this.model.set("mode", "edit");
//                    this.UD.setMode("edit");
                    return;
                }
//                this.UD.setMode("view");
                this.model.set("mode", "view");
            },
            //
            // Loading -> Render or Error 
            //
            getTemplate: function () {
               // TODO: move these code into the separate calss like viewmanager or base class for all views
                var status = this.model.get("status");
                // use the default templates for loading and load failed use-cases
                if (status == 'loading') {
                    return "#umlsync-content-loading-template";
                } else if (status == 'error') {
                    return "#umlsync-content-failed-template";
                }
                // Check if content is in edit mode
                return "#umlsync-diagram-view-template";
            },
            //
            // Render an internal items
            //
            render: function() {
                // Empty element of the current array
                this.$el.empty();
                // And handle them
                if (this.model.get("status") != "error" && this.model.get("status") != "loading") {

                    Backbone.Marionette.ItemView.prototype.render.apply(this, arguments);

                    var simpleContent  = this.model.get("content");
                    simpleContent = (simpleContent instanceof  String) ? $.parseJSON(simpleContent) : simpleContent;
                    simpleContent = (simpleContent instanceof  Object) ? simpleContent : $.parseJSON(simpleContent);

                    this.modelDiagram = new Diagram(simpleContent);
                    this.operationManager = new OperationManager({diagram:this.modelDiagram});

                    var ContentView = this;
                    
                    // Only operation manager knows about real status of diagram (on Ctrl-Z/Y or Ctrl+S)
                    this.operationManager.on("modified", function(value) {
                        ContentView.model.set("isModified", value);                       
                    });

                    // Methods become available if elements and connectors are not empty
                    if (this.modelDiagram.getUmlElements && this.modelDiagram.getUmlConnectors) {
                        var els = this.modelDiagram.getUmlElements();
                        var cs = this.modelDiagram.getUmlConnectors();

////////////////////////////////////////////////// DROP IT !!!
/*
var JSON = {};

JSON.stringify = JSON.stringify || function (obj) {
    var t = typeof (obj);
    if (t != "object" || obj === null) {
        // simple data type
        if (t == "string") obj = '"'+obj+'"';
        return String(obj);
    }
    else {
        // recurse array or object
        var n, v, json = [], arr = (obj && obj.constructor == Array);
        for (n in obj) {
            v = obj[n]; t = typeof(v);
            if (t == "string") v = '"'+v+'"';
            else if (t == "object" && v !== null) v = JSON.stringify(v);
            json.push((arr ? "" : '"' + n + '":') + String(v));
        }
        return (arr ? "[" : "{") + String(json) + (arr ? "]" : "}");
    }
};
*/
                    }

                    // Create the diagram view from the model and append to the current view
                    this.UD = new UmlDiagram({model:this.modelDiagram, opman:this.operationManager});
                    this.UD.render();
                    this.$el.append(this.UD.$el);

                    // draw all connectors
                    this.UD.drawConnectors();

                    this.dropController = new ElementDropController({view:this.UD, model: this.modelDiagram});

                }
                else {
                   // Use the default method
                   return Backbone.Marionette.ItemView.prototype.render.apply(this, arguments);
                }
            },

            //
            // Ctrl-Z
            //
            handleUndoOperation: function() {
    				if (this.operationManager)
				  this.operationManager.undo();
			},

            //
            // Ctrl-Y
            //
            handleRedoOperation: function() {
				if (this.operationManager)
				  this.operationManager.redo();
			},

            //
            // Handle content past from different sources:
            // Clipboard, main-elements-menu or icon-menu
            //
            handlePast: function(data) {
                // Create a new element !!!
                if (data.source == "diagram-menu") {
                    if (this.modelDiagram.getUmlElements) {
                        var elements = this.modelDiagram.getUmlElements();
                        elements.add(data.context);
                    }

                }
                else if (data.source == "diagram-icon-menu") {
                    if (this.modelDiagram.getUmlElements) {

                        var elements = this.modelDiagram.getUmlElements();
                        var connectors = this.modelDiagram.getUmlConnectors();

                        if (data.context.model && data.context.model.get("type") == "helper") {
                           if (data.initialContext && data.initialContext.model) {
                               var fromId = data.initialContext.model.get("id");

                               // Do nothing if initial element doesn't exist or has wrong value !!!
                               if (!fromId || !data.context.connectorType) { return; }

                               this._iconMenuStarted = true;
                               data.context.model.set("id", "ConnectionHelper");
                               data.context.model.set("temporary", true);
                               elements.add(data.context.model);

                               connectors.add(new Backbone.DiagramModel({type:data.context.connectorType, fromId:fromId, toId:"ConnectionHelper", temporary:true, epoints:[], labels:[]}));
                           }
                        }
                        else {
                           // Expected the icon menu to work through the helper ui element only
                           if (!this._iconMenuStarted) {
                                return;
                           }
                           this._iconMenuStarted = false;

                           // Dropped temporary connector
                           // It is easier to drop it neither re-assign it for a new element !!!
                           var rmConnectors = connectors.findWhere({temporary:true});
                           connectors.remove(rmConnectors);

                           // Drag and Drop helper element which it not UML element at all
                           var rmElements = elements.findWhere({temporary:true});
                           elements.remove(rmElements);

                           // Do nothing if initial element doesn't exist or has wrong value !!!
                           var fromId = data.initialContext.model.get("id");
                           if (!fromId || !data.context.connectorType) { return; }

                           // TODO: Get the model descriptor from the IconMenu element
                           // TODO: Check if connector helper was dropped on some element an use it if possible !!!
                            var mmm;
                            elements.each(function(elem) {
                                // Let's relay on mouse enter/exit behavior
                                if (elem.hilighted) {
                                  mmm = elem;
                                }
/*                                var top = elem.get("top"),
                                    left = elem.get("left"),
                                    width = elem.get("width"),
                                    height = elem.get("height");
                                if (top < data.context.top && data.context.top < top + height
                                  && left < data.context.left && data.context.left < left + width) {
                                  mmm = elem;
                                }*/
                            });
                            if (!mmm) {
                                if (data.element) {
                                    var rrr = $.extend({}, data.element, {left: data.context.left,
                                        top: data.context.top});

                                    mmm = new Backbone.DiagramModel(rrr);
                                }
                                else {
                                    mmm = new Backbone.DiagramModel({
                                        type: "class",
                                        name: "Test" + fromId,
                                        left: data.context.left,
                                        top: data.context.top,
                                        width: 150,
                                        height: 66,
                                        operations: [],
                                        attributes: []
                                    });
                                }
                                // Add new element for a while, but we have to check if it was dropped over
                                // an existing element
                                elements.add(mmm);
                            }


                           if (!mmm.get("id")) {
							   alert("Unexpected error: uml element didn't get 'id' before connector creation !");
						   }
                           connectors.add(new Backbone.DiagramModel({type:data.context.connectorType, fromId:fromId, toId:mmm.get("id"), epoints: [], labels: []}));

                           // TODO: Drop debug output one day
                           /*alert("elements: " + elements.length + "   connectors: " + connectors.length);
                           if (elements.length == 5) {
							    for (var r =0 ; r< elements.length; ++r) {
									alert("Element[" + r + "] = "  + elements.at(r).get("id"));
								}
						   }*/
                        }
                        
                    }

                }
                // Copy-past between diagrams !!!
                else if (data.source == "clipboard") {
                }
                else {
                    alert("Unknown source of PAST event: " + data.source);
                }                
            },
            //
            //  Sync-up diagram model and content tracker
            //
            syncUpBeforeClose: function() {
				if (this.model.get("isModified")) {
					var text = this.modelDiagram.getDescription("");
					alert(text);
					this.model.set("modifiedContent", text);
			    }
			}
        });

        Framework.registerContentTypeView({
            type: 'diagram',
            classPrototype:diagramView,
            extensions:"UMLSYNC,US.SVG"
        });

        return diagramView;
    });
