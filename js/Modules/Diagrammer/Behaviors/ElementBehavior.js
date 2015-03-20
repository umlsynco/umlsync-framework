define(['backbone', 'marionette', 'jquery-ui', 'Views/framework'], function (Backbone, Marionette, ui, Framework) {

    var WrapDraggableResizable = Marionette.Behavior.extend({
        onRender: function () {
            var model = this.view.model;
            var view = this.view;
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
                    Framework.vent.trigger("contextmenu:show", {type:"diagram", event:e, context: {view:this}});
                })
                .attr("style", "left:"+model.get("left")+"px;top:"+model.get("top")+"px;height:"+model.get("height")+"px;width:"+model.get("width")+"px;");


            this.$el.children(".grElement")
                .click(self,function(event) {
                    // Hide previous references
                    //$("#" + element.parrent.euid + " .us-references").hide();
                    $('#' + this.id +'_Border').parent().find("DIV.us-element-border > DIV.ui-resizable-handle").css("visibility", "hidden");
                    $('#' + this.id +'_Border').children("DIV.ui-resizable-handle").css("visibility", "visible");
                })
                .mouseenter(view, function (event){
                    var element = event.data;
                    if (!element.options.selected && !element.highlighted) {
                        element.highlighted = true;
                        var $bw = $('#' + this.id +'_Border').css({'border-width':'3px'});
                        var bw = $bw.css('border-left-width');
                        $bw.css({left:'-=' + bw, top:'-='+bw});
                    }
                })
                .mouseleave(view, function (event){
                    var element = event.data;
                    if (!element.options.selected && element.highlighted) {
                        var $bw = $('#' + this.id +'_Border');
                        var bw = $bw.css('border-left-width');
                        $bw.css({'border-width':'0px'}).css({left:'+=' + bw, top:'+='+bw});
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
