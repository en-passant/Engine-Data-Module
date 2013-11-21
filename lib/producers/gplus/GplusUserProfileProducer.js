var base = require( '../ProducerBase.js' );

function GplusUserProfileProducer() {
    base.init( this );
    var OAuth2 = require( 'oauth' ).OAuth2;

    this.oauth2 = new OAuth2( 
        engine.config.gplus.clientID, 
        engine.config.gplus.clientSecret, 
        "https://api.singly.com", "/oauth/authenticate", "/oauth/access_token" );
}
base.inherit( GplusUserProfileProducer );

GplusUserProfileProducer.prototype.getMatchPatterns = function() {
    return [ '^acct:gplus:[0-9]+', '/user/[0-9]+' ];
}
GplusUserProfileProducer.prototype.attemptRequest = function( uri, owner, source, resource, keys, callback ) {
    var self = this;

    var gplusUrl = ' https://api.singly.com/services/gplus/self?access_token=' + keys.accessToken;
	self.oauth2.get( gplusUrl, keys.accessToken, 
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
module.exports = exports = GplusUserProfileProducer;
