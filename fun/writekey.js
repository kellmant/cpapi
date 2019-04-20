"use strict";
// ID:v1.0 102218
// fun/writekey.js
// functional call to write key/value to etcd
// requires class/keystore for method builder
// will write x.value to x.key
//
const path = require('path');
const scriptname = 'keystore'
const classcall = `../class/${scriptname}`
const Keystore = require(classcall)

module.exports = async (x) => {
	try {
		const myStore = new Keystore()
		myStore.setKeyhost()
		if (x.ttl) {
			myStore.setOpt(x)
		}
		if (typeof x.value == 'object') {
			x.value = JSON.stringify(x.value)
		}
		if (x.key && x.value) {
			await myStore.setKey(x.key, x.value)
		}
		return
	} catch (err) {
		console.log(err.message)
		//throw new Error(err)
	}
}
