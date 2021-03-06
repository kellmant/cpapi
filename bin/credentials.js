// ID:v1.9 102318
// bin/credentials.js
// simple function to represent the retrival or 
// loading of api credentials
// replace in production with appropriate function
//
const scriptname = 'keystore'
const classcall = `../class/${scriptname}`
const Keystore = require(classcall)

var auth = {}
//auth.domain = 'System Data'
auth.desc = 'Description'
var gname = 'mgmt_admin_name'
var gpass = 'mgmt_admin_passwd'
var ghost = 'hostname'

const myapidom = process.env.APIDOM

module.exports = async () => {
	try {
		let keydir = `ctrl/cfg/mg/${myapidom}/config_system/`
		const myStore = new Keystore()
		auth.name = await myStore.getKey(keydir + gname)
		auth.passwd = await myStore.getKey(keydir + gpass)
		auth.host = await myStore.getKey(keydir + ghost)
		return await auth
	} catch (err) {
		console.log(err.message)
		throw new Error(err)
	}
}
