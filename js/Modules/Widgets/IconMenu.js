define(['marionette'],
function(Marionette, diagram) {
		var itemView = Backbone.Marionette.ItemView.extend({
			tagName: 'img',
			template: _.template(""),
			onRender: function() {
				this.$el.attr("src", this.model.get("image")).attr("title", this.model.get("connector"));
			}
		});

		var IconView = Backbone.Marionette.CollectionView.extend({
			childView : itemView,
			className: 'elmenu-us-class-menu',
			template: _.template("")
		});
		
		return IconView;
});	
