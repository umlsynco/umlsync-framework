define(
    ['backbone',
     'Views/framework',
     'Models/contentModel'
    ],
    function (Backbone, Framework, ContentModel) {
        var sourcecodeView = Backbone.Marionette.ItemView.extend({
            ui: {
              "lline" : "ol.linenums>li"
            },
            events: {
              "click @ui.lline": "onLineNumber"
            },
            initialize: function () {
                this.model.on('change:status', this.render);
                this.model.on('change:mode', this.onSnippets);
            },
            getTemplate: function () {
                var status = this.model.get("status");
                // use the default templates for loading and load failed use-cases
                if (status == 'loading') {
                    return "#umlsync-content-loading-template";
                } else if (status == 'error') {
                    return "#umlsync-content-failed-template";
                }
                // Check if content is in edit mode
                return "#umlsync-sourcecode-view-template";
            },
            onRender: function() {
                if (this.model.get("status") != "error" && this.model.get("status") != "loading")
                  prettyPrint();
            },
            onSnippets: function(model, newStatus, oldStatus) {
                this.snippets = ("snippets" == newStatus);
            },
            onLineNumber: function() {
                var selector = "#diag-" + this.model.cid + ">div.us-sourcecode>pre";
                Framework.vent.trigger("content:snippets:showBubble", {selector:selector}, new Backbone.Model({path:this.model.get("absPath"), comment:"", status: "new"}));
                //this.$el.children("div.us-sourcecode").children("pre").append(
//                    ' <div style="left: 248px; top: 239px; width: 250px; height: 100px;" id="snippet_bubble" class="us-snippet ui-draggable ui-resizable"><p tabindex="1" class="triangle-border top" id="vrrrrrrrrrrrrrr">&lt;p&gt;[text]&lt;/p&gt;.</p>				<span style="position:absolute;right:50px;top:15px;" class="ui-icon ui-icon-check"></span>				<span style="position:absolute;right:30px;top:15px;" class="ui-icon ui-icon-cancel"></span>				<span style="position:absolute;right:10px;top:15px;" class="ui-icon ui-icon-trash"></span>				<div style="z-index: 1000;" class="ui-resizable-handle ui-resizable-e"></div><div style="z-index: 1000;" class="ui-resizable-handle ui-resizable-s"></div><div style="z-index: 1000;" class="ui-resizable-handle ui-resizable-se ui-icon ui-icon-gripsmall-diagonal-se"></div></div>');
            },
            showSnippet: function(model) {
                var selector = "#diag-" + this.model.cid + ">div.us-sourcecode>pre";
                Framework.vent.trigger("content:snippets:showBubble", {selector:selector}, model);
            },
            templateHelpers : {
                showContent: function() {
                    return contentData = this.modifiedContent || this.content;
                }
            }
        });

        Framework.registerContentTypeView({
            type: 'sourcecode',
            classPrototype:sourcecodeView,
            extensions:"C,CPP,H,HPP,PY,HS,JS,CSS,JAVA,RB,PL,PHP"
        });

        return sourcecodeView;
    });
