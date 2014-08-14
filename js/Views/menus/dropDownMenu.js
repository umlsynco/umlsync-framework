define([
        'jquery',
        'jquery-ui',
        'marionette',
        'Views/framework',
        'Collections/contentCollection'],
    function ($, useless, Marionette, Framework, ContentCollection) {

        var DropdownView = Marionette.ItemView.extend({
            template: "#umlsync-menu-dropdown-template",
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
            }
        });

        return DropdownView;
    });
