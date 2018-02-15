const hp = require('hot-pockets')
const setParams = require('./setParams')
const connectAll = require('./connectAll')
const beatEmitter = require('beat-emitter')
const Tuna = require('tunajs')
const rand = require('./rand')

const noise = require('./noise')

const ac = new AudioContext()
const tuna = new Tuna(ac)
const beats = beatEmitter(ac)

beats.setBpm(100)
beats.start()

// ----

var limiter = setParams(ac.createDynamicsCompressor(), {
  threshold: 0,
  knee: 0,
  reduction: 20.0,
  ratio: 20,
  attack: 0.005,
  release: 0.050
})

limiter.connect(ac.destination)

const panLeft = new tuna.Panner({
  pan: -.4
})

const panRight = new tuna.Panner({
  pan: .4
})

panLeft.connect(limiter)
panRight.connect(limiter)

// ----

const viz = require('./viz')
const vizNodes = viz(ac)

viz.connect(vizNodes, limiter)
viz.startRenderLoop(vizNodes)

// ----

const mixer = createMixer(ac, limiter, [
  'noise',
  'noise2'
])

mixer.noise.disconnect()
mixer.noise.connect(panLeft)

mixer.noise2.disconnect()
mixer.noise2.connect(panRight)

noise({ 
  ac,
  dest: mixer.noise,
  beats, 
  tuna
})

noise({ 
  ac,
  dest: mixer.noise2,
  beats, 
  tuna
})

hp(() => {
  updateMixer(mixer, {
    noise: 1.0,
    noise2: 1.0
  })
})

function createMixer (ac, dest, names) {
  const nodes = {}
  names.forEach(key => {
    nodes[key] = ac.createGain()
    nodes[key].connect(dest)
  })
  return nodes
}

function updateMixer (nodesByKey, gainsByKey, transitionTime = 1) {
  Object.keys(gainsByKey).forEach(key => {
    const zero = 0.000001
    const time = ac.currentTime
    const param = nodesByKey[key].gain
    const value = gainsByKey[key]

    param.cancelScheduledValues(time)
    param.exponentialRampToValueAtTime(value || zero, time + transitionTime)
  })
}
