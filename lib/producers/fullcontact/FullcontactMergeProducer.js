var base = require( '../ProducerBase.js' );

function FullcontactMergeProducer() {
    base.init( this );
	this.keys = 'ignore';
}
base.inherit( FullcontactMergeProducer );

FullcontactMergeProducer.prototype.getMatchPatterns = function() {
    return [ '^public:fullcontact', '/people/merge' ];
}
FullcontactMergeProducer.prototype.attemptRequest = function( uri, owner, source, resource, keys, callback ) {
    var self = this,
		contact = new ContactManagerService(owner);
/*
	contact.autoAugmentFullContact(function(err, res) {
		if( err )
		{
			SystemLog.log(" Error merging FullContact URIs into People " + 
				err.toString() );
			callback( err, null );
		}
		else
		{
		*/
		contact.startFCFlow();
		callback(null, 'Success' );
	
		//}
	//});
};
module.exports = exports = FullcontactMergeProducer;
