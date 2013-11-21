var base = require( '../ProducerBase.js' );

function FlickrContactListProducer() {
    base.init( this );
    var OAuth2 = require( 'oauth' ).OAuth2;

    this.oauth2 = new OAuth2( 
        engine.config.flickr.clientID, 
        engine.config.flickr.clientSecret, 
        "https://api.singly.com", "/oauth/authenticate", "/oauth/access_token" );
}
base.inherit( FlickrContactListProducer );

FlickrContactListProducer.prototype.getMatchPatterns = function() {
    return [ '^acct:flickr:[A-Za-z0-9\@]+', '/contacts' ];
}
FlickrContactListProducer.prototype.attemptRequest = function( uri, owner, source, resource, keys, callback ) {
    var self = this;
    var flickrUrl = ' https://api.singly.com/proxy/flickr/?format=json' +
		'&method=flickr.contacts.getList&access_token=' + keys.accessToken;
	self.oauth2.get( flickrUrl, keys.accessToken, 
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
module.exports = exports = FlickrContactListProducer;

