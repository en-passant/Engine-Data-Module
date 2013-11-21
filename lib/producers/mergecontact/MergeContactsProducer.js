var base = require( '../ProducerBase.js' );

function MergeContactsProducer() {
    base.init( this );
	this.keys = 'ignore';
}
base.inherit( MergeContactsProducer );

MergeContactsProducer.prototype.getMatchPatterns = function() {
    return [ '^public:mergecontact', '/user/' ];
}
MergeContactsProducer.prototype.attemptRequest = function( uri, owner, source, resource, keys, callback ) {
    var self = this;
	var startTime = (new Date() ).valueOf();
	var contact = new ContactManagerService(owner);
	
	contact.startMergeFlow();
	callback(null, 'Success');
};
module.exports = exports = MergeContactsProducer; 
