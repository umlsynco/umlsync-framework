require.config({
	'paths' : {
        jquery : "lib/jquery.min",
        underscore : "lib/underscore-min",
        'jquery-ui' : "lib/jquery-ui",
        scrolltab : "lib/jquery.scrollabletab",
        backbone : "lib/backbone-min",
        marionette : "lib/backbone.marionette",
		github : 'lib/github',
		base64 : 'lib/base64',
        textjs : 'lib/text',
        dynatree : 'lib/jquery.dynatree',
        jcookie : 'lib/jquery.cookie',
        showdown: 'lib/showdown/showdown',
		fieldselection: 'lib/jquery-fieldselection/jquery-fieldselection',
		hotkeys: 'lib/hotkeys'
    },
    shim : {
        jquery : {
            exports : 'jQuery'
        },
        underscore : {
            exports : '_'
        },
        showdown : {
          export : 'Showdown'
        },
        jcookie: {
		  deps: ['jquery']
		},
		fieldselection: {
		  deps: ['jquery']
		},
		hotkeys: {
		  deps: ['underscore'],
		  export: 'HotKey'
		},
		github : {
            deps : ['underscore', 'base64'],
		    exports : 'Github'
		},
        scrolltab: {
            deps : ['jquery', 'jquery-ui']
        },

        dynatree : {
            deps : ['jquery', 'jcookie'],
            exports : '$.fn.dynatree'
        },
        'jquery-ui' : {
            deps : ['jquery'],
            exports : 'jQuery.ui'
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
        'Views/Files/markdownView',
     'Modules/Github/Views/githubLayoutView'
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
        contentType: 'markdown' // content type uid
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
