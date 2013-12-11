var Moment = require( 'moment' );
var base = require( '../ProducerBase.js' );
var ImapService = require( './ImapService.js' );

function ImapMailboxContentsProducer( fetcher ) {
	this.fetcher = fetcher;
    base.init( this );
}
base.inherit( ImapMailboxContentsProducer );

ImapMailboxContentsProducer.prototype.getMatchPatterns = function() {
	return [ '^acct:((imap)|(gmail)):.+', '/mailbox/[^_].*' ];
}
ImapMailboxContentsProducer.prototype.attemptRequest = function( uri, owner, source, resource, keys, callback ) {
	var self = this;
	var mailboxName = null;

	var sinceMatch = resource.match( '\\?since=([0-9]+)' );
	var since = null;
	if( sinceMatch != null )
	{
		since = parseInt( sinceMatch[1] );
		mailboxName = resource.match( '/mailbox/([^_].*)\\?since=[0-9]+' )[1];
	}
	else
	{
		mailboxName = resource.match( '/mailbox/([^_].*)' )[1];
	}

	var query;
	if( since )
		query = [[ 'SINCE', new Date( since )]];
	else 
		query = [ 'ALL' ];

	ImapService.searchForIDs( owner, keys, mailboxName, query, 
        function( error, data ){
        	console.log( 'Producer got: ' + require( 'util' ).inspect( data ));
            if( error ) {
	        	console.log( error.stack );
                callback( error, null );
			}
            else
            {
                callback( null, {
                    'uri': uri, 
                    'data': data
                });
            }
        } );
};
module.exports = exports = ImapMailboxContentsProducer;
