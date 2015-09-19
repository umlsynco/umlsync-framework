define(['marionette',
        'Views/framework'
    ],
    function(Marionette, Framework) {
        var Controller = Marionette.Controller.extend({
            initialize: function (options) {
                var that = this;
                this.tree = options.tree;
                this.treeController = options.treeController;
                // Listeners of content manager
                Framework.vent.on("content:search:path", function (data) {
                });
                
                Framework.vent.trigger('content:new:dialog', this);
            },
            //
            // @param path - path to load
            // @param callback - callback method arguments:
            //     @param data {
            //         "path": "%path which is loading%",
            //         "status" : "error|ok|invalid|loading",
            //         "loadedPath" : "path which is corresponding to status report",
            //         "reason" : "The cause of error"
            //      }
            //     @param subpaths - subpaths in case of status == "ok"
            //
            getPathStatus: function(path, callback) {
                var status = this.treeController.getSubPaths(path.substr(0, path.lastIndexOf("/")), function(data, x ,y) {
                    data.path = path;
                    callback(data, x, y);
                });
            },
            onBeforeDestroy: function() {
                Framework.vent.off("content:search:path");
            }

        });
        return Controller;
    }
);
