var base = require( '../GoogleProducerBase' );
function GoogleContactsContactListProducer() {
	base.init( this, 'googlecontacts' );
}
base.inherit( GoogleContactsContactListProducer );

GoogleContactsContactListProducer.prototype.getMatchPatterns = function() {
	return [ '^acct:googlecontacts:[0-9]+', '/contacts' ];
}
GoogleContactsContactListProducer.prototype.getDataUrl = function( resource ) {
	return 'https://www.google.com/m8/feeds/contacts/default/full?max-results=10000000';
}
GoogleContactsContactListProducer.prototype.processData = function( uri, owner, source, resource, data, callback ) {
	var result = {
		'uri': uri,
		'data': data
	};
	callback( null, result );
}

module.exports = exports = GoogleContactsContactListProducer;
