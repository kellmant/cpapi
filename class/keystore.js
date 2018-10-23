"use strict";
//
// ID:v1.0 102318
// class/keystore
// etcd class method 
// called by fun/keystore
// use 
const path = require('path');
const scriptname = path.basename(__filename);
const funcall = `../fun/${scriptname}`

const keystore = require(funcall)
const localkeys = process.env.ETCDCTL_ENDPOINTS

//Constructor
// ES6 style
//

module.exports = class Keystore {

	constructor () {
		this.keyhost = localkeys
		this.options = {}
		this.result = []
	}

	print () {
		console.log(Object.getOwnPropertyNames(this))
		console.log('\n')
	}

	resVal () {
		return this.result.node.value
	}

	getKeyhost () {
		return this.keyhost
	}

	setKeyhost (x) {
		if (!x) {
			this.keyhost = localkeys
		} else {
			this.keyhost = `http://${x}:2379`
		}
		return this
	}

	setOpt (x) {
		if (x.recursive) {
		this.options.recursive = x.recursive
		}
		if (x.ttl) {
			this.options.ttl = x.ttl
		}
		return this
	}

	async getKey (x) {
		this.key = x
		this.result = await keystore.read(this).catch((err) => { throw new Error(err)})
		if (!this.result.node.nodes) {
			return this.result.node.value
		} else {
		return await this.result.node.nodes
		}
	}

	async setKey (x, y) {
		this.key = x
		this.value = y
		this.result = await keystore.update(this).catch((err) => { throw new Error(err)})
		return await this
	}

	async rmKey (x) {
		this.options.recursive = true
		this.key = x
		this.result = await keystore.destroy(this).catch((err) => { throw new Error(err)})
		return this
	}

	async getAll (x) {
		this.key = x
		this.result = await keystore.objectify(this).catch((err) => { throw new Error(err)})
		return this
	}



}


