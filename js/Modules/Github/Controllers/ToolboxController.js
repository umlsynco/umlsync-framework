define(['marionette',
        'Views/framework',
        'Collections/toolboxIconsCollection',
        'Views/Controls/toolboxView'
    ],
    function(Marionette, Framework, ToolboxCollection, ToolboxView) {
        var Controller = Marionette.Controller.extend({
            initialize: function (options) {
                this.GithubController = options.controller;

                // Toolbox
                this.ToolboxCollection = new ToolboxCollection();
                this.ToolboxCollection.add([
                    {   name: 'github-new',
                        title: 'New content',
                        icon: 'images/newdoc.png',
                        cssClass: 'left'},
                    {   name: 'github-revertdoc',
                        title: 'Revert changes',
                        icon: 'images/revertdoc.png',
                        cssClass: 'left'},
                    {   name: 'github-removedoc',
                        title: 'Remove content',
                        icon: 'images/removedoc.png',
                        cssClass: 'left'},
                    {   name: 'github-commit',
                        title: 'Commit changes',
                        icon: 'images/commit.png',
                        cssClass: 'right'},
                    {   name: 'github-reload',
                        title: 'Reload tree',
                        icon: 'images/reload.png',
                        cssClass: 'right'}
                ]);

                // Initialize toolbox view
                this.ToolboxView = new ToolboxView({
                    childViewEventPrefix: 'github',
                    collection: this.ToolboxCollection
                });

                var that = this;
                this.ToolboxView.on("github:toolbox:click", function (data) {
                    if (data && data.model)
                      that.handleIconClick(data.model);
                });
            },
            handleIconClick: function(model) {
                if (model) {
                  var names = model.get("name").split("-");
                  if (names.length != 2) {
                      return;
                  }
                  switch(names[1]) {
                      case "new":
                          this.GithubController.NewContent();
                          break;
                      case "revertdoc":
                          this.GithubController.RevertContent();
                          break;
                      case "removedoc":
                          this.GithubController.RemoveContent();
                          break;
                      case "commit":
                          this.GithubController.CommitChanges();
                          break;
                      case "reload":
                          this.GithubController.Rebase();
                          break;
                      default:
                          alert("Unexpected operation:" + names[1]);
                          break;
                  }
                }
            }
        });
        return Controller;
    }
);
