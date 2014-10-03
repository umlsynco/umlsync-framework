define(
    ['backbone',
     'Views/framework',
     'Models/contentModel'
    ],
    function (Backbone, Framework, ContentModel) {
        var diagramView = Backbone.Marionette.ItemView.extend({
            initialize: function () {
                this.model.on('change:status', this.render);
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
                    this.$el.append("THIS IS DIAGRAM ?");
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