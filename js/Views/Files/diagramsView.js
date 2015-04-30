define(
    ['backbone',
     'Views/framework',
     'Models/contentModel',
     'Modules/Diagrammer/Models/Diagram',
     'Modules/Diagrammer/Views/umldiagram'
    ],
    function (Backbone, Framework, ContentModel, Diagram, UmlDiagram) {
        var diagramView = Backbone.Marionette.ItemView.extend({
            initialize: function () {
                this.model.on('change:status', this.render);
                // TODO: handle the lazy load of these modules
                // UML Elements
                require(['Modules/Diagrammer/Views/Elements/umlclass', 'Modules/Diagrammer/Views/Elements/umlpackage', 'Modules/Diagrammer/Views/Elements/umlcomponent',
                    'Modules/Diagrammer/Views/Elements/umlinterface', 'Modules/Diagrammer/Views/Elements/umlport', 'Modules/Diagrammer/Views/Elements/umlinstance',
                    'Modules/Diagrammer/Views/Elements/umlnote']);
                // UML connectors
                require(["Modules/Diagrammer/Views/Connectors/umlaggregation", 
                    "Modules/Diagrammer/Views/Connectors/umldependency", "Modules/Diagrammer/Views/Connectors/umlcomposition",
                    "Modules/Diagrammer/Views/Connectors/umlassociation", "Modules/Diagrammer/Views/Connectors/umlanchor",
                    "Modules/Diagrammer/Views/Connectors/umlnested", "Modules/Diagrammer/Views/Connectors/umlgeneralization",
                    "Modules/Diagrammer/Views/Connectors/umlrealization"]);
            },
            getTemplate: function () {
                var status = this.model.get("status");
                // use the default templates for loading and load failed use-cases
                if (status == 'loading') {
                    return "#umlsync-content-loading-template";
                } else if (status == 'error') {
                    return "#umlsync-content-failed-template";
                }
                // Check if content is in edit mode
                return "#umlsync-sourcecode-view-template";
            },
            render: function() {
                // Empty element of the current array
                this.$el.empty();
                // And handle them
                if (this.model.get("status") != "error" && this.model.get("status") != "loading") {
                    var simpleContent  = this.model.get("content");
                    simpleContent = (simpleContent instanceof  String) ? $.parseJSON(simpleContent) : simpleContent;
                    simpleContent = (simpleContent instanceof  Object) ? simpleContent : $.parseJSON(simpleContent);

                    this.modelDiagram = new Diagram(simpleContent);

                    // Methods become available if elements and connectors are not empty
                    if (this.modelDiagram.getUmlElements && this.modelDiagram.getUmlConnectors) {
                        var els = this.modelDiagram.getUmlElements();
                        var cs = this.modelDiagram.getUmlConnectors();
                        for (var xxx in els.models) {
                            var model = els.at(xxx);
                            if (model.get("type") == "class") {
                                var operations = model.getUmlOperations();
                                var attributes = model.getUmlAttributes();
                            }
                        }
                    }

                    this.UD = new UmlDiagram({model:this.modelDiagram });
                    this.UD.render();
                    this.$el.append(this.UD.$el);

                }
                else {
                   // Use the default method
                   return Backbone.Marionette.ItemView.prototype.render.apply(this, arguments);
                }
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

                               connectors.add(new Backbone.Model({type:data.context.connectorType, fromId:fromId, toId:"ConnectionHelper", temporary:true}));
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
                           var mmm = new Backbone.DiagramModel({type:"class", name: "Test" + fromId, left: data.context.left, top:data.context.top, operations:[], attributes:[]});

                           // Add new element for a while, but we have to check if it was dropped over
                           // an existing element
                           elements.add(mmm);
                           if (!mmm.get("id")) {
							   alert("Unexpected error: uml element didn't get 'id' before connector creation !");
						   }
                           connectors.add(new Backbone.DiagramModel({type:data.context.connectorType, fromId:fromId, toId:mmm.get("id")}));

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
            }
        });

        Framework.registerContentTypeView({
            type: 'diagram',
            classPrototype:diagramView,
            extensions:"UMLSYNC,US.SVG"
        });

        return diagramView;
    });
