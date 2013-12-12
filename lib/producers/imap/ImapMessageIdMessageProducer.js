var base = require( '../ProducerBase.js' );
var ImapService = require( './ImapService.js' );

function ImapMessageProducer( fetcher ) {
    this.fetcher = fetcher;
    base.init( this );
}
base.inherit( ImapMessageProducer );

ImapMessageProducer.prototype.getMatchPatterns = function() {
	return [ '^acct:((imap)|(gmail)):.+', '/message/.*/message-id/[^/]*$' ];
}
ImapMessageProducer.prototype.attemptRequest = function( uri, owner, source, resource, keys, callback ) {
	var self = this;
	var parsedResource = resource.match( /\/message\/(.*)\/message-id\/([^\/]*)$/ );
    var mailbox = parsedResource[1];
	var messageId = parsedResource[2];

	ImapService.searchForMessages( owner, keys, mailbox, [[ 'HEADER', 'Message-ID', messageId ]], 
        function( error, data ){
            if( error )
            {
                callback( error, null );
            }
            else
            {
                if( data.length < 1 )
                {
                    callback( new Error( 'No message found for ' + uri + ', mail server may not support searching by Message-ID.' ));
                }
                else
                {
                    callback( null, {
                        'uri': uri, 
                        'data': data[0]
                    });                    
                }
            }
        } );
};

module.exports = exports = ImapMessageProducer;
