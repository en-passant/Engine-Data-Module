var async = require( 'async' );

function DwollaUserProfileTranslator() {
}

DwollaUserProfileTranslator.prototype.getMatchPatterns = function() {
    return [ '^acct:dwolla:[0-9\-]+', '/user/[0-9\-]+' ];
}
DwollaUserProfileTranslator.prototype.translate = function( uri, owner, rawDoc, callback ) {
	var userProfile = JSON.parse( rawDoc.data ),
		parseAccountId = uri.match( /acct:dwolla:[0-9\-]+/ ),
		parseId = parseAccountId[0].split(':');
		//this code extracts out the Account number so we ensure the profile translated relates to the user (Singly)
	var finalResult;
	async.eachSeries( 
		Object.keys( userProfile ),
		function( each, done ) {
			if( userProfile.hasOwnProperty( each ) && parseId[2] ==  userProfile[each].data.Id ) {
			try {
				// Translated to fields more or less compliant with the OpenSocial 2.5.0 draft 
				// spec (opensocial-social-data-specification-2-5-0-draft):
				// http://opensocial-resources.googlecode.com/svn/spec/trunk/Social-Data.xml
				var result = { 
					// Required fields by spec
					'id': uri,
					'displayName': {'formatted': userProfile[each].data.Name },

					// Additional required fields for UI
					'preferredUsername': userProfile[each].data.Name,
					'thumbnailUrl': '/images/generic_user_image.jpeg',
					'appData': { 
						'serviceName': 'Dwolla',
						// Reuse the icon you defined in LoginStrategies.js.
						'serviceImgUrl': '/images/512x512-logos/dwolla.png',
						// Plus other app data that isn't required.
						'verified': userProfile[each].type,
					},

					// Everything else
					'location': userProfile[each].data.City + ',' + userProfile[each].data.State,
				'latitude': userProfile[each].data.Latitude,
				'longitude': userProfile[each].data.Longitude,
					'aboutMe': 'null',
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
module.exports = exports = DwollaUserProfileTranslator;
