
function SignalsUserProfileTranslator() {
}

SignalsUserProfileTranslator.prototype.getMatchPatterns = function() {
    return [ '^acct:37signals:[0-9]+', '/user/[0-9]+' ];
}
SignalsUserProfileTranslator.prototype.translate = function( uri, owner, rawDoc, callback ) {
  
   var userProfile = JSON.parse( rawDoc.data ),
		parseAccountId = uri.match( /acct:37signals:[0-9]+/ ),
		parseId = parseAccountId[0].split(':');

		//this code extracts out the Account number so we ensure the profile translated relates to the user (Singly)
  for (var each in userProfile) { 
		// double equals because the data coming back needs to be coerced (could be string/integer)
  		if( parseId[2] == userProfile[each].data.identity.id ) {
   			try {
				// Translated to fields more or less compliant with the OpenSocial 2.5.0 draft 
				// spec (opensocial-social-data-specification-2-5-0-draft):
				// http://opensocial-resources.googlecode.com/svn/spec/trunk/Social-Data.xml
				var result = { 
					// Required fields by spec
					'id': uri,
					'displayName': {'formatted': userProfile[each].data.identity.first_name + ' ' +  userProfile[each].data.identity.last_name },

					// Additional required fields for UI
					'preferredUsername': userProfile[each].data.identity.email_address,
					'thumbnailUrl': '/images/generic_user_image.jpeg',
					'appData': { 
						'serviceName': '37 Signals',
	
						// Reuse the icon you defined in LoginStrategies.js.
						'serviceImgUrl': '/images/512x512-logos/signals.png',
						// Plus other app data that isn't required.
						'verified': userProfile[each].verified,
					},

					// Everything else
					'location': 'null',
					'aboutMe': 'null',
					'emails': [ userProfile[each].data.identity.email_address ],
					'urls': [ 'null' ],
					'utcOffset': 'null',
					'languagesSpoken': [ 'null' ],
				 };

				 if( userProfile.status )
					result.status = userProfile.status.text;

				// Once you have the translated data built up, spout it out via an event so that indexers and caches 
				// are triggered.
				var outputData = {
					'uri': uri,
					'owner': owner,
					'category': 'person',
					'data': result
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
				SystemLog.log('Request timed out at document translation,  [' + uri + ']', err);
						callback(  err , null );
			}
		}
	}
};
module.exports = exports = SignalsUserProfileTranslator;
