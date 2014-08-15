define([
        'jquery',
        'jquery-ui',
        'marionette',
        'Views/framework',
        'Collections/contentCollection',
        'Behaviors/HotKeysBehavior'],
    function ($, useless, Marionette, Framework, ContentCollection, HotKeys) {
        var MenuItem = Marionette.ItemView.extend({
           template: "#umlsync-listitem-template",
           className: "diagram-selector",
           tagName: 'li',
           triggers: {
               "click span": "menu:selected"
           },
           templateHelpers: {
             showStyle: function() {
                 var text = "cursor:pointer;",
                     image = this.model.get("image"),
                     private = this.model.get("private");


                 if (image) {
                     text += "list-style-image:url('" + image + "'";
                 }
                 else if (!private) {
                     text += "list-style-image:url('images/public.png'";
                 }
                 return text;
             }
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
            childView: MenuItem,
            itemViewEventPrefix: "menu",
            onMenuSelected: function() {
                alert("SELECTED !");
            },
            onItemviewMenuSelected: function() {
                alert("SELECTED IV!");
            }

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

        var DialogView = Marionette.LayoutView.extend({
            template:"#umlsync-multitabs-dialog-template",
            ui: {
                tabs : ".ui-tabs-nav li"
            },
            events: {
              "click @ui.tabs": "changeGroupFilter",
              "mouseenter @ui.tabs": "menter",
              "mouseleave @ui.tabs": "mexit"
            },
            keyEvents : {
                'return': 'onReturnPressed',
                'esc': 'onEscPressed'
            },
            behaviors: {
                HotKeysBehavior: {}
            },
            regions: {
                tabs: '#us-list'
            },
            templateHelpers : function() {
                return {title: this.title};
            },
            menter: function(e) {
                $(e.currentTarget).addClass("ui-state-hover");
            },
            mexit: function(e) {
                $(e.currentTarget).removeClass("ui-state-hover");
            },
            onReturnPressed: function() {
              this.trigger("button:enter");
            },
            onEscPressed: function() {
                this.trigger("button:cancel");
            },
            onShow: function() {
                this.menuList = new MenuList({collection:this.collection});
                this.tabs.show(this.menuList);

                this.listenTo(this.menuList, "itemview:menu:selected", function() {alert("MENU!!!")});

                var that = this.$el.find("ul.ui-tabs-nav");
                var collection = this.collection;
                _.each(this.groups, function(group) {
                  var active = group.isDefault ? "ui-state-active ui-tabs-selected": "";
                  that.append('<li class="ui-state-default ui-corner-top '+active+'"><a><span>'+group.title+'</a></span></li>');

                  // Setup default group filter
                  if (group.isDefault) {
                      collection.setGroupFilter(group.title);
                  }
                });
            },

            changeGroupFilter: function(e) {
                this.$el.find(".ui-tabs-nav li").removeClass("ui-state-active");
                $(e.currentTarget).addClass("ui-state-active");
                var group = $(e.currentTarget).find("SPAN").text();

                var result = this.collection.setGroupFilter(group);
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

            templateHelpers : function() {
                return {
                    showActive: function () {
                        return "none";
                    },
                    'title': this.title,
                    'id': this.uid
                };
            },

            toggleDropDownMenu: function() {
                this.$el.toggleClass("us-open-menu");
            },

            onShow: function() {
                var view = new (DialogView.extend({title:this.title, groups: this.groups}))({collection:this.collection});
                this.Dropdown.show(view);
                this.listenTo(view, "button:cancel", function() {alert("CANCEL")});
                this.listenTo(view, "menu:selected", function() {alert("MENU!!!")});
            }
        });

        return DropdownView;
    });
