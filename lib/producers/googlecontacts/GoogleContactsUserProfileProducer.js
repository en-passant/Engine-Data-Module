var base = require( '../GoogleProducerBase' );
function GoogleContactsUserProfileProducer( fetcher ) {
	this.fetcher = fetcher;
	base.init( this );
}
base.inherit( GoogleContactsUserProfileProducer );

GoogleContactsUserProfileProducer.prototype.init = function( done ) {
	var self = this;
	this.fetcher.tokenStore.getApplicationTokens( 'googlecontacts', function( error, tokens ) {
		if( error ) {
			done( error );
		}
		else
		{
			var OAuth = require( 'oauth' ).OAuth;
			self.oauth = new OAuth2( 
				tokens.clientID, 
				tokens.clientSecret,
				'https://accounts.google.com', 
				'/o/oauth2/auth', 
				'/o/oauth2/token' );
			done();
		}
	} );
}
GoogleContactsUserProfileProducer.prototype.getMatchPatterns = function() {
	return [ '^acct:googlecontacts:[0-9]+', '/user/[0-9]+' ];
}
GoogleContactsUserProfileProducer.prototype.getDataUrl = function( resource ) {
	return 'https://www.googleapis.com/oauth2/v1/userinfo';
}
GoogleContactsUserProfileProducer.prototype.processData = function( uri, owner, source, resource, data, callback ) {
	var desiredUserId = resource.match( /^\/user\/([0-9]+)/ )[1];

	if( desiredUserId != JSON.parse( data ).id )
	{
		callback( 'GoogleContactsUserProfileProducer only supports getting the user profile of the logged in user, currently.', null );
	}
	else
	{
		var result = {
			'uri': uri,
			'data': data
		};
		callback( null, result );

	}
}

module.exports = exports = GoogleContactsUserProfileProducer;