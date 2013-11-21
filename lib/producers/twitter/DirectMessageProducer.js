var base = require( '../ProducerBase.js' );

function DirectMessageProducer() {
	base.init( this );
	var OAuth = require( 'oauth' ).OAuth;

	this.oauth = new OAuth( 
		engine.config.twitter.requestTokenURL, 
		engine.config.twitter.userAuthorizationURL, 
		engine.config.twitter.consumerKey, 
		engine.config.twitter.consumerSecret,
		"1.0", null, "HMAC-SHA1" );
}
base.inherit( DirectMessageProducer );

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
