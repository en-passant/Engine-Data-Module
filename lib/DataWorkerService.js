function DataWorkerService() {
	var RegExLookup = require( '../services/util/RegExLookup.js' );
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

	this.registerDocProducer( require( './producers/googlevoice/GoogleVoiceUserProfileProducer' ) );
	this.registerDocProducer( require( './producers/googlevoice/GoogleVoiceSmsProducer' ) );
	this.registerDocProducer( require( './producers/googlevoice/GoogleVoiceVoicemailProducer' ) );

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

	this.registerDocProducer( require( './producers/facebook/FacebookUserProfileProducer' ));
	this.registerDocProducer( require( './producers/facebook/FacebookContactListProducer' ));
	this.registerDocProducer( require( './producers/facebook/FacebookStatusesFeedProducer' ));
	this.registerDocProducer( require( './producers/facebook/FacebookNewsFeedProducer' ));

	this.registerDocProducer( require( './producers/github/GithubUserProfileProducer' ));
	this.registerDocProducer( require( './producers/github/GithubContactListProducer' ));
	
	this.registerDocProducer( require( './producers/dropbox/DropboxUserProfileProducer'));
	
	this.registerDocProducer( require( './producers/youtube/YoutubeUserProfileProducer'));

	this.registerDocProducer( require( './producers/tumblr/TumblrUserProfileProducer' ));
//	this.registerDocProducer( require( './producers/tumblr/TumblrStatusesProducer' ));
//	this.registerDocProducer( require( './producers/tumblr/TumblrStatusesFeedProducer' ));
//	this.registerDocProducer( require( './producers/tumblr/TumblrNewsProducer' ));
//	this.registerDocProducer( require( './producers/tumblr/TumblrNewsFeedProducer' ));

	this.registerDocProducer( require( './producers/linkedin/LinkedInUserProfileProducer' ));
	this.registerDocProducer( require( './producers/linkedin/LinkedInContactListProducer' ));
	
	this.registerDocProducer( require( './producers/meetup/MeetupUserProfileProducer' ));

	this.registerDocProducer( require( './producers/flickr/FlickrUserProfileProducer' ));
	this.registerDocProducer( require( './producers/flickr/FlickrContactListProducer' ));

	this.registerDocProducer( require( './producers/foursquare/FoursquareUserProfileProducer' ));

	this.registerDocProducer( require( './producers/rdio/RdioUserProfileProducer' ));

	this.registerDocProducer( require( './producers/wordpress/WordpressUserProfileProducer' ));
	//this.registerDocProducer( require( './producers/wordpress/WordpressStatusesProducer' ));
	//this.registerDocProducer( require( './producers/wordpress/WordpressStatusesFeedProducer' ));
	//this.registerDocProducer( require( './producers/wordpress/WordpressNewsProducer' ));
	//this.registerDocProducer( require( './producers/wordpress/WordpressNewsFeedProducer' ));

	this.registerDocProducer( require( './producers/soundcloud/SoundcloudUserProfileProducer' ));

	this.registerDocProducer( require( './producers/37signals/SignalsUserProfileProducer' ));	

	this.registerDocProducer( require( './producers/bodymedia/BodymediaUserProfileProducer' ));

	this.registerDocProducer( require( './producers/dwolla/DwollaUserProfileProducer' ));

	this.registerDocProducer( require( './producers/fitbit/FitbitUserProfileProducer' ));

	this.registerDocProducer( require( './producers/imgur/ImgurUserProfileProducer' ));

	this.registerDocProducer( require( './producers/instagram/InstagramUserProfileProducer' ));
	this.registerDocProducer( require( './producers/instagram/InstagramContactListProducer' ));

	this.registerDocProducer( require( './producers/klout/KloutUserProfileProducer' ));

	this.registerDocProducer( require( './producers/gplus/GplusUserProfileProducer' ));

	this.registerDocProducer( require( './producers/picasa/PicasaUserProfileProducer' ));

	this.registerDocProducer( require( './producers/reddit/RedditUserProfileProducer' ));

	this.registerDocProducer( require( './producers/runkeeper/RunkeeperUserProfileProducer' ));

	this.registerDocProducer( require( './producers/shutterfly/ShutterflyUserProfileProducer' ));

	this.registerDocProducer( require( './producers/stocktwits/StocktwitsUserProfileProducer' ));

	this.registerDocProducer( require( './producers/tout/ToutUserProfileProducer' ));

	this.registerDocProducer( require( './producers/withings/WithingsUserProfileProducer' ));

	this.registerDocProducer( require( './producers/yammer/YammerUserProfileProducer' ));

	this.registerDocProducer( require( './producers/zeo/ZeoUserProfileProducer' ));

	this.registerDocProducer( require( './producers/gmail/GMailUserProfileProducer' ) );
	this.registerDocProducer( require( './producers/gmail/GMailMessageProducer' ) );

	//this.registerDocProducer( require( './producers/mergecontact/MergeContactsProducer' ) );
	//this.registerDocProducer( require( './producers/fullcontact/FullcontactUserProfileProducer' ) );
	//this.registerDocProducer( require( './producers/fullcontact/FullcontactPeopleProducer' ) );
	//this.registerDocProducer( require( './producers/fullcontact/FullcontactMergeProducer' ) );

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

	this.registerTranslator( require( './translators/googlevoice/GoogleVoiceUserProfileTranslator' ));
	this.registerTranslator( require( './translators/googlevoice/GoogleVoiceSmsTranslator' ));
	this.registerTranslator( require( './translators/googlevoice/GoogleVoiceVoicemailTranslator' ));

	this.registerTranslator( require( './translators/googlecontacts/GoogleContactsUserProfileTranslator' ));
	this.registerTranslator( require( './translators/googlecontacts/GoogleContactsContactListTranslator' ));

	this.registerTranslator( require( './translators/googlecalendars/GoogleCalendarsUserProfileTranslator' ));
	this.registerTranslator( require( './translators/googlecalendars/GoogleCalendarsCalendarListTranslator' ));
	this.registerTranslator( require( './translators/googlecalendars/GoogleCalendarsEventListTranslator' ));
	this.registerTranslator( require( './translators/googlecalendars/GoogleCalendarsEventTranslator' ));

	this.registerTranslator( require( './translators/browser/BrowserGeographicLocationTranslator' ));
	this.registerTranslator( require( './translators/browser/BrowserRequestedDirectionsTranslator' ));
	
	this.registerTranslator( require( './translators/imap/ImapUserProfileTranslator' ));
	this.registerTranslator( require( './translators/imap/ImapMailboxListTranslator' ));
	this.registerTranslator( require( './translators/imap/ImapMailboxContentsTranslator' ) );
	this.registerTranslator( require( './translators/imap/ImapMessageTranslator' ) );

	this.registerTranslator( require( './translators/facebook/FacebookUserProfileTranslator' ));
	this.registerTranslator( require( './translators/facebook/FacebookContactListTranslator' ));
	this.registerTranslator( require( './translators/facebook/FacebookStatusesFeedTranslator' ));
	this.registerTranslator( require( './translators/facebook/FacebookNewsFeedTranslator' ));

	this.registerTranslator( require( './translators/github/GithubUserProfileTranslator' ));	
	this.registerTranslator( require( './translators/github/GithubContactListTranslator' ));

	this.registerTranslator( require( './translators/dropbox/DropboxUserProfileTranslator' ));

	this.registerTranslator( require( './translators/youtube/YoutubeUserProfileTranslator' ));

	this.registerTranslator( require( './translators/tumblr/TumblrUserProfileTranslator' ));
//	this.registerTranslator( require( './translators/tumblr/TumblrNewsTranslator' ));
//	this.registerTranslator( require( './translators/tumblr/TumblrNewsFeedTranslator' ));
//	this.registerTranslator( require( './translators/tumblr/TumblrStatusesTranslator' ));
//	this.registerTranslator( require( './translators/tumblr/TumblrStatusesFeedTranslator' ));

	this.registerTranslator( require( './translators/linkedin/LinkedInUserProfileTranslator' ));
	this.registerTranslator( require( './translators/linkedin/LinkedInContactListTranslator' ));

	this.registerTranslator( require( './translators/meetup/MeetupUserProfileTranslator' ));

	this.registerTranslator( require( './translators/flickr/FlickrUserProfileTranslator' ));
	this.registerTranslator( require( './translators/flickr/FlickrContactListTranslator' ));

	this.registerTranslator( require( './translators/foursquare/FoursquareUserProfileTranslator' ));

	this.registerTranslator( require( './translators/rdio/RdioUserProfileTranslator' ));

	this.registerTranslator( require( './translators/wordpress/WordpressUserProfileTranslator' ));

	this.registerTranslator( require( './translators/soundcloud/SoundcloudUserProfileTranslator' ));

	this.registerTranslator( require( './translators/37signals/SignalsUserProfileTranslator' ));

	this.registerTranslator( require( './translators/bodymedia/BodymediaUserProfileTranslator' ));

	this.registerTranslator( require( './translators/dwolla/DwollaUserProfileTranslator' ));

	this.registerTranslator( require( './translators/fitbit/FitbitUserProfileTranslator' ));

	this.registerTranslator( require( './translators/imgur/ImgurUserProfileTranslator' ));

	this.registerTranslator( require( './translators/instagram/InstagramUserProfileTranslator' ));
	this.registerTranslator( require( './translators/instagram/InstagramContactListTranslator' ));

	this.registerTranslator( require( './translators/klout/KloutUserProfileTranslator' ));

	this.registerTranslator( require( './translators/gplus/GplusUserProfileTranslator' ));

	this.registerTranslator( require( './translators/gdocs/GdocsUserProfileTranslator' ));

	this.registerTranslator( require( './translators/paypal/PaypalUserProfileTranslator' ));

	this.registerTranslator( require( './translators/picasa/PicasaUserProfileTranslator' ));

	this.registerTranslator( require( './translators/reddit/RedditUserProfileTranslator' ));

	this.registerTranslator( require( './translators/runkeeper/RunkeeperUserProfileTranslator' ));

	this.registerTranslator( require( './translators/shutterfly/ShutterflyUserProfileTranslator' ));

	this.registerTranslator( require( './translators/stocktwits/StocktwitsUserProfileTranslator' ));

	this.registerTranslator( require( './translators/tout/ToutUserProfileTranslator' ));

	this.registerTranslator( require( './translators/withings/WithingsUserProfileTranslator' ));

	this.registerTranslator( require( './translators/yammer/YammerUserProfileTranslator' ));

	this.registerTranslator( require( './translators/zeo/ZeoUserProfileTranslator' ));

	this.registerTranslator( require( './translators/gmail/GMailUserProfileTranslator' ));

	//this.registerTranslator( require( './translators/mergecontact/MergeContactsTranslator' ) );
	//this.registerTranslator( require( './translators/fullcontact/FullcontactUserProfileTranslator' ));
	//this.registerTranslator( require( './translators/fullcontact/FullcontactPeopleTranslator' ));
	//this.registerTranslator( require( './translators/fullcontact/FullcontactMergeTranslator' ));
}
DataWorkerService.prototype.registerDocProducer = function( DocProducer ) {
	var docProducer = new DocProducer();
	var matchPatterns = docProducer.getMatchPatterns();
	this.docProducerRegistry.register( docProducer, matchPatterns[0], matchPatterns[1] );
}
DataWorkerService.prototype.registerTranslator = function( Translator ) {
	var translator = new Translator();
	var matchPatterns = translator.getMatchPatterns();
	this.translatorRegistry.register( translator, matchPatterns[0], matchPatterns[1] );
}
// Attempts to get the document from our local cache, and downloads it if we don't 
// already have it.
DataWorkerService.prototype.getDocument = function( uri, callback ) {
	var self = this;
	var startTime = new Date().valueOf();
	DocumentCacheService.getDocument( uri, function( err, item ) {
		var elapsedTime = new Date().valueOf() - startTime;
		SystemLog.log( 'Cache query for ' + uri + ' completed in ' + elapsedTime + ' ms.' );
		if( err )
		{
			SystemLog.log( 'Error parsing cache entry - will redownload', err );
			self.downloadDocument( uri, callback );
		}
		else
		{
			if( item != null )
			{
				callback( null, item.data );
			}
			else
			{
				self.downloadDocument( uri, callback );
			}
		}
	});
}
DataWorkerService.prototype.downloadDocument = function( uri, callback ) {
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
					SystemLog.error( 'Document production and translation took more that 30 seconds, or did not finish at all!  URI was: ' + uri );
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
DataWorkerService.prototype.translateDocument = function( uri, userId, source, resource, rawDoc, callback ) {

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

module.exports = exports = new DataWorkerService();
