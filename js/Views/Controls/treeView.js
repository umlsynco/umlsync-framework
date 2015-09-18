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
                this.model.on("change:status", function(model, status) {
                    alert("HAndle status change")
                    //$(node.span).removeClass("dynatree-ico-conflict dynatree-ico-new dynatree-ico-updated dynatree-ico-removed").addClass("dynatree-ico-" + status);
                });
            },
            onExpand: function() {
                var $span = this.$el.children("SPAN");
                if ($span.hasClass("dynatree-lazy")) {
                    $span.removeClass("dynatree-lazy dynatree-exp-cd").addClass("dynatree-loading dynatree-exp-ed");

                    this.trigger("on:lazyload", function(view, success) {
                        if (success) {
                            $span.removeClass("dynatree-loading dynatree-exp-ed").addClass("dynatree-exp-e");
                        }
                    });
//                    this.loading = true;
//                    return;
                }

//                if (this.loading) {
//                    $span.addClass("dynatree-lazy dynatree-exp-cd").removeClass("dynatree-expanded dynatree-loading dynatree-exp-ed");
//                    return;
//                }

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
                this.treeView.on("childview:on:lazyload", function(view, callback) {
                    that.trigger("lazyload", view, callback);
                });

                this.treeView.on("childview:on:focus", function(view, callback) {
                    that.trigger("focus", view, callback);
                });

                this.treeView.on("childview:on:activate", function(view, callback) {
                    that.trigger("activate", view, callback);
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

            },
            loadPath: function(absPath, callback) {

            },
            getAutoCompletion: function(path, callback) {

            },
            onBeforeDestroy: function() {
            }

        });
        return Controller;
    });
