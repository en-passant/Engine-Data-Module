var uuid = require( 'node-uuid' );

function TwitterRelationshipTranslator() {
}
TwitterRelationshipTranslator.prototype.getMatchPatterns = function() {
	return [ '^acct:twitter:[0-9]+', '/relationship/.*' ];
}
TwitterRelationshipTranslator.prototype.translate = function( sourceUri, owner, rawDoc, callback ) {
	try {
		var parsedUri = sourceUri.match( /([^:]*):\/\/(.*)\/\/@([^\/]*)\/(([0-9]+)\/)?relationship\/(.*)/ );
		var source = parsedUri[3];
		var type = parsedUri[6];

		var translatedGroup = {
				'id': sourceUri,
				'title': type,
			};

		if( rawDoc.data.length > 1 )
		{
			var extensionUris = new Array();

			for( var chunkNumber=0; chunkNumber<rawDoc.data.length; chunkNumber++ )
			{
				var chunk = JSON.parse( rawDoc.data[ chunkNumber ] );
				{
					var extensionUri = 'ldengine://' + owner + '//@' + source + '/extension/' + uuid.v4();
					var translatedChunk = {
						'members': new Array(),
					};
					for( var j=0; j<chunk.ids.length; j++ )
						translatedChunk.members.push( 'ldengine://' + owner + '//@' + source + '/user/' + chunk.ids[j] );
					EventService.emit( 'document::translated', {
						'category': 'extension',
						'uri': extensionUri,
						'owner': owner,
						'data': translatedChunk,
						'time': Date.now()
					});
					extensionUris.push( extensionUri );
				}
			}

			// Translated to fields more or less compliant with the OpenSocial 2.5.0 draft 
			// spec (opensocial-social-data-specification-2-5-0-draft):
			// http://opensocial-resources.googlecode.com/svn/spec/trunk/Social-Data.xml

			translatedGroup.extensions = new Array();

			for( var i=0; i<extensionUris.length; i++ )
				translatedGroup.extensions.push( extensionUris[i] );
		}
		else
		{
			translatedGroup.members = new Array();
			var chunk = JSON.parse( rawDoc.data[ 0 ] );
			for( var j=0; j<chunk.ids.length; j++ )
				translatedGroup.members.push( 'ldengine://' + owner + '//@' + source + '/user/' + chunk.ids[j] );
		}

		EventService.emit( 'document::translated', {
			'category': 'group',
			'uri': sourceUri,
			'owner': owner,
			'data': translatedGroup
		});

		process.nextTick( function() {
			callback( null, translatedGroup );
		});

	} catch( err ) {
		SystemLog.log('Request timed out at document translation,  [' + uri + ']', err);
                callback(  err , null );
	}
};

module.exports = exports = TwitterRelationshipTranslator;
