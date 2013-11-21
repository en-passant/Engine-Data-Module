var Moment = require( 'moment' );
function GoogleCalendarsEventTranslator() {	
}
GoogleCalendarsEventTranslator.prototype.getMatchPatterns = function() {
	return [ '^acct:googlecalendars:[0-9]+', '/calendar/[^_].*/event/(?!_index)(.*)$' ];
}
GoogleCalendarsEventTranslator.prototype.translate = function( uri, owner, rawDoc, callback ) {
	try {
		var parsedEvent = JSON.parse( rawDoc.data );

		var result = {
			'id': parsedEvent.id,
			'status': parsedEvent.status,
			'summary': parsedEvent.summary,
			'start': Moment( parsedEvent.start.dateTime ),
			'end': Moment( parsedEvent.end.dateTime ),
		};

		var parsedUri = uri.match( /[^:]*:\/\/.*\/\/@[^\/]*\/calendar\/[^_].*\/event/ );
		var userId = parsedUri[2];
		var source = parsedUri[3];
		var resource = parsedUri[4];

		var outputData = {
			'sourceUri': uri.match( /[^:]*:\/\/.*\/\/@[^\/]*\/calendar\/[^_].*\/event/ ) + '/_index',
			'uri': uri,
			'owner': owner,
			'category': 'event', 
			'data': result,
			'time': Moment( parsedEvent.updated ).valueOf() 
		};

		NLPService.addAnalysisIfMissing( outputData, function( error, result ) {
   			if( !error )
   			{
				EventService.emit( "document::translated", result );
   			}
        	process.nextTick( function() {
        		callback( error, result.data );
        	});
   		});
	} catch( err ) {
		SystemLog.log('Request timed out at document translation. /n [' + uri + ']', err);
                callback( Error( err ), null );
	}
}
module.exports = exports = GoogleCalendarsEventTranslator;
