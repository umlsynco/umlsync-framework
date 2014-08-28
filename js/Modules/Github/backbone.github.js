define(['jquery', 'underscore', 'base64', 'backbone'], function(jQuery, _, Base64, Backbone) {

    // Initial Setup
    // -------------

    var XMLHttpRequest;

    //prefer native XMLHttpRequest always
    if (typeof window !== 'undefined' && typeof window.XMLHttpRequest !== 'undefined') {
        XMLHttpRequest = window.XMLHttpRequest;
    }
    else {
        if (typeof exports !== 'undefined') {
            XMLHttpRequest = require('xmlhttprequest').XMLHttpRequest;
        }
    }


    var API_URL = 'https://api.github.com';

    var Github = function (options) {
        var token = options.token;
        var user = options.username;
        // Wrap basic methods of Backbone
        var wrapSync = function (method, model, options) {
            var beforeSend = options.beforeSend;
            // wrap before send method
            options.beforeSend = function (xhr) {
                // Setup request headers
                xhr.setRequestHeader('Accept', 'application/vnd.github.v3.raw+json');
                xhr.setRequestHeader('Content-Type', 'application/json;charset=UTF-8');
                if (token) {
                    xhr.setRequestHeader('Authorization', 'token ' + token);
                }
                // apply an original before send method
                if (beforeSend) return beforeSend.apply(this, arguments);
            };
            // Call the Backbone.sync
            Backbone.Model.prototype.sync.apply(this, arguments);
        };

        Backbone.GithubModel = Backbone.Model.extend({
            sync: wrapSync
        });

        Backbone.GithubCollection = Backbone.Collection.extend({
            sync: wrapSync
        });
    };
    return Github;
});