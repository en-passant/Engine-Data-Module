var base = require( '../ProducerBase.js' );

function ZeoUserProfileProducer() {
    base.init( this );
    var OAuth2 = require( 'oauth' ).OAuth2;

    this.oauth2 = new OAuth2( 
        engine.config.zeo.clientID, 
        engine.config.zeo.clientSecret, 
        "https://api.singly.com", "/oauth/authenticate", "/oauth/access_token" );
}
base.inherit( ZeoUserProfileProducer );

ZeoUserProfileProducer.prototype.getMatchPatterns = function() {
    return [ '^acct:zeo:[0-9]+', '/user/[0-9]+' ];
}
ZeoUserProfileProducer.prototype.attemptRequest = function( uri, owner, source, resource, keys, callback ) {
    var self = this;
    var zeoUrl = ' https://api.singly.com/services/zeo/self?access_token=' + keys.accessToken;
	self.oauth2.get( zeoUrl, keys.accessToken, 
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
module.exports = exports = ZeoUserProfileProducer;
