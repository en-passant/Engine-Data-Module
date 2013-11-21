var Moment = require( 'moment' ),
	async = require( 'async' );

function FlickrContactListTranslator() { 
}

FlickrContactListTranslator.prototype.getMatchPatterns = function() {
    return [ '^acct:flickr:[A-Za-z0-9\@]+', '.*/contacts' ];
}
FlickrContactListTranslator.prototype.translate = function( sourceUri, owner, rawDoc, callback ) {
    try {
		var parsedUri = sourceUri.match( /([^:]*):\/\/(.*)\/\/@([^\/]*)(.*)/ );
		var source = parsedUri[3];
		var translatedContacts = new Array();
		rawDoc.data = rawDoc.data.substring(14);	
	    var contactsData = JSON.parse( rawDoc.data.substring(0, rawDoc.data.length-1) );
		// Translated to fields more or less compliant with the OpenSocial 2.5.0 draft 
	        // spec (opensocial-social-data-specification-2-5-0-draft):
	        // http://opensocial-resources.googlecode.com/svn/spec/trunk/Social-Data.xml
        async.eachSeries(
        	contactsData.contacts.contact,
        	function( contact, done ) {
				var uri = 'ldengine://' + owner + '//@' + source + '/user/' + contact.nsid;
				var translatedContact = this.translateContact( uri, contact, contact.thumbnail_url );

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
   		SystemLog.log('Request timed out at document translation,  [' + sourceUri + ']', err);
                callback(  err , null ); 
	}
};
FlickrContactListTranslator.prototype.translateContact = function( uri, rawUser, thumbnail_url ) {	
	return { 
		// Required fields by spec
		'id': uri,
		'displayName': {'formatted': rawUser.realname },

		// Additional required fields for UI
		'preferredUsername': rawUser.username,
		'thumbnailUrl': thumbnail_url,
		'appData': { 
			'serviceName': 'Flickr',
			'serviceImgUrl': '/images/512x512-logos/flickr.png',
			// Plus other app data that isn't required.
			'verified': rawUser.verified, 
		},

		// Everything else
		'location': rawUser.location || null,
		'aboutMe': rawUser.bio || null,
		'urls': [ 'http://flickr.com/photos/' + rawUser.nsid ],
		'utcOffset': rawUser.locale || null,
		'languagesSpoken': [ rawUser.languages || null ],
	 };
			
};
module.exports = exports = FlickrContactListTranslator;

