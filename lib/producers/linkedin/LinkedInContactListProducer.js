var base = require( '../ProducerBase.js' );

function LinkedInContactListProducer() {
    base.init( this );
    var OAuth2 = require( 'oauth' ).OAuth2;

    this.oauth2 = new OAuth2( 
        engine.config.linkedin.clientID, 
        engine.config.linkedin.clientSecret, 
        "https://api.singly.com", "/oauth/authenticate", "/oauth/access_token" );
}
base.inherit( LinkedInContactListProducer );

LinkedInContactListProducer.prototype.getMatchPatterns = function() {
    return [ '^acct:linkedin:[^/]*', '/contacts' ];
}
LinkedInContactListProducer.prototype.attemptRequest = function( uri, owner, source, resource, keys, callback ) {
    var self = this;

	var fields = '(id,first-name,last-name,maiden-name,formatted-name,phonetic-first-name,phonetic-last-name,formatted-phonetic-name,headline,location:(name,country:(code)),industry,distance,relation-to-viewer:(distance),current-share,num-connections,num-connections-capped,summary,specialties,positions,picture-url,site-standard-profile-request,api-standard-profile-request:(url,headers),public-profile-url)';

    var linkedinUrl = 'https://api.singly.com/proxy/linkedin/people/~/connections:' +
		fields + '?count=1500&format=json&access_token=' + keys.accessToken;

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
module.exports = exports = LinkedInContactListProducer;
