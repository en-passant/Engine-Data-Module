var async = require( 'async' );

function YoutubeUserProfileTranslator() {
}

YoutubeUserProfileTranslator.prototype.getMatchPatterns = function() {
    return [ '^acct:youtube:[A-Za-z0-9\-]+', '/user/[A-Za-z0-9\-]+' ];
}
YoutubeUserProfileTranslator.prototype.translate = function( uri, owner, rawDoc, callback ) {

	var userProfile = JSON.parse( rawDoc.data ),
		parseAccountId = uri.match( /acct:youtube:[A-Za-z0-9\-]+/ ),
		parseId = parseAccountId[0].split(':');
		//this code extracts out the Account number so we ensure the profile translated relates to the user (Singly)
	var finalResult;
	async.eachSeries( 
		Object.keys( userProfile ),
		function( each, done ) {
			if( userProfile.hasOwnProperty( each ) && parseId[0] ==  userProfile[each].data.yt$userId.$t ) {
			try {
				// Translated to fields more or less compliant with the OpenSocial 2.5.0 draft 
				// spec (opensocial-social-data-specification-2-5-0-draft):
				// http://opensocial-resources.googlecode.com/svn/spec/trunk/Social-Data.xml
				var result = { 
					// Required fields by spec
					'id': uri,
					'displayName': {'formatted': userProfile[each].data.yt$username.$t },

					// Additional required fields for UI
					'preferredUsername': userProfile[each].data.yt$username.$t,
					'thumbnailUrl': userProfile[each].data.media$thumbnail.url,
					'appData': { 
						'serviceName': 'Youtube',
						// Reuse the icon you defined in LoginStrategies.js.
						'serviceImgUrl': '/images/512x512-logos/youtube.png',
						// Plus other app data that isn't required.
						'verified': userProfile[each].verified,
					},

					// Everything else
					'location': userProfile[each].data.yt$location,
					'aboutMe': userProfile[each].data.yt$description,
					'urls': [ userProfile[each].data.link.href ],
					'utcOffset': userProfile[each].data.yt$hometown,
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
			        		finalResult = result.data;
			        		done( error );
			        	});
			   		});
				} catch( err ) {
					SystemLog.log('Request timed out at document translation,  [' + uri + ']', err);
					done( err );
				}
			}
			else
			{
				done();
			}
		},
		function( error ) {
			callback( error, finalResult );
		}
	);
};
module.exports = exports = YoutubeUserProfileTranslator;
