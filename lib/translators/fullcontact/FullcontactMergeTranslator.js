function FullcontactMergeTranslator() {
}
FullcontactMergeTranslator.prototype.getMatchPatterns = function() {
    return [ '^public:fullcontact', '/people/merge' ];
}
FullcontactMergeTranslator.prototype.translate = function( uri, owner, rawDoc, callback ) {
			try {
				process.nextTick( function() {
					callback( null, rawDoc.data );
				});
			} catch( err ) {
				SystemLog.log('Request timed out at document translation,  [' + 
					uri + ']', err);
				callback(  err , null );
			}
};
module.exports = exports = FullcontactMergeTranslator;
