
define(['marionette', './../umldiagram'],
    function(Marionette) {
        var Connector = Backbone.Marionette.ConnectorItemView.extend({
            draw: function(context2, points, color) {
                if ((points == null) || (points.length < 2)) {
                    return;
                }
                var ep = points.length-1;

                context2.beginPath();
                context2.fillStyle = color;
                context2.strokeStyle = color;
                context2.moveTo(points[0][0], points[0][1]);
                for (var i=1; i<=ep; ++i) {
                    context2.lineTo(points[i][0], points[i][1]);
                }
                context2.stroke();
                context2.closePath();
            }
        });
        return Connector;
    });

