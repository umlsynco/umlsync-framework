// Save dialog

define(['marionette', 'jquery-ui', 'Behaviors/HotKeysBehavior'],
    function(Marionette, jui, HotKeysBehavior) {
        var contentCloseDialog = Backbone.Marionette.ItemView.extend({
		    modal: true,
		    getTemplate: function() {
			  return "#umlsync-confirmation-dialog-template";
			},
			ui : {
			  buttons: "button.ui-button"
			},
			events : {
			  "mouseenter @ui.buttons": 'mouseHover1',
			  "mouseexit @ui.buttons": 'mouseHover2'
			},
			triggers: {
			  'click @ui.buttons': 'button:click',
			  'click .ui-icon-closethick': 'button:click',
			},
			keyEvents : {
			  'return': 'onReturnPressed',
			  'esc': 'onEscPressed'
			},
			
			behaviors: {
			  HotKeysBehavior: {}
			},
			
			onReturnPressed: function() {
			  this.trigger("destroy");
			},
			onEscPressed: function() {
			  this.trigger("destroy");
			},
			
			onButtonClick: function(e) {
			  this.trigger("destroy");
			},
			onRender: function() {
				this.$el.draggable().css({visibility:'visible'});
				if (this.modal) {
				  $("DIV.ui-widget-overlay").show();
				}
			},
			onDestroy: function() {
				if (this.modal) {
				  $("DIV.ui-widget-overlay").hide();
				}
			},
			mouseHover1: function(e) {
			    // Prevent multiple select behavior
			    this.ui.buttons.removeClass('ui-state-hover');
				$(e.currentTarget).addClass('ui-state-hover');
			},
			mouseHover2: function(e) {
				$(e.currentTarget).removeClass('ui-state-hover');
			}
        });
        return contentCloseDialog;
    });
