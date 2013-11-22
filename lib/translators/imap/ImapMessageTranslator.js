var Moment = require( 'moment' );
var MailParser = require( 'mailparser' ).MailParser;
var NLPServiceIsOn = engine.config.nlpClient.NLPServiceIsOn;
var insertAnalyzedData = engine.config.nlpClient.insertAnalyzedData; 

var strip = require('htmlstrip-native');

var stripOptions = {
        include_script : false,
        include_style : false,
        compact_whitespace : true
};

function ImapMessageTranslator() {
}
ImapMessageTranslator.prototype.getMatchPatterns = function() {
	return [ '^acct:((imap)|(gmail)):.+', '/message/.*' ];
}
ImapMessageTranslator.prototype.translate = function( uri, owner, rawDoc, callback ) {
	var self = this;
	try {
		if( rawDoc.data )
		{
			var parsedUri = uri.match( /[^:]*:\/\/.*\/\/@([^\/]*)\/message\/.*/ );
			var source = parsedUri[1];
			
			var parser = new MailParser();
			parser.on( "end", function( parsedMessage ) {
				var translatedMessages = [];
				var accountUri = 'ldengine://' + owner + '//@' + source;
				
				parsedMessage[ 'x-gm-thrid' ] = rawDoc.data[ 'x-gm-thrid' ]; 
				parsedMessage[ 'x-gm-msgid' ] = rawDoc.data[ 'x-gm-msgid' ];
				parsedMessage[ 'x-gm-labels' ] = rawDoc.data[ 'x-gm-labels' ];
				
				var msg = self.translateMessage( uri, accountUri, parsedMessage  );

				var data = {
						'uri': uri,
						'data': msg,
						'category': 'message'
					};
				if( msg.updated )
					data.time = msg.updated;
				else
					data.time = 0;

				NLPService.addAnalysisIfMissing( data, function( error, result ) {
		        	process.nextTick( function() {
	            		callback( error, result.data );
		        	});
		   		});
			});

			for( var i in rawDoc.data.chunks )
			{
				parser.write( rawDoc.data.chunks[i] );
			}
			parser.end();
		}
		else
		{
			var error = new Error( 'No message data received for uri: ' + uri );
			SystemLog.error( 'No message data received for uri: ' + uri + ', ' + require( 'util' ).inspect( rawDoc ), error );
			callback( error, null );
		}

	} catch( err ) {
		SystemLog.log('Request timed out at document translation,  [' + uri + ']', err);
                callback( err , null );
	}
};

//publish a contact found as an email in a message 'from' or 'to' or 'cc' field
ImapMessageTranslator.prototype.publishContact = function( uri, untranslatedContact ) {
	var parsedUri = uri.match( /[^:]*:\/\/.*\/\/@acct:((imap)|(gmail)):[^\/]+\// );

	var email = untranslatedContact.address;
	var isBlacklisted = ContactBlacklistService.isBlacklisted(email);
	if (!isBlacklisted)
	{
		var contact = {
			"id": uri,
			"appData": {
				'serviceName': parsedUri[ 1 ]
			}
		}
		SystemLog.debug( contact );
		if( untranslatedContact.name )
			contact.displayName = {
				"formatted": untranslatedContact.name
			};
		if( untranslatedContact.address )
			contact.emails = [ untranslatedContact.address ];

		var userData = {
			'uri': uri,
			'data': contact,
			'category': 'person'
		};
	} else {
		SystemLog.debug("publishContact: ignoring blacklisted address: " + email);
	}
}

ImapMessageTranslator.prototype.convertToEmailAddrStr = function(emailAddr ) {
	var emailStr = emailAddr.name + " <" + emailAddr.address + ">";
	return emailStr;
}


ImapMessageTranslator.prototype.translateMessage = function( uri, accountUri, entireMessage) {
	if( _.isUndefined( entireMessage.from ))
	{
		SystemLog.log( 'Message did not have a return address?' );
		SystemLog.log( entireMessage );
	}
	var parsedUri = uri.match( /[^:]*:\/\/.*\/\/@acct:((imap)|(gmail)):[^\/]+\// );
	var msg = {
        	'id': uri + '/',
        	"appData": {
                 	'serviceName': parsedUri[ 1 ]
                 },
                'itemtype': 'email',
	}

	if ( entireMessage.text && entireMessage.html){
		SystemLog.debug("ImapMessageTranslator.translateMessage, Message has html & text" + uri);
		msg['body'] = entireMessage.text;
		msg['bodyhtml'] = entireMessage.html;
	}
	else if ( !entireMessage.text && entireMessage.html ){
		SystemLog.debug("ImapMessageTranslator.translateMessage, Message has only html" + uri);
		msg['bodyhtml']= entireMessage.html;
		// strip HTML
		msg['body']= strip.html_strip(entireMessage.html,stripOptions);

	}
	else if ( !entireMessage.html && entireMessage.text ){
		SystemLog.debug("ImapMessageTranslator.translateMessage, Message has only text" + uri);
		msg['body'] = entireMessage.text;
	}
		

	if( _.isArray( entireMessage.from ))
	{
		msg.senderId = accountUri + '/contacts/' + entireMessage.from[0].address;
		this.publishContact( msg.senderId, entireMessage.from[0] );
	}

	if( _.isString( entireMessage.subject ))
		msg.title = entireMessage.subject;

	msg.messageid = entireMessage.headers["message-id"];
	msg.gmthrid = entireMessage[ 'x-gm-thrid' ];
	msg.gmmsgid = entireMessage[ 'x-gm-msgid' ];
	msg.gmlabels = entireMessage[ 'x-gm-labels' ];

	var recipients = [];
	var torecipients = [];
	var ccrecipients = [];
	var bccrecipients = [];
	if( entireMessage.to )
		for( var i in entireMessage.to )
		{
			var contactUri = accountUri + '/contacts/' + entireMessage.to[i].address;
			recipients.push( contactUri );
			torecipients.push( this.convertToEmailAddrStr(entireMessage.to[i]));
			this.publishContact( contactUri, entireMessage.to[ i ] );
		}
	if( entireMessage.cc )
		for( var i in entireMessage.cc )
		{
			var contactUri = accountUri + '/contacts/' + entireMessage.cc[i].address;
			recipients.push( contactUri );
			ccrecipients.push( this.convertToEmailAddrStr(entireMessage.cc[i]));
			this.publishContact( contactUri, entireMessage.cc[i] );
		}
	if( entireMessage.bcc )
		for( var i in entireMessage.bcc )
		{
			var contactUri = accountUri + '/contacts/' + entireMessage.bcc[i].address;
			bccrecipients.push( this.convertToEmailAddrStr(entireMessage.bcc[i]));
			this.publishContact( contactUri, entireMessage.bcc[i] );
		}
	msg.recipients = recipients;
	msg.torecipients = torecipients;
	msg.ccrecipients = ccrecipients;
	msg.bccrecipients = bccrecipients;

	if( entireMessage.headers.date )
		msg.timeSent = Moment( entireMessage.headers.date ).valueOf();

	if( entireMessage.inReplyTo )
		msg.inReplyTo = accountUri + '/message/' + entireMessage.inReplyTo;

	return msg;
}
module.exports = exports = ImapMessageTranslator;
