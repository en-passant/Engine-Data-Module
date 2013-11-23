Engine-Data-Module
==================

Access a variety of data sources in a simple, consistent way.

Code Sample
==================

```js
// We're using https://github.com/caolan/async for flow control later on.
// It's a nice package.
var async = require( 'async' );

// Include the engine-data-module library.
var EDM = require( 'engine-data-module' );
// In a real application, you'd probably want to store the tokens in a database,
// but in this sample we'll use a simple in-memory datastore.
var tokenStore = new EDM.DummyTokenStore();

// The DummyTokenStore requires us to load it with the tokens we got when we registered
// our app with Twitter.
tokenStore.storeApplicationTokens(
	'twitter',
	{
		"consumerKey": "GetThisFromTwitter",
		"consumerSecret": "GetThisFromTwitterAsWellAndDontTellItToAnyone"
	},
	function() {
	  // Then we can actually instantiate the module.
		var datamodule = new EDM.DataModule( 
			{ 
				tokenStore: tokenStore,
				// Specify which data sources we intend to use.  Anything listed in here
				// that doesn't have keys in the tokenStore will throw an error when it tries
				//to initialize.
				services: [ 'twitter' ]
			}
		);

    // The DummyTokenStore needs to be populated with user access tokens as well.
    // These would generally also be stored in a database in a real product.  You 
    // can use pretty much any string you want as a username.
		tokenStore.storeUserTokens( 
			'curtis', 'acct:twitter:90542269',
			{ 
		// engine-data-module doesn't provide any of the authentication flow, you'll
		// need to provde that.  https://github.com/jaredhanson/passport is an excellent
		// choice when it comes to authenticating with remote services.
			  token: 'YouGetThisTokenWhenAUserAuthenticatesWithTwitter',
		  	tokenSecret: 'YouAlsoGetThisTokenWhenTheUserAuthenticates'
		  },
		  function() {

    // Now that we have everything set up, we can actually runa few sample queries.
    // We're using async.series here to run the samples in series without having to 
    // Deeply indent and make things hard to read.
				async.series( 
					[
						function( done ) {
		        // For "curtis"'s twitter account, recover his user profile.
							datamodule.fetcher.fetch( 
								'ldengine://curtis//@acct:twitter:90542269/user/90542269',
								function( error, result ) {
									if( error )
									{
										done( error );
									}
									else
									{
										console.log( '******************************************' );
										console.log( 'Twitter User Profile:')
										console.log( result );
										console.log( '******************************************' );
										done();
									}
								}
							);			
						},
						function( done ) {
						// Now let's recover his most recent mentions.
							datamodule.fetcher.fetch( 
								'ldengine://curtis//@acct:twitter:90542269/status/mentions',
								function( error, result ) {
									if( error )
									{
										done( error );
									}
									else
									{
										console.log( '******************************************' );
										console.log( 'Twitter Mentions of that user:')
										console.log( result );
										console.log( '******************************************' );
										done();
									}
								}
							);			
						},
						function( done ) {
						// Recovering a user profile also works for a user other than the account owner.
							datamodule.fetcher.fetch( 
								'ldengine://curtis//@acct:twitter:90542269/user/130852105',
								function( error, result ) {
									if( error )
									{
										done( error );
									}
									else
									{
										console.log( '******************************************' );
										console.log( 'Twitter User Profile for a user other than the account holder:')
										console.log( result );
										console.log( '******************************************' );
										done();
									}
								}
							);			
						}
					],
					function( error ) {
						if( error )
							throw error;
					}
				);  		
		  	}
		);
	}
);

```

MIT License
==================

Copyright 2012-2013 Engine, Inc.

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
