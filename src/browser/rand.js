//@hp:pure

function inRange (min, max) {
  return Math.floor(Math.random() * (max - min)) + min
}

function from (values) {
  return values[inRange(0, values.length)]
}

function percentRange (min, max, percent) {
  const range = max - min
  return min + (percent * range)
}

module.exports = {
  inRange,
  from,
  percentRange
}
