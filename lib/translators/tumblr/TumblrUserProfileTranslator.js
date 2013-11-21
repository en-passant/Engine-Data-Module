
function TumblrUserProfileTranslator() {
}

TumblrUserProfileTranslator.prototype.getMatchPatterns = function() {
    return [ '^acct:tumblr:[A-Za-z0-9\-]+', '/user/(.)*' ];
};
TumblrUserProfileTranslator.prototype.translate = function( uri, owner, rawDoc, callback ) {
	var userProfile = JSON.parse( rawDoc.data ).response.user,
		parseAccountId = uri.match( /acct:tumblr:[A-Za-z0-9\-]+/ ),
		parseId = parseAccountId[0].split(':');
		//this code extracts out the Account number so we ensure the profile translated relates to the user (Singly)
	if( parseId[2] ==  userProfile.name ) {
		try {
		// Translated to fields more or less compliant with the OpenSocial 2.5.0 draft 
			// spec (opensocial-social-data-specification-2-5-0-draft):
			// http://opensocial-resources.googlecode.com/svn/spec/trunk/Social-Data.xml
			var result = { 
				// Required fields by spec
				'id': uri,
				'displayName': {'formatted': userProfile.name },

				// Additional required fields for UI
				'preferredUsername': userProfile.name,
				'thumbnailUrl': '/images/generic_user_image.jpeg', 
				'appData': { 
					'serviceName': 'Tumblr',
					// Reuse the icon you defined in LoginStrategies.js.
					'serviceImgUrl': '/images/512x512-logos/tumblr.png',
					// Plus other app data that isn't required.
					'verified': userProfile.verified,
				},

				// Everything else
				'location': 'N/a',
				'aboutMe': userProfile.blogs.description,
				'urls': [ userProfile.blogs.url ],
				'utcOffset': 'N/a',
				'languagesSpoken': [ 'N/a' ],
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
module.exports = exports = TumblrUserProfileTranslator;
