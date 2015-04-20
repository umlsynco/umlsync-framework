define(['backbone', 'marionette', 'jquery-ui', 'Views/framework'], function (Backbone, Marionette, ui, Framework) {

    var WrapDraggableResizable = Marionette.Behavior.extend({
        onRender: function () {
            var model = this.view.model;
            var view = this.view;

            // [TODO]: drop it !!!
            if (view.wasInitialized) {
				alert("DOUBLE CALL OF THE BEHAVIOR HANDLER !!!");
			}
			else {
				view.wasInitialized = true;
			}

            var applyOptions = _.pick(model.attributes, 'height', 'width');
            this.$el
                .css({'position': 'absolute'})
                .css(applyOptions)
                .resizable({
                    //'containment': "#" + this.,// to prevent jumping of element on resize start
                    'scroll': true,
                    'handles': this.options['resizable_h'] || 'n-u,e-u,s-u,w-u,nw-u,sw-u,ne-u,se-u',
                    'alsoResize': '#' + model.cid + '_Border .us-element-resizable-area',
                    'start': function () {
                    },
                    'stop': function () {
                    },
                    'resize': function (event, ui) {
                    }
                })
                .draggable({
                    'grid': [2, 2],
                    'scroll': true,
                    'start': function (event, ui) {
                    },
                    'drag': function (event, ui) {
                        view.trigger("drag");
                    },
                    'stop': function (event, ui) {
                    }
                })
                .bind('contextmenu', function (e) {
                    e.preventDefault();
                    // Load and show the context menu for the diagram
                    // [TODO]: Do we need to split "edit/view" states ?
                    Framework.vent.trigger("contextmenu:show", {type:"diagram", event:e, context: {view:view}});
                })
                .attr("style", "left:"+model.get("left")+"px;top:"+model.get("top")+"px;height:"+model.get("height")+"px;width:"+model.get("width")+"px;");


            this.$el.children(".grElement")
                .click(view, function(event) {
                    // Hide previous references
                    //$("#" + element.parrent.euid + " .us-references").hide();

                    // [TODO]: Check for Ctrl-pressed event.CtrlKey == true ?
                    $('#' + this.id +'_Border').parent().find("DIV.us-element-border > DIV.ui-resizable-handle").css("visibility", "hidden");
                    $('#' + this.id +'_Border').children("DIV.ui-resizable-handle").css("visibility", "visible");

                    // Trigger show or hide icon menu !!!
                    Framework.vent.trigger("diagram:iconmenu:show", view);
                    event.stopPropagation();
                })
                .mouseenter(view, function (event){
                    var element = event.data;
                    if (!element.options.selected && !element.highlighted) {
                        element.highlighted = true;
                        var $bw = $('#' + this.id +'_Border').css('border-color', '#97F7A1').css({'border-width':'3px'});
                    }
                })
                .mouseleave(view, function (event){
                    var element = event.data;
                    if (!element.options.selected && element.highlighted) {
                        var $bw = $('#' + this.id +'_Border');
                        $bw.css('border-color', 'rgba(255, 255, 255, 0.3)').css({'border-width':'3px'});
                        element.highlighted = false;
                    }
                })
                .append("<img id='" + this.euid + "_REF' title='REFERENCE' src='./images/reference.png' class='us-element-ref' style='z-index:99999;visibility:hidden;'></img>");

            // Hide element resize points which was
            // added on the previous step
            this.$el.children(".ui-resizable-handle").css({'visibility': 'hidden'});

            if (model.get("color")) {
                this.$el.find(".grElement").css("background-color", model.get("color"));
            }
        }
    });

    window.Behaviors = window.Behaviors || {};
    window.Behaviors.ElementBehavior = WrapDraggableResizable;
    return WrapDraggableResizable;
});
