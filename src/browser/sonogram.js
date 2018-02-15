// credits: https://github.com/urtzurd/html-audio/blob/gh-pages/static/js/pitch-shifter.js

function createNode (ac) {
  const fftSize = 2048
  const smoothing = 0
  const node = ac.createAnalyser()

  node.fftSize = fftSize
  node.smoothingTimeConstant = smoothing

  return node
}

function createRenderFunc (node, canvas) {
  const data = new Uint8Array(node.frequencyBinCount)
  const context = canvas.getContext('2d')

  return function () {
    const { width, height } = canvas

    node.getByteFrequencyData(data)

    // shift everything 1 px to the left
    const prev = context.getImageData(1, 0, width - 1, height)
    context.putImageData(prev, 0, 0)

    const bandHeight = height / data.length
    for (var i = 0, y = height - 1;
         i < data.length;
         i++, y -= bandHeight) {

      var val = data[i]
      context.fillStyle = `hsl(${val + 150}, 100%, ${(val / 255) * 100}%)`
      if (val === 0) {
        context.fillStyle = `hsl(150, 100%, 80%)`
      }
      context.fillRect(width - 1, y, 1, -bandHeight)
    }
  }
}

module.exports = {
  createNode,
  createRenderFunc
}
