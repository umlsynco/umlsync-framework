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
					},
					error: function() {
						alert("Context menu desctiption dowload failed !!!");
						that.loadfailed = true;
						that.loading = false;
					}
				});
			},
            getDataView: function(data) {
				// Download the content list
				var that = this;
				if (this.loading || this.loadfailed) {
					return;
				}

				// get element type from model
				// or select subtype directly for the fieds ctx menu
				var subtype = data.subtype;
				if (!subtype && data.context && data.context.view && data.context.view.model) {
					subtype = data.context.view.model.get("type");
			    } 
                // can not detect the subtype of the element !!!
			    if (!subtype) return;
			    
			    // load handler if it was not load
			    if (!this.subtypes[subtype]) {
					require(['Modules/Diagrammer/Menus/' + subtype], function(handler) {
						that.subtypes[subtype] = new handler({Framework:require('Views/framework')});
					});
				}

				for (var r=0; r < this.contentTypeList.length; ++r) {
					if (this.contentTypeList[r].type == subtype) {
						this.cachedData = data;
						return new contextMenu({collection: new Backbone.Collection(this.contentTypeList[r].fields), controller:this});
					}
				}
				return;
			}
        });

        return ContextMenuView;
    });
