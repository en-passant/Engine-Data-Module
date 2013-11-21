var Moment = require( 'moment' );
var GVClient = require( 'google-voice' ).Client;
var base = require( '../ProducerBase.js' );

function GoogleVoiceSmsProducer() {
    base.init( this );
}
base.inherit( GoogleVoiceSmsProducer );

GoogleVoiceSmsProducer.prototype.getMatchPatterns = function() {
	return [ '^acct:googlevoice:.+', '/sms' ];
}
GoogleVoiceSmsProducer.prototype.attemptRequest = function( uri, userId, source, resource, keys, callback ) {
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
		'query': 'in:sms'
	};
	if( since )
	{
		options.query += ' AND after:' + since.format( 'YYYY-MM-DD' );
	}

	client.get( type, options, 
		function( error, data ) {
			if( error ) {
				if(error.message == 'AUTHENTICATION_ERROR') {
					error = 'Login/Authentication failure for ' + uri + ' at attempt of source ' + source + ' at resource ' + resource; 
				}
				callback( error, null );   
			} else
				callback( null, {
					'uri': uri, 
					'data': data
				});			
		} );
};
module.exports = exports = GoogleVoiceSmsProducer;
