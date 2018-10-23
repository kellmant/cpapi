// ID:v3.2 091818
// fun/keystore
// called by class/keystore for 
// etcd key transport protocol handling
// constructor should be done through class method
//
const Etcd = require('node-etcd')
const etcdObjectify = require('etcd-result-objectify')


module.exports.read = function (x) {
		const etcd = new Etcd(x.keyhost)
		return new Promise(function(resolve, reject) {
			etcd.get(x.key, x.options, function (err, res) {
			if (err) {
				reject(err)
			} else {
				resolve(res)
			}
		})
	})
}

module.exports.update =  function (x) {
		const etcd = new Etcd(x.keyhost)
		return new Promise(function(resolve, reject) {
			etcd.set(x.key, x.value, x.options, function (err, res) {
			if (err) {
				reject(err)
			} else {
				process.stdout.write('.')
				resolve(res)
			}
		})
	})
}

module.exports.create = function (x) {
		const etcd = new Etcd(x.keyhost)
		return new Promise(function(resolve, reject) {
			etcd.create(x.key, x.value, x.options, function (err, res) {
			if (err) {
				reject(err)
			} else {
				resolve(res)
			}
		})
	})
}


module.exports.destroy = function (x) {
		const etcd = new Etcd(x.keyhost)
		return new Promise(function(resolve, reject) {
			etcd.del(x.key, x.options, function (err, res) {
			if (err) {
				reject(err)
			} else {
				resolve(res)
			}
		})
	})
}

module.exports.mkdir = function (x) {
		const etcd = new Etcd(x.keyhost)
		return new Promise(function(resolve, reject) {
			etcd.mkdir(x.key, x.options, function (err, res) {
			if (err) {
				reject(err)
			} else {
				resolve(res)
			}
		})
	})
}

module.exports.objectify = function (x) {
		const etcd = new Etcd(x.keyhost)
		return new Promise(function(resolve, reject) {
			etcd.get(x.key, { recursive: true }, function (err, res) {
			if (err) {
				reject(err)
			} else {
				const resObj = etcdObjectify(res.node)
				//console.log(typeof resObj)
				resolve(resObj)
			}
		})
	})
}
