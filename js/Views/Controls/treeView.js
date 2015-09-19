define(['marionette', 'dynatree'],
    function (Marionette, dt) {
        var ItemView = Backbone.Marionette.ItemView.extend({
            //<li class=""><span class="dynatree-node dynatree-folder dynatree-has-children dynatree-lazy dynatree-exp-cd dynatree-ico-cf">
            // <span class="dynatree-expander"></span>
            // <span class="dynatree-icon"></span>
            // <a href="#" class="dynatree-title">diagrams</a>
            // </span></li>
            tagName:'li',
            template: _.template('<span class="dynatree-node <%=type%> <%=icon%>">' +
                '<span id="<%=cid%>-expander" class="dynatree-<%=navtype%>"></span>' +
                '<span class="dynatree-icon"></span>' +
                '<a id="<%=cid%>-title" href="#" class="dynatree-title"><%= title %></a>' +
                '</span>' +
                '<ul id="<%=cid%>"></ul>'
            ),
            serializeData: function(){
                var data = this.model.getDynatreeData();
              return data;
            },
            templateHelpers: function() {
                // TODO: it is github specific
                //       use getDynatreeData() on serialize and handle them inside getTemplate method
                //       template: function(data) { if data.isFolder ... additional arguments for template
                var isFolder = this.model.get("type") == "tree";
                var result =  {cid: this.model.cid,};
                if (isFolder) {
                    result["type"] = "dynatree-folder";
                    result["icon"] = "dynatree-has-children dynatree-lazy dynatree-exp-cd dynatree-ico-cf";
                    result["navtype"] = "expander";
                }
                else {
                    result["type"] = "";
                    result["navtype"] = "connector";
                    result["icon"] = "dynatree-exp-c dynatree-ico-c";
                }
                return result;
            },
            ui: {
                expander : ".dynatree-expander"
            },
            events: function() {
                var result = {};
                result['click #' + this.options.model.cid + '-expander'] =  'onExpand';
                result['click #' + this.options.model.cid + '-title'] =  'onActivate';
                return result;
            },
            initialize: function () {
                var that = this;
                this.model.on("change:status", function(model, status) {
                    var $span = that.$el.children("SPAN");
                    if (status == "loading") {
                        $span.removeClass("dynatree-lazy dynatree-exp-cd").addClass("dynatree-loading dynatree-exp-ed");
                        return;
                    }
                    if (status == "loaded") {
                        $span.removeClass("dynatree-loading dynatree-exp-ed").addClass("dynatree-load dynatree-exp-e");
                        // trigger to expand items
                        that.onExpand();
                        return;
                    }

                    //$(node.span).removeClass("dynatree-ico-conflict dynatree-ico-new dynatree-ico-updated dynatree-ico-removed").addClass("dynatree-ico-" + status);
                });
            },
            onExpand: function() {
                var $span = this.$el.children("SPAN");
                if ($span.hasClass("dynatree-lazy")) {
                    this.trigger("on:lazyload", function(view, result) {
                        // expect status change on success
                    });
                    return;
                }

                if ($span.hasClass("dynatree-expanded")) {
                    this.$el.children("UL").css({display:"none"});
                    $span.removeClass("dynatree-expanded dynatree-exp-e dynatree-ico-ef").addClass("dynatree-exp-c dynatree-ico-cf");
                }
                else {
                    this.$el.children("UL").css({display:""});
                    $span.addClass("dynatree-expanded dynatree-exp-e dynatree-ico-ef").removeClass("dynatree-exp-c dynatree-ico-cf");
                }
            },
            onActivate: function() {
                var $span = this.$el.children("SPAN");
                $(document).find(".dynatree-focus").removeClass("dynatree-focus");
                $(document).find(".dynatree-active").removeClass("dynatree-active");
                $span.addClass("dynatree-focus dynatree-active");
                if ($span.hasClass("dynatree-folder")) {
                    this.onExpand();
                    return;
                }
                this.trigger("on:activate");
                this.trigger("file:focus");
            }
        });
        var TreeView = Backbone.Marionette.CollectionView.extend({
            childView : ItemView,
            tagName:'ul',
            className: 'dynatree-container',
            initialize: function () {
                this.$el.attr('id', 'us-tree');
                //this.collection.on('sync', this.render, this);
                this.collection.on('reset', this.onReset, this);

                var that = this;
                /*
                this.$el.dynatree({
                    persist: false,
                    children: [],

                    onCreate: function (node, span) {
                        // trigger context menu show
                    },
                    onLazyRead: function (node) {
                        if (node.data.isFolder) {
                            that.collection.lazyLoad(node.data);
                        }
                    },
                    onFocus: function (node) {
                    },
                    onActivate: function (node) {
                        // Nothing to load for folder
                        if (node.data.isFolder) {
                            return;
                        }
                        var clone = $.extend({}, node.data, {absPath:node.getAbsolutePath()});
                        // trigger file in focus event
                        that.trigger("file:focus", clone);
                    }
                });*/

            },
            onChildviewFileFocus:function(view) {
                this.trigger("file:focus", view.model);
            },
            resize: function(event, width, height) {
                this.$el.parent().width(width).height(height-20);
                this.$el.width(width).height(height-20);
                return {height: this.$el.height(), width: this.$el.width()}
            },
            onReset: function() {
              //this.$el.dynatree("getTree").reload();
            },
            _insertBefore:function(view, index) {
                if (view.isRendered) {
                    return true;
                }
                view.isRendered = true;
                var parentCid = view.model.get("parentCid");
                if (parentCid) {
                    $("ul#"+parentCid).append(view.el);
                    return true;
                }
                return false;
            }
        });

        var Controller = Marionette.Controller.extend({
            initialize: function (options) {
                var that = this;
                this.tree = options.tree;
                this.treeView = new TreeView({collection: this.tree});
                this.treeView.on("childview:on:lazyload", _.bind(this.onLazyLoad, this));

                this.treeView.on("childview:on:focus", function(view, callback) {
                    that.trigger("focus", view, callback);
                });

                this.treeView.on("childview:on:activate", function(view, callback) {
                    that.trigger("activate", view, callback);
                });
            },
            //
            // Uses for dual purpose:
            //    on trigger event - view.model
            //    on load path     - model only available
            //
            onLazyLoad : function(view, callback, flag) {
                var model = (flag ? view:view.model);

                model.set({status:"loading"});
                this.trigger("lazyload", model, function(model, success) {
                    model.set({status:"loaded"});
                    callback(model, success);
                });
            },
            getView: function() {
                return this.treeView;
            },
            isPathLoaded: function(path) {
                var splittedPath = path.split('/');
                return false;
            },
            getAbsolutePath: function(model) {
                try {
                    return this._getBaseModelPath(model) + "/" + model.getDynatreeData("title");
                }
                catch (e) {
                    alert("Catch exception:" + e);
                }
                return null;

            },
            _getBaseModelPath: function(model) {
                var cid = model.get("parentCid");
                if (cid) {
                    var parent = model.collection.get({cid:cid});
                    if (parent) {
                        return this._getBaseModelPath(parent) + "/" + parent.getDynatreeData("title");
                    }
                    else {
                        throw "Wrong path";
                    }
                }
                return "";
            },
            getSubPaths: function(absPath, callback) {
                var path;
                // Check if path is correct
                try {
                    path = this._sanitizePath(absPath, true);
                } catch (e) {
                    callback({error:true, reason:e});
                    return;
                }

                var dfd = $.Deferred(),
                    that = this;
                var pms = dfd.promise();
                _.each(path, function(ifolder) {
                    pms = pms.then(_.bind(that._loadPathPromise, that, ifolder, "isFolder"));
                });
                var handler = function(update,x ,y) {
                    callback(update, x, y);
                };
                pms
                    .done(function(data) {
                        var root = data.collection.filter(
                            function(model) {
                                return (model.get("parentCid") == data.parentCid);
                            });
                        var folders = new Array(), files = new Array();
                        // cache folders and files
                        _.each(root, function(model) {
                            if (model.getDynatreeData("isFolder")) {
                                folders.push(model.getDynatreeData("title"));
                            }
                            else {
                                files.push(model.getDynatreeData("title"));
                            }
                        });
                        handler({status:"valid", path:absPath, loadedPath: data.loadedPath}, folders, files);
                    })
                    .fail(handler)
                    .progress(handler);

                dfd.resolve({loadedPath:"", path:path, parentCid:undefined, collection:this.tree, callback:callback});
            },

            loadPath: function(absPath, callback) {
                var path;
                // Check if path is correct
                try {
                    path = this._sanitizePath(absPath, true);
                } catch (e) {
                    callback({error:true, reason:e});
                    return;
                }

                var dfd = $.Deferred(),
                    that = this;
                var pms = dfd.promise();
                _.each(path, function(ifolder) {
                    pms = pms.then(_.bind(that._loadPathPromise, that, ifolder, "isLazy"));
                });
                var handler = function(update, x, y) {
                  callback(update, x ,y);
                };
                pms
                    .done(function(args) {
                        handler({status:"ok", path:args.loadedPath});
                    })
                    .fail(handler)
                    .progress(handler);

                dfd.resolve({loadedPath:"", path:path, parentCid:undefined, collection:this.tree, callback:callback});
            },
            //
            // load path helper
            // @param ifolder - current folder to load
            // @param selector - isFolder or isLazy
            // @param data - JSON
            //
            _loadPathPromise: function(ifolder, selector, data) {
                var m = this;
                var dfd2 = $.Deferred();

                var next = data.path.shift();

                if (next == undefined || ifolder != next) {
                    dfd2.reject({status:"error", path:data.loadedPath, reason:"Error: Wrong number of steps to load path"});
                }

                var root = data.collection.filter(
                    function(model) {
                        return (model.get("parentCid") == data.parentCid && model.getDynatreeData("title") == next);
                    });
                // One element for each item
                if (root.length == 1) {
                    root = root[0];
                    data.parentCid = root.cid;
                    data.loadedPath += "/" + next;
                }
                else {
                    dfd2.reject({status:"error", path:data.loadedPath, reason:"Error: found more than one alternative for the path!"});
                }

                var status = root.get("status");
                if (root.getDynatreeData(selector)) {
                    // sub-paths was not loaded yet
                    if (status == undefined) {
                        this.onLazyLoad(root, function(completed) {
                            dfd2.resolve(data);
                        }, true);
                        // onLazyLoad should chnage status
                        status = "loading";
                    }
                    // make it loadable, but how to get load completion event ?
                    if (status == "loading") {
                        dfd2.notify({status:"loading", path:data.loadedPath});
                    }
                    else {
                        dfd2.resolve(data);
                    }
                }
                // it should be the last item in the list
                else {
                    if (path.length != 0) {
                        dfd2.reject({status:"error", path:data.loadedPath, reason:"Error: reached not loadable element: " + data.loadedPath});
                        return;
                    }

                    // else we should exit on the next iteration with success
                    dfd2.resolve(data);
                }


                return dfd2.promise();
            },
            loadPath2: function(absPath, callback) {
                var path;
                try {
                    path = this._sanitizePath(absPath, true);
                }
                catch (e) {
                    callback({error:true, reason:e});
                    return;
                }
                var next = path.shift(),
                    loadedPath = "",
                    parentCid,
                    activeModel;
                while (next != undefined) {
                    loadedPath += "/" + next;
                    var root = this.tree.filter(
                        function(model) {
                           return (model.get("parentCid") == parentCid && model.getDynatreeData("title") == next);
                        });
                    if (root.length == 1) {

                        root = root[0];
                        parentCid = root.cid;

                        var status = root.get("status");
                        if (root.getDynatreeData("isLazy")) {
                            if (status == undefined) {
                                this.onLazyLoad(root, function(completed) {

                                }, true);
                                status = "loading";
                            }
                            if (status == "loading") {
                                callback(status,loadedPath);
                            }
                        }
                        // it should be the last item in the list
                        else {
                            if (path.length != 0) {
                                callback("error", loadedPath, "reached file: " + step);
                                return;
                            }
                            // else we should exit on the next iteration with success
                        }


                        //alert(root.getDynatreeData());
                    }
                    else {
                        throw "UNEXPECTED USE-case: multiple elements for the same path!";
                    }
                    next = path.shift();
                }
                callback("ok", loadedPath);

            },
            getAutoCompletion: function(path, callback) {

            },
            //
            // remove /./ ../ and another use-cases
            //
            _sanitizePath: function(path, splitFlag) {
                var spath = path.split("/"),
                    sspath = new Array();
                for (var i = 0; i< spath.length; ++i) {
                    if (spath[i] == "" || spath[i] == ".") {
                        // skip an empty stpes
                        continue;
                    }
                    if (spath[i] == "..") {
                        if (sspath.length == 0) {
                            throw "Invalid path:"
                        }
                        sspath.pop();
                    }
                    else {
                        sspath.push(spath[i]);
                    }
                }
                if (splitFlag) {
                    return sspath;
                }
                return "/" + sspath.join("/");
            },
            onBeforeDestroy: function() {
                this.treeView.off("childview:on:lazyload");
                this.treeView.off("childview:on:focus");
                this.treeView.off("childview:on:activate");
            }

        });
        return Controller;
    });
