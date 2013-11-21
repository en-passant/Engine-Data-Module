var base = require( '../GoogleProducerBase' );
function GoogleCalendarsUserProfileProducer() {
	base.init( this, 'googlecalendars' );
}
base.inherit( GoogleCalendarsUserProfileProducer );

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
		SystemLog.log( 'Could not parse: ' + data, error );
		callback( error, null );		
	}
}

module.exports = exports = GoogleCalendarsUserProfileProducer;