define([
        'jquery',
        'jquery-ui',
        'marionette',
        'Views/framework',
        'Collections/contentCollection',
        'Behaviors/HotKeysBehavior'],
    function ($, useless, Marionette, Framework, ContentCollection, HotKeys) {
        var MenuItem = Marionette.ItemView.extend({
           template: "umlsync-listitem-template",
           className: "ui-state-default ui-corner-top ui-tabs-selected ui-state-active",
           tagName: 'li',
           triggers: {
               "click a": "menu:selected"
           },
           modelEvents: {
            'change:visibility': 'onVisibilityChange'
           },
           onVisibilityChange: function() {
               if (this.model.get("visibility") == "none") {
                   this.$el.hide();
               }
               else {
                   this.$el.show();
               }
           }
        });

        var MenuList = Marionette.CollectionView.extend({
            tagName: 'ul',
            className: 'ui-tabs-nav ui-helper-reset ui-helper-clearfix ui-widget-header ui-corner-all',
            itemView: MenuItem
        });

        var SearchItem = Marionette.ItemView.extend({
            tagname: '#us-search-template',
            className: '.ui-search-icon',
            events: {
                "keyup #us-search-input": "onSearch"
            },
            onSearch: function(e) {
                var val = $(e.currentTarget).val();
                this.model.set("search", val);
            }
        });

        var TabItem = Marionette.ItemView.extend({
            tagName: "li",
            className: "ui-state-default ui-corner-top ui-tabs-selected ui-state-active",
            template: "umlsync-tabitem-template"
        });

        var GroupCollectionView = Marionette.CollectionView.extend({
            tagName: "ul",
            className: "ui-tabs-nav ui-helper-reset ui-helper-clearfix ui-widget-header ui-corner-all",
            itemView: TabItem
        });

        var MenuListWithFiler = Marionette.LayoutView.extend({
            template : "#umlsync-filter-list-template",
            regions: {
                search: "#us-search",
                list: "#us-list"
            },

            onShow: function() {
                this.list.show(new GroupCollectionView({collection: this.collection, groups: this.groups}));
            }
        });



        var DialogView = Marionette.LayoutView.extend({
            template:"#umlsync-multitabs-dialog-template",
            keyEvents : {
                'return': 'onReturnPressed',
                'esc': 'onEscPressed'
            },
            behaviors: {
                HotKeysBehavior: {}
            },
            regions: {
                tabs: 'fieldset'
            },
            onReturnPressed: function() {
              this.trigger("button:enter");
            },
            onEscPressed: function() {
                this.trigger("button:cancel");
            }
        });

        var DropdownView = Marionette.LayoutView.extend({
            template: "#umlsync-menu-dropdown-template",
            regions: {
                Dropdown: "#umlsync-dropdown-region"
            },
            events : {
                "click .minibutton" : "toggleDropDownMenu"
            },

            templateHelpers : {
                showActive: function() {
                    return "none";
                }
            },

            toggleDropDownMenu: function() {
                this.$el.toggleClass("us-open-menu");
            },

            onShow: function() {
                var view = new DialogView({model:this.model});
                this.Dropdown.show(view);
                this.listenTo(view, "button:cancel", function() {alert("CANCEL")});
            }
        });

        return DropdownView;
    });
