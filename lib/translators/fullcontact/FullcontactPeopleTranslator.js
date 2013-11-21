var uriService = require('../../UriService.js');

function FullcontactPeopleTranslator() {
}
FullcontactPeopleTranslator.prototype.getMatchPatterns = function() {
    return [ '^public:fullcontact', '/people/_index' ];
}
FullcontactPeopleTranslator.prototype.translate = function( uri, owner, rawDoc, callback ) {
	try {
		var source = 'public:fullcontact';
		var peopleUris = new Array();
		var blacklist = ['reply.github.com', 'docs.google.com',
						 'noreply.github.com', 'plus.google.com'];
		rawDoc.data = rawDoc.data.docs;	

		function a(email) {

				try{
					do {
						email = JSON.parse(email); 
						for( var each in email ) {
							email[each] = a(email[each]);
						}
					} while (typeof email != 'string');
					a();
				}
				catch(err) {
					if(err.name == "SyntaxError")
						return email;
				} 
			
		}

		function massager(emails) {
			var _ = require('underscore');
			var emaillist = [];
			for( var each in emails) { 
				emaillist.push( a(emails[each]) );
			}
			emaillist = _.flatten(emaillist);
			emaillist = _.uniq(emaillist, false, function(item) { return item.toLowerCase(); });

			return emaillist;
		}
		for( var i=0; i<rawDoc.data.length; i++ )
		{
			var emails = rawDoc.data[i].emailAddrs;
			if( emails != '[]' ) {
				emails = massager(emails);

				for(var each in emails) {
					var isBlacklisted = 
						ContactBlacklistService.isBlacklisted(emails[each]);
					if (!isBlacklisted)
						peopleUris.push( 
						'ldengine://' + owner + '//@' + source + '/person/' + emails[each]
					);
				}
			}
		}
		EventService.emit( 'document::translated', {
			'uri': uri,
			'owner': owner,
			'category': 'peopleList',
			'data': peopleUris
		});
		process.nextTick( function() {
			callback( null, peopleUris );
		});
	} catch( err ) {
		SystemLog.log( 'Request timed out at document translation,  [' + uri + ']', err);
    	callback(  err , null );
	}
};
module.exports = exports = FullcontactPeopleTranslator;
