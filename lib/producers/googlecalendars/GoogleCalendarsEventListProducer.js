var Moment = require( 'moment' );

var base = require( '../GoogleProducerBase' );
function GoogleCalendarsEventListProducer() {
	base.init( this, 'googlecalendars' );
}
base.inherit( GoogleCalendarsEventListProducer );

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
