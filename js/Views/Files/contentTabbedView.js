define(
    ['jquery',
     'jquery-ui',
     'scrolltab',
     'marionette',
     'Views/framework',
     'Collections/contentCollection'],
    function ($, useless, useless2,  Marionette, Framework, ContentCollection) {
        var contentCollectionView = Marionette.CollectionView.extend({
            // tab prefix + content Id
            tabPrefix: 'diag-',
            //
            // check if content type handler was registered
            //
            getChildView: function (item) {
                var contentType = item.get('contentType');
                return Framework.getContentTypeView(contentType);
            },
            //
            // Initialize tabs and subscribe on collection's callbacks
            //
            initialize : function () {
                var contentManager = this;
                this.$el.tabs(this, {
				        'scrollable': true,
                        'tabTemplate': '<li><a href="#{href}"><span>#{label}</span></a><a class="ui-corner-all"><span class="ui-test ui-icon ui-icon-close"></span></a></li>',
                        'add': function(event, ui) {
						    if (ui & ui.panel)
                            $(this).tabs('select', '#' + ui.panel.id);
                        },
                        'show': function (event, ui) {
						   if (ui && ui.panel)  {
                            var id = ui.panel.id.substr(contentManager.tabPrefix.length);
                            contentManager.collection.triggerTabShow(id);
						  }
                        }
                    });
				this.collection.on('change:isActive', function(data, something) {
				  if (data.get("isActive")) {
				    contentManager.$el.tabs('select', data.get("parentSelector"));
			      }
				});
            },
            //
            // Append tab item for View rendering
            //
            onBeforeAddChild: function (childViewInstance) {
                if (!childViewInstance.model.get('parentSelector')) {
                    var parentSelector = this.tabPrefix + childViewInstance.model.cid;
                    this.$el.tabs("add", '#' + parentSelector, childViewInstance.model.get('title'));
                    childViewInstance.model.set('parentSelector', '#' + parentSelector);
					childViewInstance.$el.attr('id', parentSelector);
                }
            },
			attachHtml: function(collectionView, childView, index) {
			    var ps = childView.model.get('parentSelector');
				if (ps) {
				  $(ps).append(childView.$el);
				}
			},
            resize: function(event, width, height) {
                this.$el.parent().width(width).height(height);
            }
        });

        return contentCollectionView;
    });
