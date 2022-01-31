var Split = require('split.js')
//var monaco = require('monaco-editor');

window.addEventListener('DOMContentLoaded', () => {
	Split(['#editor', '#right-part'], {
		sizes: [60, 40],
		gutterSize: 10,
		gutter: (index, direction) => {
			const gutter = document.createElement('div')
			const display = document.createElement('div')
			gutter.className = `gutter gutter-${direction}`
			display.className = `display`
			gutter.append(display)
			return gutter
		}
	})
})

