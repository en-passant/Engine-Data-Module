var Moment = require( 'moment' ),
    async = require( 'async' );

function FacebookContactListTranslator() {
}

FacebookContactListTranslator.prototype.getMatchPatterns = function() {
  return [  '^acct:facebook:[0-9]+', '.*/contacts'  ];
}
/*
FacebookContactListTranslator.prototype.translate = function(uri, owner, rawDoc, callback) {
  var self = this;
  var contactsData = JSON.parse( rawDoc.data ),
      dataKeys = Object.keys(contactsData);
  var parseAccountId = sourceUri.match( /acct:facebook:[0-9]+/ ),
      parseId = parseAccountId[0].match( /[^\x3a]*$/i ),
      translatedContacts = new Array();
  var outputData = {};
  async.eachSeries(
      dataKeys,
      function( id, done ) {
        try {
          var parsedUri = sourceUri.match( /([^:]*):\/\/(.*)\/\/@([^\/]*)(.*)/ );
          var source = parsedUri[3];

          // Translated to fields more or less compliant with the OpenSocial 2.5.0 draft
          // spec (opensocial-social-data-specification-2-5-0-draft):
          // http://opensocial-resources.googlecode.com/svn/spec/trunk/Social-Data.xml
          var uri = 'ldengine://' + owner + '//@' + source + '/user/' + id;
          var translatedContact = self.translateContact( uri, contactsData[id] );
          translatedContacts.push(translatedContact);
          outputData = {
            'sourceUri': sourceUri,
            'uri': uri,
            'owner': owner,
            'category': 'person',
            'data': translatedContact
          };
          done(null, outputData);
        } catch(error) {
          SystemLog.log('Request timed out at document translation,  [' + uri + ']', error);
          done(error, null);
        }
      },
      function( error ) {
        process.nextTick( function() {
          callback( error, null );
        });
      }
  );
};
*/

FacebookContactListTranslator.prototype.translate = function(uri, owner, rawDoc, callback) {
  console.log("FacebookContactListTranslator ::::::::: " + JSON.stringify(rawDoc));
  var self = this;
  var contactsData = JSON.parse( rawDoc.data ),
      dataKeys = Object.keys(contactsData);
  console.log("FacebookContactListTranslator ::::dataKeys:: " +JSON.stringify(dataKeys));
  console.log("FacebookContactListTranslator ::::contactsData:: " +JSON.stringify(contactsData));
  var parseAccountId = sourceUri.match( /acct:facebook:[0-9]+/ ),
      parseId = parseAccountId[0].match( /[^\x3a]*$/i ),
      translatedContacts = new Array();

  async.eachSeries(
      dataKeys,
      function( id, done ) {
        try {
          var parsedUri = sourceUri.match( /([^:]*):\/\/(.*)\/\/@([^\/]*)(.*)/ );
          var source = parsedUri[3];

          // Translated to fields more or less compliant with the OpenSocial 2.5.0 draft
          // spec (opensocial-social-data-specification-2-5-0-draft):
          // http://opensocial-resources.googlecode.com/svn/spec/trunk/Social-Data.xml
          var uri = 'ldengine://' + owner + '//@' + source + '/user/' + id;
          var translatedContact = self.translateContact( uri, contactsData[id] );
          translatedContacts.push( translatedContact );

          var outputData = {
            'sourceUri': sourceUri,
            'uri': uri,
            'owner': owner,
            'category': 'person',
            'data': translatedContact
          };
          console.log("outputData "+ JSON.stringify(outputData));
          callback(null, outputData );
        } catch( error ) {
          SystemLog.log('Request timed out at document translation,  [' + uri + ']', error);
          done( error );
        }
      },
      function( error ) {
        process.nextTick( function() {
          callback( error, translatedContacts );
        });
      }
  );
};

FacebookContactListTranslator.prototype.translateContact = function( uri, rawUser ) {
  return {
    // Required fields by spec
    'id': uri,
    'displayName': {'formatted': rawUser.name },

    // Additional required fields for UI
    'preferredUsername':  rawUser.username,
    'thumbnailUrl': rawUser.picture.data.url,
    'appData': {
      'serviceName': 'Facebook',
      'serviceImgUrl': '/images/512x512-logos/facebook.png',
      // Plus other app data that isn't required.
      'verified': rawUser.verified
    },
    // Everything else
    'location': rawUser.timezone || null,
    'aboutMe': rawUser.bio || null,
    'urls': [ rawUser.link || null ],
    'utcOffset': rawUser.locale || null,
    'languagesSpoken': [ rawUser.languages || null ]
  };

};
module.exports = exports = FacebookContactListTranslator;