var Moment = require( 'moment' ),
	async = require( 'async' );

function FacebookStatusesFeedTranslator() { 
}

FacebookStatusesFeedTranslator.prototype.getMatchPatterns = function() {
    return [ '^acct:facebook:[0-9]+', '.*/fstatuses' ];
}
FacebookStatusesFeedTranslator.prototype.translate = function( sourceUri, owner, rawDoc, callback ) {
   var translatedStatuses = new Array(),
	   parseAccountId = sourceUri.match( /acct:facebook:[0-9]+/ ),
	   parseId = parseAccountId[0].match( /[^\x3a]*$/i );
   // SystemLog.debug("rawDoc data is:" + rawDoc.data);
   var self = this;	
   try {
	   statusData = JSON.parse( rawDoc.data ).data;
	var parsedUri = sourceUri.match( /([^:]*):\/\/(.*)\/\/@([^\/]*)(.*)/ );
	var source = parsedUri[3];
	async.eachSeries( 
		statusData,
		function( status, done ) {
			// Translated to fields more or less compliant with the OpenSocial 2.5.0 draft 
			// spec (opensocial-social-data-specification-2-5-0-draft):
			// http://opensocial-resources.googlecode.com/svn/spec/trunk/Social-Data.xml
			var translatedStatus = self.translateStatus( owner, source, status );
	
			translatedStatuses.push( translatedStatus );
			var outputData = {
				'sourceUri': sourceUri,
				'uri': 'ldengine://' + owner + '//@' + source + '/fstatuses/' + status.id,
				'owner': owner,
				'category': 'message',
				'data': translatedStatus,
				'time': Moment( translatedStatus.timeSent ).valueOf()
			};
			NLPService.addAnalysisIfMissing( outputData, function( error, result ) {
	   			if( !error )
	   			{
					EventService.emit( "document::translated", result );
	   			}
	   			done( error );
	   		} );

		},
		function( error ) {
			process.nextTick( function() {
			    callback( error, translatedStatuses );
			});
		}
	);
   } catch( err) {
	   	   SystemLog.error('FacebookStatusesFeedTranlater: Invalid JSON found in rawDoc[' + rawDoc.data + ']', err);
		 callback(  err , null );
   }
};
FacebookStatusesFeedTranslator.prototype.translateStatus = function( owner, source, rawMessage ) {
	var result = { 
				'body': null,
				'title': (rawMessage.name || null), 
				'url': (rawMessage.link || null),
				'appData': { 
					'serviceName': 'Facebook',
					'serviceImgUrl': '/images/512x512-logos/facebook.png',
					// Plus other app data that isn't required.
					'verified': rawMessage.verified, 
				},
				'id': 'ldengine://' + owner + '//@' + source + '/fstatuses/' + rawMessage.id,
				'senderId': 'ldengine://' + owner + '//@' + source + '/user/' + rawMessage.from.id,
				'timeSent': Moment( rawMessage.created_time ).valueOf(),
				'itemtype': 'FacebookStatusMessage'
			};
	if ( rawMessage.message ) { result.body = rawMessage.message; }
	if ( rawMessage.story ) { 
		if(result.body)
			result.body = result.body + ' ' + rawMessage.story; 
		else
			result.body = rawMessage.story; 
	}
	if ( rawMessage.description ) { 
		if(result.body)
			result.body = result.body + ' ' + rawMessage.description; 
		else
			result.body = rawMessage.description; 
	}

	return result;
};
module.exports = exports = FacebookStatusesFeedTranslator;

