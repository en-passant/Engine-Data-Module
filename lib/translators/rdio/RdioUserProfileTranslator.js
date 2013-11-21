var async = require( 'async' );

function RdioUserProfileTranslator() {
}

RdioUserProfileTranslator.prototype.getMatchPatterns = function() {
    return [ '^acct:rdio:[A-Za-z0-9]+', '/user/[A-Za-z0-9]+' ];
}
RdioUserProfileTranslator.prototype.translate = function( uri, owner, rawDoc, callback ) {
	var userProfile = JSON.parse( rawDoc.data ),
		parseAccountId = uri.match( /acct:rdio:[A-Za-z0-9]+/ ),
		parseId = parseAccountId[0].split( ':' );
		//this code extracts out the Account number so we ensure the profile translated relates to the user (Singly)
	var finalResult;
	async.eachSeries( 
		Object.keys( userProfile ),
		function( each, done ) {
			if( userProfile.hasOwnProperty( each ) && parseId[2] ==  userProfile[each].data.key ) {
			try {
				// Translated to fields more or less compliant with the OpenSocial 2.5.0 draft 
				// spec (opensocial-social-data-specification-2-5-0-draft):
				// http://opensocial-resources.googlecode.com/svn/spec/trunk/Social-Data.xml
				var result = { 
					// Required fields by spec
					'id': uri,
					'displayName': {'formatted': userProfile[each].data.firstName + ' ' + userProfile[each].data.lastName },

					// Additional required fields for UI
					'preferredUsername': userProfile[each].data.firstName + ' ' + userProfile[each].data.lastName,
					'thumbnailUrl': userProfile[each].data.icon,
					'appData': { 
						'serviceName': 'Rdio',
						// Reuse the icon you defined in LoginStrategies.js.
						'serviceImgUrl': '/images/512x512-logos/rdio.png',
						// Plus other app data that isn't required.
						'verified': userProfile[each].verified,
					},

				// Everything else
				'location': userProfile[each].timezone || null,
				'aboutMe': userProfile[each].bio || null,
				'urls': [ 'http://www.rdio.com/' + userProfile[each].url ],
				'utcOffset': userProfile[each].locale || null,
				'languagesSpoken': [ userProfile[each].languages || null ],
				 };

				 if( userProfile[each].status )
					result.status = userProfile[each].status.text;

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
module.exports = exports = RdioUserProfileTranslator;
