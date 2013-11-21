function BrowserGeographicLocationTranslator() {
}
BrowserGeographicLocationTranslator.prototype.getMatchPatterns = function() {
	return [ '^browser', '/browserLocation' ];
}
BrowserGeographicLocationTranslator.prototype.translate = function( sourceUri, owner, rawDoc, callback ) {
	var newUri = 'ldengine://' + owner + '//@acct:engine' + '/location/' + rawDoc.data.data.timestamp;

	var translatedPosition = {
		'id': newUri,
		'latitude': rawDoc.data.data.coords.latitude,
		'longitude': rawDoc.data.data.coords.longitude
	};
	var outputData = {
		'sourceUri': sourceUri,
		'uri': newUri,
		'owner': owner,
		'category': 'location',
		'data': translatedPosition,
		'time': Date.now()
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
}
module.exports = exports = BrowserGeographicLocationTranslator;
