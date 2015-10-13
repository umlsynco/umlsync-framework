define(['marionette'],
    function(Marionette) {
        var View = Backbone.Marionette.ElementItemView.extend({
            className: "us-element-transparent",
            getTemplate: function() {
           //'<div id="' + this.euid + '" class="us-package">\
           // <div class="us-alt-body us-element-resizable-area grElement">'+
           //this.getCond() +
           // '</div><div class="us-alt-tab"><b>'+this.getAlt()+'</b><img src="http://umlsync.org/sttaic/images/cornerb.png" style="position:absolute;bottom:-1px;right:-1px;"></div>\
           // </div>';
               return _.template('<div id="<%=cid%>" class="us-alt">' +
               '<div class="us-alt us-element-resizable-area grElement" style="background-color:transparent;"><%=getCondition()%></div>'+
                '<div class="us-alt-tab"><b><%=getTitle()%></b><img src="images/cornerb.png" style="position:absolute;bottom:-1px;right:-1px;"></div></div>');
            },
            templateHelpers: function() {
               return {
                   cid: this.model.cid,
                   getTitle: function() {
                      var title = this.title;
                      if (title == "Loop") return 'Loop(<a class="editablefield">' + 10 + '</a>)';
                      if (title == "Parallel") return 'Par';
                      if (title == "Option") return 'Opt';
                      return title;
                   },
                   getCondition: function() {
                     var title = this.title;

                     var condition = "";
                     if (title == "Alt") {
                       condition = '<div id="us-dashed" style="width:100%;height:50%;border-bottom:1px dashed black;">[<a id="ifcond" class="editablefield">if</a>]</div>[<a id="elsecond" class="editablefield">else</a>]';
                     }
                     if (title == "Option" || title == "Break" || title == "Loop") {
                       condition = '[<a id="cond" class="editablefield">condition</a>]';
                     }
                     if (title == "Parallel" || title == "Strict") {
                       condition = '<div id="us-dashed" style="width:100%;height:30%;border-bottom:1px dashed black;"></div><div id="us-dashed" style="width:100%;height:30%;border-bottom:1px dashed black;"></div>';
                     }
                     return condition;
                     }
               };
            }
        });
        return View;
    });

