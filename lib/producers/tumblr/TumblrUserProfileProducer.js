var base = require( '../ProducerBase.js' );

function TumblrUserProfileProducer() {
    base.init( this );
    var OAuth2 = require( 'oauth' ).OAuth2;

    this.oauth2 = new OAuth2( 
        engine.config.tumblr.clientID,
        engine.config.tumblr.clientSecret, 
        "https://api.singly.com", "/oauth/authenticate", "/oauth/access_token" );
}
base.inherit( TumblrUserProfileProducer );

TumblrUserProfileProducer.prototype.getMatchPatterns = function() {
    return [ '^acct:tumblr:([A-Za-z0-9\-].*)', '/user/([A-Za-z0-9\-].*)'];
}
TumblrUserProfileProducer.prototype.attemptRequest = function( uri, owner, source, resource, keys, callback ) {
    var self = this;
    var https = require('https');
    var userID = resource.match(/^\/user\/([A-Za-z0-9\-].*)/)[1];
    var tumblrUrlProfile = 'https://api.singly.com/proxy/tumblr/user/info?access_token=' + keys.accessToken;
    var tumblrUrlAvatar = 'http://api.tumblr.com/v2/blog/' + userID + '.tumblr.com/avatar/30'; 	    
	self.oauth2.get( tumblrUrlProfile, keys.accessToken, 
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
module.exports = exports = TumblrUserProfileProducer;
