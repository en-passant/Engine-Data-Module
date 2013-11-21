var base = require( '../ProducerBase.js' );

function FacebookNewsFeedProducer() {
    base.init( this );
    var OAuth2 = require( 'oauth' ).OAuth2;

    this.oauth2 = new OAuth2( 
        engine.config.facebook.clientID, 
        engine.config.facebook.clientSecret, 
        "https://api.singly.com", "/oauth/authenticate", "/oauth/access_token" );
}
base.inherit( FacebookNewsFeedProducer );

FacebookNewsFeedProducer.prototype.getMatchPatterns = function() {
   return [ '^acct:facebook:[0-9]+', '.*/fnews' ];
}
FacebookNewsFeedProducer.prototype.attemptRequest = function( uri, owner, source, resource, keys, callback ) {
    var self = this;
    var facebookUrl = 'https://api.singly.com/proxy/facebook/me/home?access_token=' + keys.accessToken;
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
module.exports = exports = FacebookNewsFeedProducer;
