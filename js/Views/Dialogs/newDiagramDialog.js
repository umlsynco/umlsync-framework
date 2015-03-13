define([
        'jquery',
        'marionette'
        ],
    function ($, Marionette) {
		// Content menu item
		// <li id="0" class="diagram-selector" style="cursor:pointer;list-style-image:url('././dm/icons/us/dss/classDiagram.png');"><a>UML class diagram</a></li>
		var contentView =    Marionette.ItemView.extend({
	        tagName: 'li',
	        className: 'diagram-selector',
	        template: _.template("<span style=\"cursor:pointer;list-style-image:url('<%= icon %>');\"><a><%= title %></a>"),
	        trigger: {
				'click': function() {
					// Change an active element !!!
					this.model.set("isActive", true);
				}
			},
			modelEvents: {
				'change:isActive': 'toggleSelectedClass'
			},
			toggleSelectedClass: function (isActive) {
				if (isActive) {
					this.$el.addClass("selected");
				}
				else {
					this.$el.removeClass("selected");
				}
			}
        });
        // Content menu list
        var contentMenu = Marionette.CollectionView.extend({
					             tagName: 'ul',
                                 childView: contentView,
                                 onRender: function() {
									 // TODO: drop it!!!
									 this.$el.attr("id", "diagram-menu");
								 }
                                 });

        // Content select dialog
        var DialogView = Marionette.LayoutView.extend({
            template: "#umlsync-new-diagram-dialog-template",
            modal:true,
            ui: {
                buttons: "button.ui-button",
                closeButton: "span.ui-icon-closethick",
            },
            events: {
				'click @ui.closeButton' : 'onCancel',
				'click @ui.buttons' : 'onButtonClick'
			},
			initialize: function() {
				//var collection = this.collection;
				//this.collection.on("change:isActive", function(model) {
                //   // collection.each(
				//});
			},
			onButtonClick: function(button) {
				// handle dialog completion
				this.trigger("dialog:done");
				// Detach dialog widget to do not create it again
				
			},
			onCancel: function() {
				// Trigger cancel event
				this.trigger("dialog:cancel");
		    },
		    onInputChange: function() {
				// Validate path
				alert("input changed !!!");
			},
			onTypeChange: function() {
				// Check switch between types
				alert("ON type changed !!!");
			},
			onContentTypeSelected: function(model) {
				// switch the content model type
				// 1. Diagram type
				// 2. Markdown
				// 3. Snippet bubbles
			},
            onShow: function() {
              $(this.$el).draggable().resizable();
              $(this.$el).parent().css('visibility', 'visible');
			},
			initialize: function() {
				this.isSingletone = true;
			}
        });

        return DialogView;
    });
