define(['marionette',
        'Views/framework'
    ],
    function(Marionette, Framework) {
        var Controller = Marionette.Controller.extend({
            initialize: function (options) {
                var that = this;
                this.tree = options.tree;
                // Listeners of content manager
                Framework.vent.on("content:search:path", function (data) {
                });
                
                Framework.vent.trigger('content:new:dialog', this);
            },
            getPathStatus: function(path) {
                return "valid";
                var splittedPath = path.split('/');
                // Check if it is root ?
                if ((splittedPath.length <= 1) || (path[0] == '/' && splittedPath.length == 1)) {
                    return "valid";
                }
                var status = this.tree.isPathLoaded(path.substr(0, path.lastIndexOf("/")-1));

            },
            getPathAutocompletion: function(absPath) {
                return [absPath + "xxx", absPath + "uuuu"];
            },
            onBeforeDestroy: function() {
                Framework.vent.off("content:search:path");
            }

        });
        return Controller;
    }
);
