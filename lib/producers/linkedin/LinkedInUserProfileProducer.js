var base = require( '../ProducerBase.js' );

function LinkedInUserProfileProducer() {
    base.init( this );
    var OAuth2 = require( 'oauth' ).OAuth2;

    this.oauth2 = new OAuth2( 
        engine.config.linkedin.clientID, 
        engine.config.linkedin.clientSecret, 
        "https://api.singly.com", "/oauth/authenticate", "/oauth/access_token" );
}
base.inherit( LinkedInUserProfileProducer );

LinkedInUserProfileProducer.prototype.getMatchPatterns = function() {
   return [ '^acct:linkedin:[^/]*', '/user/.*' ];
}
LinkedInUserProfileProducer.prototype.attemptRequest = function( uri, owner, source, resource, keys, callback ) {
    var self = this;
	var query = ":(id,first-name,last-name,email-address,headline,location:(name,country:(code)),industry,current-share,num-connections,summary,specialties,proposal-comments,associations,honors,interests,positions,publications,patents,languages,skills,certifications,educations,num-recommenders,recommendations-received,phone-numbers,im-accounts,twitter-accounts,date-of-birth,main-address,member-url-resources,picture-url,site-standard-profile-request:(url),api-standard-profile-request:(url),site-public-profile-request:(url),api-public-profile-request:(url),public-profile-url)?format=json";
    
	var linkedinUrl = 'https://api.singly.com/proxy/linkedin/people/~' + query + '&access_token=' + keys.accessToken;
	self.oauth2.get( linkedinUrl, keys.accessToken,
        function( error, data ){
            if( error )
                callback( error, null );
            else 
                callback( null, {
                    'uri': uri, 
                    'data': data
                });
        } );
};
module.exports = exports = LinkedInUserProfileProducer;
