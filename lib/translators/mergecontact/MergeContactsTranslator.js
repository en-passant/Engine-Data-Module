
function MergeContactsTranslator() {
}

MergeContactsTranslator.prototype.getMatchPatterns = function() {
    return [ '^public:mergecontact', '/user/' ];
}
MergeContactsTranslator.prototype.translate = function( uri, owner, rawDoc, callback ) {
			try {
				process.nextTick( function() {
					callback( null, 'Success' );
				});
			} catch( err ) {
					SystemLog.log('Request timed out at document translation,  [' + uri + ']', err);
						callback(  err , null );
			}
};
module.exports = exports = MergeContactsTranslator;
