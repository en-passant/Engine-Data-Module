var base = require( '../ProducerBase.js' );

function FacebookUserProfileProducer() {
    base.init( this );
    var OAuth2 = require( 'oauth' ).OAuth2;

    this.oauth2 = new OAuth2( 
        engine.config.facebook.clientID + "&force_login=true", //This is a passport-singly workaround to force facebook session login
        engine.config.facebook.clientSecret, 
        "https://api.singly.com", "/oauth/authenticate", "/oauth/access_token" );
}
base.inherit( FacebookUserProfileProducer );

FacebookUserProfileProducer.prototype.getMatchPatterns = function() {
    return [ '^acct:facebook:[0-9]+', '/user/[0-9]+' ];
}
FacebookUserProfileProducer.prototype.attemptRequest = function( uri, owner, source, resource, keys, callback ) {
    var self = this;
    var fields = 'bio,birthday,cover,currency,devices,education,email,favorite_athletes,favorite_teams,first_name,gender,hometown,id,installed,interested_in,languages,last_name,link,locale,location,middle_name,name,picture,political,quotes,relationship_status,religion,significant_other,third_party_id,timezone,updated_time,username,verified,video_upload_limits,website,work';

	var facebookUrl = ' https://api.singly.com/proxy/facebook/me?access_token=' + keys.accessToken + '&fields='+ fields.toString();
	self.oauth2.get( facebookUrl, keys.accessToken,
        function( error, data ){
            if( error ) {
                callback( error, null );
            }
			else {
                callback( null, {
                    'uri': uri,
                    'data': data
                });
			}
        } );
};

module.exports = exports = FacebookUserProfileProducer;
