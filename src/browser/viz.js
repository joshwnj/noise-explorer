const hp = require('hot-pockets')
const sonogram = require('./sonogram')
const scope = require('./scope')
const wave = require('./wave')
const oscScope = require('./osc-scope')

function setup (ac) {
  const sonogramNode = sonogram.createNode(ac)
  const sonogramCanvas = document.createElement('canvas')
  sonogramCanvas.style = 'width: 50vw; height: 50vh; background-color: hsl(150, 100%, 80%);'
  document.body.appendChild(sonogramCanvas)

  // ----

  const scopeNode = scope.createNode(ac)
  const scopeCanvas = document.createElement('canvas')
  scopeCanvas.style = 'width: 50vw; height: 50vh;'
  document.body.appendChild(scopeCanvas)

  // ----

  const waveNode = wave.createNode(ac)
  const waveCanvas = document.createElement('canvas')
  waveCanvas.style = 'width: 50vw; height: 50vh; background-color: hsl(260, 80%, 20%);'
  document.body.appendChild(waveCanvas)

  // ----

  const oscNode = oscScope.createNode(ac)
  const oscCanvas = document.createElement('canvas')
  oscCanvas.style = 'width: 50vw; height: 50vh;'
  document.body.appendChild(oscCanvas)

  return {
    sonogramNode,
    sonogramCanvas,
    scopeNode,
    scopeCanvas,
    waveNode,
    waveCanvas,
    oscNode,
    oscCanvas
  }
}

setup.connect = function (nodes, input) {
  const {
    sonogramNode,
    scopeNode,
    waveNode,
    oscNode
  } = nodes

  const all = [ 
    sonogramNode,
    scopeNode,
    waveNode,
    oscNode
  ]
  all.forEach(n => input.connect(n))
}

setup.startRenderLoop = function (nodes) {
  const {
    sonogramNode,
    sonogramCanvas,
    scopeNode,
    scopeCanvas,
    waveNode,
    waveCanvas,
    oscNode,
    oscCanvas
  } = nodes

  let animFrameId
  hp(() => {
    if (animFrameId) { cancelAnimationFrame(animFrameId) }
  
    // ----

    const renderSonogram = sonogram.createRenderFunc(sonogramNode, sonogramCanvas)
    const renderScope = scope.createRenderFunc(scopeNode, scopeCanvas)
    const renderWave = wave.createRenderFunc(waveNode, waveCanvas)
    const renderOscScope = oscScope.createRenderFunc(oscNode, oscCanvas)
    
    function render () {
      renderSonogram()
      renderScope()
      renderWave()
      renderOscScope()
      
      animFrameId = requestAnimationFrame(render)
    }
    
    render()
  })
}

module.exports = setup
