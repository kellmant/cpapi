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
const Keystore = require('../class/keystore')
//const keydir = '_session/535a8f8e-8820-4e80-add8-fdac1ffd314a/token'
// example runtime for your class method
//

module.exports = async (mytoken) => {
	try {
		const mySession = new Cpsession()
		var endToken = await mySession.closeToken(mytoken)
		const myStore = new Keystore()
		return await endToken.data
	} catch (error) {
		console.log('ERROR IN SESSION LOGOUT')
		console.dir(mytoken)
		console.log(error.response.data)
		return process.exit(1)
	}
}
