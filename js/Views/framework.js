define(['marionette', 'Collections/dataProviderCollection'], function(Marionette, DataProviderCollection) {
    var Framework = new Marionette.Application({
        contentTypeViews: {},
        dataProviders: new DataProviderCollection(),

        registerContentTypeView : function (id, view) {
          this.contentTypeViews[id] = view;
        },
        getContentTypeView : function (id) {
          // TODO: add unexpected content type view
          return this.contentTypeViews[id];
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

    Framework.addRegions({
        HeaderRegion: '#content-header',
        LeftRegion: '#content-left',
        RightRegion: '#content-right',
        BottomRegion: '#content-bottom'
    });

    Framework.on("initialize:after", function(){
        if (Backbone.history){ Backbone.history.start(); }
    });

    return Framework;
});