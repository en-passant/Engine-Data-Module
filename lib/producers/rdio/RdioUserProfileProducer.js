var base = require( '../ProducerBase.js' );

function RdioUserProfileProducer() {
    base.init( this );
    var OAuth2 = require( 'oauth' ).OAuth2;

    this.oauth2 = new OAuth2( 
        engine.config.rdio.clientID, 
        engine.config.rdio.clientSecret, 
        "https://api.singly.com", "/oauth/authenticate", "/oauth/access_token" );
}
base.inherit( RdioUserProfileProducer );

RdioUserProfileProducer.prototype.getMatchPatterns = function() {
    return [ '^acct:rdio:[A-Za-z0-9]+', '/user/[A-Za-z0-9]+' ];
}
RdioUserProfileProducer.prototype.attemptRequest = function( uri, owner, source, resource, keys, callback ) {
    var self = this;
    var rdioUrl = ' https://api.singly.com/services/rdio/self?access_token=' + keys.accessToken;
	self.oauth2.get( rdioUrl, keys.accessToken, 
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
module.exports = exports = RdioUserProfileProducer;
