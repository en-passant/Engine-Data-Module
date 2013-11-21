function GoogleCalendarsUserProfileTranslator() {	
}
GoogleCalendarsUserProfileTranslator.prototype.getMatchPatterns = function() {
	return [ '^acct:googlecalendars:[0-9]+', '/calendar/_index' ];
}
GoogleCalendarsUserProfileTranslator.prototype.translate = function( uri, owner, rawDoc, callback ) {
	try {
			var parsedList = JSON.parse( rawDoc.data );

			var ids = new Array();

			for( var i in parsedList.items )
			{
				if( parsedList.items[i].kind == 'calendar#calendarListEntry' )
					ids.push( parsedList.items[i].id );
			}

			var outputData = {
				'uri': uri,
				'owner': owner,
				'category': 'eventGroupList',
				'data': ids
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
module.exports = exports = GoogleCalendarsUserProfileTranslator;
