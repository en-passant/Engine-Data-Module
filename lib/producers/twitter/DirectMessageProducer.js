var base = require( '../ProducerBase.js' );

function DirectMessageProducer( fetcher ) {
	this.fetcher = fetcher;
	base.init( this );
}
base.inherit( DirectMessageProducer );

DirectMessageProducer.prototype.init = function( done ) {
	var self = this;
	this.fetcher.tokenStore.getApplicationTokens( 'twitter', function( error, tokens ) {
		if( error ) {
			done( error );
		}
		else
		{
			var OAuth = require( 'oauth' ).OAuth;
			self.oauth = new OAuth( 
				"https://api.twitter.com/oauth/request_token",
				"https://api.twitter.com/oauth/authorize",
				tokens.consumerKey, 
				tokens.consumerSecret,
				"1.0", null, "HMAC-SHA1" );
			done();
		}
	} );
}
DirectMessageProducer.prototype.getMatchPatterns = function() {
	return [ '^acct:twitter:[0-9]+', '^/direct/[0-9]+' ];
}
DirectMessageProducer.prototype.attemptRequest = function( uri, owner, source, resource, keys, callback ) {
	var messageId = resource.match( /^\/direct\/([0-9]+)/ )[1];

	var twitterUrl = 'https://api.twitter.com/1.1/direct_messages/show.json?id=' + messageId;

	this.oauth.get( twitterUrl, keys.token, keys.tokenSecret, function( error, data ){
		if( error )
			callback( error, null );
		else
		{
			callback( null, {
				'uri': uri,
				'data': data
			} );
		}
	} );
};
module.exports = exports = DirectMessageProducer;
