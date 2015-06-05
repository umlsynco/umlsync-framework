// Save dialog

define([
        'marionette',
        'jquery-ui',
        'Views/framework',
        'Behaviors/HotKeysBehavior'],
    function (Marionette, jui, Framework, HotKeysBehavior) {
        var contentCloseDialog = Backbone.Marionette.ItemView.extend({
            modal: true,
            getTemplate: function () {
                return "#umlsync-saveas-dialog-template";
            },
            ui: {
                buttons: "button.ui-button"
            },
            events: {
                "mouseenter @ui.buttons": 'mouseHover1',
                "mouseexit @ui.buttons": 'mouseHover2',
                'click @ui.buttons': 'onButtonClick',
                'click .ui-icon-closethick': 'onButtonClick'
            },
            keyEvents: {
                'return': 'onReturnPressed',
                'esc': 'onEscPressed'
            },
            behaviors: {
                HotKeysBehavior: {}
            },
            onReturnPressed: function () {
                var inFocus = this.ui.buttons.filter("ui-state-focus");
                if (inFocus.length == 1) {
                    var text = inFocus[0].children("SPAN").text();
                    this.triggerMethod("button:" + text);
                    this.trigger("destroy");
                }
            },
            onEscPressed: function () {
                this.trigger("button:cancel");
                this.trigger("destroy");
            },

            onButtonClick: function (e) {
                var $et = $(e.currentTarget);
                if ($et.hasClass("ui-icon-closethick")) {
                    this.trigger("button:cancel");
                }
                else {
                    var text = $et.children("SPAN").text();
                    this.triggerMethod("button:" + text);
                }
                this.trigger("destroy");
            },
            onRender: function () {
                this.$el.draggable().css({visibility: 'visible'});
                if (this.modal) {
                    $("DIV.ui-widget-overlay").show();
                }
            },
            onDestroy: function () {
                if (this.modal) {
                    $("DIV.ui-widget-overlay").hide();
                }
            },
            mouseHover1: function (e) {
                // Prevent multiple select behavior
                this.ui.buttons.removeClass('ui-state-hover');
                $(e.currentTarget).addClass('ui-state-hover');
            },
            mouseHover2: function (e) {
                $(e.currentTarget).removeClass('ui-state-hover');
            }
        });
        return contentCloseDialog;
    });
