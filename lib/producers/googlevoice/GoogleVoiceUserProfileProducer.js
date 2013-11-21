var GVClient = require( 'google-voice' ).Client;
var base = require( '../ProducerBase.js' );

function GoogleVoiceUserProfileProducer() {
    base.init( this );
}
base.inherit( GoogleVoiceUserProfileProducer );

GoogleVoiceUserProfileProducer.prototype.getMatchPatterns = function() {
	return [ '^acct:googlevoice:.+', '/user/.+' ];
}
GoogleVoiceUserProfileProducer.prototype.attemptRequest = function( uri, userId, source, resource, keys, callback ) {
	var self = this;

	var client = new GVClient( {
		email: keys.email,
		password: keys.password
	});

	client.getSettings( 
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
module.exports = exports = GoogleVoiceUserProfileProducer;
