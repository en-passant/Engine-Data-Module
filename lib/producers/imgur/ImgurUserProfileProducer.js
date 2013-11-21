var base = require( '../ProducerBase.js' );

function ImgurUserProfileProducer() {
    base.init( this );
    var OAuth2 = require( 'oauth' ).OAuth2;

    this.oauth2 = new OAuth2( 
        engine.config.imgur.clientID, 
        engine.config.imgur.clientSecret, 
        "https://api.singly.com", "/oauth/authenticate", "/oauth/access_token" );
}
base.inherit( ImgurUserProfileProducer );

ImgurUserProfileProducer.prototype.getMatchPatterns = function() {
    return [ '^acct:imgur:[A-Za-z0-9]+', '/user/[A-Za-z0-9]+' ];
}
ImgurUserProfileProducer.prototype.attemptRequest = function( uri, owner, source, resource, keys, callback ) {
    var self = this;
    var imgurUrl = ' https://api.singly.com/services/imgur/self?access_token=' + keys.accessToken;
	self.oauth2.get( imgurUrl, keys.accessToken, 
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
module.exports = exports = ImgurUserProfileProducer; 
