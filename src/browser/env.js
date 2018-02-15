const ZERO = 0.00001
function Env (ac, params) {
  const { 
    startAt, 
    stopAt, 
    attackTime,
    rampDownTime
  } = params

  const attack = this.attack = ac.createGain()
  attack.gain.setValueAtTime(ZERO, startAt)
  attack.gain.linearRampToValueAtTime(1.0, startAt + attackTime)

  const release = this.release = ac.createGain()
  release.gain.setValueAtTime(1.0, stopAt)
  release.gain.exponentialRampToValueAtTime(ZERO, stopAt + rampDownTime)

  attack.connect(release)

  this.startAt = startAt
  this.stopAt = stopAt
  this.attackTime = attackTime
  this.rampDownTime = rampDownTime

  this.input = attack
  this.output = release
}

Env.prototype.setInput = function (node) {
  node.connect(this.input)
  this.input = node
}

Env.prototype.connect = function (target) {
  this.output.connect(target)
}

Env.prototype.disconnect = function () {
  this.attack.disconnect()
  this.release.disconnect()
}

module.exports = Env
