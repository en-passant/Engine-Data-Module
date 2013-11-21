
function GithubUserProfileTranslator() {
}

GithubUserProfileTranslator.prototype.getMatchPatterns = function() {
    return [ '^acct:github:[0-9]+', '/user/[0-9]+' ];
};
GithubUserProfileTranslator.prototype.translate = function( uri, owner, rawDoc, callback ) {
	var userProfile = JSON.parse( rawDoc.data ),
		parseAccountId = uri.match( /acct:github:[0-9]+/ ),
		parseId = parseAccountId[0].match( /[0-9]+/ );
		//this code extracts out the Account number so we 
		//ensure the profile translated relates to the user (Singly)
		if( parseId[0] ==  userProfile.id ) {
			try {
				// Translated to fields more or less compliant 
				// with the OpenSocial 2.5.0 draft 
				// spec (opensocial-social-data-specification-2-5-0-draft):
				// http://opensocial-resources.googlecode.com/svn/spec/trunk/Social-Data.xml
				var result = { 
					// Required fields by spec
					'id': uri,
					'displayName': {'formatted': userProfile.name },

					// Additional required fields for UI
					'preferredUsername': userProfile.login,
					'thumbnailUrl': userProfile.avatar_url,
					'appData': { 
						'serviceName': 'Github',
						// Reuse the icon you defined in LoginStrategies.js.
						'serviceImgUrl': '/images/512x512-logos/github.png',
						// Plus other app data that isn't required.
						'verified': userProfile.verified,
					},

					// Everything else
					'location': userProfile.location,
					'aboutMe': userProfile.bio,
					'emails': [ userProfile.email ],
					'urls': [ userProfile.html_url ],
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
module.exports = exports = GithubUserProfileTranslator;
