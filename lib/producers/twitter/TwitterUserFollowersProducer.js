var base = require( '../ProducerBase.js' );
var twitter = require('mtwitter');

function TwitterUserFollowersProducer( fetcher ) {
  this.fetcher = fetcher;
  base.init( this );
}

base.inherit(TwitterUserFollowersProducer);

TwitterUserFollowersProducer.prototype.getMatchPatterns = function() {
  return [ '^acct:twitter:[0-9]+', '/followers' ];
}

TwitterUserFollowersProducer.prototype.init = function( done ) {
  console.log("TwitterUserFollowersProducer ::");
  var self = this;
  this.fetcher.tokenStore.getApplicationTokens( 'twitter', function(error, tokens) {
    self.consumerKey = tokens.consumerKey;
    self.consumerSecret = tokens.consumerSecret;
    if( error ) {
      done( error );
    }
    else
    {
      var OAuth = require('oauth').OAuth;
      self.oauth = new OAuth(
          "https://api.twitter.com/oauth/request_token",
          "https://api.twitter.com/oauth/authorize",
          tokens.consumerKey,
          tokens.consumerSecret,
          "1.0", null, "HMAC-SHA1" );
      done();
    }
  } );
}

TwitterUserFollowersProducer.prototype.attemptRequest = function( uri, owner, source,
                                          resource, keys, callback ) {
  //console.log("TwitterUserFollowersProducer : attemptRequest ");
  //console.log("TwitterUserFollowersProducer : resource " + JSON.stringify(resource));
  //console.log("TwitterUserFollowersProducer : uri " + JSON.stringify(uri));
  //console.log("TwitterUserFollowersProducer : owner " + JSON.stringify(owner));
  //console.log("TwitterUserFollowersProducer : source " + JSON.stringify(source));
  var self = this;
  var userId = owner;

  //console.log("TwitterUserFollowersProducer : userId "+ userId);

  this.fetcher.tokenStore.getUserTokens( owner, source, function( error, tokens ) {
    //console.log("getUserTokens : error " + JSON.stringify(error));
    //console.log("getUserTokens : tokens " + JSON.stringify(tokens));

    var twit = new twitter({
      consumer_key: self.consumerKey ,
      consumer_secret: self.consumerSecret,
      access_token_key: tokens.token,
      access_token_secret: tokens.tokenSecret
    });

    twit.get('/followers/list.json', { include_entities: true },
        function (err, data) {
          if (err) {
            console.log(err.toString());
          } else {
            //console.log(JSON.stringify(data));
            callback(null, {
              'uri': uri,
              'data': data
            });
          }
        });
/*
    if( error ) {
      callback( error );
    }
    else
    {
      self.oauth.getOAuthRequestToken(function(error, oauthToken, oauthTokenSecret, results) {
        if (error) {
          console.log("ERRROR");
        } else {
          console.log("TwitterUserFollowersProducer:oauthToken :" + tokens.token);
          console.log("TwitterUserFollowersProducer:oauthTokenSecret :" + tokens.tokenSecret);
          var twitterUrl = 'https://api.twitter.com/1.1/followers/list.json?user_id=' + userId+'&oauth_token='+tokens.token
              +'&';
          console.log("keys :" + JSON.stringify(keys));
          self.oauth.get( twitterUrl, tokens.token, tokens.tokenSecret,
              function( error, result ) {
                console.log("result :" + JSON.stringify(result));
                console.log("error :" + JSON.stringify(error));
                if( error )
                  callback( error, null );
                else
                {
                  console.log("data :" + JSON.stringify(result));
                  callback( null, {
                    'uri': uri,
                    'data': result
                  });
                 // done();
                }
              }
          );
        }
      });

    }
    */
  });

}
module.exports = exports = TwitterUserFollowersProducer;
