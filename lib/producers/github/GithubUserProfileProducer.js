var base = require( '../ProducerBase.js' );

function GithubUserProfileProducer() {
    base.init( this );
    var OAuth2 = require( 'oauth' ).OAuth2;

    this.oauth2 = new OAuth2( 
        engine.config.github.clientID, 
        engine.config.github.clientSecret, 
        "https://api.singly.com", "/oauth/authenticate", "/oauth/access_token" );
}
base.inherit( GithubUserProfileProducer );

GithubUserProfileProducer.prototype.getMatchPatterns = function() {
    return [ '^acct:github:[0-9]+', '/user/[0-9]+' ];
}
GithubUserProfileProducer.prototype.attemptRequest = function( uri, owner, source, resource, keys, callback ) {
    var self = this;
    var githubUrl = ' https://api.singly.com/proxy/github/user?access_token=' + keys.accessToken;
	self.oauth2.get( githubUrl, keys.accessToken, 
        function( error, data ){
            if( error )
                callback( error, null );
            else
                callback( null, {
                    'uri': uri, 
                    'data': data
                });
        } );

};
module.exports = exports = GithubUserProfileProducer;
