"use strict";
/*
 * ID: v2.0 102218
 * class/auth.js
 * return check point api
 * authentication token
 * Class Constructor
 * ES6 style
 *
 * this is your class method for constructing objects
 * be sure to export it, as well as call the functions it needs 
 * to return your values to the object
 * will call the script of the same name in fun/
 *
*/
const now = new Date();
const path = require('path');
const scriptname = path.basename(__filename);
const pathname = __filename
const myApi = require('../fun/cpapi')
const myUser = process.env.HOME
const myEnv = new Date().toString() + ' ' + myUser + ' running ' + scriptname + ' '
/**
 * Check Point API authentication callouts 
 *
 * @constructor 
 * @param {Object} Auth Authentication object handler
 * @param {String} Auth.tstamp timestamp authentication start
 */
module.exports = class Auth {
	constructor () {
		this.tstamp = now.getTime()
	}

/** 
 * setAuth function 
 * build authentication request for the API calls
 * @param {Object} credentials object to authenticate with
 * @param {String} credentials.name username of api account
 * @param {String} credentials.passwd authentication credential
 * @param {String} credentials.host host name or ip of API host
 * @param {String} credentials.domain security domain for api to access
 * @param {String} credentials.desc api session description (from enviroment)
 */
	setAuth (that) {
		this.user = that.name
		this.passwd = that.passwd
		this.host = that.host
		if (that.domain) {
			this.domain = that.domain
		} //else {
		//	this.domain = 'System Data'
		//}
		if (that.desc) {
			this.desc = that.desc
		} else {
			this.desc = myEnv
		}
		return this
	}

/** 
 * getToken function 
 * @param {Object} mypost json object from setAuth
 * @param {Object} mypost.data json data of setAuth for POST
 * @param {String} mypost.data.user json data of setAuth for POST
 * @param {String} mypost.data.password json data of setAuth for POST
 * @param {String} mypost.data.session-description Where would you set session description from?
 * @param {String} mypost.data.session-comment Where would you want comment data from?
 * @param {String} mypost.data.session-name Apply change ID or name from outside system?
 * @param {String} mypost.data.domain json Supply the CMA domain you are accessing
 * @param {String} mypost.method method is always POST
 * @param {String} mypost.url URI of API call with login command
 * @return {Object} mytoken = 
 *{
 * "uid": "3b4a2932-bdb2-49fc-ba44-fc7ff245425a",
 * "sid": "-jpA7hEBro78NJ4T3jazJRTmwSdKAdhp4RaLxkIiu50",
 * "url": "https://<YOUR SERVER>:443/web_api",
 * "session-timeout": 600,
 * "last-login-was-at": {
 *   "posix": 1556536590136,
 *   "iso-8601": "2019-04-29T07:16-0400"
 * },
 * "api-server-version": "1.3"
 *}
 */
	async getToken () {
		var mypost = {}
		var mymethod = 'post'
		var mydata = {
			'user': this.user,
			'password': this.passwd,
			'session-description': this.desc,
			'session-comments': 'PID: ' + process.pid + ' ' + pathname + ' ' + this.tstamp,
			'session-name': myUser + process.pid
		}
		if (this.domain) {
		mydata.domain = this.domain
		}
		var myurl = `https://${this.host}/web_api/`
		var mycmd = 'login'
		mypost.method = mymethod
		mypost.data = mydata
		mypost.baseURL = myurl
		mypost.url = mycmd
		var myres = await myApi(mypost)
		return await myres
	}

/** 
 * closeToken function 
 * @param {Object} mytoken authentication credentials returned 
 * @param {String} mytoken.sid session ID needed for headers
 * @param {String} mytoken.url URI to API host for callout
 */
	async closeToken (that) {
		const mypost = {}
		var mymethod = 'post'
		var mydata = {}
		var myheaders = { 'X-chkp-sid': that.sid }
		var myurl = that.url
		var mycmd = '/logout'
		mypost.method = mymethod
		mypost.data = mydata
		mypost.headers = myheaders
		mypost.baseURL = myurl
		mypost.url = mycmd
		var myres = await myApi(mypost)
		return await myres
	}

	print () {
		console.log(this)
		console.log('\n')
	}

	tieStamp () {
		return this.tstamp
	}

}
