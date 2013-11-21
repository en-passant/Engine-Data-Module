var base = require( '../ProducerBase.js' );

function ShutterflyUserProfileProducer() {
    base.init( this );
    var OAuth2 = require( 'oauth' ).OAuth2;

    this.oauth2 = new OAuth2( 
        engine.config.shutterfly.clientID, 
        engine.config.shutterfly.clientSecret, 
        "https://api.singly.com", "/oauth/authenticate", "/oauth/access_token" );
}
base.inherit( ShutterflyUserProfileProducer );

ShutterflyUserProfileProducer.prototype.getMatchPatterns = function() {
    return [ '^acct:shutterfly:[A-Za-z0-9]+', '/user/[A-Za-z0-9]+' ];
}
ShutterflyUserProfileProducer.prototype.attemptRequest = function( uri, owner, source, resource, keys, callback ) {
    var self = this;
    var shutterflyUrl = ' https://api.singly.com/services/shutterfly/self?access_token=' + keys.accessToken;
	self.oauth2.get( shutterflyUrl, keys.accessToken, 
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
module.exports = exports = ShutterflyUserProfileProducer; 
