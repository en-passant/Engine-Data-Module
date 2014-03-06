process.env.NODE_ENY = 'test';
process.env.FACEBOOK_KEY = '500475259980837';
process.env.FACEBOOK_SECRET = '1502a48345e37d6555167fd2c62ad83';
var EDM = require('engine-data-module');
var fs = require('fs');
var tokenStore = new EDM.DummyTokenStore();
var assert = require('assert');
var datamodule = new EDM.DataModule({
  tokenStore: tokenStore,
  services : ['facebook']
});

describe('Testing Facebook User Profile', function(){
  before(function(){
    tokenStore.storeApplicationTokens('facebook',
     {
       'clientID': '500475259980837',
       'clientSecret':'1502a48345e37d6555167fd2c62ad837',
       'callbackURL' :'/',
       'callbackPath' : '/'
     }, function(){
     });
  });

  it('should return users facebook profile', function() {
    datamodule.fetcher.fetch('ldengine://gmail:110555463901248997040//@acct:facebook:100007891360262/user/100007891360262',
     function(error, result) {
       console.log("this is result "+result);
       console.log("this is error "+error);
       assert.equal(error, null);
       assert.equal(result.username,'yuho.tata');
     });
  });

});