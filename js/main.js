require.config({
	'paths' : {
        jquery : "lib/jquery.min",
        underscore : "lib/underscore-min",
        'jquery-ui' : "lib/jquery-ui",
        scrolltab : "lib/jquery.scrollabletab",
        backbone : "lib/backbone-min",
        marionette : "lib/backbone.marionette",
		github : 'lib/marionette.github',
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
            deps : ['underscore', 'base64', 'marionette'],
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
        // content tabs controller
        'Controllers/contentController',

        // Formats handlers
        'Views/Files/sourcecodeView',
        'Views/Files/markdownView',
        'Views/Files/diagramsView',

        // Data providers Github Bitbucket localhost etc
        'Modules/Github/Views/githubLayoutView', // load and register github layout
        'Modules/Localhost/Views/localhostLayoutView' // load and register Localhost layout
    ],
function(Framework) {
    // Start the framework
    Framework.start();
});
