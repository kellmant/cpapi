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

async function runtime (x) {
	try {
		let mycred = await myCredentials(x)
		const mytoken = await myAuth(mycred)
		let netops = rebuild.network.objects
		Object.keys(netops).forEach(function(key) {
			const Cpobj = new Cpclass(netops[key])
			let mynet = Cpobj.network(netops[key])
			if (mynet.subnet4) {
			const myPost = new CpApi(mytoken)
			myPost.setData(mynet)
			myPost.setCmd('add-network')
			myPost.apiPost()
			}
		});
		const myPub = new CpApi(mytoken)
		myPub.rmData()
		myPub.setCmd('publish')
		await myPub.apiPost()
		let hostops = rebuild.host.objects
		Object.keys(hostops).forEach(function(key) {
			const Cpobj = new Cpclass(hostops[key])
			let myhost = Cpobj.host(hostops[key])
			if (myhost['ipv4-address']) {
			const myPost = new CpAPi(mytoken)
			myPost.setData(myhost)
			myPost.setCmd('add-host')
			myPost.apiPost()
			}
		});
		console.log(await 'last publish')
		myPub.rmData()
		myPub.setCmd('publish')
		await myPub.apiPost()
		await console.dir('Closing Session ')
		let myend = await myClose(mytoken)
		console.log(await myend)
	} catch (error) {
		console.log(error.response.data)
		console.log('PROGRAM ERROR')
	} finally {
		console.log('PROGRAM EXIT')
	}
}


runtime('opb')

