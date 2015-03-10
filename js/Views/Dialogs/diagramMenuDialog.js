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
            events: {
				"click @ui.closeButton" : "addAccordionItem"
			},
			addAccordionItem: function(model) {
				// Extend an accordion structure with a new item
				model = "XXXX";
//				if (typeof(model) === "String") {

				  this.accordion.collection.add({title:model});
//			    }
//			    else {
//				  this.accordion.collection.add(model);
//				}
			},
            onShow: function() {
				//if (this.accordion) return;
				this.accordion = new Accordion({collection: new Backbone.Collection()});
				this.accordion.collection.add({title:"gggg"});
				this.accordion.collection.add({title:"hhhh"});
				this.getRegion('accordion').show(this.accordion);
				var that = this;
                this.accordion.on("add:child", function() {
					  that.trigger("add:accordion", "somthing");
					  alert("added item !!!");
					  
				});
			}
        });

        return CommitView;
    });
