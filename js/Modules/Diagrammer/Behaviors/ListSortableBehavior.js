define(['backbone', 'marionette', 'jquery-ui', 'Views/framework'], function (Backbone, Marionette, ui, Framework) {

    var ListSortableBehavior = Marionette.Behavior.extend({
        onRender: function () {
            var model = this.view.model;
            //var operationManager = model.getOperationManager();
            var view = this.view;

            // [TODO]: drop it !!!
            if (view.wasInitialized) {
				alert("DOUBLE CALL OF THE BEHAVIOR HANDLER !!!");
			}
			else {
				view.wasInitialized = true;
			}

            this.$el
                .sortable({
					start: function() {
					},
					stop: function() {
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
