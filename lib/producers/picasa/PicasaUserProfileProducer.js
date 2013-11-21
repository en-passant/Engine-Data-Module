var base = require( '../ProducerBase.js' );

function PicasaUserProfileProducer() {
    base.init( this );
    var OAuth2 = require( 'oauth' ).OAuth2;

    this.oauth2 = new OAuth2( 
        engine.config.picasa.clientID, 
        engine.config.picasa.clientSecret, 
        "https://api.singly.com", "/oauth/authenticate", "/oauth/access_token" );
}
base.inherit( PicasaUserProfileProducer );

PicasaUserProfileProducer.prototype.getMatchPatterns = function() {
    return [ '^acct:picasa:[0-9]+', '/user/[0-9]+' ];
}
PicasaUserProfileProducer.prototype.attemptRequest = function( uri, owner, source, resource, keys, callback ) {
    var self = this;
    var picasaUrl = ' https://api.singly.com/services/picasa/self?access_token=' + keys.accessToken;
	self.oauth2.get( picasaUrl, keys.accessToken, 
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
module.exports = exports = PicasaUserProfileProducer;
