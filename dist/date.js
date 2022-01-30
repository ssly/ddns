function getTimeString() {
  const date = new Date()
  return `${date.toLocaleDateString()} ${date.toLocaleTimeString()}`
}

module.exports = {
  getTimeString,
}