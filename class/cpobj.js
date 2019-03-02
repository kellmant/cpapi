"use strict";
/**
 * Create and process Check Point objects
 *
 * @class 
 *
 */
module.exports = class CPobj {
		/** 
		 *
 		 * @param {Object} CPobj Check Point JSON representation
		 * @param {String} CPobj.name name of object
		 * @param {String} CPobj.type type of object
		 * @param {String} CPobj.uid unique ID of object
		 * @param {String} CPobj.comments optional comments
		 * @param {String} CPobj.color optional color of object
		 */
	constructor(x) {
		this.name = x.name || 'no name'
		this.type = x.type
		this.uid = x.uid
		if (x.comments) {
		this.comments = x.comments
		}
		if (x.color) {
		this.color = x.color
		}
	}
		/** 
		 * @param {Function} Cpobj.dump show object properties
		 *
		 */
	dump (x) {
		if (this.x) {
			return this[x]
		} else {
			return this
		}
	}

		/** 
		 * @param {Function} Cpobj.tag set object tags for post
		 *
		 */
	tag () {
		this['ignore-warnings'] = true
		delete this.type
		delete this.uid
		return this
	}
/** overwrite object if exists */
	overwrite () {
		this['set-if-exists'] = 'true'
	}

/** define a host object */
	host (x) {
		if (x['ipv4-address']) {
		this['ipv4-address'] = x['ipv4-address']
		}
		if (x['ipv6-address']) {
		this['ipv6-address'] = x['ipv6-address']
		}
		this['ignore-warnings'] = 'true'
		delete this.type
		delete this.uid
		return this
	}

/** define a network object */
	network (x) {
		if (x['subnet4']) {
		this['subnet4'] = x['subnet4']
		}
		if (x['subnet6']) {
		this['subnet6'] = x['subnet6']
		}
		if (x['mask-length4']) {
		this['mask-length4'] = x['mask-length4']
		}
		if (x['mask-length6']) {
		this['mask-length6'] = x['mask-length6']
		}
		this['ignore-warnings'] = true
		delete this.type
		delete this.uid
		return this
	}
/** create group members array */

	group (x) {
		this.members = [x.members]
		return this
	}

/** collect group members array */
	groupArr (x) {
		this.members = x
		return this
	}

/** create array of tags */
	tagem (x) {
		this.tags = [x.tags]
		return this
	}

/** collect array of tags */
	tagArr (x) {
		this.tags = x
		return this
	}

	['address-range'] (x) {
		if (x['ipv4-address-first']) {
		this['ipv4-address-first'] = x['ipv4-address-first']
		}
		if (x['ipv4-address-last']) {
		this['ipv4-address-last'] = x['ipv4-address-last']
		}
		this['ignore-warnings'] = true
		return this
	}


}
