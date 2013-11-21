var base = require( '../ProducerBase.js' );
var https = require('https');
var qs = require('querystring');
var _ = require('underscore');

function FullcontactUserProfileProducer() {
    base.init( this );
	this.options = _.clone(engine.config.fullcontact);
	this.keys = 'ignore';
}
base.inherit( FullcontactUserProfileProducer );

FullcontactUserProfileProducer.prototype.getMatchPatterns = function() {
    return [ '^public:fullcontact', '/person/.*' ];
}
FullcontactUserProfileProducer.prototype.attemptRequest = function( uri, owner, source, resource, keys, callback ) {
    var self = this,
		body = '',
		request;
	
	self.generateParams(self, uri, resource);
	
	//var dataTooOld = (DocumentCacheService._dataIsTooOld(uriFullContact, data.timestamp) == false);
	
	var CM = new ContactManagerService(owner);
	CM.checkSelectedFullContactExists(resource, function(itemExists) { 
		SystemLog.debug(" item exists : " + itemExists);
		if(itemExists == true) { 
			callback(null, null);
		}
		else {
			request = https.request(self.options, function(response) {
				if( response.statusCode != 200 && response.statusCode != 404)
				{
					if( response.statusCode == 202 )
					{
						SystemLog.log( 'ContactManagerService query returned 202 Accepted, will retry after a pause.' );
						setTimeout( function() {
							callback( new Error( 'ContactManagerService query returned 202 Accepted.' ), null );
						}, 250 );
					}
					else
					{
						SystemLog.log( 'Miscellaneous error in ContactManagerService query, will retry.' );
						callback( new Error( 'Miscellaneous error (' + response.statusCode + ') in ContactManagerService query, will retry.' ), null);
					}
				}
				else 
				{
					response.on('data', function (chunk) {
						body += chunk;
					});
					response.on('end', function() {
						SystemLog.log( 'FullContact Request completed :' + body);
						callback(null, {
							'uri': uri,
							'data': body 
						});
					});
				}
			});
			request.on( 'error', function( e ) {
					SystemLog.log( 'Error making FullContact request', e );
					callback(e.message, null);
			});
			request.end();
		}
	});
};
FullcontactUserProfileProducer.prototype.generateParams = function(self, uri , resource) {
	var self = this,
		fcQuery,
		path = '/v2/person.json?';

	fcQuery = {
		apiKey : self.options.apiKey
	}

	var id = resource.match(/[^/]+$/);
	fcQuery.email = id;

	/* Currently we only search FullContact by email.
	switch( resource.split("/")[2] )   {
		case "facebook": fcQuery.facebookUsername = id; break; 
		case "email": fcQuery.email = id; break;
		case "twitter": fcQuery.twitter = id;
	}*/

	self.options.path = path + qs.stringify(fcQuery);
	
	return ;
};
module.exports = exports = FullcontactUserProfileProducer;
