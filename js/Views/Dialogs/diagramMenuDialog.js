define([
        'jquery',
        'marionette',
        'Modules/Widgets/Accordion/Accordion'
        ],
    function ($, Marionette, Accordion) {
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
				}
			},
            onShow: function() {
				this.$el.draggable({cancel:"#us-diagram-menu-accordion"});
				this.getRegion('accordion').show(this.accordion);
				var that = this;

                this.accordion.on("add:child", function() {
					  that.trigger("add:accordion", "somthing");
				});
			},
			initialize: function() {
				this.accordion = new Accordion({collection: new Backbone.Collection()});
			}
        });

        return CommitView;
    });
