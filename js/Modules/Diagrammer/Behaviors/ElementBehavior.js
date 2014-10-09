define(['backbone', 'marionette', 'jquery-ui'], function (Backbone, Marionette, ui) {

    var WrapDraggableResizable = Marionette.Behavior.extend({
        onAttach: function () {
            alert("VVVVVVVVVVVVVVVV");
            var model = this.view.model;
            var view = this.view;
            var applyOptions = _.pick(model.attributes, 'height', 'width', 'left', 'top');
var fff = this.$el.parent(); var ggg = fff.length;
            fff.css({position:'relative'});
            this.$el
                .css({'position': 'absolute'}).css(applyOptions)
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
                    },
                    'stop': function (event, ui) {
                    }
                })
                .bind('contextmenu', function (e) {
                    e.preventDefault();
                })
                ;

            this.$el.children(".grElement")
                .click(self,function(event) {
                    // Hide previous references
                    //$("#" + element.parrent.euid + " .us-references").hide();
                })
                .mouseenter(this, function (event){
                    var element = event.data;
                    if (!element.options.selected && !element.highlighted) {
                        element.highlighted = true;
                        var $bw = $('#' + this.id +'_Border').css({'border-width':'3px'});
                        var bw = $bw.css('border-left-width');
                        $bw.css({left:'-=' + bw, top:'-='+bw});
                    }
                })
                .mouseleave(this, function (event){
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
            $('#' + model.cid + '_Border ' + ".ui-resizable-handle").css({'visibility': 'hidden'});
        }
    });

    window.Behaviors = window.Behaviors || {};
    window.Behaviors.ElementBehavior = WrapDraggableResizable;
    return WrapDraggableResizable;
});