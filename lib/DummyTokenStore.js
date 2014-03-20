function DummyTokenStore() {
	this.userTokens = {};
	this.applicationTokens = {};
}
DummyTokenStore.prototype.getUserTokens = function( owner, source, callback ) {
	if( this.userTokens[ owner ] )
	{
    console.log( "Hello hi 1" );
		if( this.userTokens[ owner ][ source ] ) {
      console.log( "Hello hi 1" + JSON.stringify(this.userTokens[ owner ][ source ]));
      callback( null, this.userTokens[ owner ][ source ]);
    }
		else
			callback( new Error( 'No tokens available for user: ' + owner + ', source: ' + source ) , null );
	}
	else
	{
		console.log( "Hello hi" );
		callback( new Error( 'No tokens available for user: ' + owner ), null );
	}
}
DummyTokenStore.prototype.storeUserTokens = function( owner, source, tokens, callback ) {
	if( !this.userTokens.hasOwnProperty( owner ) );
		this.userTokens[ owner ] = {};
	this.userTokens[ owner ][ source ] = tokens;	
	callback();	
}
DummyTokenStore.prototype.storeApplicationTokens = function( service, tokens, callback ) {
	this.applicationTokens[ service ] = tokens;
	callback();
}
DummyTokenStore.prototype.getApplicationTokens = function( service, callback ) {
	if( this.applicationTokens[ service ] )
	{
		callback( null, this.applicationTokens[ service ]);
	}
	else
	{
		callback( new Error( 'No tokens available for service: ' + service ));
	}
}
module.exports = exports = DummyTokenStore;