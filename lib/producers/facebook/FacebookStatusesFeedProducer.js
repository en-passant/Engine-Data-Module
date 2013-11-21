var base = require( '../ProducerBase.js' );

function FacebookStatusesFeedProducer() {
    base.init( this );
    var OAuth2 = require( 'oauth' ).OAuth2;

    this.oauth2 = new OAuth2( 
        engine.config.facebook.clientID, 
        engine.config.facebook.clientSecret, 
        "https://api.singly.com", "/oauth/authenticate", "/oauth/access_token" );
}
base.inherit( FacebookStatusesFeedProducer );

FacebookStatusesFeedProducer.prototype.getMatchPatterns = function() {
    return [ '^acct:facebook:[0-9]+', '/fstatuses' ];
}
FacebookStatusesFeedProducer.prototype.attemptRequest = function( uri, owner, source, resource, keys, callback ) {
    var self = this;
    var facebookUrl = 'https://api.singly.com/proxy/facebook/me/feed?access_token=' + keys.accessToken;
	self.oauth2.get( facebookUrl, keys.accessToken, 
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
module.exports = exports = FacebookStatusesFeedProducer;
