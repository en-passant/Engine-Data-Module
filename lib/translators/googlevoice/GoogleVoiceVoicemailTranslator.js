var Moment = require( 'moment' ),
	async = require( 'async' );

function GoogleVoiceVoicemailTranslator() {
}
GoogleVoiceVoicemailTranslator.prototype.getMatchPatterns = function() {
	return [ '^acct:googlevoice:.+', '/voicemail' ];
}
GoogleVoiceVoicemailTranslator.prototype.translate = function( sourceUri, owner, rawDoc, callback ) {
	var self = this;
	try {
		var parsedUri = sourceUri.match( /([^:]*):\/\/(.*)\/\/@([^\/]*)(.*)/ );
		var account = parsedUri[3];			

		var translatedMessages = new Array();
		// Translated to fields more or less compliant with the OpenSocial 2.5.0 draft 
		// spec (opensocial-social-data-specification-2-5-0-draft):
		// http://opensocial-resources.googlecode.com/svn/spec/trunk/Social-Data.xml
		async.eachSeries(
			rawDoc.messages,
			function( message, done ) {
				// The URI for a single voicemail should be:
				// ldengine://{owner}//@{account}/voicemail/{id}
				var vmId = message.id;
				var senderPhoneNumber = message.phoneNumber;

				// The URI for a remote phone contact should be:
				// ldengine://{owner}//@{account}/phone/{remotePhoneNumber}
				var remoteUri = 'ldengine://' + owner + '//@' + account + '/phone/' + senderPhoneNumber;
				var vmUri = 'ldengine://' + owner + '//@' + account + '/voicemail/' + vmId;
				var localUri = 'ldengine://' + owner + '//@' + account + '/user/' + account;

				var utcTime = new Date( parseInt( message.startTime )).toUTCString();

				var translatedVoicemail = {
					id: vmUri,
					itemtype: 'voicemail',
					body: rawDoc.messages[ messageNumber ].messageText,
					timeSent: utcTime,
					senderId: remoteUri,
					recipients: [ localUri ],
				};

				translatedMessages.push( translatedVoicemail );

				var outputData = {
					'sourceUri': sourceUri,
					'uri': vmUri,
					'owner': owner,
					'category': 'message',
					'data': translatedVoicemail,
					'time': Moment( translatedVoicemail.timeSent ).valueOf()
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
		            callback( error, translatedMessages );
		        });

			}
		);

	} catch( err ) {
		SystemLog.log('Request timed out at document translation,  [' + uri + ']', err);
                callback(  err , null );
	}
};
module.exports = exports = GoogleVoiceVoicemailTranslator;
