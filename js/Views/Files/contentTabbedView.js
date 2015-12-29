define(
    ['jquery',
     'jquery-ui',
     'underscore',
     'scrolltab',
     'marionette',
     'Views/framework',
     'Collections/contentCollection'],
    function ($, useless, _, useless2,  Marionette, Framework, ContentCollection) {
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
            // There is no tabs for snippets
            // We have to handle tabs in a separate way
            //
            filter: function(childer) {
              return children.get("contentType") != "snippets";
            },
            childEvents: {
               render: 'onChildRender'
            },
            //
            // map ui element to the model keys
            //
            triggerClose: function(event) {
              // extract content information from event
              var uid = $(event.currentTarget).parent().parent().children("A:not(.ui-corner-all)").attr("href");
              var models = this.collection.where({parentSelector:uid});
              
              // trigger with content information
              if (models.length == 1) {
                models[0].trigger("syncup", "later");

                Framework.vent.trigger("content:before:close", {model:models[0], action: "close"});
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
                this.kids = [];

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
                    
                 // Copy-Cut-Past operations !!!
                 Framework.vent.on("content:past", _.bind(this.onPastCall, this));
            },
            //
            // Fix content size
            //
            onChildRender: function(childView) {
              if (!childView.model.get('isEmbedded'))
                  Framework.vent.trigger("app:resize", true);
            },
            onPastCall: function(data) {
                if (this.activeView && this.activeView.handlePast) {
                    this.activeView.handlePast(data);
                }
            },
            //
            // Append tab item for View rendering
            //
            onBeforeAddChild: function (childViewInstance) {
                if (!childViewInstance.model.get('parentSelector')) {

                    // work-around to track active child !!!
                    this.kids[childViewInstance.model.cid] = childViewInstance;

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
                var data = {
                     width: width - 40,
                     height: height - $("#tabs>ul.ui-tabs-nav").height() - 40
                };

                this.children.each(function(child) {
                   if (child.resize instanceof Function) {
                       if (!child.model.get("isEmbedded"))
                         child.resize(data);
                   }
                });
            },
            /////////////////// Collection events ////////////////
            //
            // Remove tab on model remove from collection
            //
            onBeforeRemoveChild: function(view) {
              if (view) {
                if (this.kids[view.model.cid]) {
                    // reset active view before child remove !!!
                    if (this.kids[view.model.cid] == this.activeView)
                       this.activeView = null;

                   // clean-up views cache !!!
                   this.kids[view.model.cid] = null;
                   delete this.kids[view.model.cid];
                }
                else {
                  // an emebedded content doesn't keep instance in
                  // the local content tabs cache
                  if (!view.model.get("isEmbedded"))
                      alert("Trying to remove not existing child !!!");
                }

                var parent = view.model.get("parentSelector");
                var that = this;
                view.on('destroy', function() {
                    // destroy tab item
                    $('#tabs ul a[href^='+parent+']').parent().remove(); 
                    // trigger remove tabs for scrollable tabs
                    // to re-calculate scroll options
                    that.$el.trigger('tabsremove');
                    // Remove tab for the view manually.
                    // No idea why the jquery.tabs doesn't remove it
                    $('#tabs ' + parent).remove();
                });
              }
            },
            //
            // Handle trigger event for tab activation
            //
            isActive: function(model, something, view) {
               if (model.get("isActive")) {
                this.$el.tabs('select', model.get("parentSelector"));
                if (this.kids[model.cid]) {
                  this.activeView = this.kids[model.cid];
                  this.kids[model.cid].triggerMethod("FocusChange", true);
                }
                else {
                  this.activeView = null;
                }
              }
              else {
                if (this.kids[model.cid]) {
                  this.kids[model.cid].triggerMethod("FocusChange", false);
                }
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
