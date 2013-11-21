
function ToutUserProfileTranslator() {
}

ToutUserProfileTranslator.prototype.getMatchPatterns = function() {
    return [ '^acct:tout:[A-Za-z0-9]+', '/user/[A-Za-z0-9]+' ];
}
ToutUserProfileTranslator.prototype.translate = function( uri, owner, rawDoc, callback ) {
    try {
        var userProfile = JSON.parse( rawDoc.data );
        // Translated to fields more or less compliant with the OpenSocial 2.5.0 draft 
        // spec (opensocial-social-data-specification-2-5-0-draft):
        // http://opensocial-resources.googlecode.com/svn/spec/trunk/Social-Data.xml
        var result = { 
            // Required fields by spec
            'id': uri,
            'displayName': {'formatted': userProfile.user.fullname },

            // Additional required fields for UI
            'preferredUsername': userProfile.user.username,
            'thumbnailUrl': userProfile.user.avatar.small.http_url,
            'appData': { 
                'serviceName': 'Tout',
                // Reuse the icon you defined in LoginStrategies.js.
                'serviceImgUrl': '/images/512x512-logos/tout.png',
                // Plus other app data that isn't required.
                'verified': userProfile.verified,
            },

            // Everything else
            'location': userProfile.user.location,
            'aboutMe': userProfile.user.bio,
            'urls': [ 'null' ],
            'utcOffset': 'null',
            'languagesSpoken': [ 'null' ],
         };

         if( userProfile.user.status )
            result.status = userProfile.user.status.text;

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
module.exports = exports = ToutUserProfileTranslator;
