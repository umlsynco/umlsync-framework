
define(['backbone', 'base64', '../../../Views/framework', 'Models/loadedContentCache'], function (Backbone, b64, Framework, CacheModel) {
    var contentCache = Backbone.Collection.extend({
            model : CacheModel,
            sync: function (operation, model, something, callback) {
                if (operation == "read") {
                    var that = this;
                    var gh = Framework.Backend.Github.github;

                    var repoId = something.data.repo;
                    var branch = something.data.branch;
                    var sha = something.data.sha;
                    var absPath = something.data.absPath;

                    // working repo
                    var wr = gh.getRepo(repoId.split('/')[0], repoId.split('/')[1]);

                    // Load content by SHA
                    if (sha) {
                        wr.getBlob(sha, function(err, data) {
                            if (data == null) {
                                if (something.error) something.error(err);
                            }
                            else {
                                var clone = $.extend({}, something.data, {content:data});
                                if (something.success) something.success(clone);
                            }
                        });
                    }
                    else if (absPath) {
                        var cPath = (absPath[0] == '/')? absPath.substring(1): absPath;
                        wr.contents(cPath,  function(err, data, response) {
                            if (data == null) {
                                if (something.error) something.error(err);
                            }
                            else {
                                var clone = $.extend({}, something.data, {content:data});
                                if (something.success) something.success(clone);
                            }
                        });
                    }
                    else {
                        alert("Not enough information about loadable content (no SHA or absolute path available)!")
                    }
                }
            }
        });
    return contentCache;
});
