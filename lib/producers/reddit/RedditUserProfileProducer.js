var base = require( '../ProducerBase.js' );

function RedditUserProfileProducer() {
    base.init( this );
    var OAuth2 = require( 'oauth' ).OAuth2;

    this.oauth2 = new OAuth2( 
        engine.config.reddit.clientID, 
        engine.config.reddit.clientSecret, 
        "https://api.singly.com", "/oauth/authenticate", "/oauth/access_token" );
}
base.inherit( RedditUserProfileProducer );

RedditUserProfileProducer.prototype.getMatchPatterns = function() {
    return [ '^acct:reddit:[0-9]+', '/user/[0-9]+' ];
}
RedditUserProfileProducer.prototype.attemptRequest = function( uri, owner, source, resource, keys, callback ) {
    var self = this;
    var redditUrl = ' https://api.singly.com/services/reddit/self?access_token=' + keys.accessToken;
	self.oauth2.get( redditUrl, keys.accessToken, 
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
module.exports = exports = RedditUserProfileProducer; 
