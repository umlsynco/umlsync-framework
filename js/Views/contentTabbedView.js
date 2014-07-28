define(
    ['jquery',
     'jquery-ui',
     'marionette',
     'Views/framework',
     'Collections/contentCollection'],
    function ($, useless,  Marionette, Framework, ContentCollection) {
        var contentCollectionView = Marionette.CollectionView.extend({
            counter: 0,
            tabPrefix: 'diag-',
            getChildView: function (item) {
                var contentType = item.get('contentType');
                return Framework.getContentTypeView(contentType);
            },
            onBeforeRender: function () {
                var contentManager = this;
                this.$el.tabs(this, {
                        'tabTemplate': '<li><a href="#{href}"><span>#{label}</span></a><a class="ui-corner-all"><span class="ui-test ui-icon ui-icon-close"></span></a></li>',
                        'add': function(event, ui) {
                            $(this).tabs('select', '#' + ui.panel.id);
                        },
                        'show': function (event, ui) {
                            var id = ui.panel.id.substr(contentManager.tabPrefix.length);
                            contentManager.collection.triggerTabShow(id);
                        }
                    });
            },
            onBeforeAddChild: function (childViewInstance) {
                if (!childViewInstance.model.get('tabname')) {
                    var tabname = this.tabPrefix + childViewInstance.model.get('id');
// alert("ADD " + childViewInstance.model.get('id')); UNDEFINED !!!
                    this.$el.tabs("add", '#' + tabname, childViewInstance.model.get('title'));
                    this.$el.append('<div id="' + tabname + '"></div>');

                    ++this.counter;
                    childViewInstance.model.set('tabname', tabname);
                }
            }
        });

        return contentCollectionView;
    });
