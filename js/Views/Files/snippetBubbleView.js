define(
    ['backbone',
        'Views/framework'
    ],
    function (Backbone, Framework, ContentModel) {
        var bubbleView = Backbone.Marionette.ItemView.extend({
            template:"#umlsync-snippet-bubble",
            ui: {
                "icons" : "span.ui-icon",
                "text" : "p#vrrrrrrrrrrrrrr",
                "area" : "div#snippet_bubble"

            },
            events: {
                "click @ui.icons": "onIconClick",
                "click @ui.text": "onEdit",
//                "blur @ui.text" : "onBlur"
            },
            initialize: function () {
                // TBD
            },
            onRender: function() {
                //this.$el.draggable().resizable();
            },
//            onBlur: function() {
//                if (this.ui.text.children("textarea").length >0) {
//                    var comment = this.ui.text.children("textarea").val();
//                    this.model.set({comment:comment});
//                    this.ui.text.empty().text(comment);
//                }
//            },
            onEdit: function() {
                var $txt = this.ui.text.children("textarea");
                if ($txt.length == 0) {
                    var txt = this.ui.text.text();
                    this.ui.text.empty();
                    this.ui.text.append("<textarea>"+txt+"</textarea>");
                    //this.ui.text.children("textarea").blur(_.bind(this.onBlur, this));
                }
            },
            onIconClick: function(e,x ,y, z) {
                var $target = $(e.target);
                if ($target.hasClass("ui-icon-cancel")) {
                    var $txt = this.ui.text.children("textarea");
                    if ($txt.length > 0) {
                        // restore the previous comment if it was editable
                        this.ui.text.empty().text(this.model.get("comment"));
                    }
                    else {
                        if (this.model.get("status") == "new") {
                            // Added new but was not edit
                            if (this.model.get("comment") == "") {
                                this.model.set({status:"removed"});
                            }
                        }
                        // destroy the current view
                        this.destroy();
                    }
                }
                else if ($target.hasClass("ui-icon-trash")) {
                    this.model.set({status:'removed'});
                    this.destroy();
                }
                else if ($target.hasClass("ui-icon-check")) {
                   var $txt = this.ui.text.children("textarea");
                    if ($txt.length > 0) {
                        var comment = $txt.val();
                        // if comment was dropped
                        if (comment == "") {
                            this.model.set({comment: comment, status: 'removed'});
                            this.destroy();
                            return;
                        }
                        else {
                            if (this.model.get("status") == "new") {
                                // new -> new only
                                this.model.set({comment: comment});
                            }
                            else {
                                // loaded -> modified
                                this.model.set({comment: comment, status: 'modified'});
                            }
                            this.ui.text.empty().text(comment);
                        }
                    }
                }
            },
            templateHelpers : {
                showContent: function() {
                    return contentData = this.modifiedContent || this.content;
                }
            }
        });


        return bubbleView;
    });
