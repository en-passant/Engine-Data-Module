var base = require( '../ProducerBase.js' );

function GithubContactListProducer() {
    base.init( this );
    var OAuth2 = require( 'oauth' ).OAuth2;

    this.oauth2 = new OAuth2( 
        engine.config.github.clientID, 
        engine.config.github.clientSecret, 
        "https://api.singly.com", "/oauth/authenticate", "/oauth/access_token" );
}
base.inherit( GithubContactListProducer );

GithubContactListProducer.prototype.getMatchPatterns = function() {
    return [ '^acct:github:[0-9]+', '/contacts' ];
}
GithubContactListProducer.prototype.attemptRequest = function( uri, owner, source, resource, keys, callback ) {
    var self = this;
    var followersUrl = 'https://api.singly.com/proxy/github/user/followers?&access_token=' + keys.accessToken;
	self.oauth2.get( followersUrl, keys.accessToken, 
        function( error, data ){
            if( error )
                callback( error, null );
            else {
				var followers = JSON.parse(data);
				var followingUrl = 'https://api.singly.com/proxy/'+
					'github/user/following?access_token=' + keys.accessToken;
				self.oauth2.get( followingUrl, keys.accessToken, 
					function(error, data) {
						if(error)
							callback(error, null);
						else {
							data = followers.concat(JSON.parse(data));
							callback( null, {
								'uri': uri, 
								'data': data
							});
						}
					}
				);
			}
        } );
};
module.exports = exports = GithubContactListProducer;
