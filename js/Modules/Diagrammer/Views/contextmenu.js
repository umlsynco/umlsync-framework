define([
        'jquery',
        'marionette',
        'Views/framework'
        ],
    function ($, Marionette, Framework) {
		// Content menu item
		// <li id="0" class="diagram-selector" style="cursor:pointer;list-style-image:url('././dm/icons/us/dss/classDiagram.png');"><a>UML class diagram</a></li>
		var contentView =    Marionette.ItemView.extend({
	        tagName: 'li',
	        className: 'diagram-selector',
	        template: _.template("<span style=\"cursor:pointer;list-style-image:url('<%= icon %>');\"><a><%= title %></a>"),
	        events: {
				'click': function() {
					// Change an active element !!!
					this.model.set("isActive", true);
				}
			},
			modelEvents: {
				'change:isActive': 'toggleSelectedClass'
			},
			toggleSelectedClass: function (isActive) {
				if (this.model.get("isActive")) {
					this.$el.addClass("selected");
				}
				else {
					this.$el.removeClass("selected");
				}
			},
			initialize: function() {
		    }
        });
        // Context menu list
        var contextMenu = Marionette.CollectionView.extend({
					             tagName: 'ul',
                                 childView: contentView,
                                 onRender: function() {
									 // TODO: drop it!!!
									 this.$el.attr("id", "diagram-menu");
								 },
   							     initialize: function() {
									 this.collection.on(
									   "change:isActive",
									   function(model) {
										   // Prevent loop
										   if (!model.get("isActive")) return;

								           var activeItems = this.where({isActive:true});
  								           for (var i in activeItems) {
											if (activeItems[i] != model)
   									          activeItems[i].set({isActive:false});
								           }
							          });
							     }
                          });

        // Content select dialog
        var ContextMenuView = Marionette.LayoutView.extend({
            template: _.template(""),
			regions: {
				ContentList : "#selectable-list"
			},
			initialize: function(options) {
				// Prevent multiple render
				this.isSingletone = true;
				// Initialize an empty context menu
				this.contentTypeList = new contextMenu({collection: new Backbone.Collection()});
				// handle all element's context menu calls
				if (options.registryregistry) {
				    options.registry.addContextMenuHandler("diagram", this);
				}
            },
            getDataView: function(data) {
				// Download the content list
				var that = this;
alert("PATH TO THE CONTEXT MENU QQQQQ");
				$.ajax({
					url: "./assets/menu/description.json",
					dataType: 'json',
					success: function(data) {
						that.contentTypeList.collection.add(data);
					},
					error: function() {
						alert("TODO: HANDLE the CONTExt MENUS LIST DOWNLOAD FAILED !!!");
					}
				});
			},
            onShow: function() {
              $(this.$el).parent().css('visibility', 'visible');
			},
			onRender: function() {
			  if (this.ContentList)
			      this.ContentList.show(this.contentTypeList);
			}
        });

        return ContextMenuView;
    });
