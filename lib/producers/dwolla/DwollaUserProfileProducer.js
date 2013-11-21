var base = require( '../ProducerBase.js' );

function DwollaUserProfileProducer() {
    base.init( this );
    var OAuth2 = require( 'oauth' ).OAuth2;

    this.oauth2 = new OAuth2( 
        engine.config.dwolla.clientID, 
        engine.config.dwolla.clientSecret, 
        "https://api.singly.com", "/oauth/authenticate", "/oauth/access_token" );
}
base.inherit( DwollaUserProfileProducer );

DwollaUserProfileProducer.prototype.getMatchPatterns = function() {
    return [ '^acct:dwolla:[0-9]+', '/user/[0-9]+' ];
}
DwollaUserProfileProducer.prototype.attemptRequest = function( uri, owner, source, resource, keys, callback ) {
    var self = this;
    var dwollaUrl = ' https://api.singly.com/services/dwolla/self?access_token=' + keys.accessToken;
	self.oauth2.get( dwollaUrl, keys.accessToken, 
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
module.exports = exports = DwollaUserProfileProducer;
