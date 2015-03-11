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
			addAccordionItem: function() {
				// Extend an accordion structure with a new item
				var model = {type: "class", title: "Class"};

				if (this.count == 0) {
   				  // Extend an accordion structure with a new item
				  var model = {type: "package", title: "Package"};
                  this.count++;
				}
				else if (this.count == 1) {
   				  // Extend an accordion structure with a new item
				  var model = {type: "component", title: "Component"};
                  this.count++;
				}
				else if (this.count == 2) {
   				  // Extend an accordion structure with a new item
				  var model = {type: "sequence", title: "Sequence"};
                  this.count++;
				}
				else {
					this.count = 0;
				}

				var that = this;
				
				$.ajax({url: "./assets/menu/ds/"+model.type+"_with_menu.json", dataType: "json", success:function(data) {
					that.accordion.addMenu(model, data[0]);
				}
				});
			},
            onShow: function() {
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
