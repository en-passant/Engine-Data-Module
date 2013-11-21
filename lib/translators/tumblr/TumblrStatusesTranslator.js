var Moment = require( 'moment' ),
	async = require( 'async' );

function TumblrStatusesTranslator() {
}

TumblrStatusesTranslator.prototype.getMatchPatterns = function() {
    return [ '^acct:tumblr:[A-Za-z0-9\-]+', '.*/statuses' ];
}
TumblrStatusesTranslator.prototype.translate = function( sourceUri, owner, rawDoc, callback ) {
    try {
		var parsedUri = sourceUri.match( /([^:]*):\/\/(.*)\/\/@([^\/]*)(.*)/ );
		var source = parsedUri[3];

		var translatedStatuses = new Array();
				
	        var statusData = JSON.parse( rawDoc.data );
		// Translated to fields more or less compliant with the OpenSocial 2.5.0 draft 
	        // spec (opensocial-social-data-specification-2-5-0-draft):
	        // http://opensocial-resources.googlecode.com/svn/spec/trunk/Social-Data.xml
	    async.eachSeries(
	    	statusData,
	    	function( status, done ) {
    			try
				{
					var translatedStatus = this.translateStatus( owner, source, status.data );
			
					translatedStatuses.push( translatedStatus );
					var outputData = {
						'sourceUri': sourceUri,
						'uri': 'ldengine://' + owner + '//@' + source + '/statuses/' + statusData[i].data.id,
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
				}
				catch( error )
				{
					SystemLog.error( 'Error translating document: ' + require( 'util' ).inspect( status ), error );
					done( error );
				}

	    	},
	    	function( error ) {
				process.nextTick( function() {
					callback( error, translatedStatuses );
				});
	    	}
	    );
    }
	catch( error )
	{
		SystemLog.log( 'Error parsing data for uri: ' + sourceUri, error );
		callback( error );
	}
};
TumblrStatusesTranslator.prototype.translateStatus = function( owner, source, rawMessage ) {
	return { 
				'title': rawMessage.title || null,
				'body': rawMessage.description || rawMessage.text || null,
				'source': rawMessage.source || null,
				'url': rawMessage.url || null,
				'appData': { 
					'serviceName': 'Tumblr',
					'serviceImgUrl': '/images/512x512-logos/tumblr.png',
					// Plus other app data that isn't required.
					'verified': rawMessage.verified, 
				},
				'id': 'ldengine://' + owner + '//@' + source + '/statuses/' + rawMessage.id,
				'userId': 'ldengine://' + owner + '//@' + source + '/user/' + rawMessage.blog_name,
				'timeSent': Moment(rawMessage.timestamp).valueOf(),
				'itemtype': 'article'
			};
};
module.exports = exports = TumblrStatusesTranslator;

