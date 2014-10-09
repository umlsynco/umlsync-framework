define(['backbone', 'marionette', 'jquery-ui'], function (Backbone, Marionette, ui) {

    var WrapDraggableResizable = Marionette.Behavior.extend({
        onRender: function () {
            this.$el.wrap('<div id="' + this.cid + '_Border" class="us-element-border"></div>');
            $('#' + this.euid + '_Border')
                .resizable({
                    //'containment': "#" + this.,// to prevent jumping of element on resize start
                    'scroll': true,
                    'handles': this.options['resizable_h'] || 'n-u,e-u,s-u,w-u,nw-u,sw-u,ne-u,se-u',
                    'alsoResize': '#' + this.cid + '_Border .us-element-resizable-area',
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
                .css({'position': 'absolute', 'top': this.options['pageY'], 'left': this.options['pageX']});

            // Hide element resize points which was
            // added on the previous step
            $('#' + this.cid + '_Border ' + ".ui-resizable-handle").css({'visibility': 'hidden'});
        }
    });

    window.Behaviors = window.Behaviors || {};
    window.Behaviors.ElementBehavior = WrapDraggableResizable;
    return WrapDraggableResizable;
});