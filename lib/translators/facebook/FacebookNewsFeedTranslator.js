var Moment = require( 'moment' ),
    async = require( 'async' );

function FacebookNewsFeedTranslator() {
}

FacebookNewsFeedTranslator.prototype.getMatchPatterns = function() {
  return [ '^acct:facebook:[0-9]+', '.*/fnews' ];
};

FacebookNewsFeedTranslator.prototype.translate = function( sourceUri, owner, rawDoc, callback ) {
  var translatedMessages = new Array(),
  outputData = {},
  parseAccountId = sourceUri.match( /acct:facebook:[0-9]+/ ),
  parseId = parseAccountId[0].match( /[^\x3a]*$/i );
  var self = this;
  try {
    postsData = JSON.parse( rawDoc.data ).data;
  } catch( err) {
    SystemLog.log('FacebookStatusesFeedTranlater: Invalid JSON found in rawDoc[' + rawDoc.data + ']', err);
    callback(  err , null );
  }
  try {
    var parsedUri = sourceUri.match( /([^:]*):\/\/(.*)\/\/@([^\/]*)(.*)/ );
    var source = parsedUri[3];
    async.eachSeries(
        postsData,
        function( post, done ) {
          // Translated to fields more or less compliant with the OpenSocial 2.5.0 draft
          // spec (opensocial-social-data-specification-2-5-0-draft):
          // http://opensocial-resources.googlecode.com/svn/spec/trunk/Social-Data.xml
          var translatedMessage = self.translateMessage( owner, source, post );
          translatedMessages.push( translatedMessage );
          outputData = {
            'sourceUri': sourceUri,
            'uri': 'ldengine://' + owner + '//@' + source + '/fnews/' + post.id,
            'owner': owner,
            'category': 'message',
            'data': translatedMessage,
            'time': Moment( translatedMessage.timeSent ).valueOf()
          };
          done( null, outputData );
        },
        function( error ) {
          process.nextTick( function() {
            done( error, null );
          });
        }
    );
  } catch( err ) {
    SystemLog.log('Request timed out at document translation,  [' + sourceUri + ']', err);
    callback(  err , null );
  }
};

FacebookNewsFeedTranslator.prototype.translateMessage = function( owner, source, rawMessage ) {
  var result = {
    'body': null,
    'title': (rawMessage.name || null),
    'url': (rawMessage.link || null),
    'appData': {
      'serviceName': 'Facebook',
      'serviceImgUrl': '/images/512x512-logos/facebook.png',
      // Plus other app data that isn't required.
      'verified': rawMessage.verified
    },
    'id': 'ldengine://' + owner + '//@' + source + '/fnews/' + rawMessage.id,
    'senderId': 'ldengine://' + owner + '//@' + source + '/user/' + rawMessage.from.id,
    'timeSent': Moment( rawMessage.created_time ).valueOf(),
    'itemtype': 'FacebookNewsfeed'
  };

  if (rawMessage.message) {
    result.body = rawMessage.message;
  }
  if (rawMessage.story) {
    if(result.body)
      result.body = result.body + ' ' + rawMessage.story;
    else
      result.body = rawMessage.story;
  }
  if (rawMessage.description) {
    if(result.body)
      result.body = result.body + ' ' + rawMessage.description;
    else
      result.body = rawMessage.description;
  }
  return result;
};
module.exports = exports = FacebookNewsFeedTranslator;

