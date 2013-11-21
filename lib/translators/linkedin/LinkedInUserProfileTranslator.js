
function LinkedInUserProfileTranslator() {
}

LinkedInUserProfileTranslator.prototype.getMatchPatterns = function() {
    return [ '^acct:linkedin:[^/]*', '/user/.*' ];
};
LinkedInUserProfileTranslator.prototype.translate = function( uri, owner, rawDoc, callback ) {
	var userProfile = JSON.parse( rawDoc.data ),
		parseAccountId = uri.match( /acct:linkedin:[^/]*/ ),
		parseId = parseAccountId[0].split(':');
		//this code extracts out the Account number so we 
		//ensure the profile translated relates to the user (Singly)
		if( parseId[2] ==  userProfile.id ) {
			try {
				// Translated to fields more or less compliant with 
				// the OpenSocial 2.5.0 draft 
				// spec (opensocial-social-data-specification-2-5-0-draft):
				// http://opensocial-resources.googlecode.com/svn/spec/trunk/Social-Data.xml
				var result = {
					// Required fields by spec
					'id': uri,
					'displayName': {'formatted': userProfile.firstName  + ' ' +  userProfile.lastName },

					// Additional required fields for UI
					'preferredUsername': userProfile.firstName + ' ' + userProfile.lastName,
					'thumbnailUrl': userProfile.pictureUrl,
					'appData': {
						'serviceName': 'LinkedIn',
						// Reuse the icon you defined in LoginStrategies.js.
						'serviceImgUrl': '/images/512x512-logos/linkedin.png',
						// Plus other app data that isn't required.
						'verified': userProfile.verified,
					},

					// Everything else
					'location': userProfile.location,
					'aboutMe': userProfile.headline,
					'urls': [ userProfile.publicProfileUrl ],
					'utcOffset': 'null',
					'languagesSpoken': [ 'null' ],
				 };

				 if( userProfile.status )
					result.status = userProfile.status.text;
		// Once you have the translated data built up, 
		// spout it out via an event so that indexers and caches 
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
};
module.exports = exports = LinkedInUserProfileTranslator;
