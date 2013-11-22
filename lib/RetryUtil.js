/**
 * Utility method which makes it simpler and easier to make a network request with retry capability, 
 * a limit no the number of retries, and a way to quit early with a truly fatal error.
 * makeRequest should be a function that makes a request, and takes a callback whose arguments are error, result.
 * limit should be a number. -1 will mean no limit.
 * shouldWait should be a function which takes an error as input, and returns an integer that gives the number of ms to wait before retrying.
 * isFatal should be a function which takes an error as input, and returns true if the error is the sort that should terminate retrying.
 * recoverFromFailure should be a function which takes a callback as an argument, which takes only an error as its argument.
 *     recoverFromFailure is executed after an error, but before we retry - it could be used to refresh access tokens, for example.
 **/
 function Retry( makeRequest, limit, shouldWait, isFatal, recoverFromFailure ) {
 	if( makeRequest )
 		this._makeRequest = makeRequest;
 	if( limit > 0 )
 		this._limit = limit;
 	else
 		this._limit = -1;
 	if( shouldWait )
 		this._shouldWait = shouldWait;
 	if( isFatal )
 		this._isFatal = isFatal;
 	if( recoverFromFailure )
 		this._recoverFromFailure = recoverFromFailure;
 }
Retry.prototype.query = function( callback ) {
	var self = this;
	var attemptCount = 0;
	function requestor() {
		attemptCount++;
		self._makeRequest( function( error, result ) {
			if( error )
			{
				if( self._isFatal && self._isFatal( error ) )
				{
					callback( error );
				}
				else
				{
					if( self._limit > 0 && attemptCount >= self._limit )
					{
						var tooManyRetriesError = new Error( 'Too Many Retries, see this.finalError for final error.' );
						if(typeof error == 'string' ) {
							var matched = error.match(/Login\/Authentication failure/)
							if( matched && matched[0] )  
                   				error = 'Authentication error occurred';
						}
						else {
							if (error.message)
								if( error.message == 'AUTHENTICATION_ERROR' )
									error = 'Authentication error occurred';
						}
						tooManyRetriesError.finalError = error;
						callback( tooManyRetriesError );
					}
					else
					{
						if( self._recoverFromFailure )
						{
							self._recoverFromFailure( function( error ) {
								if( error )
								{
									var errorInRecoveryError = new Error( 'Error recovering from previous failure in preparation for retry, see this.finalError for final error.' );
									errorInRecoveryError.finalError = error;
									callback( errorInRecoveryError );
								}
								else
								{
									if( self._shouldWait )
										setTimeout( requestor, self._shouldWait( error ));										
									else
										process.nextTick( requestor );
								}
							});
						}
						else
						{
							if( self._shouldWait )
								setTimeout( requestor, self._shouldWait( error ));
							else
								process.nextTick( requestor );
						}
					}

				}
			}
			else
			{
				callback( null, result );
			}
		});
	}

	process.nextTick( requestor );
}

module.exports = exports = Retry;
