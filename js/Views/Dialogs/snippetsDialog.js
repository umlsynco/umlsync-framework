// Snippets navigator dialog

// TODO: 1. contentController as input param to request content load or open
//       2. content - switch to the snippets mode
//       3. trigger bubble creation !!!

define([
        'marionette',
        'jquery-ui',
        'Views/framework',
        'Behaviors/HotKeysBehavior'],
    function (Marionette, jui, Framework, HotKeysBehavior) {
        var ItemView = Backbone.Marionette.ItemView.extend({
            template: _.template("<%=path%>"),
            tagName: "li",
            onRender:function() {
                // Set title
                this.$el.attr("title", this.model.get("comment"));
            }
        }),
        CollectionView = Backbone.Marionette.CollectionView.extend({
           childView:ItemView,
            tagName: "ul",
            className: "ui-sortable"
        });

        var snippetsDialog = Backbone.Marionette.LayoutView.extend({
            getTemplate: function () {
                return "#us-snippets-template";
            },
            regions: {
                snippetList: "DIV#snippets>DIV#selectable-list"
            },
            ui: {
                buttons: "button.ui-button",
                navigator: "#us-snippets-toolbox>ul>li"
            },
            events: {
                "mouseenter @ui.buttons": 'mouseHover1',
                "mouseexit @ui.buttons": 'mouseHover2',
                'click @ui.buttons': 'onButtonClick',
                'click .ui-icon-closethick': 'onButtonClick',
                'click @ui.navigator': 'onNavigate'
            },
            keyEvents: {
                'return': 'onReturnPressed',
                'esc': 'onEscPressed'
            },
            behaviors: {
                HotKeysBehavior: {}
            },
            initialize: function(options) {
                // List of the snippets elements
              this.collection = options.collection;
            },
            //
            // Navigator buttons on the top of the dialog
            //
            onNavigate: function() {
                this.trigger("on:navigate");
                this.destroy();
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
                // Redraw collection on render
                this.elementsView = new CollectionView({collection:this.collection});
                this.snippetList.show(this.elementsView);
                this.elementsView.$el.sortable();
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
        return snippetsDialog;
    });
