define(
    ['backbone',
        'Views/framework',
        'Models/contentModel'],
    function (Backbone, Framework, ContentModel) {
        var diagrammingView = Backbone.Marionette.ItemView.extend({
            render: function () {
                var parentSelector = this.model.get('parentSelector');
                $(parentSelector).append("HELLO DIAGRAM TABS !!! " + parentSelector);
            }
        });

        Framework.registerContentTypeView({
            type: 'diagram',
            classPrototype:diagrammingView,
            extensions:"UMLSYNC,US.SVG"
        });

        return diagrammingView;
    });
