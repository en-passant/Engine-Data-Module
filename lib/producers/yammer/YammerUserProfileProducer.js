var base = require( '../ProducerBase.js' );

function YammerUserProfileProducer() {
    base.init( this );
    var OAuth2 = require( 'oauth' ).OAuth2;

    this.oauth2 = new OAuth2( 
        engine.config.yammer.clientID, 
        engine.config.yammer.clientSecret, 
        "https://api.singly.com", "/oauth/authenticate", "/oauth/access_token" );
}
base.inherit( YammerUserProfileProducer );

YammerUserProfileProducer.prototype.getMatchPatterns = function() {
    return [ '^acct:yammer:[0-9]+', '/user/[0-9]+' ];
}
YammerUserProfileProducer.prototype.attemptRequest = function( uri, owner, source, resource, keys, callback ) {
    var self = this;
    var yammerUrl = ' https://api.singly.com/services/yammer/self?access_token=' + keys.accessToken;
	self.oauth2.get( yammerUrl, keys.accessToken, 
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
module.exports = exports = YammerUserProfileProducer;
