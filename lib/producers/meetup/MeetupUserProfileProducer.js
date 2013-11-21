var base = require( '../ProducerBase.js' );

function MeetupUserProfileProducer() {
    base.init( this );
    var OAuth2 = require( 'oauth' ).OAuth2;

    this.oauth2 = new OAuth2( 
        engine.config.meetup.clientID, 
        engine.config.meetup.clientSecret, 
        "https://api.singly.com", "/oauth/authenticate", "/oauth/access_token" );
}
base.inherit( MeetupUserProfileProducer );

MeetupUserProfileProducer.prototype.getMatchPatterns = function() {
    return [ '^acct:meetup:[0-9]+', '/user/[0-9]+' ];
}
MeetupUserProfileProducer.prototype.attemptRequest = function( uri, owner, source, resource, keys, callback ) {
    var self = this;
    var meetupUrl = ' https://api.singly.com/services/meetup/self?access_token=' + keys.accessToken;
	self.oauth2.get( meetupUrl, keys.accessToken, 
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
module.exports = exports = MeetupUserProfileProducer;
