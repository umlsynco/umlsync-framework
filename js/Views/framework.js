define(['marionette',
        'Collections/dataProviderCollection',
        'Controllers/NewDocumentController',
        'Controllers/ContextMenuRegistry'
        ],
    function(Marionette, DataProviderCollection, NewDocumentDialog, ContextMenuRegistry, DiagramCtxMenu) {

$.log = function(message) {
    if (window.console) console.log(message);
};
        
    var Framework = new Marionette.Application({
        //
        // Collection of the loaded content on the right side tabs
        //
        ContentCollection: null,
        //
        // Right side view
        // It could be easily extended with a multi-window
        //
        ContentView: null,
        //
        // View which is responsible for the switching
        // between all registered data providers (DP)
        // 1. It could close close all opened files on DP change
        // 2. It could support multiple DP mode etc..
        //
        DataProviderSwitcher: null,
        //
        // Context menu state:
        // TODO: Move to ContextMenuRegistry
        //
        ContextMenuActive: false,
        //
        // List of the registered content types
        // with a corresponding prototypes and controllers
        //
        contentTypeViews: {},
        //
        // List of the registered data providers
        // Github, BitBake, LocalHost etc..
        //
        dataProviders: new DataProviderCollection(),
        //
        // @param options - the list of options for the content type
        // @param options.controller - action controller :
        //        { onRegister: function({framework: null}) {},
        //          onActivate: function() { }
        //        }
        //
        registerContentTypeView : function (options) {
          this.contentTypeViews[options.type] = options;

          if (options.controller && options.controller.onRegister) {
              options.controller.onRegister({framework:this});
          }

          if (this.newDocController == undefined) {
            var that = this;
            this.newDocController = new NewDocumentDialog({});

            // Data should describe the storage (github, eclipse etc)   
            this.vent.on('content:new:dialog', function(data) {
                var dlg =  that.newDocController.getDialog({dataprovider: data, contentTypeViews: that.contentTypeViews});
                that.DialogRegion.show(dlg);
                dlg.on("dialog:cancel", function() {
                    // Unsubscribe and hide
                    dlg.off("dialog:cancel");
                    dlg.off("dialog:done");
                    that.DialogRegion.show();
                });
                dlg.on("dialog:done", function(model) {
                    
                    // Unsubscribe and hide
                    dlg.off("dialog:cancel");
                    dlg.off("dialog:done");

                    // if model is empty then something wrong happened
                    // if model has absPath then github:content:new (save) -> content:focus (loaded) from data provider
                    // if no model abs path then "New {%content type%}" title

                    var model2 = model || {title: "selected nothing"};
                    // Load the diagram menu element
                    var stype = model2.get("contentType");
                    if (stype && that.contentTypeViews[stype].controller && that.contentTypeViews[stype].controller.onRequest) {
                        // Controller trigger request for load content type
                        that.contentTypeViews[stype].controller.onRequest(model2);
                    }

                    if (!model.absPath) {
                        // Trigger github:content:new -> content:focus (pre-loaded)
                        that.vent.trigger("content:focus",
                            {
                                title: 'New document',
                                contentType: 'diagram',
                                content: {base_type: 'base', type: "class", elements: [], connectors: []}
                            }
                        );
                    }

                    // handle new content creation !!!
                    that.DialogRegion.show();
                });

            });
          }
        },
        getContentTypeView : function (id) {
          if (this.contentTypeViews[id].controller && this.contentTypeViews[id].controller.onActivate) {
              this.contentTypeViews[id].controller.onActivate({contextMenuRegistry:this.ContextMenuRegistry});
          }
          
          return this.contentTypeViews[id].classPrototype;
        },

        getContentType : function (extension) {
            //TODO: Another way to make a stub for snippets
            if (extension == "SNIPPETS") {
                return "snippets";
            }
            for (var v in this.contentTypeViews) {
                if (this.contentTypeViews[v].extensions.split(',').indexOf(extension) >=0) {
                    return this.contentTypeViews[v].type;
                }
            }
        },
        //////////////////////////////////////////////
        //            DATA PROVIDER API             //
        //////////////////////////////////////////////
        registerDataProvider: function(name, object) {
            this.dataProviders.add({name:name, object:object});
        },
        getDataProvider : function(name) {
            var result = this.dataProviders.where({name:name});
            if (result.length == 1) {
                return result[0].get('object');
            }
            else {
                return null;
            }
        },
        getDataProviderCollection: function() {
            return this.dataProviders;
        }
    });

    var ResizableRegion = Marionette.Region.extend({
        resize: function(event, w, h) {
            if (this.currentView && this.currentView.resize) {
                return this.currentView.resize(event, w, h);
            }
            else {
                return {height: this.$el.height(), width: this.$el.width()};
            }
        }
    });

    var DialogRegion = Marionette.Region.extend({
          show: function(view, options) {

               if (this.currentView && this.currentView.isSingletone) {
                  // detach child element
                  this.$el.children().detach();
                  this.currentView = undefined;
              }

              // View detach when necessary        
              if (!view) {
                this.currentView = undefined;
                return;
              }

              // Do not re-render view for 
              if (view && view.$el && view.$el.length > 0
                  && view.isSingletone) {
                  // Destroy previous dialog
                  if (this.currentView) {
                      this.reset();
                  }
                  // Set incomming view as default !
                  this.currentView = view;
                  this.$el.append(view.$el);
                  // Trigger method
                  this.triggerMethod('show', view);

                  if (_.isFunction(view.triggerMethod)) {
                    view.triggerMethod('show');
                  } else {
                    this.triggerMethod.call(view, 'show');
                  }
                  return this;
              }
              else {
                Marionette.Region.prototype.show.apply(this, arguments);
              }
          }
    });

    Framework.addRegions({
        HeaderRegion: {
            selector: '#content-header',
            regionClass: ResizableRegion
        },
        LeftRegion: {
            selector: '#content-left',
            regionClass: ResizableRegion
        },
        RightRegion: {
            selector: '#content-right',
            regionClass: ResizableRegion
        },
        BottomRegion: {
            selector: '#content-bottom',
            regionClass: ResizableRegion
        },
        DialogRegion: {
            selector: '#content-dialog',
            regionClass: DialogRegion
        },
        ContextMenuRegion: {
            selector: '#context-menu-region',
            regionClass: DialogRegion // Singletone and disconnect without destroy !
        },
        DiagramMenuRegion: "#diagram-menu",

        IconMenuRegion : "#diagram-iconmenu-region"
    });

    Framework.addInitializer( function(options){
        var that = this;
        // Subscribe on window resize
        $(window).resize(function(e) {
            that.vent.trigger('app:resize', e);
        });

        $("#content-left-right-resize").draggable({
             drag: function(e, ui) {
                that.vent.trigger('app:resize', e, ui);
             },
             stop: function(e, ui) {
                that.vent.trigger('app:resize', e, ui);
             }
        });

        // [TODO]: Path for each diagram ?
        if (Backbone.history){ Backbone.history.start(); }

        // Context menu region handler !!!
        if (!this.ContextMenuRegistry)
           this.ContextMenuRegistry = new ContextMenuRegistry({region:this.ContextMenuRegion, Framework: this});

        // context menu is global feature
        this.vent.on("contextmenu:show", function(data) {
            that.ContextMenuRegistry.show(data);
            that.ContextMenuActive = true;
        });
        
        // Hide the context menu on each click
        $(document).click(function(){
            if (that.ContextMenuActive && that.ContextMenuRegion.$el) {
              that.ContextMenuRegion.$el.hide();
              that.ContextMenuActive = false;
            }
            
            // hide the icon menu
            if (that.IconMenuRegion.isActive) 
              that.vent.trigger("diagram:iconmenu:show", null);
        });

    });

    Marionette.Behaviors.behaviorsLookup = function() {
        return window.Behaviors;
    }
    window.Behaviors = window.Behaviors || {};

    return Framework;
});
