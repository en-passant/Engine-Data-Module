var base = require( '../GoogleProducerBase' );
function GoogleCalendarsUserProfileProducer( fetcher ) {
	this.fetcher = fetcher;
	base.init( this );
}
base.inherit( GoogleCalendarsUserProfileProducer );

GoogleCalendarsUserProfileProducer.prototype.init = function( done ) {
	var self = this;
	this.fetcher.tokenStore.getApplicationTokens( 'googlecalendars', function( error, tokens ) {
		if( error ) {
			done( error );
		}
		else
		{
			var OAuth = require( 'oauth' ).OAuth;
			self.oauth = new OAuth2( 
				tokens.clientID, 
				tokens.clientSecret,
				'https://accounts.google.com', 
				'/o/oauth2/auth', 
				'/o/oauth2/token' );
			done();
		}
	} );
}
GoogleCalendarsUserProfileProducer.prototype.getMatchPatterns = function() {
	return [ '^acct:googlecalendars:[0-9]+', '/user/[0-9]+' ];
}
GoogleCalendarsUserProfileProducer.prototype.getDataUrl = function( resource ) {
	return 'https://www.googleapis.com/oauth2/v1/userinfo';
}
GoogleCalendarsUserProfileProducer.prototype.processData = function( uri, owner, source, resource, data, callback ) {
	var desiredUserId = resource.match( /^\/user\/([0-9]+)/ )[1];

	try {
		if( desiredUserId != JSON.parse( data ).id )
		{
			callback( new Error( 'GoogleCalendarsUserProfileProducer only supports getting the user profile of the logged in user, currently.' ), null );
		}
		else
		{
			var result = {
				'uri': uri,
				'data': data
			};
			callback( null, result );

		}
	} catch( error ) {
		callback( error, null );		
	}
}

module.exports = exports = GoogleCalendarsUserProfileProducer;