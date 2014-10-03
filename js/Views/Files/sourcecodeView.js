define(
    ['backbone',
     'Views/framework',
     'Models/contentModel'
    ],
    function (Backbone, Framework, ContentModel) {
        var sourcecodeView = Backbone.Marionette.ItemView.extend({
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
            onRender: function() {
                if (this.model.get("status") != "error" && this.model.get("status") != "loading")
                  prettyPrint();
            },
            templateHelpers : {
                showContent: function() {
                    return contentData = this.modifiedContent || this.content;
                }
            }
        });

        Framework.registerContentTypeView({
            type: 'sourcecode',
            classPrototype:sourcecodeView,
            extensions:"C,CPP,H,HPP,PY,HS,JS,CSS,JAVA,RB,PL,PHP"
        });

        return sourcecodeView;
    });
