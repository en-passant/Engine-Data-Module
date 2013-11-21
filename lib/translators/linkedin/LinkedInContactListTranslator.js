var Moment = require( 'moment' );
var async = require( 'async' );

function LinkedInContactListTranslator() { 
}

LinkedInContactListTranslator.prototype.getMatchPatterns = function() {
    return [ '^acct:linkedin:[^/]*', '.*/contacts' ];
}
LinkedInContactListTranslator.prototype.translate = function( sourceUri, owner, rawDoc, callback ) {
	var self = this;
	var parsedUri = sourceUri.match( /([^:]*):\/\/(.*)\/\/@([^\/]*)(.*)/ );
	var source = parsedUri[3];

	var translatedContacts = new Array();
	
	try
	{
	    var contactsData = JSON.parse( rawDoc.data ).values;
	
		// Translated to fields more or less compliant with the OpenSocial 2.5.0 draft 
	        // spec (opensocial-social-data-specification-2-5-0-draft):
	        // http://opensocial-resources.googlecode.com/svn/spec/trunk/Social-Data.xml
	    async.eachSeries( 
	    	contactsData,
	    	function( contact, done ) {
    			try
				{
					var uri = 'ldengine://' + owner + '//@' + source + '/user/' + contact.id;
					var translatedContact = self.translateContact( uri, contact );
					translatedContacts.push( translatedContact );

					var outputData = {
						'sourceUri': sourceUri,
						'uri': uri, 
						'owner': owner,
						'category': 'person',
						'data': translatedContact
					};
					NLPService.addAnalysisIfMissing( outputData, function( error, result ) {
			   			if( !error )
			   			{
							EventService.emit( "document::translated", result );
			   			}
			   			done( error );
			   		} );
				}
				catch( error )
				{
					SystemLog.error( 'Error translating document: ' + require( 'util' ).inspect( contact ), error );
					done( error );
				}
	    	},
	    	function( error ) {
	    		callback( error, translatedContacts );
	    	}
	    );
    }
	catch( error )
	{
		SystemLog.log( 'Error parsing contacts data for uri: ' + sourceUri, error );
		callback( error );
	}
};
LinkedInContactListTranslator.prototype.translateContact = function( uri, rawUser ) {	
	return { 
		// Required fields by spec
		'id': uri,
		'displayName': {'formatted': rawUser.formattedName || rawUser.id },

		// Additional required fields for UI
		'preferredUsername': rawUser.id,
		'thumbnailUrl': rawUser.pictureUrl || null,
		'appData': { 
			'serviceName': 'LinkedIn',
			'serviceImgUrl': '/images/512x512-logos/linkedin.png',
			// Plus other app data that isn't required.
			'verified': rawUser.verified, 
		},

		// Everything else
		'location': rawUser.timezone || null,
		'aboutMe': rawUser.headline || null,
		'urls': [ rawUser.publicProfileUrl ],
		'utcOffset': rawUser.location || null,
		'languagesSpoken': [ rawUser.languages || null ],
	 };
			
};
module.exports = exports = LinkedInContactListTranslator;

