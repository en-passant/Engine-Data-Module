function BrowserRequestedDirectionsTranslator() {
}
BrowserRequestedDirectionsTranslator.prototype.getMatchPatterns = function() {
	return [ '^browser', '/requestedDirections' ];
}
BrowserRequestedDirectionsTranslator.prototype.translate = function( sourceUri, owner, rawDoc, callback ) {
	var data = JSON.parse( rawDoc.data.data );

	var origin;
	if( typeof data.ub.origin == 'string' )
		origin = '"' + data.ub.origin + '"';
	else
		origin = 'lat' + data.ub.origin.Xa + 'lon' + data.ub.origin.Ya;

	var destination;
	if( typeof data.ub.destination == 'string' )
		destination = '"' + data.ub.destination + '"';
	else
		destination = 'lat' + data.ub.destination.Xa + 'lon' + data.ub.destination.Ya;

	var newUri = 'ldengine://' + owner + '//@acct:engine' + '/directions/' + data.ub.travelMode + '/' + destination + '/' + origin;

	var translatedRoutes = {
		'id': newUri,
		'routes': data.routes
	};
	var outputData = {
		'sourceUri': sourceUri,
		'uri': newUri,
		'owner': owner,
		'category': 'routes',
		'data': translatedRoutes,
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
module.exports = exports = BrowserRequestedDirectionsTranslator;
