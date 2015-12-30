define([
        'jquery',
        'marionette',
        'Views/framework'
        ],
    function ($, Marionette, Framework) {
        // Content menu item
        // <li id="0" class="diagram-selector" style="cursor:pointer;list-style-image:url('././dm/icons/us/dss/classDiagram.png');"><a>UML class diagram</a></li>
        var contextItemView =    Marionette.ItemView.extend({
            tagName: 'li',
            className: 'diagram-selector',
            template: _.template("<span style=\"cursor:pointer;list-style-image:url('');\"><a><%= title %></a></span>"),
            triggers: {
                'click': "itemclick"
            }
        });

        // Context menu list
        var contextMenu = Marionette.CollectionView.extend({
            tagName: 'ul',
            childView: contextItemView,
            childEvents: {
                "itemclick": function(view, vm) {
                    if (!Framework) Framework = require('Views/framework');
                    if (vm.model.get("command"))
                        Framework.vent.trigger(vm.model.get("command"), this.options.controller.cachedData);
                        $(document).trigger("click");
                    }
                },
                className: 'context-menu',
                    onRender: function() {
                        this.$el.show();
                    }
        });

        // Content select dialog
        var ContextMenuView = Marionette.Controller.extend({
            initialize: function(options) {
                  // List of handlers
                this.subtypes = {};

                // Descrpition of the context menu items
                this.contentTypeList = {};

                // handle all element's context menu calls
                if (options.registry) {
                    options.registry.addContextMenuHandler("diagram", this);
                }

                this.initalizeJSON();
            },
            initalizeJSON: function() {
                // Prevent multiple load of the same data
                if (this.loading) return;

                var that = this;
                this.loading = true;
                $.ajax({
                    url: "./assets/menu/description.json",
                    dataType: 'json',
                    success: function(data) {
                        that.contentTypeList = data;
                        that.loading = false;
                        that._loadCommandHandler("default");
                    },
                    error: function() {
                        alert("Failed to AJAX context menu description!");
                        that.loadfailed = true;
                        that.loading = false;
                    }
                });
            },
            _getDiagramSubType: function(context) {
                if (context.diagram && context.diagram.model) {
                    return context.diagram.model.get("type");
                }
                return null;
            },
            _getElementSubType: function(context) {
                if (context.element && context.element.model) {
                    return context.element.model.get("type");
                }
                return null;
            },
            _loadCommandHandler: function(subtype) {
				var that = this;
                // load handler if it was not load
                if (this.subtypes[subtype] == undefined) {
                    require(['Modules/Diagrammer/Menus/' + subtype], function(handler) {
                        that.subtypes[subtype] = new handler({Framework:require('Views/framework')});
                        $.log("LOADED : " + subtype + " = " + that.subtypes[subtype]);
                    },
                    function() {
						that.subtypes[subtype] = null;
                        $.log("There is no special context menu handler for " + subtype);
                    });
                }
            },
            getDataView: function(data) {
                // Download the content list
                var that = this;
                if (this.loading || this.loadfailed) {
                    return null;
                }

                // get element type from model
                // or select subtype directly for the fieds ctx menu
                var subtype = data.subtype || this._getDiagramSubType(data.context),
                etype = data.subtype || this._getElementSubType(data.context);

                // It should never happen but who knows ?
                if (!subtype || !etype) return null;
                
                // Load handler which could proceed commnad line
                // diagram type specific handlers
                this._loadCommandHandler(subtype);

                // Find list of <title, command> for the element
                // and hope that handler willbe loaded on time
                for (var r=0; r < this.contentTypeList.length; ++r) {
                    if (this.contentTypeList[r].type == etype) {
                        this.cachedData = data;
                        return new contextMenu({collection: new Backbone.Collection(this.contentTypeList[r].fields), controller:this});
                    }
                }
                
                for (var r=0; r < this.contentTypeList.length; ++r) {
                    if (this.contentTypeList[r].type == "default") {
                        this.cachedData = data;
                        return new contextMenu({collection: new Backbone.Collection(this.contentTypeList[r].fields), controller:this});
                    }
                }
                return null;
            }
        });

        return ContextMenuView;
    });
