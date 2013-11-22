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
	        	process.nextTick( function() {
            		callback( error, result.data );
	        	});
	   		});
		} catch( err ) {
   		 callback( Error( err ), null );
	}
}
module.exports = exports = GoogleCalendarsUserProfileTranslator;
