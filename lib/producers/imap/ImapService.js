var ImapConnection = require( 'imap' ).ImapConnection;
var OAuth2 = require( 'oauth' ).OAuth2;
var Async = require( 'async' );
var utils = require( 'imap/lib/imap.utilities' );
var _ = require( 'underscore' );

console.log( 'Run ImapService!' );

function ImapService() {
	this.connections = {};
	this.recentRefreshTimes = {};
	setTimeout( this._deleteIdleConnections(), 5000 );
	setTimeout( this._deleteOldRefreshTimes(), 600000 );
}

/**
 * callback: function( numClosed ).
 */
ImapService.prototype.shutdown = function( callback ) {
	var self = this;

	var toRemove = this._getAllConnections();

	Async.each( toRemove,
		function( connectionInfo, done ) {
			self._disposeOfDeadConnection( 
				connectionInfo.owner, 
				connectionInfo.account,
				connectionInfo.connection,
				done );
		},
		function( error ) {
			console.trace( error );
			callback( toRemove.length );
		}
	);
}

ImapService.prototype._getAllConnections = function() {
	var result = [];
	for( var owner in this.connections )
	{
		if( this.connections.hasOwnProperty( owner ))
		{
			for( var host in this.connections[ owner ])
			{
				if( this.connections[ owner ].hasOwnProperty( host ))
				{
					for( var port in this.connections[ owner ][ host ])
					{
						if( this.connections[ owner ][ host ].hasOwnProperty( port ))
						{
							for( var user in this.connections[ owner ][ host ][ port ])
							{
								if( this.connections[ owner ][ host ][ port ].hasOwnProperty( user ))
								{
									result.push( {
										owner: owner,
										account: {
											host: host,
											port: port, 
											username: user
										},
										connection: this.connections[ owner ][ host ][ port ][ user ]
									});
								}
							}
						}
					}
				}
			}
		}
	}
	return result;
}

/**
 * callback: function( error, message )
 */
ImapService.prototype.fetch = function( owner, account, mailbox, messageId, callback ) {
	this._fetch( owner, account, mailbox, messageId, false, callback );
}

ImapService.prototype.fetchBySeqNo = function( owner, account, mailbox, messageId, callback ) {
	this._fetch( owner, account, mailbox, messageId, true, callback );
}

ImapService.prototype._fetch = function( owner, account, mailbox, messageId, useSeq, callback ) {
	var self = this;
	var retried = 0;
	var retry = function( connection ) {
		if( connection )
		{
			connection.deadListener = null;
			self._disposeOfDeadConnection( owner, account, connection );
		}
		retried++;
		if( retried < 5 )
			self.fetch( owner, account, mailbox, messageId, callback );
		else
			callback( new Error( 'Too many retries performing search' ), null );
	};

	self._getConnectionForAccount( owner, account, function( error, connection ) {
		if( error )
		{
			if( self._isFatalConnectionError( error ) )
			{
				callback( error );
			}
			else
			{
				retry( connection );				
			}
		}
		else
		{
			if( connection )
			{
				var deadListener = function() {
					connection.deadListener = null;
					callback( new Error( 'Connection was killed' ), null );
				}
				connection.deadListener = deadListener;

				connection.openBox( mailbox, true, function( error ) {
					if( error )
					{
						if( self._isFatalConnectionError( error ) )
						{
							callback( error );
						}
						else
						{
							retry( connection );				
						}
					}
					else
					{
						self._fetchMessage( 
							useSeq ? connection.seq : connection, messageId, 
							{
								'struct': true,
								'markSeen': false
							},
							function( error, message ) {
								if( error )
								{
									if( self._isFatalConnectionError( error ) )
									{
										callback( error );
									}
									else
									{
										retry( connection );				
									}
								}
								else
								{	
									connection.closeBox( function( error ) {
										connection.deadListener = null;
										if( error )
										{
											self._disposeOfDeadConnection( owner, account, connection );
											callback( error, message );
										}
										else
										{
											self._releaseConnection( owner, account, connection );
											callback( null, message );
										}
									});
								}
							}
						);
					}
				} );
			}
			else
			{
				callback( new Error( 'IMAP Authentication failed.'), null );
			}
		}
	} );

}

ImapService.prototype._fetchMessage = function( connection, messageId, settings, callback ) {
	var timedout = false;
	var data = {
		'chunks': new Array()
	};
	connection.fetch( messageId, settings, {
		'headers': { parse: false },
		'body': true,
		cb: function( fetch ) {
			fetch.on('message', function(msg) {

				msg.on('data', function(chunk) {
					data.chunks.push( chunk.toString() );
				});
				
				msg.on('end', function() {
					data.id = msg.id;
					data.date = msg.date;
					data.flags = msg.flags;
					data.structure = msg.structure;
					data[ 'x-gm-thrid' ] = msg[ 'x-gm-thrid' ];
					data[ 'x-gm-msgid' ] = msg[ 'x-gm-msgid' ];
					data[ 'x-gm-labels'] = msg[ 'x-gm-labels' ];
					if( msg.headers )
						data.headers = msg.headers;
				});
			});
			fetch.on( 'timeout', function() {
				timedout = true;
				callback( new Error( 'Fetch timed out' ), null );
			});
			fetch.on('end', function() {
			});
		}
	}, function( error ) {
		if( error )
			callback( error, null );
		else
		{
			if( !timedout && !connection.dead )
			{	
				callback( null, data );	
			}			
		}
	} );
	var fetch = connection.fetch( messageId, settings );
	
}

ImapService.prototype.searchForIDs = function( owner, account, mailbox, query, callback ) {
	var messageIdSets = [];

	this._search( 
		owner, account, mailbox, query, 
		{
			headers: 'message-id',
			cb: function( fetch ) {
				fetch.on('message', function(msg) {
					var headers;
		            msg.on('headers', function(hdrs) {
		            	headers = hdrs;
		            });
		            msg.on('end', function() {
		            	var ids = {
		            		'message-id': headers[ 'message-id' ],
		            		'x-gm-msgid': msg[ 'x-gm-msgid' ],
		            		uid: msg.uid,
		            		seqno: msg.seqno
		            	};
		            	messageIdSets.push( ids );
		            });
		          });
			}
		},
		function( error ) {
			callback( error, messageIdSets );
		});
}

ImapService.prototype.searchForMessages = function( owner, account, mailbox, query, callback ) {
	var messages = [];
	this._search( 
		owner, account, mailbox, query, 
		{
			'headers': { parse: false },
			body: true,
			cb: function( fetch ) {
				var data = {
					'chunks': new Array()
				};
				fetch.on('message', function(msg) {

					msg.on('data', function(chunk) {
						data.chunks.push( chunk.toString() );
					});
					
					msg.on('end', function() {
						data.id = msg.id;
						data.date = msg.date;
						data.flags = msg.flags;
						data.structure = msg.structure;
						data[ 'x-gm-thrid' ] = msg[ 'x-gm-thrid' ];
						data[ 'x-gm-msgid' ] = msg[ 'x-gm-msgid' ];
						data[ 'x-gm-labels'] = msg[ 'x-gm-labels' ];
						if( msg.headers )
							data.headers = msg.headers;
					});
		            msg.on('end', function() {
		            	messages.push( data );
					});
				});
				fetch.on( 'timeout', function() {
					timedout = true;
					callback( new Error( 'Search for message timed out' ), null );
				});
			}
		},
		function( error ) {
			callback( error, messages );
		});

}

/**
 * callback: function( error, messageIds )
 */
ImapService.prototype._search = function( owner, account, mailbox, query, options, callback ) {
	var self = this;

	var retried = 0;
	var retry = function( connection ) {
		if( connection )
		{
			connection.deadListener = null;
			self._disposeOfDeadConnection( owner, account, connection );
		}
		retried++;
		if( retried < 5 )
			self._search( owner, account, mailbox, query, options, callback );
		else
			callback( new Error( 'Too many retries performing search' ), null );
	};

	self._getConnectionForAccount( owner, account, function( error, connection ) {
		if( error )
		{
			if( self._isFatalConnectionError( error ) )
			{
				callback( error );
			}
			else
			{
				retry( connection );				
			}
		}
		else
		{
			if( connection )
			{
				var deadListener = function() {
					connection.deadListener = null;
					callback( new Error( 'Connection was killed' ), null );
				}
				connection.deadListener = deadListener;

				try {
					connection.openBox( mailbox, true, function( error ) {
						if( error )
						{
							if( self._isFatalConnectionError( error ) )
							{
								callback( error );
							}
							else
							{
								retry( connection );				
							}
						}
						else
						{
							connection.search( query, function( error, messageIds ) {

								if( error )
								{
									if( self._isFatalConnectionError( error ) )
									{
										callback( error );
									}
									else
									{
										retry( connection );				
									}
								}
								else
								{
									try {									
										connection.fetch( messageIds, options, 
											function( error ) {
												if( error )
												{
													self._disposeOfDeadConnection( owner, account, connection );
													callback( null );
												}
												else
												{
													connection.closeBox( function( error ) {
														connection.deadListener = null;
														if( error )
														{
															self._disposeOfDeadConnection( owner, account, connection );
															callback( null );
														}
														else
														{
															self._releaseConnection( owner, account, connection );
															callback( null );
														}
													});
												}
											}
										);	
									} catch( error ) {
										if( error.message != 'Nothing to fetch' )
										{
											self._disposeOfDeadConnection( owner, account, connection );
										}
										else
										{
											self._releaseConnection( owner, account, connection );										
										}
										callback( null );
									}
								
								}
							});
						}
					});
				}
				catch( error )
				{
					if( self._isFatalConnectionError( error ) )
					{
						callback( error );
					}
					else
					{
						retry( connection );				
					}
				}
			}
			else
			{
				callback( new Error( 'IMAP Authentication Failed' ), null );
			}
		}
	});
}

/**
 * callback: function( error, mailboxes )
 */
ImapService.prototype.getMailboxes = function( owner, account, callback, retried ) {
	var self = this;

	if( retried == null )
     retried = 0;
  var retry = function( error, connection ) {
		if( connection )
		{
			connection.deadListener = null;
			self._disposeOfDeadConnection( owner, account, connection );
		}
		if( retried < 5 )
			self.getMailboxes( owner, account, callback, retried+1 );
		else
			callback( error, null );
	};
	self._getConnectionForAccount( owner, account, function( error, connection ) {
		if( error )
		{
			if( self._isFatalConnectionError( error ) )
			{
				callback( error );
			}
			else
			{
				retry( error, connection );				
			}
		}
		else
		{
			if( connection )
			{
				self._getMailboxes( owner, connection, function( error, results ) {
					if( error )
					{
						if( self._isFatalConnectionError( error ) )
						{
							callback( error );
						}
						else
						{
							retry( error, connection );				
						}
					}
					else
					{
						self._releaseConnection( owner, account, connection );
						callback( null, results );
					}
				});
			}
			else
			{
				callback( new Error( 'IMAP Authentication Failed' ), null );
			}

		}
	});
}

/**
 * callback: function( error, success )
 */
ImapService.prototype.testAuthentication = function( owner, account, callback ) {
	var self = this;

	var timedout = false;
	var finished = false;
	setTimeout( function() {
		if( !finished )
		{
			timedout = true;
			callback( new Error( 'Connection timed out to: ' + account.host + ':' + account.port + ', secured=' + account.secured ));
		}
	}, 30000 );
	self._createNewConnection( owner, account, function( error, connection ) {
		if( !timedout )
		{
			finished = true;
			if( error )
			{
				if( error.code == 'AUTHENTICATIONFAILED' )
					callback( null, false );
				else
					callback( error, false );
			}
			else
			{
				if( connection )
				{
					connection.logout( function() {
						callback( null, true );
					} );
				}
				else
				{
					callback( null, false );
				}
			}
		}
		else
		{
			if( connection )
				connection.logout( function() {} );
		}
	});
}

ImapService.prototype._getExistingConnection = function( owner, account ) {
	if( this.connections[ owner ] )
		if( this.connections[ owner ][ account.host ])
			if( this.connections[ owner ][ account.host ][ account.port ])
				return this.connections[ owner ][ account.host ][ account.port ][ account.username ];
	return null;
}

ImapService.prototype._storeConnection = function( owner, account, connection ) {
	if( !this.connections[ owner ])
		this.connections[ owner ] = {};

	if( !this.connections[ owner ][ account.host ])
		this.connections[ owner ][ account.host ] = {};

	if( !this.connections[ owner ][ account.host ][ account.port ])
		this.connections[ owner ][ account.host ][ account.port ] = {};

	this.connections[ owner ][ account.host ][ account.port ][ account.username ] = connection;

}

ImapService.prototype._deleteConnection = function( owner, account ) {
	delete this.connections[ owner ][ account.host ][ account.port ][ account.username ];
	if( this._isEmpty( this.connections[ owner ][ account.host ][ account.port ]))
	{
		delete this.connections[ owner ][ account.host ][ account.port ];
		if( this._isEmpty( this.connections[ owner ][ account.host ] ))
		{
			delete this.connections[ owner ][ account.host ];
			if( this._isEmpty( this.connections[ owner ]))
				delete this.connections[ owner ];
		}
	}
}

ImapService.prototype._isEmpty = function( map ) {
	for( var p in map )
		if( map.hasOwnProperty( p ))
			return false;
	return true;
}

/**
 * If no connection to the server already exists, creates one.
 * if one is busy, waits until it is available and then returns it.
 * If a connection cannot be created because authentication failed, returns
 * no error and a null connection.
 */
ImapService.prototype._getConnectionForAccount = function( owner, account, callback ) {
	var self = this;
	var existingConnection = self._getExistingConnection( owner, account );
	if( existingConnection )
	{
		if( existingConnection.busy )
			setTimeout( function() {
				self._getConnectionForAccount( owner, account, callback );
			}, 1000 );
		else 
		{
			existingConnection.busy = true;
			callback( null, existingConnection );
		}
	}
	else
	{
		// create a new one.
		self._createNewConnection( owner, account, function( error, connection ) {
			if( error ) {
				if( error.code == 'AUTHENTICATIONFAILED' ) {
		         error = "Authentication failed creating new IMAP connection.";
				}
				callback( error, null );
			}
			else
			{
				self._storeConnection( owner, account, connection );
            	connection.busy = true;
                callback( null, connection );
			}
		});
	}
}
ImapService.prototype._encodeXOAuth2 = function( username, accessToken ) {
	var clientResponse = 'user=' + username + '\u0001auth=Bearer ' + accessToken + '\u0001\u0001';
	return utils.escape( new Buffer( clientResponse ).toString('base64') );
}
ImapService.prototype._encodeAccountInfo = function( account ) {
	var encodedAccountInfo = {
		username: account.username,
		host: account.host,
		port: account.port,
		secure: account.secure,
		profileURI: account.profileURI
	};
	if( account.password ) {
		encodedAccountInfo.password = account.password;
	}
	if( account.accessToken ) {
		encodedAccountInfo.xoauth2 = this._encodeXOAuth2( account.username, account.accessToken );
		encodedAccountInfo.accessToken = account.accessToken;
  }
  if( account.refreshToken ) {
		encodedAccountInfo.refreshToken = account.refreshToken;
	}

	return encodedAccountInfo;
}

ImapService.prototype._refreshAndCreateConnection = function( owner, account, callback ) {
	var self = this;
	this._refreshToken( owner, account, function( error, newConnectionData ) {
		if( error )
		{
			// Don't need to log here because this is an internal function and we're passing the error up.
			callback( error, null );			
		}
		else
		{
			encodedAccountInfo = self._encodeAccountInfo( newConnectionData );
			connection = new ImapConnection( encodedAccountInfo );
			self._addConnectionErrorHandler( connection );

			connection.connect( function( error ) {
				if( error )
				{
					// Don't need to log here because this is an internal function and we're passing the error up.
					callback( error, null );
				}
				else
				{
	                callback( null, self._attachTimeout( owner, newConnectionData, connection ));
				}
			} );
		}
	} );
}

ImapService.prototype._createNewConnection = function( owner, account, callback ) {
	var self = this;

	// If we're logging in using a password, just do that.
	if( account.password )
	{
		var connection = new ImapConnection( account );
		self._addConnectionErrorHandler( connection );
	    connection.connect( function( error ) {
	        if( error )
	        {
            	callback( error, null );
	        }
	        else
	        {
	            callback( null, self._attachTimeout( owner, account, connection ));
	        }
	    });
	}
	else // If we're doing oauth instead,
	{
		if( account.accessToken )
		{
			var encodedAccountInfo = this._encodeAccountInfo( account );
			var connection = new ImapConnection( encodedAccountInfo );
			self._addConnectionErrorHandler( connection );
		    connection.connect( function( error ) {
		        if( error && error.status != "400" )
		        {
		        	if( self._isFatalConnectionError( error ) )
		        	{
		        		if( encodedAccountInfo.refreshToken && self._isDueToBeRefreshed( owner, account ) )
		        		{
			        		self._refreshAndCreateConnection( owner, account, callback );
		        		}
		        		else
		        		{
		        			// Don't need to log here because this is an internal function and we're passing the error up.
		        			callback( error, null );
		        		}
		        	}
		        	if( encodedAccountInfo.refreshToken && self._isDueToBeRefreshed( owner, account ) )
		        	{
		        		self._refreshAndCreateConnection( owner, account, callback );
		        	}
		        	else
		        	{
		        		// Don't need to log here because this is an internal function and we're passing the error up.
		            	callback( error, null );        		
		        	}
		        }
		        else
		        {
		            callback( null, self._attachTimeout( owner, account, connection ));
		        }
		    });			
		}
		else // If we didn't have an access token, let's just try to refresh.
		{
        	if( account.refreshToken && self._isDueToBeRefreshed( owner, account ) )
        	{
        		self._refreshAndCreateConnection( owner, account, callback );
        	}
        	else
        	{
        		var error = new Error( 'Could not create IMAP connection, no password, accessToken, or refresh token was available.' );
        		error.owner = owner;
        		error.account = account;
            	callback( error, null );        		
        	}
		}
	}
}

ImapService.prototype._addConnectionErrorHandler = function( connection ) {
	connection.on( 'error', function( error ) {
	});
}

ImapService.prototype._attachTimeout = function( owner, account, connection ) {
	var self = this;
	connection.on( 'timeout', function( error ) {
		self = _disposeOfDeadConnection( owner, account, connection );
	});
	return connection;
}

ImapService.prototype._disposeOfDeadConnection = function( owner, account, connection, optionalCallback ) {
	connection.dead = true;
	this._deleteConnection( owner, account, connection );
	if( connection.deadListener )
	{
		process.nextTick( function() {
			connection.deadListener();
		} );
	}
	connection.logout( function() {
		if( optionalCallback )
			optionalCallback();
	});
}

ImapService.prototype._releaseConnection = function( owner, account, connection ) {
	connection.busy = false;
	connection.idleAt = new Date().valueOf();
}

ImapService.prototype._getMailboxes = function( owner, connection, callback ) {
	var self = this;

	var namespaceList = new Array();

	for( var i in connection.namespaces.personal )
		namespaceList.push( connection.namespaces.personal[ i ] );
	for( var i in connection.namespaces.other )
		namespaceList.push( connection.namespaces.other[ i ] );
	for( var i in connection.namespaces.shared )
		namespaceList.push( connection.namespaces.shared[ i ] );

	var results = new Array();


	Async.eachSeries( 
		namespaceList, 
		function( ns, callback ) {
			var prefixes;
			if( _.isArray( ns.prefix ))
				prefixes = ns.prefix;
			else
				prefixes = [ ns.prefix ];

			Async.eachSeries( 
				prefixes, 
				function( prefix, done ) {
					self._getMailboxesForPrefix( owner, connection, prefix, ns.delim, 
						function( error, result ) {
							if( error )
								done( error );
							else
							{
								results.push( result );
								done( null );
							}
						}
					);
				},
				function( error ) {
					callback( error );		
				}
			);
		}, 
		function( err ) {
			if( err )
			{
				callback( err, null );
			}
			else
			{
				callback( null, results );
			}
		}
	);


}

ImapService.prototype._getMailboxesForPrefix = function( owner, connection, prefix, delim, callback ) {
	var self = this;

	var deadListener = function() {
		connection.deadListener = null;
		callback( new Error( 'Connection was killed' ), null );
	}
	connection.deadListener = deadListener;
	connection.getBoxes( prefix, function( error, boxes ) {
		connection.deadListener = null;
		if( error )
		{
			callback( error, null );
		}
		else
		{
			self._removeParentPointers( boxes );
			callback( null, 
				{
					'prefix': prefix,
					'delim': delim,
					'boxes': boxes
				} 
			);

		}
	});
}

ImapService.prototype._removeParentPointers = function( item ) {
	if( typeof item == 'object' )
	{

		for( var key in item ) 
		{
			if( item.hasOwnProperty( key ))
			{
				if( key == 'parent' )
				{
					delete item[ key ];
				}
				else
				{
					this._removeParentPointers( item[ key ]);
				}
			}
		}
	}
}

ImapService.prototype._deleteOldRefreshTimes = function() {
	var self = this;
	var startTime = new Date().getTime();
	var oldestAcceptable = startTime - 300000;
	var connectionList = Object.keys( self.recentRefreshTimes );
	var connectionCount = connectionList.length;

	Async.eachSeries( 
		connectionList,
		function( c, done ) {
			process.nextTick( function() {
					if( self.recentRefreshTimes.hasOwnProperty( c ))
						if( self.recentRefreshTimes[ c ] < oldestAcceptable )
						{
							delete self.recentRefreshTimes[ c ];
						}
					done();
				}
			);
		},
		function( error ) {
			var endTime = new Date().getTime();
			setTimeout( self._deleteOldRefreshTimes.bind( self ), 600000 );
		}
	);
}

ImapService.prototype._deleteIdleConnections = function() {
	var self = this;

	var toCheck = this._getAllConnections();
	var currentTime = new Date().valueOf();

	Async.each( toCheck,
		function( connectionInfo, done ) {
			if( connectionInfo.connection.idleAt && 
				( currentTime - connectionInfo.connection.idleAt ) > 10000 )
			{
				self._disposeOfDeadConnection( 
					connectionInfo.owner, 
					connectionInfo.account,
					connectionInfo.connection,
					done );
			}
			else
				done();
		},
		function( error ) {
			setTimeout( function() {
				self._deleteIdleConnections();
			}, 5000 );
		}
	);
}

ImapService.prototype._refreshToken = function( owner, account, done ) {
	var assembledKey = owner + '//@' + account;
	this.recentRefreshTimes[ assembledKey ] = new Date().getTime();
	
	var oauth2 = new OAuth2( 
		engine.config.gmail.clientID, 
		engine.config.gmail.clientSecret,
		'https://accounts.google.com', '/o/oauth2/auth', '/o/oauth2/token' );

	var parsedUri = account.profileURI.match( /([^:]*):\/\/(.*)\/\/@([^\/]*)(.*)/ );
	var accountName = parsedUri[3];

	oauth2.getOAuthAccessToken( 
		account.refreshToken,
		{ 'grant_type': 'refresh_token' },
		function( error, accessToken, refreshToken, results ) {
			if( error )
			{
				// Don't need to log the error here since this is an internal method and we're passing it up.
				done( error );
			}
			else
			{
				account.accessToken = accessToken;
				AccountsService.updateAccountInformation( 
					owner, accountName, account, function( error ) {
						done( null, account );
					}
				);
			}

		}
	);
}

ImapService.prototype._isDueToBeRefreshed = function( owner, account ) {
	var assembledKey = owner + '//@' + account;
	if( this.recentRefreshTimes[ owner ] && this.recentRefreshTimes[ owner ] < ( new Date().getTime() - 300000 ))
		return false;
	else
		return true;
}

ImapService.prototype._isFatalConnectionError = function( error ) {
	if( error.status == 400 ||
		error.statusCode == 400 ||
		error.statusCode == 403 ||
		error.toString().indexOf( 'Invalid credentials' ) == 7 )
	{
		return true;
	}
	else
	{
		return false;
	}
}

module.exports = exports = new ImapService();
