define(['marionette', 'Views/Dialogs/snippetsDialog'],
    function(Marionette, SnippetsDialog) {
        var Controller = Marionette.Controller.extend({
            initialize: function (options) {
                this.snippetsRegion = options.region;
                this.handlers = {};
            },
            request:function(data) {
                // TODO: 1. Check if some snippet was opened before
                //       2. Close/save dialog for an existing snippet
                //       3. trigger snippet load
                //
                //       new SnippetsContentController();
                //       or this.snippetsController.handleSnippet(data);
                var data2 = [
                    {path:"/a//vwwwwwwwwww11111111/v/v/v/v", comment: "Do something"},
                    {path:"/asdfsdfsddsfv/v", comment: "Do something"},
                    {path:"/a/sddddd222222222222/v/v", comment: "Do something"},
                    {path:"/a//v/4444444444444v/v/v/v", comment: "Do something"}
                ];
                this.dialog = new SnippetsDialog({collection: new Backbone.Collection(data2)});
                this.snippetsRegion.show(this.dialog);
var that = this;
                this.dialog.on("on:navigate", function(dialog) {
                    that.snippetsRegion.show();
                });
            }
        });
        return Controller;
    }
);// define
