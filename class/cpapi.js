"use strict";
/*
 * ID:v1.2 102218
 * class/cpapi.js
 * Class Constructor
 * ES6 style
 *
 * this is your class method for constructing objects
 * be sure to export it, as well as call the functions it needs
 * to return your values to the object
 * will call the script of the same name in fun/
 * for functional transport of REST calls
 *
 * axios API constructor for Check Point
 * see fun/cpapi.js for axios function
*/


const path = require('path');
const scriptname = path.basename(__filename);
const funcall = `../fun/${scriptname}`
const myApi = require(funcall)


/**
 * Process Check Point API callouts 
 * @constructor 
 * @param {Object} CPapi Check Point JSON representation
 * @param {String} CPapi.method API method (always post)
 * @param {String} CPapi.headers apply mytoken.sid to X-chkp-sid header
 * @param {String} CPapi.baseURL URL of API call
 * @param {Object} CPapi.data object holder for JSON callout data
 */
module.exports = class Cpapi {
	constructor(that) {
		this.method = 'post'
		this.headers = { 'X-chkp-sid': that.sid }
		this.baseURL = that.url + '/'
		this.data = {}
	}
/**
 * cntObj Function
 * count the returned objects in the paging function from Check Point API
 * @param {Object} CPapi Check Point JSON representation
 * @param {Object} CPapi.data object holder for JSON callout data
 * @param {Number} CPapi.data.from from object count
 * @param {Number} CPapi.data.to to object count
 * @param {Number} CPapi.data.total of total object count
 */
	cntObj (from, to, total) {
		this.data.from = from
		this.data.to = to
		this.data.total = total
		return this
	}

/**
 * setCnt Function
 * @param {Object} CPapi Check Point JSON representation
 * @param {Object} CPapi.data object holder for JSON callout data
 * @param {Number} CPapi.data.offset collect object from index
 * @param {Number} CPapi.data.limit maximum objects to retrieve (500 limit)
 */
	setCnt (offset, limit) {
		this.data.offset = offset
		this.data.limit = limit
		return this
	}

/**
 * setDetail Function
 * @param {Object} CPapi Check Point JSON representation
 * @param {Object} CPapi.data object holder for JSON callout data
 * @param {String} CPapi.data.details-level full, standard or uid level of object data
 */
	setDetail (detail) {
		this.data['details-level'] = detail
		return this
	}

	setCmd (cmd) {
		this.url = cmd
		return this
	}

/**
 * addData Function
 * @param {Object} CPapi Check Point JSON representation
 * @param {Object} CPapi.data object holder for JSON callout data
 * @param {String} CPapi.data.filter filter parameters of returned objects
 * @param {String} CPapi.data.type object type
 * @param {String} CPapi.data.name object name
 * @param {String} CPapi.data.uid object uid 
 * @param {String} CPapi.data.policy-package policy name (used for installs)
 * @param {String} CPapi.data.revision policy revision ID (used for installs)
 * @param {String} CPapi.data.targets policy install targets (used for installs)
 */
	addData (that) {
		if (that.filter) {
		this.data.filter = that.filter
		}
		if (that.type) {
		this.data.type = that.type
		}
		if (that.ip) {
		this.data['ip-only'] = that.ip
		}
		// every call needs a name
		// or UID of the object you are calling
		if (that.name) {
			this.data.name = that.name
		}
		if (that.uid) {
			this.data.uid = that.uid
		}
		// Used for policy install via api
		if (that.policy) {
			this.data["policy-package"] = that.policy
		}
		if (that.revision) {
			this.data.revision = that.revision
		}
		if (that.targets) {
			this.data.targets = that.targets
		}
		// session tracking callouts
		if (that.id) {
			this.data['task-id'] = that.id
		}
		if (that.toid) {
			this.data['to-session'] = that.toid
		}
		if (that.frid) {
			this.data['from-session'] = that.frid
		}
		if (that.to) {
			this.data['to-date'] = that.to
		}
		if (that.from) {
			this.data['from-date'] = that.from
		}
		if (that.hits) {
			this.data['show-hits'] = that.hits
		}
		if (that.dict) {
			this.data['use-object-dictionary'] = that.dict
		}
		if (that.order) {
			this.data.order = that.order
		}
		return this
	}

	setData (that) {
		this.data = that
		return this
	}

	rmData () {
		this.data = {}
		return this
	}

	delObj (x) {
		if (x.uid) {
			this.data.uid = x.uid
		} else {
			this.data.name = x.name
		}
		return this
	}

	print () {
		console.dir(this)
		console.log('\n')

	}

	async apiPost () {
		this.response = {}
		this.response = await myApi(this).catch((error) => { console.log(error.response.data)})
		//this.response = await myApi(this)
		return await this.response.data
	}

}

