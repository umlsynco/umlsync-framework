define(['backbone', 'marionette', 'jquery-ui', 'Views/framework'], function (Backbone, Marionette, ui, Framework) {

    var ListSortableBehavior = Marionette.Behavior.extend({
		onModeChange: function(mode) {
                if (mode) {
                  this.$el.sortable().enableSelection();
                }
                else {
                  this.$el.sortable().disableSelection();
                }
	    },
        onRender: function () {
            var model = this.view.model;
            //var operationManager = model.getOperationManager();
            var view = this.view;
var startIndex = -1;

            // [TODO]: drop it !!!
            if (view.wasInitialized) {
				alert("DOUBLE CALL OF THE BEHAVIOR HANDLER !!!");
			}
			else {
				view.wasInitialized = true;
			}

            this.$el.sortable({
                        connectedWith:  "DIV.us-class-operations",
			start: function(event, ui) {
                           startIndex = $(ui.item).index();

			},
			stop: function(event, ui) {
                           var dropIndex = $(ui.item).index();
                           if (startIndex != dropIndex) {
                             var models = view.collection.models.splice(startIndex, 1);
                             view.collection.models.splice(dropIndex, 0, models[0]);
                           }
			}
                });

            var that = this;
            view.collection.on("add", function() {
				that.$el.sortable("refresh");
			});
        }
    });

    window.Behaviors = window.Behaviors || {};
    window.Behaviors.ListSortableBehavior = ListSortableBehavior;
    return ListSortableBehavior;
});
