"use strict";
//
// ID:2.0 102218
// bin/close.js
// close session authorization for check point api
// that uses the auth class method to process 
// credentials in json form:
// auth.name username of api account
// auth.password authentication credential
// auth.host host name or ip of API host
// auth.desc api session description (from enviroment)
//
// copy this to the new filename for your class method
// put a copy of your main runtime with the class in bin/
// put a copy of the class constructor in class/
// put a copy of the functions your class needs in fun/

// main runtime
// recieve and process args from the callout
// this will show you return values of your args 
// for runtime
// bin/close.js
//
const path = require('path');
const scriptname = 'auth';
const classcall = `../class/${scriptname}`
const Cpsession = require(classcall)

// example runtime for your class method
//

module.exports = async (mytoken) => {
	try {
		const mySession = new Cpsession()
		const endToken = await mySession.closeToken(mytoken)
		return await endToken.data
	} catch (err) {
		console.log('ERROR IN SESSION LOGOUT for ' + mytoken)
		return process.exit(1)
	}
}
