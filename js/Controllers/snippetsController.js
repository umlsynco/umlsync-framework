define(['marionette', 'Views/Dialogs/snippetsDialog', 'Views/Files/snippetBubbleView'],
    function(Marionette, SnippetsDialog, SnippetBubbleView) {
        var Framework;
        var Controller = Marionette.Controller.extend({
            initialize: function (options) {
                this.snippetsRegion = options.region;
                this.handlers = {};
                // Enable/Disable snippets mode for tabs
                this.contentController = options.contentController;
                Framework = options.Framework;
                Framework.vent.on("content:snippets:showBubble", _.bind(this.showBubble, this));
            },
            status: false,
            showBubble: function(coordinates, model) {
                if (!this.status) return;
                //var model = new Backbone.Model(modelData);
                this.openedSnippetCollection.add(model);

                if (this.snippetBubble) {
                    this.snippetBubble.destroy();
                }
                // instantiate a new snippet bubble
                this.snippetBubble = new SnippetBubbleView({model:model});
                this.snippetBubble.render();

                this.snippetBubble.$el.appendTo(coordinates.selector);
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
                this.openedSnippetCollection = new Backbone.Collection(data2);

                this.dialog = new SnippetsDialog({collection: this.openedSnippetCollection, contentController: this.contentController});

                this.snippetsRegion.show(this.dialog);

                this.contentController.setSnippetsMode(true);
                this.status = true;

                var that = this;
                this.dialog.on("on:navigate", function(dialog) {
                    that.snippetsRegion.show();
                    that.contentController.setSnippetsMode(false);
                    that.status = false;
                });
            }
        });
        return Controller;
    }
);// define
