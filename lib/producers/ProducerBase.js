var Retry = require( '../util/RetryUtil' );

exports.init = function( object ) {
}

exports.inherit = function( subclass ) {
	subclass.prototype.produce = function( uri, owner, source, resource, callback ) {
		var self = this;
		AccountsService.getUserAccountInfo( owner, source, function( keys ) {
			if( keys != null || self.keys == 'ignore' )
			{
				var retry = new Retry( 
					function( callback ) { // Use the subclass method to actually make the query.
						try {
							self.attemptRequest( uri, owner, source, resource, keys, callback );
						} catch( error ) {
							callback( error );
						}
					},
					3, // Limit ourselves to three retries, in the "best" failure case.
					function( errorWeMightWaitBecauseOf ) { // If we get back a status code of 202, wait 250ms before trying again.
						if( errorWeMightWaitBecauseOf.statusCode == 202 )
							return 250;
						else
							return 0;
					},
					function( errorThatMightMakeUsGiveUp ) { // If we get a 400 series error, just give up.  This means we sent something that the remote server didn't like, and doing it again won't help.
						if( errorThatMightMakeUsGiveUp.statusCode >= 400 && errorThatMightMakeUsGiveUp.statusCode < 500 )
						{
							EventService.emit("account::tag",{ 'owner': owner,'accountId': source } );
							return true;
						}
						else
							return false;
					}
				);
				retry.query( function( error, result ) {
					if( !error )
					{
						EventService.emit( "document::load", result );
					}
					callback( error, result );
				});
						
			}
			else
			{
				callback( new Error( 'Keyset for ' + uri + ' was null.' ), null );
			}
		} );
	}
}
