function ImapMailboxListTranslator() {
}
ImapMailboxListTranslator.prototype.getMatchPatterns = function() {
	return [ '^acct:((imap)|(gmail)):.+', '/mailbox/_index' ];
}
ImapMailboxListTranslator.prototype.translate = function( uri, owner, rawDoc, callback ) {
	try {
		if( rawDoc.data.length == 0 )
		{
			SystemLog.error( 'No data returned for mailbox list for ' + uri + ' - maybe an error occured in the MailboxListProducer?' );
			callback( null, [] );
		}
		else
		{
			var boxList = new Array();
			// Don't have a good example of how namespaces work, so we'll just go with the first one.
	/*		for( var nsNumber in rawDoc ) 
			{*/
				var prefix = '';
				var delim;
				if (typeof rawDoc.data[ 0 ] != "undefined") {
				    prefix = rawDoc.data[ 0 ].prefix;
				    delim = rawDoc.data[ 0 ].delim;
				}

				this.addBoxesRecursively( rawDoc.data[ 0 ].boxes, delim, prefix, boxList );
	//		}

			var outputData = {
				'uri': uri,
				'owner': owner,
				'category': 'messageGroupList',
				'data': boxList
			};
	        NLPService.addAnalysisIfMissing( outputData, function( error, result ) {
	   			if( !error )
	   			{
					EventService.emit( "document::translated", result );
	   			}
	        	process.nextTick( function() {
	        		callback( error, result.data );
	        	});
	   		});

		}
	} catch( err ) {
		SystemLog.log('Error translating IMAP mailbox list,  [' + uri + ']', err);
		SystemLog.log( 'ImapMailboxListTranslator rawDoc was: ' + require( 'util' ).inspect( rawDoc ));
        callback( err , null );
	}
};
ImapMailboxListTranslator.prototype.addBoxesRecursively = function( boxes, delim, pathSoFar, output ) {
	for( var boxName in boxes ) {

		var fullBoxName = pathSoFar + boxName;

		if( !this.hasAttribute( boxes[ boxName ], 'NOSELECT' ) && 
		    !this.hasAttribute( boxes[ boxName ], 'TRASH' ) && 
		    !this.hasAttribute( boxes[ boxName ], 'SPAM' ) )
		{
			output.push( fullBoxName );
		}

		if( boxes[ boxName ].children && !_.isUndefined( delim ) )
		{
			SystemLog.log( boxes[ boxName ].children );
			this.addBoxesRecursively( boxes[ boxName ].children, delim, fullBoxName + delim, output );
		}
	}
}
ImapMailboxListTranslator.prototype.hasAttribute = function( box, lookingFor ) {
  if( !box.attribs )
    return false;

	for( var i=0; i<box.attribs.length; i++ )
	{
		if( box.attribs[ i ] == lookingFor )
			return true;
	}

	return false;
}
module.exports = exports = ImapMailboxListTranslator;
