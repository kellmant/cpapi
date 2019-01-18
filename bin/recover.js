// bin/recover.js 
// put objects back into manager
// based on json output
//
const myCredentials = require('../bin/credentials')
const myAuth = require('../bin/auth')
const myClose = require('../bin/close')
//
const rebuild = require('../last.json')
const Cpclass = require('../class/cpobj')
const CpApi = require('../class/cpapi')
const setKey = require('../fun/writekey')
var myLog = {}
async function runtime (x) {
	try {
		let mycred = await myCredentials(x)
		const mytoken = await myAuth(mycred)
		myLog.key = '_session/' + mytoken.uid + '/token'
		myLog.value = mytoken
		setKey(myLog)
		let netops = rebuild.network.objects
		Object.keys(netops).forEach(function(key) {
			const Cpobj = new Cpclass(netops[key])
			let mynet = Cpobj.network(netops[key])
			if (mynet.subnet4) {
			const myPost = new CpApi(mytoken)
			myPost.setData(mynet)
			myPost.setCmd('add-network')
			let myres = myPost.apiPost()
			myLog.key = '_session/' + mytoken.uid + '/' + mynet.name
			myLog.value = JSON.stringify(myres)
				setKey(myLog)
			}
		});
		const myPub = new CpApi(mytoken)
		myPub.rmData()
		myPub.setCmd('publish')
		let myrespub = myPub.apiPost()
		myLog.key = '_session/' + mytoken.uid + '/publish'
		myLog.value = JSON.stringify(myrespub)
		setKey(myLog)
		let hostops = rebuild.host.objects
		Object.keys(hostops).forEach(function(key) {
			const Cphostobj = new Cpclass(hostops[key])
			let myhost = Cphostobj.host(hostops[key])
			if (myhost['ipv4-address']) {
			const myPost = new CpApi(mytoken)
			myPost.setData(myhost)
			myPost.setCmd('add-host')
			let myres = myPost.apiPost()
			myLog.key = '_session/' + mytoken.uid + '/' + mynet.name
			myLog.value = JSON.stringify(myres)
			setKey(myLog)
			}
		});
		console.log(await 'last publish')
		myPub.rmData()
		myPub.setCmd('publish')
		myrespub = await myPub.apiPost()
		myLog.key = '_session/' + mytoken.uid + '/publish'
		myLog.value = myrespub
		setKey(myLog)
		await console.dir('Closing Session ')
		const myend = await myClose(mytoken)
		myLog.key = '_session/' + mytoken.uid + '/token'
		myLog.value = JSON.stringify(myend)
		setKey(myLog)
		console.log(await myend)
	} catch (error) {
		console.log(error.response.data)
		console.log('PROGRAM ERROR')
	} finally {
		console.log('PROGRAM EXIT')
	}
}


runtime('opb')

