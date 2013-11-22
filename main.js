function EngineDataModule() {
	this.fetcher = new ( require( './lib/DataFetcher' ) )();

	fetcher.registerDocProducer( require( './lib/producers/twitter/TwitterUserProfileProducer' ) );
	fetcher.registerDocProducer( require( './lib/producers/twitter/TwitterTweetIndexProducer' ) );
	fetcher.registerDocProducer( require( './lib/producers/twitter/TwitterMentionsProducer' ) );
	fetcher.registerDocProducer( require( './lib/producers/twitter/TwitterIncomingRelationshipProducer' ) );
	fetcher.registerDocProducer( require( './lib/producers/twitter/TwitterIncomingPendingRelationshipProducer' ) );
	fetcher.registerDocProducer( require( './lib/producers/twitter/TwitterOutgoingPendingRelationshipProducer' ) );
	fetcher.registerDocProducer( require( './lib/producers/twitter/TwitterOutgoingRelationshipProducer' ) );
	fetcher.registerDocProducer( require( './lib/producers/twitter/TwitterDirectMessagesSentProducer' ) );
	fetcher.registerDocProducer( require( './lib/producers/twitter/TwitterDirectMessagesReceivedProducer' ) );
	fetcher.registerDocProducer( require( './lib/producers/twitter/TweetProducer' ) );
	fetcher.registerDocProducer( require( './lib/producers/twitter/DirectMessageProducer' ) );

	fetcher.registerDocProducer( require( './lib/producers/appdotnet/AppDotNetUserProfileProducer') );
	fetcher.registerDocProducer( require( './lib/producers/appdotnet/AppDotNetUserFollowingProducer') );
	fetcher.registerDocProducer( require( './lib/producers/appdotnet/AppDotNetUserFollowersProducer') );
	fetcher.registerDocProducer( require( './lib/producers/appdotnet/AppDotNetPostCreatedProducer') );
	fetcher.registerDocProducer( require( './lib/producers/appdotnet/AppDotNetPostMentionsProducer') );

	fetcher.registerDocProducer( require( './lib/producers/googlecontacts/GoogleContactsUserProfileProducer' ) );
	fetcher.registerDocProducer( require( './lib/producers/googlecontacts/GoogleContactsContactListProducer' ) );

	fetcher.registerDocProducer( require( './lib/producers/imap/ImapUserProfileProducer' ) );
	fetcher.registerDocProducer( require( './lib/producers/imap/ImapMailboxListProducer' ) );
	fetcher.registerDocProducer( require( './lib/producers/imap/ImapMailboxContentsProducer' ) );
	fetcher.registerDocProducer( require( './lib/producers/imap/ImapMessageIdMessageProducer' ));
	fetcher.registerDocProducer( require( './lib/producers/imap/ImapUidMessageProducer' ));
	fetcher.registerDocProducer( require( './lib/producers/imap/ImapMessageProducer' ));

	fetcher.registerDocProducer( require( './lib/producers/googlecalendars/GoogleCalendarsUserProfileProducer' ) );
	fetcher.registerDocProducer( require( './lib/producers/googlecalendars/GoogleCalendarsCalendarListProducer' ) );
	fetcher.registerDocProducer( require( './lib/producers/googlecalendars/GoogleCalendarsEventListProducer' ) );
	fetcher.registerDocProducer( require( './lib/producers/googlecalendars/GoogleCalendarsEventProducer' ) );

	fetcher.registerDocProducer( require( './lib/producers/gmail/GMailUserProfileProducer' ) );
	fetcher.registerDocProducer( require( './lib/producers/gmail/GMailMessageProducer' ) );

	fetcher.registerTranslator( require( './lib/translators/twitter/TwitterUserProfileTranslator' ));
	fetcher.registerTranslator( require( './lib/translators/twitter/TwitterDirectMessageTranslator' ));
	fetcher.registerTranslator( require( './lib/translators/twitter/TwitterRelationshipTranslator' ));
	fetcher.registerTranslator( require( './lib/translators/twitter/TwitterTweetTranslator' ));

	fetcher.registerTranslator( require( './lib/translators/appdotnet/AppDotNetUserProfileTranslator' ));
	fetcher.registerTranslator( require( './lib/translators/appdotnet/AppDotNetPostMentionTranslator' ));
	fetcher.registerTranslator( require( './lib/translators/appdotnet/AppDotNetUserFollowersTranslator' ));
	fetcher.registerTranslator( require( './lib/translators/appdotnet/AppDotNetUserFollowingTranslator' ));
	fetcher.registerTranslator( require( './lib/translators/appdotnet/AppDotNetPostCreatedTranslator' ));

	fetcher.registerTranslator( require( './lib/translators/googlecontacts/GoogleContactsUserProfileTranslator' ));
	fetcher.registerTranslator( require( './lib/translators/googlecontacts/GoogleContactsContactListTranslator' ));

	fetcher.registerTranslator( require( './lib/translators/googlecalendars/GoogleCalendarsUserProfileTranslator' ));
	fetcher.registerTranslator( require( './lib/translators/googlecalendars/GoogleCalendarsCalendarListTranslator' ));
	fetcher.registerTranslator( require( './lib/translators/googlecalendars/GoogleCalendarsEventListTranslator' ));
	fetcher.registerTranslator( require( './lib/translators/googlecalendars/GoogleCalendarsEventTranslator' ));
	
	fetcher.registerTranslator( require( './lib/translators/imap/ImapUserProfileTranslator' ));
	fetcher.registerTranslator( require( './lib/translators/imap/ImapMailboxListTranslator' ));
	fetcher.registerTranslator( require( './lib/translators/imap/ImapMailboxContentsTranslator' ) );
	fetcher.registerTranslator( require( './lib/translators/imap/ImapMessageTranslator' ) );

	fetcher.registerTranslator( require( './lib/translators/gmail/GMailUserProfileTranslator' ));
}
module.exports = exports = EngineDataModule;