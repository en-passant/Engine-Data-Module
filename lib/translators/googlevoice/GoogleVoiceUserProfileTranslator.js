function GoogleVoiceUserProfileTranslator() {
}
GoogleVoiceUserProfileTranslator.prototype.getMatchPatterns = function() {
	return [ '^acct:googlevoice:.+', '/user/.+' ];
}
GoogleVoiceUserProfileTranslator.prototype.translate = function( uri, owner, rawDoc, callback ) {
	try {
		// Translated to fields more or less compliant with the OpenSocial 2.5.0 draft 
		// spec (opensocial-social-data-specification-2-5-0-draft):
		// http://opensocial-resources.googlecode.com/svn/spec/trunk/Social-Data.xml
		var phoneNumbers = new Array();
		phoneNumbers.push( rawDoc.settings.primaryDidInfo.phoneNumber );
		for( var i=0; i<rawDoc.phoneList.length; i++ )
		{
			phoneNumbers.push( rawDoc.phones[ rawDoc.phoneList[ i ] ].phoneNumber );
		}
		var emailAddresses = new Array();
		for( var i=0; i<rawDoc.settings.emailAddresses.length; i++ )
			emailAddresses.push( rawDoc.settings.emailAddresses[i] );
		emailAddresses.push( rawDoc.settings.emailNotificationAddress );

		var result = { 
			// Required fields by spec
			'id': uri,
			'displayName': {'formatted': rawDoc.settings.emailAddresses[0] },

			// Additional required fields for UI
			'preferredUsername': rawDoc.settings.primaryDidInfo.formattedNumber,
			'thumbnailUrl': '/images/generic_user_image.jpeg',
			'appData': { 
				'serviceName': 'Google Voice',
				'serviceImgUrl': '/images/512x512-logos/googlevoice.png',
				// Plus other app data that isn't required.
			},

			// Everything else
			'emails': rawDoc.settings.emailAddresses,
			'phoneNumbers': phoneNumbers,	
			'languagesSpoken': [ rawDoc.settings.language ],		
		 };

		var outputData = {
			'uri': uri,
			'owner': owner,
			'category': 'person',
			'data': result
		};
        NLPService.addAnalysisIfMissing( data, function( error, result ) {
   			if( !error )
   			{
				EventService.emit( "document::translated", result );
   			}
        	process.nextTick( function() {
        		callback( error, result.data );
        	});
   		});
	} catch( err ) {
		SystemLog.log('Request timed out at document translation,  [' + uri + ']', err);
                callback(  err , null );
	}
};
module.exports = exports = GoogleVoiceUserProfileTranslator;
