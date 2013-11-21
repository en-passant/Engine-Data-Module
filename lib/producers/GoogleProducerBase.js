var base = require( './ProducerBase.js' );

exports.init = function( object, configurationSection ) {
	base.init( this );
	var OAuth2 = require( 'oauth' ).OAuth2;
	object.oauth2 = new OAuth2( engine.config[ configurationSection ].clientID, 
		engine.config[ configurationSection ].clientSecret,
		'https://accounts.google.com', '/o/oauth2/auth', '/o/oauth2/token' );

};
exports.inherit = function( subclass ) {
	base.inherit( subclass );

	subclass.prototype.attemptRequest = function( uri, owner, source, resource, keys, callback ) {

		var self = this;

		var timesRefreshed = 0;
		var url = self.getDataUrl( resource );
		var needsTokenRefresh = function( error ) {
			if( error.statusCode )
				if( error.statusCode == 401 || error.statusCode == 400 || error.statusCode == 404 )
					return true;

			return false;
		};
		var retryRequest = function( error, data, response ) {
			if( error )
			{
				if( needsTokenRefresh( error ))
				{
					self.oauth2.getOAuthAccessToken( 
						keys.refreshToken,
						{ 'grant_type': 'refresh_token' },
						function( error, accessToken, refreshToken, results ) {
							keys.accessToken = accessToken;
							AccountsService.updateAccountInformation( 
								owner, source, keys, function( error ) {
									if( error )
									{
										error.originalUrl = url;
										callback( error, null );
									}
									else
										self.oauth2.get( url, keys.accessToken, 
											function( error, result ) {
												if( error )
												{
													error.originalUrl = url;
													if(error.statusCode == 401 ) {
														error = 'Login/Authentication failure for ' + uri +
															' at attempt of url ' + url; 
													}
													callback( error, null );
												}
									            else
													self.processData( uri, owner, source, resource, result, callback );
											} );
								});
						});
				}
				else
				{
					var error = new Error( 'Could not create Google connection, no password, accessToken, or refresh token was available.' );
					error.owner = owner;
					error.account = source;
					if(error.statusCode == 401) {
						error = 'Login/Authentication failure for ' + uri + ' at attempt of url ' + url; 
					}
					callback( error, null );
				}
			}
			else
			{
				self.processData( uri, owner, source, resource, data, callback );
			}
		};
		self.oauth2.get( url, keys.accessToken, retryRequest );

	};
};
