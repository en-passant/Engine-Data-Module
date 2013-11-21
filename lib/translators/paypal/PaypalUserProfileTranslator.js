
function PaypalUserProfileTranslator() {
}

PaypalUserProfileTranslator.prototype.getMatchPatterns = function() {
    return [ '^acct:paypal:[0-9]+', '/user/[0-9]+' ];
}
PaypalUserProfileTranslator.prototype.translate = function( uri, owner, rawDoc, callback ) {
    try {
        var userProfile = JSON.parse( rawDoc.data );
	
        // Translated to fields more or less compliant with the OpenSocial 2.5.0 draft 
        // spec (opensocial-social-data-specification-2-5-0-draft):
        // http://opensocial-resources.googlecode.com/svn/spec/trunk/Social-Data.xml
        var result = { 
            // Required fields by spec
            'id': uri,
            'displayName': {'formatted': userProfile[0].data.fullname },

            // Additional required fields for UI
            'preferredUsername': userProfile[0].data.login,
            'thumbnailUrl': userProfile[0].data.avatar_url,
            'appData': { 
                'serviceName': 'Paypal',
                // Reuse the icon you defined in LoginStrategies.js.
                'serviceImgUrl': '/images/512x512-logos/paypal.png',
                // Plus other app data that isn't required.
                'verified': userProfile[0].verified,
            },

            // Everything else
            'location': userProfile[0].data.location,
            'aboutMe': userProfile[0].data.bio,
            'urls': [ userProfile[0].data.html_url ],
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
};
module.exports = exports = PaypalUserProfileTranslator;
