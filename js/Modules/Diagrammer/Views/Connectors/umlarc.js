
define(['marionette', './../umldiagram'],
    function(Marionette) {
        var Connector = Backbone.Marionette.ConnectorItemView.extend({
        draw: function(context2, points, color) {
            if ((points == null) || (points.length < 2)) {
               return;
            }

            var ep = points.length-1;
            var x = 15,
                dx = points[ep].x - points[ep-1].x,
                dy = points[ep].y - points[ep-1].y,
                gip = Math.sqrt(dx*dx + dy*dy);

            
            var sina = dy/gip,
            cosa = dx/gip,
            x3 = points[ep].x, // - Math.sqrt(x*x*3/4)*cosa,
            y3 = points[ep].y, // - Math.sqrt(x*x*3/4)*sina,
            x6 = points[ep].x - x*cosa,
            y6 = points[ep].y - x*sina;
            
            context2.beginPath();
            context2.fillStyle = color;
            context2.strokeStyle = color;
            context2.moveTo(points[0].x, points[0].y);
            for (i=1; i<ep; ++i) {
              context2.lineTo(points[i].x, points[i].y);
            }

            if (gip<x)
               return;

            context2.moveTo(points[ep-1].x, points[ep-1].y);
            context2.lineTo(x6, y6);
            context2.stroke();

            context2.beginPath();            
            asin = Math.acos(sina);
            if (cosa > 0) asin = -asin; // Keep the direction !!!
            context2.arc(x3, y3, x, asin, asin + Math.PI , true);

            context2.stroke();
            //context2.closePath();
        
       }
    });
        return Connector;
    });


