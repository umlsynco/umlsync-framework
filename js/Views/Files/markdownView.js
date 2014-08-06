define(
    ['backbone',
        'showdown',
        'Views/framework',
        'Models/contentModel'],
    function (Backbone, $Showdown, Framework, ContentModel) {

        var converter = new Showdown.converter(); //{ extensions: ['umlsync'] }

        var view = Backbone.Marionette.ItemView.extend({
            getTemplate: function () {
                var status = this.model.get("status");
                // use the default templates for loading and load failed use-cases
                if (status == 'loading') {
                    return "#umlsync-content-loading-template";
                } else if (status == 'error') {
                    return "#umlsync-content-failed-template";
                }

                // Check if content is in edit mode
                var mode = this.model.get("mode");
                if (mode == "edit") {
                    return "#umlsync-markdown-edit-template";
                } else {
                    return "#umlsync-markdown-view-template";
                }
            },
            render: function () {
                var title = this.model.get('title');
                var parentSelector = this.model.get('parentSelector');
                var contentData = this.model.get('contentData') || 'Goodby word !';
                $(parentSelector).append('<div class="us-diagram announce instapaper_body md" data-path="/" id="readme"><span class="name">\
                    <span class="mini-icon mini-icon-readme"></span> ' + title + '</span>\
                    <article class="markdown-body entry-content" itemprop="mainContentOfPage">\
                    ' + converter.makeHtml(contentData) + '\
                    </article></div>');
            }
        });

        Framework.registerContentTypeView({type: 'markdown', classPrototype: view, extensions: "MD"});

        return view;
    });

