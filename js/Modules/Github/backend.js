define(['marionette',
        'Views/framework',
        'github'
    ],
    function (Marionette, Framework, Github) {
        Framework.module('Backend', function(Backend) {
            Backend.Github = {};
            Backend.Github = new Github({username:'umlsynco', token:'eb1fce6a57390401d331ada0880144168872a935', singleton: true});
        });
        return Framework.Backend.Github;
    });
