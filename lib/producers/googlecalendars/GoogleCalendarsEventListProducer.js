var Moment = require( 'moment' );

var base = require( '../GoogleProducerBase' );
function GoogleCalendarsEventListProducer( fetcher ) {
	this.fetcher = fetcher;
	base.init( this );
}
base.inherit( GoogleCalendarsEventListProducer );

GoogleCalendarsEventListProducer.prototype.init = function( done ) {
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
GoogleCalendarsEventListProducer.prototype.getMatchPatterns = function() {
	return [ '^acct:googlecalendars:[0-9]+', '/calendar/[^_].*/event/_index' ];
}
GoogleCalendarsEventListProducer.prototype.getDataUrl = function( resource ) {

	var sinceMatch = resource.match( '[?&]since=([0-9]+)' );
	var since = null;
	if( sinceMatch != null )
		since = parseInt( sinceMatch[1] );

	var calendarId = resource.match( /\/calendar\/([^_].*)\/event\/_index/ )[1];

	var url = 'https://www.googleapis.com/calendar/v3/calendars/' + encodeURIComponent( calendarId ) + '/events?orderBy=updated' ;
	if( since )
	{
		var parsedSince = Moment( since );
		url += '&updatedMin=' + parsedSince.format();
	}

	return url;
}
GoogleCalendarsEventListProducer.prototype.processData = function( uri, owner, source, resource, data, callback ) {
	var result = {
		'uri': uri,
		'data': data
	};
	callback( null, result );

}

module.exports = exports = GoogleCalendarsEventListProducer;
