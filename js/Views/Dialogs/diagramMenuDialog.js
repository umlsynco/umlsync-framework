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
//            events: {
//				"click @ui.closeButton" : "addAccordionItem"
//			},
			addAccordionItem: function(modelBB) {
				// Extend an accordion structure with a new item
				var that = this;
				var model = {type: modelBB.get("type"), title: modelBB.get("title")};
				alert("ADD " + model.type + "  " + model.title);
				$.ajax({
					url: "./assets/menu/ds/"+model.type+"_with_menu.json",
					dataType: "json",
					success:function(data) {
					   that.accordion.addMenu(model, data[0]);
				    }
				});
			},
            onShow: function() {
				this.$el.draggable({cancel:"#us-diagram-menu-accordion"});
				//if (this.accordion) return;
				this.accordion = new Accordion({collection: new Backbone.Collection()});
				this.getRegion('accordion').show(this.accordion);
				var that = this;

                this.accordion.on("add:child", function() {
					  that.trigger("add:accordion", "somthing");
				});
			}
        });

        return CommitView;
    });
