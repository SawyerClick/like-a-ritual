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

	// no one stays at the top forever | d948c819e0f4dfc69ca1d84bfe1d01393ca3c4e2
	// secret society | e61375ad17705dc265890abdae911eade0a33435
	// Frown | 80e735c8e1c3e951afd64567e29e96c5a3a24c0a
	// murder your memory | 693ffd35a748011ecf51684b118de8f2126f5a4c
	// head in the ceiling fan | bc4b7cc516cf570255256e64c63c5addfca21a0f
	// your pain is mine now |

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
			audio: 'e61375ad17705dc265890abdae911eade0a33435'
		},
		{
			id: 'card-3.0',
			card: 'card-3',
			audio: 'e61375ad17705dc265890abdae911eade0a33435'
		},
		{
			id: 'card-3.1',
			card: 'card-3',
			audio: 'e61375ad17705dc265890abdae911eade0a33435'
		},
		{
			id: 'card-3.2',
			card: 'card-3',
			audio: 'e61375ad17705dc265890abdae911eade0a33435'
		},
		{
			id: 'card-4.0',
			card: 'card-4',
			audio: 'f0eeade594fabb03b37fb57cab7095ae4dae5e56'
		},
		{
			id: 'card-4.1',
			card: 'card-4',
			audio: 'f0eeade594fabb03b37fb57cab7095ae4dae5e56'
		},
		{
			id: 'card-4.2',
			card: 'card-4',
			audio: 'f0eeade594fabb03b37fb57cab7095ae4dae5e56'
		},
		{
			id: 'card-5.1',
			card: 'card-5',
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
			src: [
				'https://p.scdn.co/mp3-preview/' + cardNames[currentCard].audio + '.mp3'
			],
			volume: 0.8,
			loop: true
		})
		stopLastAudio()
		newSound.play()
		noiseArray.push(newSound)
	}

	let margin = { top: 100, right: 25, bottom: 25, left: 25 }
	if (window.innerWidth < 600)
		margin = { top: 50, right: 25, bottom: 25, left: 25 }
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

	d3.selectAll('.album')
		.style('background-color', function (d) {
			return color(d3.select(this).text().trim())
		})
		.attr('class', function (d) {
			if (d3.select(this).select('.albumName').node()) {
				const nameClean = d3
					.select(this)
					.select('.albumName')
					.text()
					.trim()
					.replace(/[^a-z0-9]/gi, '-')
				return `${nameClean} album`
			} else {
				return 'album'
			}
		})

	const albumOrder = [...album]
		.sort((a, b) =>
			d3.ascending(+a.release_date.split('-')[0], +a.release_date.split('-')[0])
		)
		.map((d) => d.name)

	const tracksByDate = [...tracks]
		.sort((a, b) => d3.descending(a.track_number, b.track_number))
		.sort((a, b) =>
			d3.descending(albumOrder.indexOf(a.album), albumOrder.indexOf(b.album))
		)

	const y = d3
		.scaleBand()
		.domain(tracksByDate.map((d) => d.uri))
		.range([height, 0])
		.paddingInner(0.15)

	const track2Column = 'popularity'
	const y2 = d3
		.scaleBand()
		.domain(
			[...tracks]
				.sort((a, b) => d3.ascending(a[track2Column], b[track2Column]))
				.map((d) => d.uri)
		)
		.range([height, 0])
		.paddingInner(0.15)

	const x = d3.scaleLinear().domain([0, 55]).range([0, width])
	let xAxisTicks = [0, 25, 50]
	const axisOptions = d3
		.axisTop(x)
		.tickValues(xAxisTicks)
		.tickFormat((x, i) => (i === 0 ? x + '% popularity' : x + '%'))
		.tickSize(-height)
		.tickPadding(10)

	const xAxis = (g) =>
		g
			.attr('transform', `translate(0,${0})`)
			.call(axisOptions)
			.attr('class', 'x-axis')

	const axis = tracksVis.append('g').call(xAxis).style('opacity', 0)

	tracksVis
		.select('g.x-axis text:first-of-type')
		.attr('dx', '-4.5px')
		.attr('text-anchor', 'start')

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
				if (!['card-4', 'card-3'].includes(cardNames[currentCard].card)) {
					if (i == idCount) {
						return 1
					} else if (i < idCount) {
						return 0.2
					} else {
						return 0
					}
				} else {
					if (i == idCount) {
						return 1
					} else {
						return 0
					}
				}
			})
			.style('display', (d, i) => {
				if (cardNames[currentCard].card === 'card-4') {
					if (i == idCount) {
						return 'block'
					} else {
						return 'none'
					}
				}
			})
			.style('z-index', (d, i) => (i == idCount ? '2' : '-1'))

		if (currentCard === 5) {
			d3.select('#card-3 .tweetEmbed').style('opacity', 1)
		} else {
			d3.select('#card-3 .tweetEmbed').style('opacity', 0)
		}

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

		function track1() {
			function getAlbumNode(d) {
				const nameClean = d.album.replace(/[^a-z0-9]/gi, '-')
				const thisAlbumNode = d3
					.select(`.album.${nameClean}`)
					.node()
					.getBoundingClientRect()
				return thisAlbumNode
			}

			tracksVis
				.selectAll('rect.track')
				.data(tracks)
				.join('rect')
				.attr('class', 'track')
				.attr('id', (d) => 'id' + d.uri.split(':')[2])
				.attr('opacity', 1)
				.attr('fill', (d) => color(d.album))
				.attr('rx', 6)
				.attr('ry', 6)
				.attr('x', (d) =>
					previousCard === 5 ? getAlbumNode(d).x - margin.left : 0
				)
				.attr('width', (d) =>
					previousCard === 5 ? getAlbumNode(d).width : x(d.popularity)
				)
				.attr('y', (d) =>
					previousCard === 5 ? getAlbumNode(d).y - margin.top : y(d.uri)
				)
				.attr('height', (d) =>
					previousCard === 5 ? getAlbumNode(d).height : y.bandwidth()
				)
				.transition()
				.duration(750)
				.attr('y', (d) => y(d.uri))
				.attr('width', width)
				.attr('x', 0)
				.attr('height', y.bandwidth())

			tracksVis
				.selectAll('text.track')
				.data(tracks)
				.join('text')
				.attr('class', 'track')
				.text((d) => d.name)
				.attr('opacity', previousCard === 5 ? 0 : 1)
				.style('font-size', y.bandwidth())
				.transition()
				.attr('y', (d) => y(d.uri) + y.bandwidth() / 1.75)
				.attr('x', 5)
				.transition()
				.delay((d, i) => (previousCard === 4 ? i * 10 + 1000 : i * 10 + 800))
				.attr('opacity', 1)

			tracksVis.select('.x-axis').transition().style('opacity', 0)
		}

		function track2() {
			if (window.innerWidth < 600) {
				tracksVis
					.selectAll('text.track')
					.transition()
					.duration(250)
					.attr('opacity', 0)
			}

			const xColumn = 'popularity'
			x.domain([0, 55])
			xAxisTicks = [0, 25, 50]
			axisOptions
				.tickValues(xAxisTicks)
				.tickFormat((x, i) => (i === 0 ? x + '% ' + xColumn : x + '%'))

			tracksVis
				.select('g.x-axis')
				.transition()
				.duration(500)
				.delay(previousCard === 6 ? 1000 : 0)
				.call(xAxis)
				.call((g) => g.selectAll('.domain').remove())
				.style('opacity', 1)

			tracksVis
				.selectAll('rect.track')
				.transition()
				.duration(500)
				.attr('y', (d) => y(d.uri))
				// .transition()
				.delay((d) => (previousCard === 6 ? y.domain().indexOf(d.uri) * 15 : 0))
				.attr('width', (d) => x(d[track2Column]))
				.attr('opacity', (d) =>
					[
						'Your Pain Is Mine Now',
						'Head in the Ceiling Fan',
						'Murder Your Memory'
					].includes(d.name)
						? 1
						: 0.5
				)
		}

		function track3() {
			const xColumn = 'energy'
			x.domain([0, 100])
			xAxisTicks = [0, 50, 100]
			axisOptions
				.tickValues(xAxisTicks)
				.tickFormat((x, i) => (i === 0 ? x + '% ' + xColumn : x + '%'))

			tracksVis.select('g.x-axis').transition().duration(500).call(xAxis)

			tracksVis
				.selectAll('rect.track')
				.transition()
				.duration(500)
				.attr('y', (d) => y(d.uri))
				// .transition()
				// .delay((d) => y.domain().indexOf(d.uri) * 15)
				.attr('width', (d) => x(d.features[xColumn] * 100))
		}

		if (cardNames[currentCard].id === 'card-4.0') track1()
		if (cardNames[currentCard].id === 'card-4.1') track2()
		if (cardNames[currentCard].id === 'card-4.2') track3()
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
