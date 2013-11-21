
function FullcontactUserProfileTranslator() {
}

FullcontactUserProfileTranslator.prototype.getMatchPatterns = function() {
    return [ '^public:fullcontact', '/person/.*' ];
}
FullcontactUserProfileTranslator.prototype.translate = function( uri, owner, rawDoc, callback ) {
	SystemLog.debug("FullContactUserProfiletranslator rawDoc data : ");
	SystemLog.debug( rawDoc);
	if(rawDoc == null) 
		callback(null, null); // catching case of existing item blabla
	else {
		var userProfile = JSON.parse(rawDoc.data );
		var email = uri.match(/[^\/]*$/)[0];
			try {
					if(userProfile.status == 404) userProfile = null;
					if(userProfile != null) {
						EventService.emit( 'document::translated', {
							'uri': uri,
							'sourceUri': email,
							'owner': owner,
							'category': 'fullcontact',
							'data': userProfile
						});
					}
					process.nextTick( function() {
						callback( null, userProfile );
					});
			} catch( err ) {
					SystemLog.log('Request timed out at document translation,  [' + uri + ']', err);
						callback( err , null );
			}
	}
};
module.exports = exports = FullcontactUserProfileTranslator;
