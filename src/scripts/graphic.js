import * as d3 from 'd3'
import { Howl, Howler } from 'howler'

Promise.all([
	d3.json(require('/data/tracks.json')),
	d3.json(require('/data/albums.json')),
	d3.json(require('/data/cardnames.json'))
])
	.then(ready)
	.catch((err) => console.log('Failed with', err))

function ready([tracks, album, cardNames]) {
	console.log(tracks)
	console.log(album)

	// no one stays at the top forever | d948c819e0f4dfc69ca1d84bfe1d01393ca3c4e2
	// secret society | e61375ad17705dc265890abdae911eade0a33435
	// Frown | 80e735c8e1c3e951afd64567e29e96c5a3a24c0a
	// murder your memory | 693ffd35a748011ecf51684b118de8f2126f5a4c
	// head in the ceiling fan | bc4b7cc516cf570255256e64c63c5addfca21a0f
	// your pain is mine now |

	const cardSequence = null
	let currentId = 'intro'
	let currentCard = 0
	let previousCard = 0
	const currentSound = null
	const currentSoundTrack = 'null'
	let lastAudio = 'null'
	const noiseArray = []
	let axis = null

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
	let thisAlbum
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

	const contourVis = d3
		.select('#contourTracks svg')
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

	//  setting up contour
	const xContourColumn = 'tempo'
	const yContourColumn = 'liveness'
	const colors = [
		'#e5dfcb',
		'#c8c1a3',
		'#a7a38a',
		'#828680',
		'#5d6b78',
		'#3d5066',
		'#26364a',
		'#161e29'
	]
	const linearColorScale = d3
		.scaleLinear()
		.domain(d3.range(0, 1, 1 / colors.length))
		.range(colors.reverse())
		.interpolate(d3.interpolateLab)
	const yContour = d3.scaleLinear().domain([0, 1]).range([height, 0])
	const xContour = d3
		.scaleLinear()
		.domain(d3.extent(tracks, (d) => d.features[xContourColumn]))
		.range([0, width])
	const contour = d3
		.contourDensity()
		.x((d) => xContour(d.features[xContourColumn]))
		.y((d) => yContour(d.features[yContourColumn]))
		.size([width, height])

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
		.paddingInner(0.1)

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

		const thisCard = d3.select('#' + currentId)
		const thisNowPlaying = thisCard.select('.nowPlaying')
		let nowPlayingText = null
		if (cardNames[currentCard].nowPlaying)
			nowPlayingText = cardNames[currentCard].nowPlaying

		if (nowPlayingText) {
			if (thisNowPlaying.node()) {
				thisCard.select('.nowPlaying').text(`🎶 ${nowPlayingText} 🎶`)
			} else {
				thisCard
					.append('p')
					.attr('class', 'nowPlaying')
					.text(`🎶 ${nowPlayingText} 🎶`)
			}
		} else {
			if (thisNowPlaying.node()) {
				thisNowPlaying.remove()
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
				.style('fill', (d) => color(d.album))
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
				.duration(150)
				.delay((d, i) => (previousCard === 5 ? i * 15 + 500 : i * 15 + 800))
				.attr('opacity', 1)

			if (axis === null) {
				axis = tracksVis.append('g').call(xAxis).style('opacity', 0)

				tracksVis
					.select('g.x-axis text:first-of-type')
					.attr('dx', '-4.5px')
					.attr('text-anchor', 'start')
			}
			axis.style('opacity', 0)
		}

		function track2() {
			if (window.innerWidth < 600)
				d3.selectAll('text').transition().duration(250).attr('opacity', 0)

			const xColumn = 'popularity'
			x.domain([0, 55])
			xAxisTicks = [0, 25, 50]
			axisOptions
				.tickValues(xAxisTicks)
				.tickFormat((x, i) => (i === 0 ? x + '% ' + xColumn : x + '%'))

			axis
				.transition()
				.duration(500)
				.delay(previousCard === 5 ? 200 : 0)
				.call(xAxis)
				.call((g) => g.selectAll('.domain').remove())
				.style('opacity', 1)

			tracksVis
				.selectAll('rect.track')
				.transition()
				.duration(500)
				.attr('y', (d) => y(d.uri))
				.attr('width', (d) => x(d[track2Column]))
				.style('fill', (d) =>
					[
						'Your Pain Is Mine Now',
						'Head in the Ceiling Fan',
						'Murder Your Memory'
					].includes(d.name)
						? color(d.album)
						: d3.rgb(color(d.album)).darker(1.5).toString()
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
				.attr('width', (d) => x(d.features[xColumn] * 100))
				.style('fill', (d) =>
					[
						'Your Pain Is Mine Now',
						'Head in the Ceiling Fan',
						'Murder Your Memory'
					].includes(d.name)
						? color(d.album)
						: d3.rgb(color(d.album)).darker(1.5).toString()
				)
		}

		function track4() {
			const xColumn = 'valence'
			x.domain([0, 80])
			xAxisTicks = [0, 40, 80]
			axisOptions
				.tickValues(xAxisTicks)
				.tickFormat((x, i) => (i === 0 ? x + '% ' + xColumn : x + '%'))

			if (previousCard === 8) {
				tracksVis.select('g.x-axis').transition().duration(500).call(xAxis)
			} else {
				tracksVis.select('g.x-axis').attr('opacity', 0).call(xAxis) // Add the new.
				tracksVis.select('g.x-axis').transition().attr('opacity', 1) // Fade`-in the new.
			}

			tracksVis
				.selectAll('rect.track')
				.transition()
				.duration(500)
				.attr('y', (d) => y(d.uri))
				.attr('width', (d) => x(d.features[xColumn] * 100))
				.style('fill', (d) => color(d.album))

			// const valenceAverages = d3.rollup(
			// 	tracks.filter((d) => !['Face Ghost', "Flood of '72"].includes(d.album)),
			// 	(v) => d3.mean(v.map((e) => e.features[xColumn])) * 100,
			// 	(d) => d.album
			// )

			// const grouped = d3.group(
			// 	tracks.filter((d) => !['Face Ghost', "Flood of '72"].includes(d.album)),
			// 	(d) => d.album
			// )

			// console.log(grouped)

			// tracksVis
			// 	.selectAll('line.albumValence')
			// 	.data(grouped)
			// 	.join('line')
			// 	.attr('class', 'albumValence')
			// 	.attr('x1', (d) => x(valenceAverages.get(d[0])))
			// 	.attr('x2', (d) => x(valenceAverages.get(d[0])))
			// 	.attr('y1', (d) => y(d[1][0].uri))
			// 	.attr('y2', (d) => y(d[1][d[1].length - 1].uri) + y.bandwidth())
			// 	.attr('stroke-width', '15px')
			// 	.attr('stroke', (d) => d3.rgb(color(d[0])).brighter(1).toString())
		}
		function track5() {
			thisAlbum = [...tracks].filter((d) => d.album === 'Floral Green')
			const contours = contour(thisAlbum)
			const colorScale = d3
				.scaleOrdinal()
				.domain(contours.map((d) => d.value))
				.range(
					d3.quantize(linearColorScale, contours.map((d) => d.value).length)
				)
			if (previousCard === 9) {
				const contour_g = contourVis
					.append('g')
					.attr('fill', 'none')
					.selectAll('.contour')
					.data(contours)
					.join('g')
				contour_g
					.append('path')
					.attr('class', 'contour')
					.attr('d', d3.geoPath())
					.attr('stroke-width', (d, i) => (i % 5 ? 0.25 : 1))
					.style('stroke', 'black')
					.attr('fill', (d) => colorScale(d.value))
			} else {
				d3.selectAll('.contour').transition().attr('opacity', 0)

				d3.selectAll('.contour')
					.data(contours)
					.attr('opacity', 0)
					.attr('d', d3.geoPath())
					.attr('stroke-width', (d, i) => (i % 5 ? 0.25 : 1))
					.style('stroke', 'black')
					.attr('fill', (d) => colorScale(d.value))
					.transition()
					.attr('opacity', 1)
			}

			// axisOptions
			// 	// .tickValues(xAxisTicks) // xAxisTicks = [0, 50, 100]
			// 	.ticks(2)
			// 	.tickFormat((x, i) => (i === 0 ? x + 'bpm' + xColumn : x + ''))

			// contourVis
			// 	.selectAll('circle.track')
			// 	.data(thisAlbum)
			// 	.join('circle')
			// 	.attr('r', y.bandwidth() / 2)
			// 	.style('fill', 'white')
			// 	.attr('cx', (d) => x5(d.features[xColumn]))
			// 	.attr('cy', (d) => y5(d.features[yColumn]))
		}
		function track6() {
			thisAlbum = [...tracks].filter((d) => d.album === 'Hyperview')
			const contours = contour(thisAlbum)
			const colorScale = d3
				.scaleOrdinal()
				.domain(contours.map((d) => d.value))
				.range(
					d3.quantize(linearColorScale, contours.map((d) => d.value).length)
				)

			d3.selectAll('.contour').transition().attr('opacity', 0)

			d3.selectAll('.contour')
				.data(contours)
				.attr('opacity', 0)
				.attr('d', d3.geoPath())
				.attr('stroke-width', (d, i) => (i % 5 ? 0.25 : 1))
				.style('stroke', 'black')
				.attr('fill', (d) => colorScale(d.value))
				.transition()
				.attr('opacity', 1)
		}

		if (cardNames[currentCard].id === 'card-4.0') track1()
		if (cardNames[currentCard].id === 'card-4.1') track2()
		if (cardNames[currentCard].id === 'card-4.2') track3()
		if (cardNames[currentCard].id === 'card-4.3') track4()
		if (cardNames[currentCard].id === 'card-5.0') track5()
		if (cardNames[currentCard].id === 'card-5.1') track6()
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
		if (e.key === 'ArrowLeft' && currentCard > -1) updateCard('left')
		else if (e.key == 'ArrowRight' && currentCard < cardNames.length - 1)
			updateCard('right')
	}
}
