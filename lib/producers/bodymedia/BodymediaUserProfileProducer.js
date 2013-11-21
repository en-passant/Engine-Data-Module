var base = require( '../ProducerBase.js' );

function BodymediaUserProfileProducer() {
    base.init( this );
    var OAuth2 = require( 'oauth' ).OAuth2;

    this.oauth2 = new OAuth2( 
        engine.config.bodymedia.clientID, 
        engine.config.bodymedia.clientSecret, 
        "https://api.singly.com", "/oauth/authenticate", "/oauth/access_token" );
}
base.inherit( BodymediaUserProfileProducer );

BodymediaUserProfileProducer.prototype.getMatchPatterns = function() {
    return [ '^acct:bodymedia:[0-9]+', '/user/[0-9]+' ];
}
BodymediaUserProfileProducer.prototype.attemptRequest = function( uri, owner, source, resource, keys, callback ) {
    var self = this;
    var bodymediaUrl = ' https://api.singly.com/services/bodymedia/self?access_token=' + keys.accessToken;
	self.oauth2.get( bodymediaUrl, keys.accessToken, 
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
module.exports = exports = BodymediaUserProfileProducer;
