require.config({
	'paths' : {
        jquery : "lib/jquery.min",
        underscore : "lib/underscore-min",
        'jquery-ui' : "lib/jquery-ui",
        'scrollable-tabs' : "lib/jquery.scrollabletab",
        backbone : "lib/backbone-min",
        marionette : "lib/backbone.marionette",
		github : 'lib/github',
		base64 : 'lib/base64',
        textjs : 'lib/text'
    },
    shim : {
        jquery : {
            exports : 'jQuery'
        },
        underscore : {
            exports : '_'
        },
		github : {
		    deps : ['underscore', 'base64'],
		    exports : 'Github'
		},
        'jquery-ui' : {
            deps : ['jquery'],
            exports : 'jQuery.ui'
        },
       'scrollable-tabs': {
            deps : ['jquery', 'jquery-ui']
        },
        backbone : {
            deps : ['jquery', 'underscore'],
            exports : 'Backbone'
        },
        marionette : {
            deps : ['jquery', 'underscore', 'backbone'],
            exports : 'Marionette'
        }
    }
});

require(
    ['Views/framework',
     'Controllers/contentController',
     'Views/Files/sourcecodeView',
     'Module/Github/Views/githubLayoutView'
    ],
function(Framework, Controller, scview, ghView) {
    // Start the framework
    Framework.start();

    Framework.ContentCollection.add({
        title: 'test', // Content title
        absPath: '/test', // Absolute path to the content
        isModified: false, // modified indicator
        isOwner: true, // Indicates if it is possible to modify content
        isEditable: true, // Indicates if if framework has corresponding handler
        sha: null, // Git SHA summ
        repo: 'umlsynco/umlsync', // GitHub repository name
        branch: 'master', // Branch name
        view: 'github', // view identifier - GitHub or something else
        contentType: 'sourcecode' // content type uid
    });

    Framework.ContentCollection.add({
        title: 'test2', // Content title
        absPath: '/test2', // Absolute path to the content
        isModified: false, // modified indicator
        isOwner: true, // Indicates if it is possible to modify content
        isEditable: true, // Indicates if if framework has corresponding handler
        sha: null, // Git SHA summ
        repo: 'umlsynco/umlsync', // GitHub repository name
        branch: 'master', // Branch name
        view: 'github', // view identifier - GitHub or something else
        contentType: 'sourcecode' // content type uid
    });
});
