"use strict";
/**
 * Process Check Point objects 
 * @constructor 
 * @param {Object} CPobj Check Point JSON representation
 * @param {String} CPobj.name name of object unique
 * @param {String} CPobj.type type of object we can classify on
 * @param {String} CPobj.uid unique ID of object
 * @param {String} [CPobj.comments] comments
 * @param {String} [CPobj.color] color of object
 * @return {Cpobj} The value of the new object
 */
module.exports = class CPobj {
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
		 * dump object properties
		 * @param {Function} Cpobj.dump show object properties
		 * @return {Object} The value of the new object
		 */
	dump (x) {
		if (this.x) {
			return this[x]
		} else {
			return this
		}
	}

		/** 
		 * @param {Function} Cpobj.tag remove object type and uid for post
		 *
		 */
	tag () {
		this['ignore-warnings'] = true
		delete this.type
		delete this.uid
		return this
	}
/** 
 * overwrite object if exists 
 * @param {Boolean} Cpobj.set-if-exists set to true to overwrite object properties 
 */
	overwrite () {
		this['set-if-exists'] = 'true'
	}

/** 
 * define a host object
 * @param {Object} CPobj Check Point JSON representation
 * @param {String} CPobj.ipv4-address IPv4 of object
 * @param {String} CPobj.ipv6-address IPv6 of object
 * @return {Object} The value of the new host object
 *
 */
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

/** 
 * define a network object by network and subnet mask
 * @param {Object} CPobj Check Point JSON representation
 * @param {String} CPobj.subnet4 IPv4 network of object
 * @param {String} CPobj.subnet6 IPv6 network of object
 * @param {String} CPobj.mask-length4 IPv4 netmask of object 
 * @param {String} CPobj.mask-length6 IPv6 netmask of object 
 * @return {Object} The value of the new network object
 */
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
/** 
 * create group members array 
 * @param {Object[]} members create an array field to hold object members
 */
	group (x) {
		this.members = [x.members]
		return this
	}

/** 
 * collect group members array 
 * @param {Object} CPobj Check Point JSON representation
 * @param {Array} CPobj.members add object members to group array
 * @return {Object} The value of the new group object
 *
 */
	groupArr (x) {
		this.members = x
		return this
	}

/** 
 * create array for tag objects
 * @param {Object[]} tags create an array field to hold object tags
 */
	tagem (x) {
		this.tags = [x.tags]
		return this
	}

/** 
 * collect objects in array of tags 
 * @param {Object} CPobj Check Point JSON representation
 * @param {Array} CPobj.tags add object members to tag array
 * @return {Object} The value of the new tag object
 */
	tagArr (x) {
		this.tags = x
		return this
	}

/** 
 * define address range object by first and last IP 
 * @param {Object} CPobj Check Point JSON representation
 * @param {String} CPobj.ipv4-address-first IPv4 start of network of object
 * @param {String} CPobj.ipv4-address-last IPv4 end of network of object
 * @return {Object} The value of the new address range object
 */
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

/** 
 * define all service object properties through one method
 * most parameters should be set by the incoming object
 * with the most common changes to:
 * @param {Object} CPobj Check Point JSON representation
 * @param {Number} CPobj.port port used by service
 * @param {Number} CPobj.source-port source port used by service
 * @param {Number} CPobj.ip-protocol protocol identified by number
 * @param {String} CPobj.protocol protocol name (tcp, udp icmp, etc)
 * @param {Boolean} CPobj.keep-connections-open-after-policy-installation true/false service matching to policy
 * @param {Object} CPobj.aggressive-aging aging properties object
 * @param {Boolean} CPobj.aggressive-aging.enable true/false
 * @param {Boolean} CPobj.aggressive-aging.use-default-timeout true/false
 * @param {Number} CPobj.aggressive-aging.default-timeout Timeout value
 */
	service (x) {
		if (x.port) {
			this.port = x.port
		}
		if (x['source-port']) {
			this['source-port'] = x['source-port']
		}
		if (x['ip-protocol']) {
			this['ip-protocol'] = x['ip-protocol']
		}
		if (x['keep-connections-open-after-policy-installation']) {
			this['keep-connections-open-after-policy-installation'] = x['keep-connections-open-after-policy-installation']
		}
		if (x['aggressive-aging']) {
			this['aggressive-aging'] = x['aggressive-aging']
		}
		if (x['match-by-protocol-signature']) {
			this['match-by-protocol-signature'] = x['match-by-protocol-signature']
		}
		if (x['match-for-any']) {
			this['match-for-any'] = x['match-for-any']
		}
		if (x['override-default-settings']) {
			this['override-default-settings'] = x['override-default-settings']
		}
		if (x.protocol) {
			this.protocol = x.protocol
		}
		if (x['session-timeout']) {
			this['session-timeout'] = x['session-timeout']
		}
		if (x['sync-connections-on-cluster']) {
			this['sync-connections-on-cluster'] = x['sync-connections-on-cluster']
		}
		if (x['use-default-session-timeout']) {
			this['use-default-session-timeout'] = x['use-default-session-timeout'] 
		}
		if (x['interface-uuid']) {
			this['interface-uuid'] = x['interface-uuid']
		}
		if (x['program-number']) {
			this['program-number'] = x['program-number']
		}
		if (x['accept-replies']) {
			this['accept-replies'] = x['accept-replies']
		}
		this['ignore-warnings'] = true
		return this
	}


}
