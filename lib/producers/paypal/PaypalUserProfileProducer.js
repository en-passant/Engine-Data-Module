var base = require( '../ProducerBase.js' );

function PaypalUserProfileProducer() {
    base.init( this );
    var OAuth2 = require( 'oauth' ).OAuth2;

    this.oauth2 = new OAuth2( 
        engine.config.paypal.clientID, 
        engine.config.paypal.clientSecret, 
        "https://api.singly.com", "/oauth/authenticate", "/oauth/access_token" );
}
base.inherit( PaypalUserProfileProducer );

PaypalUserProfileProducer.prototype.getMatchPatterns = function() {
    return [ '^acct:paypal:[0-9]+', '/user/[0-9]+' ];
}
PaypalUserProfileProducer.prototype.attemptRequest = function( uri, owner, source, resource, keys, callback ) {
    var self = this;
    var paypalUrl = ' https://api.singly.com/services/paypal/self?access_token=' + keys.accessToken;
	self.oauth2.get( paypalUrl, keys.accessToken, 
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
module.exports = exports = PaypalUserProfileProducer;
