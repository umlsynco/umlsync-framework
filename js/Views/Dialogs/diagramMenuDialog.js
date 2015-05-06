define([
        'jquery',
        'marionette',
        'Modules/Widgets/Accordion/Accordion',
        'Modules/Widgets/IconMenu'
        ],
    function ($, Marionette, Accordion, IconMenu) {
		var Framework;
        var CommitView = Marionette.LayoutView.extend({
            template: "#us-diagram-menu-template",
            modal:false,
            regions: {
                accordion: '#us-diagram-menu-accordion'
            },
            ui: {
                buttons: "button.ui-button",
                closeButton: "span.ui-icon-closethick",
            },
// Multiple events for the diagram menu changing !!!
//            events: {
//				"click @ui.closeButton" : "addAccordionItem"
//			},
			addAccordionItem: function(modelBB) {
				// Extend an accordion structure with a new item
				var that = this;
				var model = {type: modelBB.get("id"), title: modelBB.get("title")};

                if (!this.accordion.hasMenu(model)) {
					$.ajax({
						url: "./assets/menu/ds/"+model.type+"_with_menu.json",
						dataType: "json",
						success:function(data) {
						   // TODO: Prototyped for the multiple descriptions
						   // download, but uses sinlgle description for a while
						   that.accordion.addMenu(model, data[0]);
						   that.extendIconMenus(data[0].menus);
						}
					});
				}
			},
			// Is icon menu is some kind of the context menu ???
			extendIconMenus: function(menus) {
				var that = this;
				_.each(menus, function(menuItem){
					that.menus.push(menuItem);
				})
				
			},
            onShow: function() {
				this.$el.draggable({cancel:"#us-diagram-menu-accordion"});
				this.getRegion('accordion').show(this.accordion);
				var that = this;

                this.accordion.on("add:child", function() {
					  that.trigger("add:accordion", "somthing");
				});
			},
			showIconMenu: function(data) {
				// Hide menu
				if (!data) {
					if (Framework.IconMenuRegion.$el)
					  Framework.IconMenuRegion.isActive = false;
					  Framework.IconMenuRegion.$el.hide();
					return;
				}
				
				// Cache an icon menu data
				this.IconMenuData = data;
				
				if (data.model) {
					var lookingFor = data.model.get("type") + "-menu";
					if (this.activeIconMenu == lookingFor) {
						Framework.IconMenuRegion.isActive = true;
					    var pos = data.$el.position()
						Framework.IconMenuRegion.$el.css({top:pos.top + 20, left:pos.left +25, opacity:"1"});
						Framework.IconMenuRegion.$el.show();
						return;
					}

					Framework.IconMenuRegion.reset();

					for (var r=0; r< this.menus.length; ++r) {
						var currentItem = this.menus[r];
						if (currentItem.id == lookingFor) {
							var icons = currentItem.items[0];
							var iconMenuView = new IconMenu({collection: new Backbone.Collection(icons.cs), diagramMenu:this});
							Framework.IconMenuRegion.show(iconMenuView);
							// Change the position on the element !!!
							var pos = data.$el.position()
							Framework.IconMenuRegion.$el.css({top:pos.top + 20, left:pos.left +25, opacity:"1"});
							Framework.IconMenuRegion.$el.show();
							
							this.activeIconMenu = lookingFor;
							Framework.IconMenuRegion.isActive = true;

							// There is no multiple views for the current menu, so we can return
							return;
						}
					}
				}
			},
			initialize: function(options) {
				this.accordion = new Accordion({collection: new Backbone.Collection(), Framework:options.Framework});
				Framework = options.Framework;
				this.menus = new Array();
				Framework.vent.on("diagram:iconmenu:show", _.bind(this.showIconMenu, this));
			}
        });

        return CommitView;
    });
