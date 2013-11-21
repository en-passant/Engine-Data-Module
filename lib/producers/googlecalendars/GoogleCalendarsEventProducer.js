var base = require( '../GoogleProducerBase' );
function GoogleCalendarsEventProducer() {
	base.init( this, 'googlecalendars' );
}
base.inherit( GoogleCalendarsEventProducer );

GoogleCalendarsEventProducer.prototype.getMatchPatterns = function() {

	return [ '^acct:googlecalendars:[0-9]+', '/calendar/[^_].*/event/(?!_index)(.*)$' ];
}
GoogleCalendarsEventProducer.prototype.getDataUrl = function( resource ) {
	var parsedResource = resource.match( /\/calendar\/([^_].*)\/event\/(?!_index)(.*)$/ );
	return 'https://www.googleapis.com/calendar/v3/calendars/' + encodeURIComponent( parsedResource[1] ) + '/events/' + parsedResource[2];
}
GoogleCalendarsEventProducer.prototype.processData = function( uri, owner, source, resource, data, callback ) {

	var result = {
		'uri': uri,
		'data': data
	};
	callback( null, result );

}

module.exports = exports = GoogleCalendarsEventProducer;
