define(['marionette', 'Collections/dataProviderCollection'], function(Marionette, DataProviderCollection) {
    var Framework = new Marionette.Application({
        contentTypeViews: {},
        dataProviders: new DataProviderCollection(),

        registerContentTypeView : function (options) {
          this.contentTypeViews[options.type] = options;
        },
        getContentTypeView : function (id) {
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
		DialogRegion: '#content-dialog'
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