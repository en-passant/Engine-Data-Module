var Xml2js = require( 'xml2js' ),
	async = require( 'async' );

function GoogleContactsContactListTranslator() {	
}
GoogleContactsContactListTranslator.prototype.getMatchPatterns = function() {
	return [ '^acct:googlecontacts:[0-9]+', '/contacts' ];
}
GoogleContactsContactListTranslator.prototype.translate = function( sourceUri, owner, rawDoc, callback ) {
	var self = this;

	var parsedUri = sourceUri.match( /([^:]*:\/\/.*\/\/@[^\/]*).*/ );
	var baseUri = parsedUri[1];			

	var parser = new Xml2js.Parser();
	var contactList = new Array();

	try
	{
		var parsed = parser.parseString( rawDoc.data, function( err, result ) {
			if( err )
				callback( err, null );
			else
			{
				async.eachSeries(
					result.entry,
					function( item, done ) {
		    			try
						{
							var contact = {
								'id': baseUri + '/contact/' + 
									item.id.slice( 40 ),
								'emails': self.parsePotentialArray( item, 'email' ),
								'alternateNames': self.parsePotentialArray( item, 'name' ),
								'ims': self.parsePotentialArray( item, 'im' ),
								'organizations': self.parsePotentialArray( item, 'organization' ),
								'phoneNumbers': self.parsePotentialArray( item, 'phoneNumber' ),
							};
							
							if( item.title[ '#' ] )
								contact.displayName = { 'formatted': item.title[ '#' ] };
							else
							{
								if( contact.alternateNames.length > 0 )
									contact.displayName = contact.alternateNames[0];
							}

							contact.addresses = new Array();
							var structuredAddresses = self.parsePotentialArray( item, 'structuredPostalAddress' );
							for( var i in structuredAddresses )
								contact.addresses.push( structuredAddresses[i] )

							var addresses = self.parsePotentialArray( item, 'postalAddress' );
							for( var i in addresses )
								contact.addresses.push( addresses[i] );

							var outputData = {
								'sourceUri': sourceUri,
								'uri': contact.id,
								'owner': owner,
								'category': 'person',
								'data': contact
							};
							NLPService.addAnalysisIfMissing( outputData, function( error, result ) {
					        	process.nextTick( function() {
					        		contactList.push( contact.id );
					        		done( error );
					        	});
					   		});
						}
						catch( error )
						{
							SystemLog.error( 'Error translating contact: ' + require( 'util' ).inspect( i ) + ' from ' + require( 'util' ).inspect( result.entry ) );
							done( error );
						}					   		
					},
					function( error ) {
						if( error )
						{
							callback( error, contactList );
						}
						else
						{
					        process.nextTick( function() {
					            callback( null, contactList );
					        });							
						}
					}
				);
			}
		});
    }
	catch( error )
	{
		SystemLog.log( 'Error parsing contacts data for uri: ' + sourceUri, error );
		callback( error );
	}
}
GoogleContactsContactListTranslator.prototype.parsePotentialArray = function( entry, string ) {
	var item = entry[ 'gd:' + string ];

	var result = new Array();
	if( item )
	{
		if( Object.prototype.toString.call( item ) === '[object Array]' )
			for( var i in item )
				result.push( this[ 'parse' + string + 'Data' ]( item[i] ) );
		else
			result.push( this[ 'parse' + string + 'Data' ]( item ));
	}
	return result;
}
GoogleContactsContactListTranslator.prototype.parseemailData = function ( data ) {
	return data['@'].address;
}
GoogleContactsContactListTranslator.prototype.parsenameData = function ( data ) {
	if( data[ 'gd:fullName' ] )
		return data['gd:fullName'];
	else
	{
		var nameSoFar = '';
		if( data['gd:namePrefix'] )
			nameSoFar += data['gd:namePrefix'];
		if( data['gd:givenName'] )
			nameSoFar += data['gd:givenName'];
		if( data['gd:additionalName'] )
			nameSoFar += data['gd:additionalName'];
		if( data['gd:familyName'] )
			nameSoFar += data['gd:familyName'];
		if( data['gd:nameSuffix'] )
			nameSoFar += data['gd:nameSuffix'];
		return nameSoFar;
	}
}
GoogleContactsContactListTranslator.prototype.parseimData = function ( data ) {
	return data['@'].address;
}
GoogleContactsContactListTranslator.prototype.parseorganizationData = function ( data ) {
	var organization = {};

	if( data['@'] && data['@'].label )
		organization.type = data['@'].label;

	if( data[ 'gd:orgDepartment' ])
		organization.department = data[ 'gd:orgDepartment' ];

	if( data[ 'gd:orgJobDescription' ])
		organization.description = data[ 'gd:orgJobDescription' ];

	if( data[ 'gd:orgName' ])
		organization.name = data[ 'gd:orgName' ];

	if( data[ 'gd:orgTitle' ])
		organization.title;

	if( data[ 'gd:where' ])
		organization.location;

	return organization;
}
GoogleContactsContactListTranslator.prototype.parsephoneNumberData = function ( data ) {
	return data['#'];
}
GoogleContactsContactListTranslator.prototype.parsepostalAddressData = function ( data ) {
	return data['#'];
}
GoogleContactsContactListTranslator.prototype.parsestructuredPostalAddressData = function ( data ) {
	var address = {};

	if( data[ 'gd:formattedAddress' ] )
	{
		address.formatted = data[ 'gd:formattedAddress' ];
		address.streetAddress = data[ 'gd:formattedAddress' ];
	}

	if( data[ '@' ] && data[ '@' ].rel )
		address.type = data[ '@' ].rel;


	var temp = '';

	if( data[ 'gd:housename' ] )
		temp = data[ 'gd:housename' ];

	if( data[ 'gd:agent' ] )
	{
		if( temp.length > 0 ) temp += '\n';
		temp += data[ 'gd:agent' ];
	}

	if( data[ 'gd:pobox' ] )
	{
		if( temp.length > 0 ) temp += '\n';
		temp += data[ 'gd:pobox' ];
	}

	if( data[ 'gd:street' ] )
	{
		if( temp.length > 0 ) temp += '\n';
		temp += data[ 'gd:street' ];
	}

	address.building = temp;

	if( data[ 'gd:country' ] )
		address.country = data[ 'gd:country' ];

	if( data[ 'gd:region' ] )
		address.region = data[ 'gd:region' ];

	var temp = '';

	if( data[ 'gd:neighborhood' ])
		temp = data[ 'gd:neighborhood' ];

	if( data[ 'gd:city' ] )
	{
		if( temp.length > 0 ) temp += '\n';
		temp += data[ 'gd:city' ];
	}

	address.locality = temp;

	if( data[ 'gd:postcode' ])
		address.postalCode = data[ 'gd:postcode' ];

	return address;
}

module.exports = exports = GoogleContactsContactListTranslator;
