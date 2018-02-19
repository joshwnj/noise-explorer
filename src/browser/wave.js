// source: https://webaudiotech.com/sites/limiter_comparison/oscilloscope.js

const MINVAL = 1234;	// height/2 == zero.	MINVAL is the "minimum detected signal" level.

function findFirstPositiveZeroCrossing(buf, buflen, height) {
	var i = 0;
	var last_zero = -1;
	var t;

	// advance until we're zero or negative
	while (i<buflen && (buf[i] > height/2 ) )
		i++;

	if (i>=buflen)
		return 0;

	// advance until we're above MINVAL, keeping track of last zero.
	while (i<buflen && ((t=buf[i]) < MINVAL )) {
		if (t >= height/2) {
			if (last_zero == -1)
				last_zero = i;
		} else
			last_zero = -1;
		i++;
	}

	// we may have jumped over MINVAL in one sample.
	if (last_zero == -1)
		last_zero = i;

	if (i==buflen)	// We didn't find any positive zero crossings
		return 0;

	// The first sample might be a zero.	If so, return it.
	if (last_zero == 0)
		return 0;

	return last_zero;
}

function createNode (ac) {
  const node = ac.createAnalyser()
  node.fftSize = 2048
  return node
}

function createRenderFunc (node, canvas) {
  const data = new Uint8Array(canvas.width)
  const context = canvas.getContext('2d')

  return function () {
    const { width, height } = canvas

	  node.getByteTimeDomainData(data);
//console.log(data)
    // context.fillStyle = 'hsla(260, 80%, 20%, 0.3)'
    // context.fillRect(0, 0, width, height)

    // shift everything 1 px to the left
    const prev = context.getImageData(1, 0, width - 1, height)
    context.putImageData(prev, 0, 0)

    context.lineWidth = 1
    context.strokeStyle = 'rgba(255, 255, 255, 0.1)'

    // draw the mid line
    context.beginPath();
	  context.moveTo(0,height/2);
	  context.lineTo(width,height/2);
	  context.stroke();

    var len = data.length
    var sum = 0
    var max = 0
    for (var i=0; i<len; i++) {
      sum += data[i]

      var abs = Math.abs(128 - data[i])
      if (abs > max) { max = abs }
    }

    const avg = sum / len
    const mid = height / 2
    const avgRatio = (128 - avg) / 128
    const size = avgRatio * mid

    const maxRatio = max / 128
    const maxSize = maxRatio * mid

    context.fillStyle = `hsl(260, 80%, 20%)`
    context.fillRect(width - 1, 0, 1, height)

    context.fillStyle = `hsla(90, 100%, 80%, .3)`
    context.fillRect(width - 2, mid - maxSize, 1, (maxSize * 2))

    context.fillStyle = `hsl(150, 100%, 80%)`
    context.fillRect(width - 2, mid - size, 1, (size * 2))
  }
}

module.exports = {
  createNode,
  createRenderFunc
}
