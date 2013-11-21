var base = require( '../ProducerBase.js' );

function ToutUserProfileProducer() {
    base.init( this );
    var OAuth2 = require( 'oauth' ).OAuth2;

    this.oauth2 = new OAuth2( 
        engine.config.tout.clientID, 
        engine.config.tout.clientSecret, 
        "https://api.singly.com", "/oauth/authenticate", "/oauth/access_token" );
}
base.inherit( ToutUserProfileProducer );

ToutUserProfileProducer.prototype.getMatchPatterns = function() {
    return [ '^acct:tout:[A-Za-z0-9]+', '/user/[A-Za-z0-9]+' ];
}
ToutUserProfileProducer.prototype.attemptRequest = function( uri, owner, source, resource, keys, callback ) {
    var self = this;
    var toutUrl = ' https://api.singly.com/proxy/tout/me?access_token=' + keys.accessToken;
    self.oauth2.get( toutUrl, keys.accessToken, 
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
module.exports = exports = ToutUserProfileProducer;
