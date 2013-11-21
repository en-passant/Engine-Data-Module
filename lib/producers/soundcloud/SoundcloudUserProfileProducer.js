var base = require( '../ProducerBase.js' );

function SoundcloudUserProfileProducer() {
    base.init( this );
    var OAuth2 = require( 'oauth' ).OAuth2;

    this.oauth2 = new OAuth2( 
        engine.config.soundcloud.clientID, 
        engine.config.soundcloud.clientSecret, 
        "https://api.singly.com", "/oauth/authenticate", "/oauth/access_token" );
}
base.inherit( SoundcloudUserProfileProducer );

SoundcloudUserProfileProducer.prototype.getMatchPatterns = function() {
    return [ '^acct:soundcloud:[0-9]+', '/user/[0-9]+' ];
}
SoundcloudUserProfileProducer.prototype.attemptRequest = function( uri, owner, source, resource, keys, callback ) {
    var self = this;
    var soundcloudUrl = ' https://api.singly.com/services/soundcloud/self?access_token=' + keys.accessToken;
	self.oauth2.get( soundcloudUrl, keys.accessToken, 
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
module.exports = exports = SoundcloudUserProfileProducer;
