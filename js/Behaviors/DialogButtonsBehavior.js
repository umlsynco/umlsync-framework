define(['marionette', 'hotkeys'], function(Marionette, HotKeys2) {

window.Behaviors.DialogButtonsBehavior = Marionette.Behavior.extend({
    keyEvents : {
      'return': 'onReturnPressed',
      'esc': 'onEscPressed'
    },
    
    onReturnPressed: function() {
	  // Check which is in focus and trigger corresponding event
      this.trigger("button:enter");
    },
    onEscPressed: function() {
      this.trigger("button:cancel");
    },

    onRender: function() {
	  if (this.view.keyEvents)
        HotKeys.bind(this.view.keyEvents, this.view, this.view.cid);

	  // Bind on enter and esc
	  HotKeys.bind(this.keyEvents, this, this.view.cid);
	  
	  // Handle buttons
	  
    },

    onClose: function() {
	  if (this.view.keyEvents)
        HotKeys.unbind(this.view.keyEvents, this.view, this.view.cid);
      // Un-bind from enter and esc
	  HotKeys.unbind(this.keyEvents, this, this.view.cid);

	}
});

  return window.Behaviors.DialogButtonsBehavior;
});