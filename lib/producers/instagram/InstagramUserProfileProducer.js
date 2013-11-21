var base = require( '../ProducerBase.js' );

function InstagramUserProfileProducer() {
    base.init( this );
    var OAuth2 = require( 'oauth' ).OAuth2;

    this.oauth2 = new OAuth2( 
        engine.config.instagram.clientID, 
        engine.config.instagram.clientSecret, 
        "https://api.singly.com", "/oauth/authenticate", "/oauth/access_token" );
}
base.inherit( InstagramUserProfileProducer );

InstagramUserProfileProducer.prototype.getMatchPatterns = function() {
    return [ '^acct:instagram:[0-9]+', '/user/[0-9]+' ];
}
InstagramUserProfileProducer.prototype.attemptRequest = function( uri, owner, source, resource, keys, callback ) {
    var self = this;
    var instagramUrl = ' https://api.singly.com/proxy/instagram/users/self?access_token=' + keys.accessToken;
	self.oauth2.get( instagramUrl, keys.accessToken, 
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
module.exports = exports = InstagramUserProfileProducer;
