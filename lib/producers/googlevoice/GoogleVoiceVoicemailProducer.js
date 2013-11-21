var Moment = require( 'moment' );
var GVClient = require( 'google-voice' ).Client;
var base = require( '../ProducerBase.js' );

function GoogleVoiceVoicemailProducer() {
    base.init( this );
}
base.inherit( GoogleVoiceVoicemailProducer );

GoogleVoiceVoicemailProducer.prototype.getMatchPatterns = function() {
	return [ '^acct:googlevoice:.+', '/voicemail' ];
}
GoogleVoiceVoicemailProducer.prototype.attemptRequest = function( uri, userId, source, resource, keys, callback ) {
	var self = this;

	var sinceMatch = resource.match( '[?&]since=([0-9]+)' );
	if( sinceMatch != null )
		var since = Moment( parseInt( sinceMatch[1] ));

	var client = new GVClient( {
		email: keys.email,
		password: keys.password
	});
	var type = 'search';
	var options = {
		'limit': Infinity,
		'query': 'in:voicemail'
	};
	if( since )
	{
		options.query += ' AND after:' + since.format( 'YYYY-MM-DD' );
	}

	client.get( type, options, 
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
module.exports = exports = GoogleVoiceVoicemailProducer;
