var base = require( '../ProducerBase.js' );

function DropboxUserProfileProducer() {
    base.init( this );
    var OAuth2 = require( 'oauth' ).OAuth2;

    this.oauth2 = new OAuth2( 
        engine.config.dropbox.clientID, 
        engine.config.dropbox.clientSecret, 
        "https://api.singly.com", "/oauth/authenticate", "/oauth/access_token" );
}
base.inherit( DropboxUserProfileProducer );

DropboxUserProfileProducer.prototype.getMatchPatterns = function() {
    return [ '^acct:dropbox:[0-9]+', '/user/[0-9]+' ];
}
DropboxUserProfileProducer.prototype.attemptRequest = function( uri, owner, source, resource, keys, callback ) {
    var self = this;

    var dropboxUrl = ' https://api.singly.com/services/dropbox/self?access_token=' + keys.accessToken;
	self.oauth2.get( dropboxUrl, keys.accessToken, 
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
module.exports = exports = DropboxUserProfileProducer;
