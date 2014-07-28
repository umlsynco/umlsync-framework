define(['Views/framework', 'backbone'], function (Framework, Backbone) {
    var ContentModel = Backbone.Model.extend({
        defaults: {
            title: '', // Content title
            absPath: '', // Absolute path to the content
            sha: null, // Git SHA summ
            repo: null, // GitHub repository name
            branch: null, // Branch name
            view: null, // view identifier - GitHub or something else
            contentType: null, // content type uid
            modifiedContent: null, // modified content
            originalContent: null, // original content
            isModified: false, // modified indicator
            isOwner: false, // Indicates if it is possible to modify content
            isEditable: false, // Indicates if if framework has corresponding handler
            isActive: false, // Indicates if content in focus
            created: 0 // Date of view creation
        },

        initialize: function () {
            if (this.isNew()) {
                this.set('created', Date.now());
            }
        },

        toggle: function () {
            return this.set('isModified', !this.isModified());
        },

        isModified: function () {
            return this.get('isModified');
        }
    });
    return ContentModel;
});
