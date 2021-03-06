import moment from 'moment'

function periodToDates(period) {
  check(period, String)
  let startDate
  let endDate
  switch (period) {
    default:
      startDate = moment.utc().startOf('month').toDate()
      endDate = moment.utc().endOf('month').toDate()
      break
    case 'currentWeek':
      startDate = moment.utc().startOf('week').toDate()
      endDate = moment.utc().endOf('week').toDate()
      break
    case 'lastMonth':
      startDate = moment.utc().subtract(1, 'month').startOf('month').toDate()
      endDate = moment.utc().subtract(1, 'month').endOf('month').toDate()
      break
    case 'last3months':
      startDate = moment.utc().subtract(3, 'month').startOf('month').toDate()
      endDate = moment.utc().subtract(1, 'month').endOf('month').toDate()
      break
    case 'lastWeek':
      startDate = moment.utc().subtract(1, 'week').startOf('week').toDate()
      endDate = moment.utc().subtract(1, 'week').endOf('week').toDate()
      break
    case 'currentYear':
      startDate = moment.utc().startOf('year').toDate()
      endDate = moment.utc().endOf('year').toDate()
      break
    case 'lastYear':
      startDate = moment.utc().subtract(1, 'year').startOf('year').toDate()
      endDate = moment.utc().subtract(1, 'year').endOf('year').toDate()
      break
    case 'all':
      startDate = moment.utc().subtract(20, 'years').startOf('month').toDate()
      endDate = moment.utc().add(20, 'years').toDate()
      break
  }
  return { startDate, endDate }
}
function timeInUserUnit(time, meteorUser) {
  const precision = meteorUser.profile.precision ? meteorUser.profile.precision : 2
  if (meteorUser.profile.timeunit === 'd') {
    const convertedTime = Number(time / (meteorUser.profile.hoursToDays
      ? meteorUser.profile.hoursToDays : 8)).toFixed(precision)
    return convertedTime !== Number(0).toFixed(precision) ? convertedTime : undefined
  }
  return Number(time).toFixed(precision)
}
export { periodToDates, timeInUserUnit }
