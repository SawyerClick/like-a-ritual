import * as d3 from 'd3'
import { Howl, Howler } from 'howler'

Promise.all([
	d3.json(require('/data/tracks.json')),
	d3.json(require('/data/albums.json'))
])
	.then(ready)
	.catch((err) => console.log('Failed with', err))

function ready([tracks, album]) {
	console.log(tracks)
	console.log(album)

	const cardNames = [
		{
			id: 'card-1.0',
			card: 'card-1',
			audio: 'none'
		},
		{
			id: 'card-1.1',
			card: 'card-1',
			audio: 'none'
		},
		{
			id: 'card-2.0',
			card: 'card-2',
			audio:
				'https://p.scdn.co/mp3-preview/94c4f8a738c0a901b587ac9e47b2b55946fb2047.mp3'
		},
		{
			id: 'card-3.0',
			card: 'card-3',
			audio: 'none'
		},
		{
			id: 'card-3.1',
			card: 'card-3',
			audio: 'none'
		},
		{
			id: 'card-4.0',
			card: 'card-4',
			audio: 'none'
		},
		{
			id: 'card-4.1',
			card: 'card-4',
			audio: 'none'
		}
	]

	const cardSequence = null
	let currentId = 'intro'
	let currentCard = 0
	let previousCard = 0
	const currentSound = null
	const currentSoundTrack = 'null'
	let lastAudio = 'null'
	const noiseArray = []

	currentId = cardNames[currentCard].card

	function stopLastAudio() {
		// console.log('stop last audio')
		if (noiseArray.length > 0) {
			for (const noise in noiseArray) {
				noiseArray[noise].stop()
			}
		}
	}

	window.onblur = function () {
		// console.log('blurring')
		stopLastAudio()
	}

	function playSound() {
		// console.log('playing sound', cardNames[currentCard].audio)
		const newSound = new Howl({
			src: [cardNames[currentCard].audio],
			volume: 0.8,
			loop: true
		})
		stopLastAudio()
		newSound.play()
		noiseArray.push(newSound)
	}

	const margin = { top: 25, right: 25, bottom: 25, left: 25 }
	const svgContainer = d3.select('#scatterTracks').node()
	const svgWidth = svgContainer.offsetWidth
	const svgHeight = svgContainer.offsetHeight
	const width = svgWidth - margin.right - margin.left
	const height = svgHeight - margin.top - margin.bottom
	const tracksVis = d3
		.select('#scatterTracks svg')
		.attr('width', svgWidth)
		.attr('height', svgHeight)
		.append('g')
		.attr('transform', 'translate(' + margin.left + ',' + margin.top + ')')

	function updateCard(direction) {
		previousCard = currentCard
		if (direction === 'right') {
			currentCard++
		} else if (direction === 'left') {
			currentCard = Math.max(0, currentCard - 1)
		}

		if (currentCard === 0) {
			d3.select('#touch .left').style('width', '0%')
			d3.select('#touch .right').style('width', '100%')
		} else if (currentCard === cardNames.length - 1) {
			d3.select('#touch .right').style('width', '0%')
			d3.select('#touch .left').style('width', '100%')
		} else {
			if (window.innerWidth < 450) {
				d3.selectAll('#touch div').style('width', '50%')
			} else {
				d3.select('#touch .left').style('width', '32%')
				d3.select('#touch .right').style('width', '68%')
			}
		}

		const id = cardNames[currentCard].id
		const idCount = +id.split('.')[1]
		currentId = cardNames[currentCard].card
		if (currentCard !== 0) {
			if (
				cardNames[currentCard].audio == 'none' ||
				lastAudio != cardNames[currentCard].audio
			) {
				stopLastAudio()
			}
			if (
				cardNames[currentCard].audio != 'none' &&
				lastAudio != cardNames[currentCard].audio
			) {
				playSound()
			}
		}

		d3.selectAll('.card').classed(
			'visible',
			(d, i, nodes) => d3.select(nodes[i]).attr('id') === currentId
		)

		d3.select(`#${currentId}`)
			.selectAll('.part')
			.style('opacity', (d, i) => {
				if (i == idCount) {
					return 1
				} else if (i < idCount) {
					return 0.3
				} else {
					return 0
				}
			})
			.style('z-index', (d, i) => (i == idCount ? '2' : '-1'))

		console.log(
			'touched:',
			direction,
			'\nCURRENTLY AT CARD::',
			currentCard,
			'\nCURRENTLY AT ID::',
			currentId,
			'\nPREVIOUS CARD:: ',
			previousCard
		)

		lastAudio = cardNames[currentCard].audio

		const color = d3
			.scaleOrdinal()
			.domain([
				'Hyperview',
				'Floral Green',
				'Shed',
				'The Last Thing You Forget',
				'Spring Songs',
				'Face Ghost',
				"Flood of '72"
			])
			.range([
				'hsla(27, 22%, 82%, 1)',
				'hsla(168, 30%, 55%, 1)',
				'hsla(224, 90%, 70%, 1)',
				'hsla(270, 30%, 70%, 1)',
				'hsla(201, 50%, 75%, 1)',
				'hsla(0, 45%, 60%, 1)',
				'hsla(210, 15%, 60%, 1)'
			])

		d3.selectAll('.album').style('background-color', function (d) {
			return color(d3.select(this).text().trim())
		})

		function track1() {
			const yColumn = 'danceability'
			const xColumn = 'valence'
			const albumOrder = [...album]
				.sort((a, b) =>
					d3.ascending(
						+a.release_date.split('-')[0],
						+a.release_date.split('-')[0]
					)
				)
				.map((d) => d.name)

			const tracksByDate = [...tracks]
				.sort((a, b) => d3.descending(a.track_number, b.track_number))
				.sort((a, b) =>
					d3.descending(
						albumOrder.indexOf(a.album),
						albumOrder.indexOf(b.album)
					)
				)

			const y = d3
				.scaleBand()
				.domain(tracksByDate.map((d) => d.uri))
				.range([height, 0])
				.paddingInner(0.15)

			tracksVis
				.selectAll('rect.track')
				.data(tracks)
				.join('rect')
				.attr('class', 'track')
				.attr('id', (d) => 'id' + d.uri.split(':')[2])
				.attr('fill', (d) => color(d.album))
				.attr('rx', 6)
				.attr('ry', 6)
				.attr('x', 0)
				.attr('height', (d) => y.bandwidth())
				.transition()
				.duration(500)
				.attr('y', (d) => y(d.uri))
				.attr('width', width)

			tracksVis
				.selectAll('text.track')
				.data(tracks)
				.join('text')
				.attr('class', 'track')
				.text((d) => d.name)
				.attr('opacity', 0)
				.style('font-size', y.bandwidth())
				.transition()
				.duration(500)
				.attr('y', (d) => y(d.uri) + y.bandwidth() / 1.75)
				.attr('x', 5)
				.transition()
				.delay((d, i) => i * 15)
				.attr('opacity', 1)
		}

		function track2() {
			const yColumn = 'energy'
			const xColumn = 'valence'
			const x = d3
				.scaleLinear()
				.domain(d3.extent(tracks, (d) => d.features[yColumn]))
				.range([0, width])

			const y = d3
				.scaleBand()
				.domain(
					[...tracks]
						.sort((a, b) =>
							d3.ascending(a.features[yColumn], b.features[yColumn])
						)
						.map((d) => d.uri)
				)
				.range([height, 0])
				.paddingInner(0.15)

			tracksVis
				.selectAll('text.track')
				.transition()
				.duration(250)
				.attr('opacity', 0)

			tracksVis
				.selectAll('rect.track')
				.transition()
				.duration(500)
				.attr('y', (d) => y(d.uri))
				.transition()
				.delay((d) => y.domain().indexOf(d.uri) * 15)
				.attr('width', (d) => x(d.features[yColumn]))
		}

		if (cardNames[currentCard].id === 'card-4.0') track1()
		if (cardNames[currentCard].id === 'card-4.1') track2()
	}

	updateCard('none')

	d3.select('#touch')
		.selectAll('div')
		.on('click', function () {
			updateCard(d3.select(this).attr('class'))
		})

	document.onkeydown = checkKey
	function checkKey(e) {
		e = e || window.event
		if (e.key === 'ArrowLeft') {
			if (currentCard > -1) updateCard('left')
		} else if (e.key == 'ArrowRight') {
			if (currentCard < cardNames.length - 1) updateCard('right')
		}
	}
}
