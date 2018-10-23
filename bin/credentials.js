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

module.exports = async (x) => {
	try {
		let keydir = `ctrl/cfg/mg/${x}/config_system/`
		const myStore = new Keystore()
		myStore.setKeyhost('keystore.east1')
		auth.name = await myStore.getKey(keydir + gname)
		auth.passwd = await myStore.getKey(keydir + gpass)
		auth.host = await myStore.getKey(keydir + ghost)
		return await auth
	} catch (err) {
		console.log(err.message)
		throw new Error(err)
	}
}
