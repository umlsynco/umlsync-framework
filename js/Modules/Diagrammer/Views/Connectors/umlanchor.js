
define(['marionette', './../umldiagram'],
    function(Marionette) {
        var Connector = Backbone.Marionette.ConnectorItemView.extend({
            draw: function(c, points, color) {
                if ((points == null) || (points.length < 2)) {
                    return;
                }
                var ep = points.length-1;
                // Return SVG connector's group

                for (var i=0; i<points.length-1; ++i) {
                    c.beginPath();
                    c.fillStyle = color;
                    c.strokeStyle = color;

                    this.dashedLine(points[i], points[i+1], c);
                    c.stroke();
                    c.closePath();
                    //c.arc(points[i][0], points[i][1], 3, 0, Math.PI * 2, true);
                }
            }
        });
        return Connector;
    });

