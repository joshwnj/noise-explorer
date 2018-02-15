const hp = require('hot-pockets')
const sonogram = require('./sonogram')
const scope = require('./scope')
const oscScope = require('./osc-scope')

function setup (ac) {
  const sonogramNode = sonogram.createNode(ac)
  const sonogramCanvas = document.createElement('canvas')
  sonogramCanvas.style = 'background-color: hsl(150, 100%, 80%); width: 50vw; height: 50vh;'
  document.body.appendChild(sonogramCanvas)

  // ----

  const scopeNode = scope.createNode(ac)
  const scopeCanvas = document.createElement('canvas')
  scopeCanvas.style = 'width: 50vw; height: 50vh;'
  document.body.appendChild(scopeCanvas)

  // ----

  const oscNode = oscScope.createNode(ac)
  const oscCanvas = document.createElement('canvas')
  oscCanvas.style = 'width: 100vw; height: 50vh;'
  document.body.appendChild(oscCanvas)

  return {
    sonogramNode,
    sonogramCanvas,
    scopeNode,
    scopeCanvas,
    oscNode,
    oscCanvas
  }
}

setup.connect = function (nodes, input) {
  const {
    sonogramNode,
    scopeNode,
    oscNode
  } = nodes

  const all = [ 
    sonogramNode,
    scopeNode,
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
    oscNode,
    oscCanvas
  } = nodes

  let animFrameId
  hp(() => {
    if (animFrameId) { cancelAnimationFrame(animFrameId) }
  
    // ----

    const renderSonogram = sonogram.createRenderFunc(sonogramNode, sonogramCanvas)
    const renderScope = scope.createRenderFunc(scopeNode, scopeCanvas)
    const renderOscScope = oscScope.createRenderFunc(oscNode, oscCanvas)
    
    function render () {
      renderSonogram()
      renderScope()
      renderOscScope()
      
      animFrameId = requestAnimationFrame(render)
    }
    
    render()
  })
}

module.exports = setup
