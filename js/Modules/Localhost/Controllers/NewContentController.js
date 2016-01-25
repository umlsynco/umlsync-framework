define(['marionette',
        'Views/framework'
    ],
    function(Marionette, Framework) {
        var Controller = Marionette.Controller.extend({
            initialize: function (options) {
                var that = this;
                this.tree = options.tree;
                this.treeController = options.treeController;
                this.contentCache = options.cache;
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
                    data["path"] = path;
                    callback(data, x, y);
                });
            },
            createContent: function(path, description, autocompleteState, callback) {
                // 3. Create model for treeCollection
                var absPath = autocompleteState.loadedPath + "/" + path.split("/").pop();
                var treeModel = {
                    path:path.split("/").pop(),
                    absPath: absPath,
                    status: "new",
                    type: "blob",
                    parentCid: autocompleteState.parentCid
                };
                // 4. Extend tree with path
               var modelObj =  this.tree.getModelHelper(treeModel);

                // 1. Create the model for the cache
                var model = {
                    status: "new",
                    absPath: absPath,
                    title: path.split("/").pop(),
                    content: description.content,
                    contentType: 'diagram',
                    key: modelObj.cid
                };
                // 2. Append to the cache
                this.contentCache.add(model);

                // 5. Trigger on activate for the new element
                this.treeController.trigger("activate", {model:modelObj});

                // 6. callback
                callback();
            },
            onBeforeDestroy: function() {
                Framework.vent.off("content:search:path");
            }

        });
        return Controller;
    }
);
