define(['marionette', 'hotkeys'], function(Marionette, HotKeys2) {

window.Behaviors.HotKeysBehavior = Marionette.Behavior.extend({
    onRender: function() {
	  if (this.view.keyEvents)
        HotKeys.bind(this.view.keyEvents, this.view, this.view.cid);
    },

    onClose: function() {
	  if (this.view.keyEvents)
        HotKeys.unbind(this.view.keyEvents, this.view, this.view.cid);
    }
});

  return window.Behaviors.HotKeysBehavior;
});