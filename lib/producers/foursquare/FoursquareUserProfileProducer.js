var base = require( '../ProducerBase.js' );

function FoursquareUserProfileProducer() {
    base.init( this );
    var OAuth2 = require( 'oauth' ).OAuth2;

    this.oauth2 = new OAuth2( 
        engine.config.foursquare.clientID, 
        engine.config.foursquare.clientSecret, 
        "https://api.singly.com", "/oauth/authenticate", "/oauth/access_token" );
}
base.inherit( FoursquareUserProfileProducer );

FoursquareUserProfileProducer.prototype.getMatchPatterns = function() {
    return [ '^acct:foursquare:[0-9]+', '/user/[0-9]+' ];
}
FoursquareUserProfileProducer.prototype.attemptRequest = function( uri, owner, source, resource, keys, callback ) {
    var self = this;
    var foursquareUrl = ' https://api.singly.com/services/foursquare/self?access_token=' + keys.accessToken;
	self.oauth2.get( foursquareUrl, keys.accessToken, 
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
module.exports = exports = FoursquareUserProfileProducer;
