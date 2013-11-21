var base = require( '../ProducerBase.js' );

function ImapUserProfileProducer() {
    base.init( this );
}
base.inherit( ImapUserProfileProducer );

ImapUserProfileProducer.prototype.getMatchPatterns = function() {
	return [ '^acct:imap:.+', '/user/.+' ];
}
ImapUserProfileProducer.prototype.attemptRequest = function( uri, userId, source, resource, connectionInfo, callback ) {
	var self = this;

	callback( null, {
			'username': connectionInfo.username,
			'server': connectionInfo.host,
			'port': connectionInfo.port,
			'secure': connectionInfo.secure
		} );
};
module.exports = exports = ImapUserProfileProducer;
