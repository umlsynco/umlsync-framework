define([
        'jquery',
        'jquery-ui',
        'marionette',
        '../framework',
        'Collections/contentCollection',
        'Behaviors/HotKeysBehavior'],
    function ($, useless, Marionette, Framework, ContentCollection, HotKeys) {
        var TableItem = Marionette.ItemView.extend({
            template: _.template('<td><input checked="false" type="checkbox"></td><td><%= absPath %></td>'),
            tagName: 'tr',
            ui: {
                checkbox : "input"
            },
            events: {
                'change @ui.checkbox': 'handleCheckbox'
            },
            initialize: function() {
                // Checked by default
                this.model.set({waitingForCommit: true});
            },
            handleCheckbox: function() {
                this.model.set({waitingForCommit: (this.ui.checkbox.attr('checked') ? true : false)});
            }
        });

        var TableView = Marionette.CollectionView.extend({
            tagName: 'tbody',
            childView: TableItem,
            addChild: function(child, ChildView, index){
                if (child.get('status') == "new") {
                    Backbone.Marionette.CollectionView.prototype.addChild.apply(this, arguments);
                }
            }
        });

        var CommitView = Marionette.LayoutView.extend({
            template: "#umlsync-commit-dialog-template",
            modal:true,
            regions: {
                table: '#us-commit-table'
            },
            ui: {
                buttons: "button.ui-button",
                message: "input#us-commit-message"
            },
            events: {
                "mouseenter @ui.buttons": 'mouseHover1',
                "mouseexit @ui.buttons": 'mouseHover2',
                'click @ui.buttons': 'onButtonClick',
                'click .ui-icon-closethick': 'onButtonClick'
            },
            onButtonCommit: function() {
                this.trigger("button:commit", {message: this.ui.message.html()});
            },
            onButtonClick: function (e) {
                var $et = $(e.currentTarget);
                if ($et.hasClass("ui-icon-closethick")) {
                    this.trigger("cancel");
                }
                else {
                    var text = $et.children("SPAN").text();
                    this.triggerMethod("button:" + text);
                }
                this.trigger("destroy");
            },
            mouseHover1: function (e) {
                // Prevent multiple select behavior
                this.ui.buttons.removeClass('ui-state-hover');
                $(e.currentTarget).addClass('ui-state-hover');
            },
            mouseHover2: function (e) {
                $(e.currentTarget).removeClass('ui-state-hover');
            },
            onShow: function () {
                this.table.show(new TableView({collection:this.collection}));
            },
            onRender: function () {
                this.$el.draggable().css({visibility: 'visible'}).resizable();
                if (this.modal) {
                    $("DIV.ui-widget-overlay").show();
                }
            },
            onDestroy: function() {
                if (this.modal) {
                    $("DIV.ui-widget-overlay").hide();
                }
            }
        });

        return CommitView;
    });
