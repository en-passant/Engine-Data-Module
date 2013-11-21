var base = require( '../ProducerBase.js' );

function InstagramContactListProducer() {
    base.init( this );
    var OAuth2 = require( 'oauth' ).OAuth2;

    this.oauth2 = new OAuth2( 
        engine.config.instagram.clientID, 
        engine.config.instagram.clientSecret, 
        "https://api.singly.com", "/oauth/authenticate", "/oauth/access_token" );
}
base.inherit( InstagramContactListProducer );

InstagramContactListProducer.prototype.getMatchPatterns = function() {
    return [ '^acct:instagram:[0-9]+', '/contacts' ];
}
InstagramContactListProducer.prototype.attemptRequest = function( uri, owner, source, resource, keys, callback ) {
    var self = this;
    var followsUrl = ' https://api.singly.com/proxy/instagram/users/self/follows?access_token=' + keys.accessToken;
	self.oauth2.get( followsUrl, keys.accessToken, 
        function( error, data ){
            if( error )
                callback( error, null );
            else {
				var follows = JSON.parse(data);
				var followersUrl = 'https://api.singly.com/proxy/'+
					'instagram/users/self/followed-by?access_token=' + keys.accessToken;
				self.oauth2.get( followersUrl, keys.accessToken, 
					function(error, data) {
						if(error)
							callback(error, null);
						else {
							data = follows.data.concat(JSON.parse(data).data);
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
module.exports = exports = InstagramContactListProducer;
