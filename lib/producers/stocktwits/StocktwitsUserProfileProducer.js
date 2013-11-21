var base = require( '../ProducerBase.js' );

function StocktwitsUserProfileProducer() {
    base.init( this );
    var OAuth2 = require( 'oauth' ).OAuth2;

    this.oauth2 = new OAuth2( 
        engine.config.stocktwits.clientID, 
        engine.config.stocktwits.clientSecret, 
        "https://api.singly.com", "/oauth/authenticate", "/oauth/access_token" );
}
base.inherit( StocktwitsUserProfileProducer );

StocktwitsUserProfileProducer.prototype.getMatchPatterns = function() {
    return [ '^acct:stocktwits:[0-9]+', '/user/[0-9]+' ];
}
StocktwitsUserProfileProducer.prototype.attemptRequest = function( uri, owner, source, resource, keys, callback ) {
    var self = this;
    var stocktwitsUrl = ' https://api.singly.com/services/stocktwits/self?access_token=' + keys.accessToken;
	self.oauth2.get( stocktwitsUrl, keys.accessToken, 
        function( error, data ){
            if( error )
                callback( error, null );
            else
                callback( null, {
                    'uri': uri, 
                    'data': data
                });
        } );
};
module.exports = exports = StocktwitsUserProfileProducer;
