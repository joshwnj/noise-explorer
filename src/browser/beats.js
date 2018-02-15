//@hp:pure
const beatEmitter = require('beat-emitter')

module.exports = function (ac) {
  const beats = beatEmitter(ac)
  
  const bpm = 110
  beats.setBpm(bpm)
  beats.start()
  return beats
}
