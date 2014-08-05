define(
    ['backbone',
        'showdown',
        'Views/framework',
        'Models/contentModel'],
    function (Backbone, $Showdown, Framework, ContentModel) {

        var converter = new Showdown.converter(); //{ extensions: ['umlsync'] }

        var view = Backbone.Marionette.ItemView.extend({
            render: function () {
                var title = this.model.get('title');
                var parentSelector = this.model.get('parentSelector');
                var contentData = this.model.get('contentData') || 'Goodby word !';
                $(parentSelector).append('<div class="us-diagram announce instapaper_body md" data-path="/" id="readme"><span class="name">\
                    <span class="mini-icon mini-icon-readme"></span> '+title+'</span>\
                    <article class="markdown-body entry-content" itemprop="mainContentOfPage">\
                    '+converter.makeHtml(contentData)+'\
                    </article></div>');
            }
        });

        Framework.registerContentTypeView('markdown', view);

        return view;
    });

