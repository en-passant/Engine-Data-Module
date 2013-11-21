var base = require( '../ProducerBase.js' );

function YoutubeUserProfileProducer() {
    base.init( this );
    var OAuth2 = require( 'oauth' ).OAuth2;

    this.oauth2 = new OAuth2( 
        engine.config.youtube.clientID, 
        engine.config.youtube.clientSecret, 
        "https://api.singly.com", "/oauth/authenticate", "/oauth/access_token" );
}
base.inherit( YoutubeUserProfileProducer );

YoutubeUserProfileProducer.prototype.getMatchPatterns = function() {
    return [ '^acct:youtube:[A-Za-z0-9\-]+', '/user/[A-Za-z0-9\-]+' ];
}
YoutubeUserProfileProducer.prototype.attemptRequest = function( uri, owner, source, resource, keys, callback ) {
    var self = this;
    var youtubeUrl = ' https://api.singly.com/services/youtube/self?access_token=' + keys.accessToken;
	self.oauth2.get( youtubeUrl, keys.accessToken, 
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
module.exports = exports = YoutubeUserProfileProducer;

