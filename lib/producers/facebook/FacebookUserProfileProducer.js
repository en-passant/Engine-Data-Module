var base = require('../ProducerBase.js');
var everyauth = require('everyauth');
var passport = require('passport');
var FacebookStrategy = require('passport-facebook').Strategy;

function FacebookUserProfileProducer(fetcher) {
  this.fetcher = fetcher;
  base.init(this);
}

base.inherit(FacebookUserProfileProducer);
process.env.FACEBOOK_KEY = '500475259980837';
process.env.FACEBOOK_SECRET = '1502a48345e37d6555167fd2c62ad83';
FacebookUserProfileProducer.prototype.getMatchPatterns = function() {
  return [ '^acct:facebook:[0-9]+', '/user/[0-9]+' ];
}
var self;
FacebookUserProfileProducer.prototype.init = function(done) {
  self = this;
  this.fetcher.tokenStore.storeApplicationTokens('facebook',
     {
       'clientID': '500475259980837',
       'clientSecret':'1502a48345e37d6555167fd2c62ad837',
       'callbackURL' :'/',
       'callbackPath' : '/'
     }, function(){
     });
   this.fetcher.tokenStore.getApplicationTokens('facebook' , function(error, tokens) {
    if (error) {
      done(error);
    } else {
      self.clientID = tokens.clientId;
      self.clientSecret = tokens.clientSecret;
      done();
    }
  });
}


passport.serializeUser(function(user, done) {
  done(null, user.id);
});

passport.deserializeUser(function(id, done) {
  User.findById(id, function(err, user) {
    done(err, user);
  });
});

FacebookUserProfileProducer.prototype.attemptRequest = function(uri, owner, source, resource, keys, callback) {
  var profileFields = ['','','',''];
  console.log("This is uri : "+ uri);
//  everyauth.debug = true;
//  console.log("everauth debug >" + everyauth.debug);
/*
  everyauth.facebook.findUserById( function (userId, callback) {
    var user ={}; //usersByFbId[userId].username;
    callback(null, user);
  });
  everyauth.facebook
    .appId(self.clientId)
    .appSecret(self.clientSecret)
    .scope('email,user_location,user_photos,publish_actions')
    .handleAuthCallbackError(function(req, res){
       callback(error, null);
     })
     .findOrCreateUser(function (session, accessToken, accessTokExtra, fbUserMetadata) {
        console.log("profile :"+ fbUserMetadata);
        callback(null, {
         'uri' : uri,
         'data' : fbUserMetadata
       })
    }).redirectPath('/');
*/
  passport.use(new FacebookStrategy({
    'clientID': '500475259980837',
    'clientSecret': '1502a48345e37d6555167fd2c62ad83',
    'callbackURL' : '/auth/facebook/callback'
  },
  function(accessToken, refreshToken, profile, done) {
    process.nextTick(function () {

      // To keep the example simple, the user's Yammer profile is returned to
      // represent the logged-in user.  In a typical application, you would want
      // to associate the Yammer account with a user record in your database,
      // and return that user instead.
      console.log("This is profile :" + profile);
      return done(null, profile);
    });
 //   console.log("This is profile :" + profile);
 //   return done(null, profile);
  }));
  passport.authenticate('facebook', { successRedirect: '/',
                                   failureRedirect: '/login',
                                   failureFlash: true })
}
module.exports = exports = FacebookUserProfileProducer;