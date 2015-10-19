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
						}
					});
					$.ajax({
						url: "./assets/menu/icon_menus.json",
						dataType: "json",
						success:function(data) {
						  that.extendIconMenus(data);
						}
					});
				}
			},
            iconMenuInitialized: false,
			// Is icon menu is some kind of the context menu ???
			extendIconMenus: function(menus) {
				var that = this;
                if (this.iconMenuInitialized)
                    return;
                this.iconMenuInitialized = true;
				_.each(menus, function(menuItem, ii){
					_.each(menuItem.items, function(item, ci) {
						_.each(item.connectors, function(con) {
                            con.menuId = ii;
                            con.itemId = ci;
						});
					});
					that.menus.push(menuItem);
				});
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
					if (Framework.IconMenuRegion.$el == undefined) {
						alert("SMTHING WRONG 2");
						return;
					}
					  Framework.IconMenuRegion.$el.hide();
					return;
				}
				
				// Cache an icon menu data
				this.IconMenuData = data;
				
				if (data.model) {
					var lookingFor = "us-"+data.model.get("type") + "-menu",
					lookingFor2 = "us-class-"+data.model.get("type") + "-menu";
					if (this.activeIconMenu == lookingFor) {
						Framework.IconMenuRegion.isActive = true;
					    var pos = data.$el.position();
if (Framework.IconMenuRegion.$el == undefined) {
	alert("SMTHING WRONG");
	return;
}
						Framework.IconMenuRegion.$el.css({top:pos.top + 20, left:pos.left +25, opacity:"1"});
						Framework.IconMenuRegion.$el.show();
						return;
					}

					var found = false;
					var icons = new Backbone.Collection();

					// looking for us-%diagram%-%element%-menu
					// and us-%element%-menu
					for (var r=0; r< this.menus.length; ++r) {
						var currentItem = this.menus[r];
						if (currentItem.id == lookingFor || currentItem.id == lookingFor2) {
							_.each(currentItem.items, function(menuItem){
								_.each(menuItem, function(connector) {
									icons.add(connector);
									found = true;
								});
							});
						}
					}

					// There are some elements without menu
					if (found) {
						Framework.IconMenuRegion.reset();
						var iconMenuView = new IconMenu({
							collection: icons,
							diagramMenu: this,
							description: this.menus
						});
						Framework.IconMenuRegion.show(iconMenuView);
						// Change the position on the element !!!
						var pos = data.$el.position()
						Framework.IconMenuRegion.$el.css({
							top: pos.top + 20,
							left: pos.left + 25,
							opacity: "1"
						});
						Framework.IconMenuRegion.$el.show();

						this.activeIconMenu = lookingFor;
						Framework.IconMenuRegion.isActive = true;
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
