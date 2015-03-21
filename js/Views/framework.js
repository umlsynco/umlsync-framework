define(['marionette',
        'Collections/dataProviderCollection',
        'Controllers/DiagramMenuController',
        'Controllers/NewDocumentController',
        'Controllers/ContextMenuRegistry',
        'Modules/Diagrammer/Views/contextmenu'
        ],
    function(Marionette, DataProviderCollection, DiagramMenu, NewDocumentDialog, ContextMenuRegistry, DiagramCtxMenu) {
		
    var Framework = new Marionette.Application({
        contentTypeViews: {},
        dataProviders: new DataProviderCollection(),
        registerContentTypeView : function (options) {
          this.contentTypeViews[options.type] = options;
          if (this.diagramMenu == undefined) {
			  this.diagramMenu = new DiagramMenu({Framework:this});
			  this.DiagramMenuRegion.show(this.diagramMenu.getDialog(), {forceShow: true});
			  this.diagramMenu.hide();
			  
			  // TODO: Think if we really need this callback !!!
			  this.diagramMenu.on("add:accordion", function(regionId) {
				  //alert("Handle new item added to the diagram menu !!!");
			  });
		  }
		  if (this.newDocController == undefined) {
			var that = this;
		    this.newDocController = new NewDocumentDialog({});

            // Data should describe the storage (github, eclipse etc)   
		    this.vent.on('content:new:dialog', function(data) {
				var dlg =  that.newDocController.getDialog(data);
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

					model = model || {title: "selected nothing"};
 				    that.diagramMenu.getDialog().addAccordionItem(model);
 				    
 				    that.vent.trigger("content:focus", {title:'New docuemnt', contentType: 'diagram', content: {base_type:'base', type:"class", elements:[], connectors:[]}});

					// handle new content creation !!!
					that.DialogRegion.show();
				});

			});
		  }
        },
        getContentTypeView : function (id) {
		  if (id == "diagram") {
			  this.diagramMenu.show();
			  if (!this.dctx) {
				  this.dctx = new DiagramCtxMenu({registry:this.ContextMenuRegistry});
			  }
		  }
		  else {
			  this.diagramMenu.hide();
		  }
          return this.contentTypeViews[id].classPrototype;
        },

        getContentType : function (extension) {
            for (var v in this.contentTypeViews) {
                if (this.contentTypeViews[v].extensions.split(',').indexOf(extension) >=0) {
                    return this.contentTypeViews[v].type;
                }
            }
        },

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
        DiagramMenuRegion: "#diagram-menu"
    });

    Framework.addInitializer( function(options){
        var that = this;
        // Subscribe on window resize
        $(window).resize(function(e) {
            that.vent.trigger('app:resize', e);
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
		});

    });

	Marionette.Behaviors.behaviorsLookup = function() {
		return window.Behaviors;
	}
	window.Behaviors = window.Behaviors || {};

    return Framework;
});
