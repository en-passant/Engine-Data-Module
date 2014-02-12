process.env.NODE_ENV = 'test';
var EDM = require( 'engine-data-module' );
var tokenStore = new EDM.DummyTokenStore();
var assert = require('assert');
var datamodule = new EDM.DataModule({
  tokenStore: tokenStore,
	services: [ 'imap' ]
});

describe('Testing Imap User Profile', function() {
  before(function() {
    tokenStore.storeUserTokens(
      'curtis', 'acct:imap:curtislacy221@yahoo.com@imap.mail.yahoo.com',
	    {
		     username: 'curtislacy221@yahoo.com',
		     password: 'enR9GBEU-Zrqm-2xev_PpQ_cuN-TqyTg',
		     host: 'imap.mail.yahoo.com',
		     port: '993',
		     secure: 'on'
	    }, function(){});
  });

  it('should return users imap profile', function() {
    datamodule.fetcher.fetch(
      'ldengine://curtis//@acct:imap:curtislacy221@yahoo.com@imap.mail.yahoo.com/user/curtis.lacy',
       function(error, result) {
         assert.equal(error, null);
       });
  });

});