var base = require( '../ProducerBase.js' );

function RunkeeperUserProfileProducer() {
    base.init( this );
    var OAuth2 = require( 'oauth' ).OAuth2;

    this.oauth2 = new OAuth2( 
        engine.config.runkeeper.clientID, 
        engine.config.runkeeper.clientSecret, 
        "https://api.singly.com", "/oauth/authenticate", "/oauth/access_token" );
}
base.inherit( RunkeeperUserProfileProducer );

RunkeeperUserProfileProducer.prototype.getMatchPatterns = function() {
    return [ '^acct:runkeeper:[0-9]+', '/user/[0-9]+' ];
}
RunkeeperUserProfileProducer.prototype.attemptRequest = function( uri, owner, source, resource, keys, callback ) {
    var self = this;
    var runkeeperUrl = ' https://api.singly.com/services/runkeeper/self?access_token=' + keys.accessToken;
	self.oauth2.get( runkeeperUrl, keys.accessToken, 
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
module.exports = exports = RunkeeperUserProfileProducer; 
