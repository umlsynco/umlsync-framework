define(['marionette', 'Collections/dataProviderCollection',  'Controllers/DiagramMenuController', 'Controllers/NewDocumentController'],
    function(Marionette, DataProviderCollection, DiagramMenu, NewDocumentDialog) {
		
    var Framework = new Marionette.Application({
        contentTypeViews: {},
        dataProviders: new DataProviderCollection(),

        registerContentTypeView : function (options) {
          this.contentTypeViews[options.type] = options;
          if (this.diagramMenu == undefined) {
			  this.diagramMenu = new DiagramMenu({});
			  this.DiagramMenuRegion.show(this.diagramMenu.getDialog(), {forceShow: true});
			  this.diagramMenu.hide();
			  this.diagramMenu.on("add:accordion", function(regionId) {
				  alert("Handle new item added to the diagram menu !!!");
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
					that.DialogRegion.show(null);
				});
				dlg.on("dialog:done", function() {
					// handle new content creation !!!
					that.DialogRegion.show(null);
				});

			});
		  }
        },
        getContentTypeView : function (id) {
		  if (id == "diagram") {
			  this.diagramMenu.show();
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

              // Do not re-render view for 
			  if (view.$el && view.$el.length > 0
			      && view.isSingletone && view.isRendered) {
				  this.currentView = view;
				  this.$el.append(view.$el);
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
        DiagramMenuRegion: "#diagram-menu"
    });

    Framework.addInitializer( function(options){
        var that = this;
        // Subscribe on window resize
        $(window).resize(function(e) {
            that.vent.trigger('app:resize', e);
        });

        if (Backbone.history){ Backbone.history.start(); }
    });

	Marionette.Behaviors.behaviorsLookup = function() {
		return window.Behaviors;
	}
	window.Behaviors = window.Behaviors || {};

    return Framework;
});
