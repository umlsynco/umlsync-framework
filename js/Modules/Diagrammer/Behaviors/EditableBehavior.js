define(['backbone', 'marionette', 'jquery-ui', 'Views/framework'], function (Backbone, Marionette, ui, Framework) {

    var EditableBehavior = Marionette.Behavior.extend({
// TODO: Add textarea, input or custom
//        defaults: {
//           "component": "input"
//        },
        events: {
            "click @ui.editablefield": "editField"
        },
        editField: function (event) {
            var model = this.view.model;
            //var operationManager = model.getOperationManager();
            var view = this.view;

            var currentTarget = $(event.currentTarget).parent();

            currentTarget.children("a").hide();
            var that = this;

            var xxx = currentTarget.children("a").html();
            currentTarget.append("<input type='text' value='"+ xxx +"' style='width:100%;'>");

            // <----- MODEL NAME of the editable field
            var modelName = currentTarget.attr("name") || "name";

            currentTarget.children("input").blur(function() {
                var inp = currentTarget.children("input");
                var val = inp.val();
                inp.remove();
                currentTarget.children("a").html(val).show();

                // SyncUp Model: Class opertations
                that.model.set(modelName, val);
            })
            .on('keyup', function(e){
                if (e.which == 27) { 
                    //$('#status').html("cancel");
                    $(this).off('blur').remove();
                    currentTarget.children("A").show();
                }
                else if (e.which == 13) { 
                    $(this).trigger("blur");
                }
            })
            .focus();
        }
    });

    window.Behaviors = window.Behaviors || {};
    window.Behaviors.EditableBehavior = EditableBehavior;
    return EditableBehavior;
});
