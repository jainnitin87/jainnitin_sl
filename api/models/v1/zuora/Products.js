/**
 * Products.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/documentation/concepts/models-and-orm/models
 */

module.exports = {

  connection: ['zuoraRest'],

	  	autoCreatedAt: false,
	  	autoUpdatedAt: false,
	  	tableName: 'catalog/products',
	  	attributes: {
	  		success: 'boolean',
	  		processId: 'string',
	  		reason: 'json',
	  		products: 'array',
	  		nextPage: 'string'
	  	}
};

