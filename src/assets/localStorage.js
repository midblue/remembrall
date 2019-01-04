const storage = require('./storage')

storage.remove('%5B%5D')
console.log(storage.list())

exports.setSet = function(username, newSet) {
  storage.set(`${username}${newSet.id}`, JSON.stringify(newSet))
  return true
}

exports.updateSet = function(username, newSet) {
  storage.set(`${username}${newSet.id}`, JSON.stringify(newSet))
  return true
}

exports.getAllSets = function(username) {
  const allSets = {}
  storage
    .list()
    .filter(key => key.indexOf(username) === 0)
    .forEach(key => (allSets[key] = storage.get(key)))
  console.log(allSets)
  return allSets
}

exports.deleteSet = function(username, setId) {
  return storage.remove(`${username}${setId}`)
}
