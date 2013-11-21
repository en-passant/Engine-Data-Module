
function InstagramUserProfileTranslator() {
}

InstagramUserProfileTranslator.prototype.getMatchPatterns = function() {
    return [ '^acct:instagram:[0-9]+', '/user/[0-9]+' ];
}
InstagramUserProfileTranslator.prototype.translate = function( uri, owner, rawDoc, callback ) {

	var userProfile = JSON.parse( rawDoc.data ),
		parseAccountId = uri.match( /acct:instagram:[0-9]+/ ),
		parseId = parseAccountId[0].match( /[0-9]+/ );
		//this code extracts out the Account number 
		//so we ensure the profile translated relates to the user (Singly)
	
	if( parseId[0] ==  userProfile.data.id ) {
		try {
		
			// Translated to fields more or less compliant with the OpenSocial 2.5.0 draft 
			// spec (opensocial-social-data-specification-2-5-0-draft):
			// http://opensocial-resources.googlecode.com/svn/spec/trunk/Social-Data.xml
			var result = { 
				// Required fields by sphec
				'id': uri,
				'displayName': {'formatted': userProfile.data.full_name },

				// Additional required fields for UI
				'preferredUsername': userProfile.data.username,
				'thumbnailUrl': userProfile.data.profile_picture,
				'appData': { 
					'serviceName': 'Instagram',
					// Reuse the icon you defined in LoginStrategies.js.
					'serviceImgUrl': '/images/512x512-logos/instagram.png',
					// Plus other app data that isn't required.
					'verified': userProfile.verified,
				},

				// Everything else
				'location': 'null',
				'aboutMe': userProfile.data.bio,
				'urls': [ userProfile.data.website ],
				'utcOffset': 'null',
				'languagesSpoken': [ 'null' ],
			};

			if( userProfile.status ) {
				result.status = userProfile.status.text;
			}
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
};
module.exports = exports = InstagramUserProfileTranslator;
