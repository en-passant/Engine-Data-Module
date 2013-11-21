var Moment = require( 'moment' ),
	async = require( 'async' );

function InstagramContactListTranslator() { 
}

InstagramContactListTranslator.prototype.getMatchPatterns = function() {
    return [ '^acct:instagram:[0-9]+', '.*/contacts' ];
}
InstagramContactListTranslator.prototype.translate = function( sourceUri, owner, rawDoc, callback ) {
    try {
		var parsedUri = sourceUri.match( /([^:]*):\/\/(.*)\/\/@([^\/]*)(.*)/ );
		var source = parsedUri[3];

		var translatedContacts = new Array();
	    
		var contactsData = rawDoc.data;
		// Translated to fields more or less compliant with the OpenSocial 2.5.0 draft 
	        // spec (opensocial-social-data-specification-2-5-0-draft):
	        // http://opensocial-resources.googlecode.com/svn/spec/trunk/Social-Data.xml
	    async.eachSeries(
	    	contactsData,
	    	function( contact, done ) {
				var uri = 'ldengine://' + owner + '//@' + source + '/user/' + contact.id;
				var translatedContact = this.translateContact( uri, contact );
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

	    	},
	    	function( error ) {
				process.nextTick( function() {
					callback( error, translatedContacts );
				});
	    	}
	    );
    } catch( err ) { 
   		SystemLog.log('Request timed out at document translation,  [' + uri + ']', err);
                callback(  err , null ); 
	}
};
InstagramContactListTranslator.prototype.translateContact = function( uri, rawUser ) {	
	return { 
		// Required fields by spec
		'id': uri,
		'displayName': {'formatted': rawUser.full_name || rawUser.id },

		// Additional required fields for UI
		'preferredUsername':  rawUser.username,
		'thumbnailUrl': rawUser.profile_picture,
		'appData': { 
			'serviceName': 'Instagram',
			'serviceImgUrl': '/images/512x512-logos/instagram.png',
			// Plus other app data that isn't required.
			'verified': rawUser.verified, 
		},

		// Everything else
		'location': rawUser.timezone || null,
		'aboutMe': rawUser.bio || null,
		'urls': [ rawUser.website ],
		'utcOffset': rawUser.locale ||  null,
		'languagesSpoken': [ rawUser.languages || null ],
	 };
			
};
module.exports = exports = InstagramContactListTranslator;

