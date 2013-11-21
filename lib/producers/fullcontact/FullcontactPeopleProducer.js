var base = require( '../ProducerBase.js' );

function FullcontactPeopleProducer() {
    base.init( this );
	this.keys = 'ignore';
}
base.inherit( FullcontactPeopleProducer );

FullcontactPeopleProducer.prototype.getMatchPatterns = function() {
    return [ '^public:fullcontact', '/people/_index' ];
}
FullcontactPeopleProducer.prototype.attemptRequest = function( uri, owner, source, resource, keys, callback ) {
    var self = this,
		CM = new ContactManagerService(owner);
	
	// What's err?  It doesn't look like an error object.
	CM.getAllPeople( function( err, data ){ 
		if(err) {
			SystemLog.error( 'Error in ContactManagerService.getAllPeople() for owner: ' + owner, err );
			callback( err, null );
		}
		else{
			SystemLog.debug(" Recieved People list for user " + owner.toString() );
			callback( null, {
				'uri': uri, 
				'data': data
			});
		}
	});
};
module.exports = exports = FullcontactPeopleProducer;
