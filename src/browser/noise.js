const hp = require('hot-pockets')
const setParams = require('./setParams')
const connectAll = require('./connectAll')
const rand = require('./rand')

module.exports = function ({ ac, dest, beats, tuna }) {
  let schedule

  const chorus = new tuna.Chorus({

  })

  const filter = setParams(ac.createBiquadFilter(), {
    type: 'lowpass',
    frequency: 1000,
    gain: 10
  })

  const phaser = new tuna.Phaser({
    rate: 1.2,                     //0.01 to 8 is a decent range, but higher values are possible
    depth: 0.3,                    //0 to 1
    feedback: 0.2,                 //0 to 1+
    stereoPhase: 30,               //0 to 180
    baseModulationFrequency: 700,  //500 to 1500
    bypass: 0
  });

  const pingPongDelay = new tuna.PingPongDelay();

  const convolver = new tuna.Convolver({
    highCut: 22050,                         //20 to 22050
    lowCut: 20,                             //20 to 22050
    dryLevel: 0,                            //0 to 1+
    wetLevel: 1.5,                            //0 to 1+
    level: 1,                               //0 to 1+, adjusts total output of both wet and dry
    impulse: "impulses/ir_rev_short.wav",    //the path to your impulse response
    bypass: 0
  })

  const volume = setParams(ac.createGain(), {
    gain: 0.0
  })

  const limiter = setParams(ac.createDynamicsCompressor(), {
    threshold: -70.0,
    knee: 0.0,
    ratio: 10,
    attack: 0.005,
    release: 0.050
  })

  const inputNode = connectAll(
    chorus,
    filter,
    phaser,
    convolver,
    pingPongDelay,
    limiter,
    volume,
    dest
  )

  const noiseBuffer = createNoiseBuffer(ac)

  function createNoiseBuffer (ac) {
    const len = 4096
    const buffer = ac.createBuffer(1, len, ac.sampleRate)
    const data = buffer.getChannelData(0)

    for (var i = 0; i < len; i++) {
      data[i] = Math.random()
    }
    return buffer
  }
  
  function createNoiseSource (ac, params, buffer) {
    const node = ac.createBufferSource()

    const {
      detune = 0
    } = params

    setParams(node, {
      buffer,
      detune,
      loop: true
    })

    return node
  }

  const node = createNoiseSource(ac, {}, noiseBuffer)
  node.start(ac.currentTime)
  node.connect(inputNode)

  volume.gain.setValueAtTime(0.0001, ac.currentTime)
  volume.gain.linearRampToValueAtTime(1.0, ac.currentTime + 3)

  hp(() => {
    // unmount schedule from a previous update
    if (schedule) { beats.clearSchedule(schedule) }

    const {
      bpm,
      secondsPerBeat
    } = beats.info()

    setParams(limiter, {
      threshold: -90.0
    })
    
    setParams(filter, {
      type: 'notch',
      gain: 10
    })
    
    setParams(chorus, {
      rate: 5,
      feedback: .5,
      delay: .1,
      bypass: 0
    })

    setParams(convolver, {
      wetLevel: 0.8,
      dryLevel: 0
    })

    setParams(pingPongDelay, {
      bypass: 0,
      wetLevel: 0.9, //0 to 1
      feedback: 0.7, //0 to 1
      delayTimeLeft: 500, //1 to 10000 (milliseconds)
      delayTimeRight: 700 //1 to 10000 (milliseconds)
    })

    node.playbackRate.value = .2

    const presets = [
      (time) => {
        setParams(chorus, {
          rate: rand.from([1, 5, 20, 50])
        })
      },

      (time) => {
        setParams(chorus, {
          feedback: rand.from([.1, .2, .8])
        })
      },

      (time) => {
        setParams(chorus, {
          delay: rand.from([.1, .2, .8, 1.5, 3])
        })
      },

      (time) => {
        setParams(convolver, {
          wetLevel: rand.from([.1, .2, .8, 1.1])
        })
      },

      (time) => {
        const param = convolver.highCut
        param.cancelScheduledValues(time)
        param.exponentialRampToValueAtTime(rand.from([5000, 8000, 15000, 22000]) , time + (secondsPerBeat * rand.inRange(1, 5)))
      },

      (time) => {
        const param = convolver.lowCut
        param.cancelScheduledValues(time)
        param.exponentialRampToValueAtTime(rand.from([50, 1000, 5000, 8000, 15000]) , time + (secondsPerBeat * rand.inRange(1, 5)))
      },

      (time) => {
        filter.type = rand.from(['notch', 'peaking', 'lowpass', 'bandpass', 'lowshelf'])

        const param = filter.frequency
        param.cancelScheduledValues(time)
        param.exponentialRampToValueAtTime(rand.from([100, 3000, 7000, 15000]) , time + (secondsPerBeat * rand.inRange(1, 5)))
      },

      (time) => {
        const param = node.playbackRate
        param.cancelScheduledValues(time)
        param.exponentialRampToValueAtTime(rand.from([.1, .2, .8, 1.5, 3]) , time + (secondsPerBeat * rand.inRange(1, 5)))
      },

      (time) => {
        setParams(pingPongDelay, {
          delayTimeLeft: rand.from([ 300, 500, 2200, 3500 ]),
          delayTimeRight: rand.from([ 300, 500, 2200, 3500 ])
        })
      }
    ]

    let beatsUntilChange = 0
    schedule = beats.schedule((beat, time) => {
      if (beatsUntilChange === 0) {
        rand.from(presets)(time)
        beatsUntilChange = rand.from([ 1, 2, 3 ]) * 3
      } else {
        beatsUntilChange --
      }
    })
  })
}
