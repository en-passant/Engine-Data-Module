var RegExLookup = require( './RegExLookup.js' );
	
function DataFetcher() {

	this.docProducerRegistry = new RegExLookup();

	this.registerDocProducer( require( './producers/twitter/TwitterUserProfileProducer' ) );
	this.registerDocProducer( require( './producers/twitter/TwitterTweetIndexProducer' ) );
	this.registerDocProducer( require( './producers/twitter/TwitterMentionsProducer' ) );
	this.registerDocProducer( require( './producers/twitter/TwitterIncomingRelationshipProducer' ) );
	this.registerDocProducer( require( './producers/twitter/TwitterIncomingPendingRelationshipProducer' ) );
	this.registerDocProducer( require( './producers/twitter/TwitterOutgoingPendingRelationshipProducer' ) );
	this.registerDocProducer( require( './producers/twitter/TwitterOutgoingRelationshipProducer' ) );
	this.registerDocProducer( require( './producers/twitter/TwitterDirectMessagesSentProducer' ) );
	this.registerDocProducer( require( './producers/twitter/TwitterDirectMessagesReceivedProducer' ) );
	this.registerDocProducer( require( './producers/twitter/TweetProducer' ) );
	this.registerDocProducer( require( './producers/twitter/DirectMessageProducer' ) );

	this.registerDocProducer( require( './producers/appdotnet/AppDotNetUserProfileProducer') );
	this.registerDocProducer( require( './producers/appdotnet/AppDotNetUserFollowingProducer') );
	this.registerDocProducer( require( './producers/appdotnet/AppDotNetUserFollowersProducer') );
	this.registerDocProducer( require( './producers/appdotnet/AppDotNetPostCreatedProducer') );
	this.registerDocProducer( require( './producers/appdotnet/AppDotNetPostMentionsProducer') );

	this.registerDocProducer( require( './producers/googlecontacts/GoogleContactsUserProfileProducer' ) );
	this.registerDocProducer( require( './producers/googlecontacts/GoogleContactsContactListProducer' ) );

	this.registerDocProducer( require( './producers/imap/ImapUserProfileProducer' ) );
	this.registerDocProducer( require( './producers/imap/ImapMailboxListProducer' ) );
	this.registerDocProducer( require( './producers/imap/ImapMailboxContentsProducer' ) );
	this.registerDocProducer( require( './producers/imap/ImapMessageIdMessageProducer' ));
	this.registerDocProducer( require( './producers/imap/ImapUidMessageProducer' ));
	this.registerDocProducer( require( './producers/imap/ImapMessageProducer' ));

	this.registerDocProducer( require( './producers/googlecalendars/GoogleCalendarsUserProfileProducer' ) );
	this.registerDocProducer( require( './producers/googlecalendars/GoogleCalendarsCalendarListProducer' ) );
	this.registerDocProducer( require( './producers/googlecalendars/GoogleCalendarsEventListProducer' ) );
	this.registerDocProducer( require( './producers/googlecalendars/GoogleCalendarsEventProducer' ) );

	this.registerDocProducer( require( './producers/gmail/GMailUserProfileProducer' ) );
	this.registerDocProducer( require( './producers/gmail/GMailMessageProducer' ) );

	this.translatorRegistry = new RegExLookup();

	this.registerTranslator( require( './translators/twitter/TwitterUserProfileTranslator' ));
	this.registerTranslator( require( './translators/twitter/TwitterDirectMessageTranslator' ));
	this.registerTranslator( require( './translators/twitter/TwitterRelationshipTranslator' ));
	this.registerTranslator( require( './translators/twitter/TwitterTweetTranslator' ));

	this.registerTranslator( require( './translators/appdotnet/AppDotNetUserProfileTranslator' ));
	this.registerTranslator( require( './translators/appdotnet/AppDotNetPostMentionTranslator' ));
	this.registerTranslator( require( './translators/appdotnet/AppDotNetUserFollowersTranslator' ));
	this.registerTranslator( require( './translators/appdotnet/AppDotNetUserFollowingTranslator' ));
	this.registerTranslator( require( './translators/appdotnet/AppDotNetPostCreatedTranslator' ));

	this.registerTranslator( require( './translators/googlecontacts/GoogleContactsUserProfileTranslator' ));
	this.registerTranslator( require( './translators/googlecontacts/GoogleContactsContactListTranslator' ));

	this.registerTranslator( require( './translators/googlecalendars/GoogleCalendarsUserProfileTranslator' ));
	this.registerTranslator( require( './translators/googlecalendars/GoogleCalendarsCalendarListTranslator' ));
	this.registerTranslator( require( './translators/googlecalendars/GoogleCalendarsEventListTranslator' ));
	this.registerTranslator( require( './translators/googlecalendars/GoogleCalendarsEventTranslator' ));
	
	this.registerTranslator( require( './translators/imap/ImapUserProfileTranslator' ));
	this.registerTranslator( require( './translators/imap/ImapMailboxListTranslator' ));
	this.registerTranslator( require( './translators/imap/ImapMailboxContentsTranslator' ) );
	this.registerTranslator( require( './translators/imap/ImapMessageTranslator' ) );

	this.registerTranslator( require( './translators/gmail/GMailUserProfileTranslator' ));
}
DataFetcher.prototype.registerDocProducer = function( DocProducer ) {
	var docProducer = new DocProducer();
	var matchPatterns = docProducer.getMatchPatterns();
	this.docProducerRegistry.register( docProducer, matchPatterns[0], matchPatterns[1] );
}
DataFetcher.prototype.registerTranslator = function( Translator ) {
	var translator = new Translator();
	var matchPatterns = translator.getMatchPatterns();
	this.translatorRegistry.register( translator, matchPatterns[0], matchPatterns[1] );
}
DataFetcher.prototype.fetch = function( uri, callback ) {
	var startTime = new Date().valueOf();
	var dataManager = this;
	var schemeMatch = uri.match( /^([^:]*):/ );
	SystemLog.log( 'Downloading document: ' + uri );
	if( schemeMatch != null )
	{
		var scheme = schemeMatch[1];

		if( scheme == 'ldengine' ) {
			var parsedUri = uri.match( /([^:]*):\/\/(.*)\/\/@([^\/]*)(.*)/ );
			var userId = parsedUri[2];
			var source = parsedUri[3];
			var resource = parsedUri[4];

			var docProducer = dataManager.docProducerRegistry.get( source, resource );
			if( docProducer )
			{
				var translationDone = false;
				var timeout = setTimeout( function() {
					callback( new Error( 'Document production and translation took more than 30 seconds, or did not finish at all!  URI was: ' + uri ));
				}, 30000 );
				try {
					docProducer.produce( uri, userId, source, resource,
						function( err, rawDoc ) {
							var elapsedTime = new Date().valueOf() - startTime;
							SystemLog.log( 'Document Production for ' + uri + ' completed in '
								+ elapsedTime + ' ms.' );
							if( err )
							{
								clearTimeout( timeout );
								callback( {
									'error': err, 
									'userId': userId,
						      		'source': source, 
						      		'resource': resource 
								}, null );
							}
							else
							{
								try {
									dataManager.translateDocument( 
										uri, userId, source, resource, rawDoc, function( error, result ) {
											clearTimeout( timeout );
											callback( error, result );
										} );
								} catch( error )
								{
									clearTimeout( timeout );
									callback( error );
								}
							}
						}
					);
				} 
				catch( e )
				{
					clearTimeout( timeout );
					callback( e );
				}
			}
			else
			{
				callback( new Error( 'No document producer for URI: ' + uri ), null );
			}
		}
		else
		{
			callback( new Error( 'Unknown scheme: ' + scheme ), null );
		}
	}
	else
		callback( new Error( 'Bad URI Format: ' + uri ), null );

}
DataFetcher.prototype.translateDocument = function( uri, userId, source, resource, rawDoc, callback ) {

	var startTime = new Date().valueOf();
	var translator = this.translatorRegistry.get( source, resource );
	if( translator )
		translator.translate( uri, userId, rawDoc, function( error, result ) {
			var elapsedTime = new Date().valueOf() - startTime;
			SystemLog.log( 'Document Translation of ' + uri + ' was completed in ' + elapsedTime + ' ms.' );
			callback( error, result );
		} );
	else
		callback( new Error( 'No document translator for URI: ' + uri ), null );
}

module.exports = exports = new DataFetcher();
