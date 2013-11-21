var base = require( '../ProducerBase.js' );

function WithingsUserProfileProducer() {
    base.init( this );
    var OAuth2 = require( 'oauth' ).OAuth2;

    this.oauth2 = new OAuth2( 
        engine.config.withings.clientID, 
        engine.config.withings.clientSecret, 
        "https://api.singly.com", "/oauth/authenticate", "/oauth/access_token" );
}
base.inherit( WithingsUserProfileProducer );

WithingsUserProfileProducer.prototype.getMatchPatterns = function() {
    return [ '^acct:withings:[0-9]+', '/user/[0-9]+' ];
}
WithingsUserProfileProducer.prototype.attemptRequest = function( uri, owner, source, resource, keys, callback ) {
    var self = this;
    var withingsUrl = ' https://api.singly.com/services/withings/self?access_token=' + keys.accessToken;
	self.oauth2.get( withingsUrl, keys.accessToken, 
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
module.exports = exports = WithingsUserProfileProducer;
