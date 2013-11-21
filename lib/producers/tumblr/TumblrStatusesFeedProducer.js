var base = require( '../ProducerBase.js' );

function TumblrStatusesFeedProducer() {
    base.init( this );
    var OAuth2 = require( 'oauth' ).OAuth2;

    this.oauth2 = new OAuth2( 
        engine.config.tumblr.clientID, 
        engine.config.tumblr.clientSecret, 
        "https://api.singly.com", "/oauth/authenticate", "/oauth/access_token" );
}
base.inherit( TumblrStatusesFeedProducer );

TumblrStatusesFeedProducer.prototype.getMatchPatterns = function() {
   return [ '^acct:tumblr:[A-Za-z0-9\-]+', '/fstatuses' ];
}
TumblrStatusesFeedProducer.prototype.attemptRequest = function( uri, owner, source, resource, keys, callback ) {
    var self = this;
    var tumblrUrl = ' https://api.singly.com/types/statuses_feed?limit=9999&services=tumblr&access_token=' + keys.accessToken;
	self.oauth2.get( tumblrUrl, keys.accessToken, 
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
module.exports = exports = TumblrStatusesFeedProducer;
