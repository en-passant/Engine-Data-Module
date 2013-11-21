var Moment = require( 'moment' ),
	async = require( 'async' );

function GoogleVoiceSmsTranslator() {
}
GoogleVoiceSmsTranslator.prototype.getMatchPatterns = function() {
	return [ '^acct:googlevoice:.+', '/sms' ];
}
GoogleVoiceSmsTranslator.prototype.translate = function( sourceUri, owner, rawDoc, callback ) {
	var self = this;
	try {
		var translatedMessages = new Array();
		// Translated to fields more or less compliant with the OpenSocial 2.5.0 draft 
		// spec (opensocial-social-data-specification-2-5-0-draft):
		// http://opensocial-resources.googlecode.com/svn/spec/trunk/Social-Data.xml
		var parsedUri = sourceUri.match( /([^:]*):\/\/(.*)\/\/@([^\/]*)(.*)/ );
		var account = parsedUri[3];			// The URI for a single text should be:
			// ldengine://{owner}//@{account}/sms/{thread_id}/{index}
		async.eachSeries( 
			rawDoc.messages,
			function( thread, done ) {
				var thread_id = thread.id;
				var remotePhoneNumber = thread.phoneNumber;
	
				// The URI for a remote phone contact should be:
				// ldengine://{owner}//@{account}/phone/{remotePhoneNumber}
				var remoteUri = 'ldengine://' + owner + '//@' + account + '/phone/' + remotePhoneNumber;
				var threadUri = 'ldengine://' + owner + '//@' + account + '/sms/' + thread_id;
				var localUri = 'ldengine://' + owner + '//@' + account + '/user/' + account;

				var threadStartDateTime = new Date( parseInt( thread.startTime ));
				var threadStartDateStr = ( threadStartDateTime.getMonth() + 1 ) + '/' + threadStartDateTime.getDate() + '/' + threadStartDateTime.getFullYear();

				var messageCount = 0;

				async.eachSeries( 
					thread.thread,
					function( msg, msgDone ) {
						var translatedSms = {
							id: threadUri + '/' + messageCount,
							itemtype: 'SMS',
							body: msg.text,
							timeSent: threadStartDateStr + ' ' + msg.time
						};

						if( messageCount > 0 )
							translatedSms.inReplyTo = threadUri + '/' + ( messageCount - 1 );
						if( 'Me:' == msg.from )
						{
							translatedSms.senderId = localUri;
							translatedSms.recipients = [ remoteUri ];
						}
						else
						{
							translatedSms.senderId = remoteUri;
							translatedSms.recipients = [ localUri ];
						}
						if( messageCount < rawDoc.messages[ threadNumber ].thread.length - 1 )
						{
							translatedSms.replies = [ threadUri + '/' + ( messageCount+1 ) ]
						}

						translatedMessages.push( translatedSms );
						messageCount++;

						var outputData = {
							'sourceUri': sourceUri,
							'uri': threadUri + '/' + messageCount,
							'owner': owner,
							'category': 'message',
							'data': translatedSms,
							'time': Moment( translatedSms.timeSent ).valueOf()
						}
						NLPService.addAnalysisIfMissing( outputData, function( error, result ) {
				   			if( !error )
				   			{
								EventService.emit( "document::translated", result );
				   			}
				   			msgDone( error );
				   		} );
					},
					done
				);
			},
			function( error ) {
				process.nextTick( function() {
		            callback( error, translatedMessages );
		        });
			}
		);

	} catch( err ) {
		SystemLog.log('Request timed out at document translation,  [' + uri + ']', err);
                callback( err , null );
	}
};
module.exports = exports = GoogleVoiceSmsTranslator;
