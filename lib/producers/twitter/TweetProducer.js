var base = require( '../ProducerBase.js' );
function TweetProducer() {
	var OAuth = require( 'oauth' ).OAuth;

	this.oauth = new OAuth( 
		engine.config.twitter.requestTokenURL, 
		engine.config.twitter.userAuthorizationURL, 
		engine.config.twitter.consumerKey, 
		engine.config.twitter.consumerSecret,
		"1.0", null, "HMAC-SHA1" );
}
base.inherit( TweetProducer );

TweetProducer.prototype.getMatchPatterns = function() {
	return [ '^acct:twitter:[0-9]+', '^/status/[0-9]+' ];
}
TweetProducer.prototype.attemptRequest = function( uri, owner, source, resource, keys, callback ) {
	var userId = resource.match( /^\/status\/([0-9]+)/ )[1];

	var twitterUrl = 'https://api.twitter.com/1.1/statuses/show.json?id=' + userId;
	self.oauth.get( twitterUrl, keys.token, keys.tokenSecret, 
	function( error, data ) {
		if( error )
			callback( error, null );
		else
		{
			callback( null, {
				uri: uri,
				data: data
			});
		}
	} );
};
module.exports = exports = TweetProducer;
