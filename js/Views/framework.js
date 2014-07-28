define(['marionette'], function(Marionette) {
    var Framework = new Marionette.Application({
        contentTypeViews: {},
        addContentTypeView : function (id, view) {
          this.contentTypeViews[id] = view;
        },
        getContentTypeView : function (id) {
          // TODO: add unexpected content type view
          return this.contentTypeViews[id];
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

    Framework.RightRegion.on("before:show", function(view){
        alert("Show region again" + view);
    });
    return Framework;
});