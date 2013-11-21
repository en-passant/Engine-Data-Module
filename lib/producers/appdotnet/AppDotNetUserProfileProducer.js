var base = require( '../ProducerBase.js' );
function AppDotNetUserProfileProducer() {
    base.init( this );
    var OAuth2 = require( 'oauth' ).OAuth2;

    this.oauth2 = new OAuth2( 
        engine.config.appdotnet.clientID, 
        engine.config.appdotnet.clientSecret, 
        "https://alpha.app.net", "/oauth/authenticate", "/oauth/access_token" );
}
base.inherit( AppDotNetUserProfileProducer );

AppDotNetUserProfileProducer.prototype.getMatchPatterns = function() {
    return [ '^acct:appdotnet:[0-9]+', '/user/[0-9]+' ];
}
AppDotNetUserProfileProducer.prototype.attemptRequest = function( uri, owner, source, resource, keys, callback ) {
    var userID = resource.match(/^\/user\/([0-9]+)/)[1];
    var appdotnetUrl = ' https://alpha-api.app.net/stream/0/users/' + userID;
	this.oauth2.get( appdotnetUrl, keys.accessToken, 
       function( error, data ) {
            if( error )
                callback( error, null );
            else
                callback( null, {
                    'uri': uri,
                    'data': data
                });
        } 
     );
};
module.exports = exports = AppDotNetUserProfileProducer;
