var Moment = require( 'moment' ),
	async = require( 'async' );

function TumblrNewsTranslator() { 
}

TumblrNewsTranslator.prototype.getMatchPatterns = function() {
    return [ '^acct:tumblr:[A-Za-z0-9\-]+', '.*/news' ];
}
TumblrNewsTranslator.prototype.translate = function( sourceUri, owner, rawDoc, callback ) {
   try {
		var parsedUri = sourceUri.match( /([^:]*):\/\/(.*)\/\/@([^\/]*)(.*)/ );
		var source = parsedUri[3];

		var translatedMessages = new Array();
				
	        var postsData = JSON.parse( rawDoc.data );
		// Translated to fields more or less compliant with the OpenSocial 2.5.0 draft 
	        // spec (opensocial-social-data-specification-2-5-0-draft):
	        // http://opensocial-resources.googlecode.com/svn/spec/trunk/Social-Data.xml
	    async.eachSeries(
	    	postsData,
	    	function( post, done ) {
    			try
				{
					var translatedMessage = this.translateMessage( owner, source, post.data );
			
					translatedMessages.push( translatedMessage );
					var outputData = {
						'sourceUri': sourceUri,
						'uri': 'ldengine://' + owner + '//@' + source + '/news/' + postsData[i].data.id,
						'owner': owner,
						'category': 'message',
						'data': translatedMessage,
						'time': Moment( translatedMessage.timeSent ).valueOf()
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
					SystemLog.error( 'Error translating document: ' + require( 'util' ).inspect( post ), error );
					done( error );
				}
	    	},
	    	function( error ) {
				process.nextTick( function() {
					callback( error, translatedMessages );
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
TumblrNewsTranslator.prototype.translateMessage = function( owner, source, rawMessage ) {
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
				'id': 'ldengine://' + owner + '//@' + source + '/news/' + rawMessage.id,
				'userId': 'ldengine://' + owner + '//@' + source + '/user/' + rawMessage.blog_name,
				'timeSent': Moment(rawMessage.timestamp).valueOf(),
				'itemtype': 'article'
			};
};
module.exports = exports = TumblrNewsTranslator;

