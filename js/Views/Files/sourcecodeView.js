define(
    ['backbone',
        'Views/framework',
        'Models/contentModel'],
    function (Backbone, Framework, ContentModel) {
        var sourcecodeView = Backbone.Marionette.ItemView.extend({
            render: function () {
                var parentSelector = this.model.get('parentSelector');
                $(parentSelector).append("HELLO TABS !!! " + parentSelector);
            }
        });

        Framework.registerContentTypeView('sourcecode', sourcecodeView);

        return sourcecodeView;
    });
