var base = require('../ProducerBase.js');
var everyauth = require('everyauth');

function FacebookUserProfileProducer(fetcher) {
  this.fetcher = fetcher;
  base.init(this);
}

base.inherit(FacebookUserProfileProducer);

FacebookUserProfileProducer.prototype.getMatchPatterns = function() {
  return [ '^acct:facebook:[0-9]+', '/user/[0-9]+' ];
}

FacebookUserProfileProducer.prototype.init = function(done) {
  var self = this;
  this.fetcher.tokenStore.getApplicationTokens('facebook' , function(error, tokens) {
    if (error) {
      done(error);
    } else {
      self.clientID = tokens.consumerKey;
      self.clientSecret = tokens.consumerSecret;
      done();
    }
  });
}

FacebookUserProfileProducer.prototype.attemptRequest = function(uri, owner, source, resource, keys, callback) {
  var profileFields = ['','','',''];
  everyauth.facebook
    .appId(self.clientId)
    .appSecret(self.clientSecret)
    .scope()
    .handleAuthCallbackError(function(req, res){
       callback(error, null);
     })
     .findOrCreateUser(function (session, accessToken, accessTokExtra, fbUserMetadata) {
       callback(null, {
         'uri' : uri,
         'data' : fbUserMetadata
       })
    }).redirectPath('/');
}
module.exports = exports = FacebookUserProfileProducer;