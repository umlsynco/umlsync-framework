define(
    ['jquery',
     'jquery-ui',
     'scrolltab',
     'marionette',
     'Views/framework',
     'Collections/contentCollection'],
    function ($, useless, useless2,  Marionette, Framework, ContentCollection) {
        var contentCollectionView = Marionette.CollectionView.extend({
            collectionEvents: {
              'change:isModified': 'isModified',
              'change:isActive': 'isActive'
              
            },
            events: {
               "click .ui-icon-close" : 'triggerClose'
            },

            // tab prefix + content Id
            tabPrefix: 'diag-',
			//
			// map ui element to the model keys
			//
            triggerClose: function(event) {
			  // extract content information from event
			  var uid = $(event.currentTarget).parent().parent().children("A:not(.ui-corner-all)").attr("href");
			  var models = this.collection.where({parentSelector:uid});
			  
			  // trigger with content information
			  if (models.length == 1) {
				Framework.vent.trigger("content:before:close", models[0]);
			  }
            },
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
            },
			/////////////////// Collection events ////////////////
			//
			// Remove tab on model remove from collection
			//
			onBeforeRemoveChild: function(view) {
			  if (view) {
			    var parent = view.model.get("parentSelector");
				var that = this;
				view.on('destroy', function() {
				    // destroy tab item
				    $('#tabs ul a[href^='+parent+']').parent().remove(); 
					// trigger remove tabs for scrollable tabs
					// to re-calculate scroll options
					that.$el.trigger('tabsremove');
				});
			  }
			},
            //
            // Handle trigger event for tab activation
            //
            isActive: function(model, something) {
               if (model.get("isActive")) {
                this.$el.tabs('select', model.get("parentSelector"));
              }
            },
            //
            // Handle modified state of opened tab
            //
            isModified: function(model, state, something) {
              var selector = model.get("parentSelector");
              var $item = $('a[href$="' + selector + '"]').children("span");
              var text = $item.text();
              if (text[0] != "*" && state) {
                text = "* " + text;
              }
              else if (text[0] == "*" && !state) {
                text = text.substring(2);
              }
              $item.text(text);
            }
        });

        return contentCollectionView;
    });
