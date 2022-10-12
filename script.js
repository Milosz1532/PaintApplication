const canvas = document.querySelector('canvas')
canvas.width = window.innerWidth - 200
canvas.height = 400

const canvasBox = document.querySelector('#canvasBox')

let ctx = canvas.getContext('2d')
ctx.fillStyle = 'white'
ctx.fillRect(0, 0, canvas.width, canvas.height)

let draw_width = '2'
let is_drawing = false
let shape = false
let restore_array = []
let index = -1

let activeColorBtn = document.querySelector('.active.color-pick')
let draw_color = activeColorBtn.style.backgroundColor

const pen_range = document.querySelector('#pen_range')
const color_picker = document.querySelector('#color_picker')
const clearBtn = document.querySelector('#clear')
const undoBtn = document.querySelector('#undo')

const pen = document.querySelector('.pen')
const rectangleBtn = document.querySelector('#rectangleBtn')

const startDrawing = e => {
	is_drawing = true
	ctx.beginPath()
	ctx.moveTo(e.clientX - canvasBox.offsetLeft, e.clientY - canvasBox.offsetTop)
	e.preventDefault()
}

const draw = e => {
	if (is_drawing && shape == false) {
		ctx.lineTo(e.clientX - canvasBox.offsetLeft, e.clientY - canvasBox.offsetTop)
		ctx.strokeStyle = draw_color
		ctx.lineWidth = draw_width
		ctx.lineCap = 'round'
		ctx.lineJoin = 'round'
		ctx.stroke()
	}
	e.preventDefault()
}

const stop = e => {
	if (shape == false) {
		if (is_drawing) {
			ctx.stroke()
			ctx.closePath()
			is_drawing = false
		}
		if (e.type != 'mouseout') {
			restore_array.push(ctx.getImageData(0, 0, canvas.width, canvas.height))
			index += 1
		}
		e.preventDefault()
	}
}

const buttons = document.querySelectorAll('.color-pick')
for (const button of buttons) {
	// Change Color
	button.addEventListener('click', function (e) {
		if (activeColorBtn) {
			activeColorBtn.classList.remove('active')
		}
		activeColorBtn = e.target
		draw_color = e.target.style.backgroundColor
		e.target.classList.add('active')
	})
}
color_picker.addEventListener('input', function (e) {
	// Color Picker
	if (activeColorBtn) {
		activeColorBtn.classList.remove('active')
	}
	activeColorBtn = e.target
	draw_color = e.target.value
	e.target.classList.add('active')
})

const changePenWidth = e => {
	// Change Pen Width
	draw_width = e.target.value
}

const clearCanvas = e => {
	ctx.fillStyle = 'white'
	ctx.clearRect(0, 0, canvas.width, canvas.height)
	ctx.fillRect(0, 0, canvas.width, canvas.height)
	restore_array = []
	index = -1
}

const undo = e => {
	if (index <= 0) {
		clearCanvas()
	} else {
		index -= 1
		restore_array.pop()
		ctx.putImageData(restore_array[index], 0, 0)
	}
}

let draggingMouse = false
let leftMouseDrag, topMouseDrag

const temporary_dimensions = document.querySelector('.temporary_dimensions')

const getMouseType = e => {
	if (e.type == 'mousedown') {
		draggingMouse = true
		leftMouseDrag = e.pageX - canvasBox.offsetLeft
		topMouseDrag = e.pageY - canvasBox.offsetTop
		temporary_dimensions.setAttribute('style', 'top:' + topMouseDrag + 'px;left:' + leftMouseDrag + 'px;')
	} else {
		draggingMouse = false
		ctx.strokeStyle = draw_color
		ctx.rect(
			temporary_dimensions.offsetLeft,
			temporary_dimensions.offsetTop,
			temporary_dimensions.offsetWidth,
			temporary_dimensions.offsetHeight
		)

		ctx.stroke()
		ctx.closePath()
		restore_array.push(ctx.getImageData(0, 0, canvas.width, canvas.height))
		index += 1
		temporary_dimensions.removeAttribute('style')
		e.preventDefault()
	}
}

//	ctx.roundRect(temporary_dimensions.offsetLeft, temporary_dimensions.offsetTop, temporary_dimensions.offsetWidth, temporary_dimensions.offsetHeight, [new DOMPoint(80,80), new DOMPoint(80,80)]);

const checkDimensions = e => {
	if (draggingMouse) {
		let top = e.clientY - topMouseDrag - canvasBox.offsetTop
		let left = e.clientX - leftMouseDrag - canvasBox.offsetLeft

		let width = Math.abs(left)
		let height = Math.abs(top)

		let boxTop, boxLeft

		if (top < 0) {
			boxTop = e.pageY - canvasBox.offsetTop
		} else {
			boxTop = topMouseDrag
		}

		if (left < 0) {
			boxLeft = e.pageX - canvasBox.offsetLeft
		} else {
			boxLeft = leftMouseDrag
		}

		temporary_dimensions.setAttribute(
			'style',
			'width:' + width + 'px;height:' + height + 'px;top:' + boxTop + 'px;left:' + boxLeft + 'px;'
		)
	}
}

const changeMode = e => {
	is_drawing = false
	shape = true
	canvasBox.addEventListener('mousedown', getMouseType, false)
	canvasBox.addEventListener('mouseup', getMouseType, false)
	canvasBox.addEventListener('mousemove', checkDimensions, false)
	pen.classList.remove('active')
	rectangleBtn.classList.add('active')
}

const setDrawMode = e => {
	is_drawing = false
	shape = false
	pen.classList.add('active')
	rectangleBtn.classList.remove('active')
	canvasBox.removeEventListener('mousedown', getMouseType, false)
	canvasBox.removeEventListener('mouseup', getMouseType, false)
	canvasBox.removeEventListener('mousemove', checkDimensions, false)
}

canvas.addEventListener('touchstartDrawing', startDrawing, false)
canvas.addEventListener('touchmove', draw, false)
canvas.addEventListener('mousedown', startDrawing, false)
canvas.addEventListener('mousemove', draw, false)
canvas.addEventListener('touchend', stop, false)
canvas.addEventListener('mouseup', stop, false)
canvas.addEventListener('mouseout', stop, false)
clearBtn.addEventListener('click', clearCanvas, false)
pen_range.addEventListener('input', changePenWidth, false)
undoBtn.addEventListener('click', undo, false)
rectangleBtn.addEventListener('click', changeMode, false)
pen.addEventListener('click', setDrawMode, false)
