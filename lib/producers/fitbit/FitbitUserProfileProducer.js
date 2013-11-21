var base = require( '../ProducerBase.js' );

function FitbitUserProfileProducer() {
    base.init( this );
    var OAuth2 = require( 'oauth' ).OAuth2;

    this.oauth2 = new OAuth2( 
        engine.config.fitbit.clientID, 
        engine.config.fitbit.clientSecret, 
        "https://api.singly.com", "/oauth/authenticate", "/oauth/access_token" );
}
base.inherit( FitbitUserProfileProducer );

FitbitUserProfileProducer.prototype.getMatchPatterns = function() {
     return [ '^acct:fitbit:[0-9]+', '/user/[0-9]+' ];
}
FitbitUserProfileProducer.prototype.attemptRequest = function( uri, owner, source, resource, keys, callback ) {
    var self = this;
    var fitbitUrl = ' https://api.singly.com/services/fitbit/self?access_token=' + keys.accessToken;
	self.oauth2.get( fitbitUrl, keys.accessToken, 
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
module.exports = exports = FitbitUserProfileProducer;
