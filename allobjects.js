const myCredentials = require('./bin/credentials')
const myAuth = require('./bin/auth')
const pagein = require('./fun/page')
const grabin = require('./fun/grab')
//
const dataobj = {}
dataobj.mycmd = 'show-objects'
dataobj.type = 'object'
const apiget = {}
apiget.pub = 'show-last-published-session'
apiget.pkg = 'show-package'
const dump = require('./fun/writefile')
const myClose = require('./bin/close')
var myobjs = {}

const myapidom = process.env.APIDOM

runtime(myapidom)

async function runtime (x) {
	try {
		let mycred = await myCredentials(x)
		const mytoken = await myAuth(mycred)
		console.dir(await mytoken.uid)
		myobjs = await pagein(mytoken, dataobj.mycmd)
		dump('backup', myobjs)
		//console.log(await typeof myobjs)
		const myend = await myClose(mytoken)
		console.log(await myend)
	} catch (error) {
		console.log(error.response)
		console.log('PROGRAM ERROR')
	} finally {
		console.log('PROGRAM EXIT')
	}
}



