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

        Framework.registerContentTypeView({
            type: 'sourcecode',
            classPrototype:sourcecodeView,
            extensions:"C,CPP,H,HPP,PY,HS,JS,CSS,JAVA,RB,PL,PHP"
        });

        return sourcecodeView;
    });
