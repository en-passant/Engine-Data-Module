var base = require( '../ProducerBase.js' );

function WordpressUserProfileProducer() {
    base.init( this );
    var OAuth2 = require( 'oauth' ).OAuth2;

    this.oauth2 = new OAuth2( 
        engine.config.wordpress.clientID, 
        engine.config.wordpress.clientSecret, 
        "https://api.singly.com", "/oauth/authenticate", "/oauth/access_token" );
}
base.inherit( WordpressUserProfileProducer );

WordpressUserProfileProducer.prototype.getMatchPatterns = function() {
    return [ '^acct:wordpress:[0-9]+', '/user/[0-9]+' ];
}
WordpressUserProfileProducer.prototype.attemptRequest = function( uri, owner, source, resource, keys, callback ) {
    var self = this;
    var wordpressUrl = ' https://api.singly.com/services/wordpress/self?access_token=' + keys.accessToken;
	self.oauth2.get( wordpressUrl, keys.accessToken, 
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
module.exports = exports = WordpressUserProfileProducer;
