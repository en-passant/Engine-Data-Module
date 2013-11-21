var base = require( '../ProducerBase.js' );

function GdocsUserProfileProducer() {
    base.init( this );
    var OAuth2 = require( 'oauth' ).OAuth2;

    this.oauth2 = new OAuth2( 
        engine.config.gdocs.clientID, 
        engine.config.gdocs.clientSecret, 
        "https://api.singly.com", "/oauth/authenticate", "/oauth/access_token" );
}
base.inherit( GdocsUserProfileProducer );

GdocsUserProfileProducer.prototype.getMatchPatterns = function() {
    return [ '^acct:gdocs:[A-Za-z0-9\.\@\%]+', '/user/[A-Za-z0-9\.\@\%]+' ];
}
GdocsUserProfileProducer.prototype.attemptRequest = function( uri, owner, source, resource, keys, callback ) {
    var self = this;
    var gdocsUrl = ' https://api.singly.com/services/gdocs/self?access_token=' + keys.accessToken;
	self.oauth2.get( gdocsUrl, keys.accessToken, 
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
module.exports = exports = GdocsUserProfileProducer;
