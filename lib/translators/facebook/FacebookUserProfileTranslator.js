
function FacebookUserProfileTranslator() {
}

FacebookUserProfileTranslator.prototype.getMatchPatterns = function() {
    return [ '^acct:facebook:[0-9]+', '/user/[0-9]+' ];
};
FacebookUserProfileTranslator.prototype.translate = function( uri, owner, rawDoc, callback ) {
	
	var userProfile = JSON.parse(rawDoc.data),
		parseAccountId = uri.match( /acct:facebook:[0-9]+/ ),
		parseId = parseAccountId[0].match( /[0-9]+/ );
		//this code extracts out the Account number so we 
		//ensure the profile translated relates to the user (Singly)
	
	if( parseId[0] ==  userProfile.id ) {
		try {
			// Translated to fields more or less compliant with the 
			// OpenSocial 2.5.0 draft spec 
			// (opensocial-social-data-specification-2-5-0-draft):
			// http://opensocial-resources.googlecode.com/svn/spec/trunk/Social-Data.xml
			var result = {
				// Required fields by spec
				'id': uri,
				'displayName': {'formatted': userProfile.name },

				// Additional required fields for UI

				'preferredUsername': userProfile.username,
				'thumbnailUrl': userProfile.picture.data.url,
				'appData': {
					'serviceName': 'Facebook',
					// Reuse the icon you defined in LoginStrategies.js.
					'serviceImgUrl': '/images/512x512-logos/facebook.png',
					// Plus other app data that isn't required.
					'verified': userProfile.verified,
				},

				// Everything else
				'location': userProfile.locale,
				'aboutMe': userProfile.birthday +
					',' + userProfile.email +
					',' + userProfile.gender,
				'emails':[ userProfile.email ],
				'urls': [ userProfile.link ],
				'utcOffset': userProfile.timezone,
				'languagesSpoken': [ 'null' ],
				};

				if( userProfile.status ) {
				result.status = userProfile.status.text;
				}
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
module.exports = exports = FacebookUserProfileTranslator;
