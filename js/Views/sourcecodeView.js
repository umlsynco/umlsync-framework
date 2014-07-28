define(
    ['backbone',
        'Views/framework',
        'Models/contentModel'],
    function (Backbone, Framework, ContentModel) {
        var sourcecodeView = Backbone.Marionette.ItemView.extend({
            render: function () {
                var tabname = this.model.get('tabname');
                $('#' + tabname).append("HELLO TABS !!!");
            }
        });

        Framework.addContentTypeView('sourcecode', sourcecodeView);

        return sourcecodeView;
    });
