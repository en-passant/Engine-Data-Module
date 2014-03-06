process.env.NODE_ENY = 'test';
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
    tokenStore.storeUserTokens(
     'Yuho','acct:facebook:100007891360262',
     {
       username: 'yuho.jeta',
       password: 'Datamodule1234',
       secure:'on'
     }, function(){
     });
  });

  it('should return users facebook profile', function() {
    datamodule.fetcher.fetch('ldengine://gmail:110555463901248997040//@acct:facebook:100007891360262/user/100007891360262',
     function(error, result) {
       console.log(result);
       console.log(error);
       assert.equal(error, null);
     });
  });

});