function GoogleCalendarsEventListTranslator() {	
}
GoogleCalendarsEventListTranslator.prototype.getMatchPatterns = function() {
	return [ '^acct:googlecalendars:[0-9]+', '/calendar/[^_].*/event/_index' ];
}
GoogleCalendarsEventListTranslator.prototype.translate = function( uri, owner, rawDoc, callback ) {
	try {
		var parsedEventList = JSON.parse( rawDoc.data );

		var eventIdList = new Array();

		for( var i in parsedEventList.items )
		{
			if( parsedEventList.items[i].kind == 'calendar#event' )
				eventIdList.push( parsedEventList.items[i].id );
		}

		var outputData = {
			'uri': uri,
			'owner': owner,
			'category': 'eventGroup',
			'data': eventIdList
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
module.exports = exports = GoogleCalendarsEventListTranslator;
