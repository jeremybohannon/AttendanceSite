const getCurrentMonthDayYear = () => {
  const dateObj = new Date()
  const month = dateObj.getUTCMonth() + 1
  const day = dateObj.getUTCDate()
  const year = dateObj.getUTCFullYear()
  return `${month}/${day}/${year}`
}

module.exports = {
  getCurrentMonthDayYear,
}
