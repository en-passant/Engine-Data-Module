var base = require( '../ProducerBase.js' );

function SignalsUserProfileProducer() {
    base.init( this );
    var OAuth2 = require( 'oauth' ).OAuth2;

    this.oauth2 = new OAuth2( 
        engine.config[ '37signals' ].clientID, 
        engine.config[ '37signals' ].clientSecret, 
        "https://api.singly.com", "/oauth/authenticate", "/oauth/access_token" );
}
base.inherit( SignalsUserProfileProducer );

SignalsUserProfileProducer.prototype.getMatchPatterns = function() {
    return [ '^acct:37signals:[0-9]+', '/user/[0-9]+' ];
}
SignalsUserProfileProducer.prototype.attemptRequest = function( uri, owner, source, resource, keys, callback ) {
    var Signals37Url = ' https://api.singly.com/services/37signals/self?access_token=' + keys.accessToken;
	this.oauth2.get( Signals37Url, keys.accessToken, function( error, data ){
        if( error )
            callback( error, null );
        else
            callback( null, {
                'uri': uri, 
                'data': data
            });
    } );
};
module.exports = exports = SignalsUserProfileProducer;
