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
                    'Modules/Diagrammer/Views/Elements/umlinterface', 'Modules/Diagrammer/Views/Elements/umlport', 'Modules/Diagrammer/Views/Elements/umlinstance']);
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
                    this.modelDiagram = new Diagram($.parseJSON(this.model.get("content")));

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
            }
        });

        Framework.registerContentTypeView({
            type: 'diagram',
            classPrototype:diagramView,
            extensions:"UMLSYNC,US.SVG"
        });

        return diagramView;
    });
