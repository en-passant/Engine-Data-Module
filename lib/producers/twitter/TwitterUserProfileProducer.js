var base = require( '../ProducerBase.js' );
function TwitterUserProfileProducer() {
	base.init( this );
	var OAuth = require( 'oauth' ).OAuth;

	this.oauth = new OAuth( 
		engine.config.twitter.requestTokenURL, 
		engine.config.twitter.userAuthorizationURL, 
		engine.config.twitter.consumerKey, 
		engine.config.twitter.consumerSecret,
		"1.0", null, "HMAC-SHA1" );
}
base.inherit( TwitterUserProfileProducer );

TwitterUserProfileProducer.prototype.getMatchPatterns = function() {
	return [ '^acct:twitter:[0-9]+', '/user/[0-9]+' ];
}
TwitterUserProfileProducer.prototype.attemptRequest = function( uri, owner, source, resource, keys, callback ) {
	var self = this;

	var userId = resource.match( /^\/user\/([0-9]+)/ )[1];

	var twitterUrl = 'https://api.twitter.com/1.1/users/show.json?user_id=' + userId;
	self.oauth.get( twitterUrl, keys.token, keys.tokenSecret, 
		function( error, result ) {
			if( error )
				callback( error, null );
			else
			{
				callback( null, {
					'uri': uri,
					'data': result
				});
			}
		} 
	);
};
module.exports = exports = TwitterUserProfileProducer;
