var base = require( '../GoogleProducerBase' );
function GoogleCalendarsCalendarListProducer( fetcher ) {
	this.fetcher = fetcher;
	base.init( this );
}
base.inherit( GoogleCalendarsCalendarListProducer );

GoogleCalendarsCalendarListProducer.prototype.init = function( done ) {
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
GoogleCalendarsCalendarListProducer.prototype.getMatchPatterns = function() {
	return [ '^acct:googlecalendars:[0-9]+', '/calendar/_index' ];
}
GoogleCalendarsCalendarListProducer.prototype.getDataUrl = function( resource ) {
	return 'https://www.googleapis.com/calendar/v3/users/me/calendarList';
}
GoogleCalendarsCalendarListProducer.prototype.processData = function( uri, owner, source, resource, data, callback ) {

	var result = {
		'uri': uri,
		'data': data
	};
	callback( null, result );

}

module.exports = exports = GoogleCalendarsCalendarListProducer;