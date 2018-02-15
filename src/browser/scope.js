function createNode (ac) {
  const node = ac.createAnalyser()
  node.fftSize = 128
  return node
}

function createRenderFunc (node, canvas) {
  const binCount = node.frequencyBinCount
  const data = new Uint8Array(binCount)
  const context = canvas.getContext('2d')

  return function () {
    const { width, height } = canvas

    node.getByteFrequencyData(data)

    context.fillStyle = 'hsla(180, 30%, 80%, 0.4)'
    context.fillRect(0, 0, width, height)

    context.lineWidth = 2
    context.strokeStyle = 'hsla(250, 80%, 30%, 1.0)'

    context.beginPath()

    const sliceWidth = height * 1.0 / binCount
    var y = height - sliceWidth

    for (var i = 0; i < binCount; i++) {

      const v = data[i] / 255.0
      const x = Math.max(2, width * v)

      context.moveTo(x, y)
      context.lineTo(x, y + sliceWidth)

      y -= sliceWidth
    }

    context.stroke()
  }
}

module.exports = {
  createNode,
  createRenderFunc
}
