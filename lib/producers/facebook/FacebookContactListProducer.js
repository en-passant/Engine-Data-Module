var base = require( '../ProducerBase.js' );

function FacebookContactListProducer() {
    base.init( this );
    var OAuth2 = require( 'oauth' ).OAuth2;

    this.oauth2 = new OAuth2( 
        engine.config.facebook.clientID, 
        engine.config.facebook.clientSecret, 
        "https://api.singly.com", "/oauth/authenticate", "/oauth/access_token" );
}
base.inherit( FacebookContactListProducer );

FacebookContactListProducer.prototype.getMatchPatterns = function() {
    return [ '^acct:facebook:[0-9]+', '/contacts' ];
}
FacebookContactListProducer.prototype.attemptRequest = function( uri, owner, source, resource, keys, callback ) {
    var self = this;
    
    var fields = 'bio,birthday,cover,currency,devices,education,email,favorite_athletes,favorite_teams,first_name,gender,hometown,id,installed,interested_in,languages,last_name,link,locale,location,middle_name,name,picture,political,quotes,relationship_status,religion,significant_other,third_party_id,timezone,updated_time,username,verified,video_upload_limits,website,work';
	
	var facebookUrl = 'https://api.singly.com/proxy/facebook/me/friends?access_token=' + keys.accessToken;
	self.oauth2.get( facebookUrl, keys.accessToken, 
        function( error, data ){
            if( error )
                callback( error, null );
            else {
				data = JSON.parse(data).data;
				var ids = [];
				data.forEach( function (friend) {
					ids.push(friend.id);
				});
				var friendUrl = 'https://api.singly.com/proxy/'+
					'facebook/?ids=' + ids.toString() +
						'&fields=' + fields.toString() + 
							'&access_token=' + keys.accessToken;
				self.oauth2.get( friendUrl, keys.accessToken, 
					function(error, data) {
						if(error)
							callback(error, null);
						else {
							callback( null, {
								'uri': uri, 
								'data': data
							});
						}
					}
				);
			}
	});
};
module.exports = exports = FacebookContactListProducer;
