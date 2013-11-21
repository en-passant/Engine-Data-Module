var base = require( '../GoogleProducerBase' );
function GoogleCalendarsCalendarListProducer() {
	base.init( this, 'googlecalendars' );
}
base.inherit( GoogleCalendarsCalendarListProducer );

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