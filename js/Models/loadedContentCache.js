define(['backbone'], function (Backbone) {
    var ContentCacheModel = Backbone.Model.extend({
        defaults: {
            full_name: '', // Absolute path to the content
            sha: null, // Git SHA summ
            repo: null, // GitHub repository name
            branch: null, // Branch name
            contentType: null, // content type uid
            contentData: null,
            contentModifiedData: null,
            referenceCount: 0, // Indicates if we need to reserve content in cache
            created: 0 // Date of view creation
        },

        initialize: function () {
            if (this.isNew()) {
                this.set('created', Date.now());
            }
        }
    });
    return ContentModel;
});
