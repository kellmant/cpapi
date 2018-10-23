"use strict";
//
// ID: v2.0 102218
// class/auth.js
// return check point api
// authentication token
// Class Constructor
// ES6 style
//
// this is your class method for constructing objects
// be sure to export it, as well as call the functions it needs 
// to return your values to the object
// will call the script of the same name in fun/
//
// Get token authorization for check point api
// that users the auth class method to process 
// credentials in json form:
// auth.name username of api account
// auth.password authentication credential
// auth.host host name or ip of API host
// auth.domain security domain for api to access
// auth.desc api session description (from enviroment)
//
const now = new Date();
const path = require('path');
const scriptname = path.basename(__filename);
const pathname = __filename
const myApi = require('../fun/cpapi')
const myUser = process.env.HOME
const myEnv = new Date().toString() + ' ' + myUser + ' running ' + scriptname + ' '

module.exports = class Auth {

	constructor () {
		this.tstamp = now.getTime()
	}

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

	timeStamp () {
		return this.tstamp
	}

}
