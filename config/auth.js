/**
 * Created by jin on 27/05/15.
 */

var bluemix      = require('./bluemix');
var watson       = require('watson-developer-cloud');
var extend       = require('util')._extend;

module.exports = {
    'facebookAuth' : {
        'clientID' : '846302955449560',
        'clientSecret' : '4a8dbd72e74e0b9b8e5c842d73bc2087',
        'callbackURL' : 'http://localhost:3000/paris/auth/facebook/callback'
    },

    // if bluemix credentials exists, then override local
    // Create the service wrapper
    'personalityInsights' : new watson.personality_insights(
        extend({
            version: 'v2',
            url: 'https://gateway.watsonplatform.net/personality-insights/api',
            username: '4d23ec31-4f20-4237-a4db-e7ddfa7c5f48',
            password: 'z6k9BKL9LRmO'
        }, bluemix.getServiceCreds('personality_insights'))
    )
};