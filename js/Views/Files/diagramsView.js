define(
    ['backbone',
     'Views/framework',
     'Models/contentModel',
     'Modules/Diagrammer/Models/Diagram',
     'Modules/Diagrammer/Controllers/OperationManager',
     'Modules/Diagrammer/Controllers/ElementDropController',
     'Modules/Diagrammer/Controllers/SequenceElementDropController',
     'Modules/Diagrammer/Views/umldiagram',
     'Controllers/DiagramMenuController'
    ],
    function (Backbone, Framework, ContentModel, Diagram, OperationManager, ElementDropController, SequenceElementDropController, UmlDiagram, DiagramMenuController) {

        var controller = new DiagramMenuController(); 

        //
        // This class is responsible for the tab which contain diagram
        // It should handle concreate instance of the diagram
        //
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
                'getLink': 'span#us-getlink',
                'getLinkContent' : 'div#us-getlink-content',
                'readme': "div.us-diagram"

            },
            events: {
                'click @ui.editButton': 'toggleEditMode',
                'click @ui.getLink' : 'onGetLink'
          
            },
            toggleEditMode: function(event) {
                var text = this.ui.editButton.text();
                if (text == "Open") {
                    alert("Please implement open handler");
                    // Prevent markdown onEdit handler call
                    event.stopPropagation();
                    return;            
                }
                if (text == 'Edit') {
                    this.model.set("mode", "edit");
                    this.UD.setMode("edit");
                    this.ui.editButton.text("View");
                    controller.show();
                    return;
                }
                this.ui.editButton.text("Edit");
                this.UD.setMode("view");
                this.model.set("mode", "view");
                controller.hide();
            },
            onGetLink: function() {
               this.ui.getLinkContent.toggle();
               $.cachedPath = this.model.get("absPath");
               // TODO: move to render
               this.ui.getLinkContent.find('input').val('http://umlsync.org/github?path=' + this.model.get("absPath"));
             
            },
            onFocusChange: function(isFocused) {
              if (isFocused) {
                if (this.model.get("mode") == "edit"
                   && !this.model.get("isEmbedded")) {
                   controller.show();
                }
                else {
                   controller.hide();
                }
              }
              else {
                controller.hide();
              }
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
            // Handle application resize behavior
            // it could be horizontal splitter or window resize
            //
            resize: function(options) {
               this.$el.find("div.us-diagram").css(options);
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

                    var isemb = this.model.get("isEmbedded");

                    var simpleContent  = this.model.get("content");
                    simpleContent = (simpleContent instanceof  String) ? $.parseJSON(simpleContent) : simpleContent;
                    simpleContent = (simpleContent instanceof  Object) ? simpleContent : $.parseJSON(simpleContent);

                    this.modelDiagram = new Diagram(simpleContent);
                    if (!isemb) {
                      this.operationManager = new OperationManager({diagram:this.modelDiagram});

                      var ContentView = this;
                    
                      // Only operation manager knows about real status of diagram (on Ctrl-Z/Y or Ctrl+S)
                      this.operationManager.on("modified", function(value) {
                          ContentView.model.set("isModified", value);                       
                      });
                    }

                    this.modelDiagram.set({isEmbedded:isemb});

                    // Create the diagram view from the model and append to the current view
                    this.UD = new UmlDiagram({model:this.modelDiagram, opman:this.operationManager, vent: Framework.vent});
                    this.UD.render();
                    this.$el.append(this.UD.$el);

                    if (isemb) {
                      var sizes = this.modelDiagram.getSize();
                      this.$el.css(sizes);
                      this.UD.$el.css(sizes);
                      // this.US.$el.find(".us-canvas").css(sizes);
                    }
                    else {
                      this.UD.setMode("edit");
                    }
                    // draw all connectors
                    this.UD.drawConnectors();

                    //
                    // Sequence diagram has complex behavior which is out of scope of diagram types
                    //
                    if (!isemb) {
                      if (this.modelDiagram.get("type") == "sequence") {
                          this.dropController = new SequenceElementDropController({view:this.UD, model: this.modelDiagram});
                      }
                      else {
                          this.dropController = new ElementDropController({view:this.UD, model: this.modelDiagram});
                      }
                    }

                    // An embedded diagram behavior
                    if (isemb) this.ui.editButton.text("Open");

                    this.trigger("render");
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
            _iconMenuStarted: false,
            handlePast: function(data) {
                // Create a new element !!!
                if (data.source == "diagram-menu") {
                    if (this.modelDiagram.getUmlElements) {
                        var elements = this.modelDiagram.getUmlElements();
                        data.context.set({left:200, top: 5});
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
                           var epp = [];
                           // llsequence; llreturn etc...
                           if (data.context.connectorType[0] == "l" && data.context.connectorType[1] == "l") {
                               epp.push({x:  data.context.left, y: data.context.top});
                           }
                           connectors.add(new Backbone.DiagramModel({type:data.context.connectorType, fromId:fromId, toId:mmm.get("id"), epoints: epp, labels: []}));

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
        //        alert(text);
            this.model.set("modifiedContent", text);
        }
            }
        });

        
        //
        // Global content handlers registry
        //
        //
        Framework.registerContentTypeView({
            type: 'diagram',
            classPrototype:diagramView,
            extensions:"UMLSYNC,US.SVG",
            controller: controller
        });

        return diagramView;
    });
