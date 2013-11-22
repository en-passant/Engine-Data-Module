var base = require( '../ProducerBase.js' );
function AppDotNetPostCreatedProducer() {
    this.fetcher = fetcher;
    base.init( this );
}
base.inherit( AppDotNetPostCreatedProducer );

AppDotNetPostCreatedProducer.prototype.init = function( done ) {
    var self = this;
    this.fetcher.tokenStore.getApplicationTokens( 'appdotnet', function( error, tokens ) {
        if( error ) {
            done( error );
        }
        else
        {
            var OAuth2 = require( 'oauth' ).OAuth2;
            this.oauth2 = new OAuth2( 
                tokens.clientID, 
                tokens.clientSecret, 
                "https://alpha.app.net", 
                "/oauth/authenticate", 
                "/oauth/access_token" );
            done();
        }
    });
}
AppDotNetPostCreatedProducer.prototype.getMatchPatterns = function() {
    return [ '^acct:appdotnet:[0-9]+', '/posts/created' ];
}
AppDotNetPostCreatedProducer.prototype.attemptRequest = function( uri, owner, source, resource, keys, callback ) {
    var self = this;

    var appdotnetUrl = ' https://alpha-api.app.net/stream/0/users/me/posts';
	self.oauth2.get( appdotnetUrl, keys.accessToken,
        function( error, data ) {
            if( error ) {
					if(error.statusCode == 401) {
						error = 'Login/Authentication failure for ' + uri + ' at attempt of resource ' + resource; 
					}
					callback( error, null );
				}
            else
                callback( null, {
                    'uri': uri,
                    'data': data
                });
        } 
    );
};
module.exports = exports = AppDotNetPostCreatedProducer;
