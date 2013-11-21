var base = require( '../ProducerBase.js' );

function ImapMessageProducer() {
    base.init( this );
}
base.inherit( ImapMessageProducer );

ImapMessageProducer.prototype.getMatchPatterns = function() {
	return [ '^acct:((imap)|(gmail)):.+', '/message/[^/]*/uid/[^/]*$' ];
}
ImapMessageProducer.prototype.attemptRequest = function( uri, owner, source, resource, keys, callback ) {
	var self = this;
	var parsedResource = resource.match( /\/message\/([^\/]*)\/uid\/([^\/]*)$/ );
    var mailbox = parsedResource[1];
	var messageId = parsedResource[2];

    ImapService.fetch( owner, keys, mailbox, messageId, 
        function( error, data ){
            if( error )
                callback( error, null );
            else if( data )
            {
                callback( null, {
                    'uri': uri, 
                    'data': data
                });
            }
            else
            {
                var error = new Error( '(ImapUidMessageProducer) Undefined message data for uri: ' + uri );
                error.data = data;
                error.uri = uri;
                callback( error, null );
            }
        } );
};

module.exports = exports = ImapMessageProducer;
