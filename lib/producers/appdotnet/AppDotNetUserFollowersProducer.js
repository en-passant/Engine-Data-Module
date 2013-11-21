var base = require( '../ProducerBase.js' );
function AppDotNetUserFollowersProducer() {
    base.init( this );
    var OAuth2 = require( 'oauth' ).OAuth2;

    this.oauth2 = new OAuth2( 
        engine.config.appdotnet.clientID, 
        engine.config.appdotnet.clientSecret, 
        "https://alpha.app.net", "/oauth/authenticate", "/oauth/access_token" );
}
base.inherit( AppDotNetUserFollowersProducer );

AppDotNetUserFollowersProducer.prototype.getMatchPatterns = function() {
    return [ '^acct:appdotnet:[0-9]+', '/user/followers' ];
}
AppDotNetUserFollowersProducer.prototype.attemptRequest = function( uri, owner, source, resource, keys, callback ) {
    var self = this;
    var appdotnetUrl = ' https://alpha-api.app.net/stream/0/users/me/followers';
	self.oauth2.get( appdotnetUrl, keys.accessToken, 
        function( error, data ) {
            if( error )
                callback( error, null );
            else
                callback( null, {
                    'uri': uri,
                    'data': data
                });
        } );
};
module.exports = exports = AppDotNetUserFollowersProducer;
