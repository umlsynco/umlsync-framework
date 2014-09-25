define(['marionette',
        'Views/framework'
    ],
    function(Marionette, Framework) {
        var Controller = Marionette.Controller.extend({
            initialize: function (options) {
                this.close = options.close || false; // disable close by default
                this.done = options.done;
                this.cancel = options.cancel;
                this.GithubController = options.controller;

                var that = this;
                // Listeners of content manager
                Framework.vent.on("content:syncall:cancel", function (data) {
                    if (that.cancel) { that.cancel(data); }
                });
                Framework.vent.on("content:syncall:complete", function (data) {
                    if (that.done) { that.done(data); }
                });

                Framework.vent.trigger('content:syncall', this.GithubController.getViewInfo({close:this.close}));

            }
        });
        return Controller;
    }
);
