import * as d3 from 'd3'
import d3Tip from 'd3-tip'
import d3Annotation from 'd3-svg-annotation'
d3.tip = d3Tip
let audio = null

const margin = { top: 30, left: 110, right: 180, bottom: 30 }
const height = 270 - margin.top - margin.bottom
const width = 1100 - margin.left - margin.right

const svg = d3
  .select('#chart1')
  .append('svg')
  .attr('height', height + margin.top + margin.bottom)
  .attr('width', width + margin.left + margin.right)
  .append('g')
  .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')')

// Build your scales here
const xPositionScale = d3
  .scaleLinear()
  .domain([0, 1])
  .range([0, width])
const xPositionScale100 = d3
  .scaleLinear()
  .domain([0, 100])
  .range([0, width])

const keys = ['Valence', 'Danceability', 'Energy', 'Popularity']

const color = d3
  .scaleOrdinal()
  .domain(keys)
  .range(['#dbc269', '#5CDB95', '#C7493A', '#566fa3'])

d3.csv(require('../data/spotify_punk_playlists.csv'))
  .then(ready)
  .catch(function(err) {
    console.log('Failed with', err)
  })

function ready(datapoints) {
  d3.select('i').on('click', d => {
    if (audio) {
      audio.pause()
    }
  })

  const annotations = [
    {
      note: {
        wrap: 140,
        label: 'Green Day and Fall Out Boy are the cool kids, obviously'
      },
      type: d3Annotation.annotationCalloutRect,
      subject: {
        width: 25,
        height: -25
      },
      data: { category: height - 207, song_popularity: 76 },
      dx: 250,
      dy: 0,
      color: ['silver']
    }
  ]

  const makeAnnotations = d3Annotation
    .annotation()
    .accessors({
      x: d => xPositionScale100(d.song_popularity),
      y: d => d.category
    })
    .annotations(annotations)
    .notePadding(10)

  svg.call(makeAnnotations)

  svg
    .selectAll('labels')
    .data(keys)
    .enter()
    .append('text')
    .text(d => d)
    .attr('x', -20)
    .attr('y', function(d, i) {
      return height - 20 - i * 65
    })
    .style('fill', d => color(d))
    .style('text-anchor', 'end')

  // energy
  svg
    .selectAll('circle')
    .data(datapoints)
    .enter()
    .append('circle')
    .attr('cy', height - 155)
    .attr('cx', d => xPositionScale(d.energy))
    .attr('fill', '#C7493A')
    .attr('fill-opacity', 0.5)
    .attr('r', 5)
    .attr('class', d => 'id-' + d.id)

  // popularity
  svg
    .selectAll('svg')
    .data(datapoints)
    .enter()
    .append('circle')
    .attr('cy', height - 220)
    .attr('cx', d => xPositionScale100(d.song_popularity))
    .attr('fill', '#566fa3')
    .attr('fill-opacity', 0.5)
    .attr('r', 5)
    .attr('class', d => 'id-' + d.id)

  // danceability
  svg
    .selectAll('svg')
    .data(datapoints)
    .enter()
    .append('circle')
    .attr('cy', height - 90)
    .attr('cx', d => xPositionScale(d.danceability))
    .attr('fill', '#5CDB95')
    .attr('fill-opacity', 0.5)
    .attr('r', 5)
    .attr('class', d => 'id-' + d.id)

  // valence
  svg
    .selectAll('svg')
    .data(datapoints)
    .enter()
    .append('circle')
    .attr('cy', height - 25)
    .attr('cx', d => xPositionScale(d.valence))
    .attr('fill', '#dbc269')
    .attr('fill-opacity', 0.5)
    .attr('r', 5)
    .attr('class', d => 'id-' + d.id)

  svg
    .selectAll('circle')
    .on('mouseover', function(d) {
      d3.select('.songbox .band')
        .text('')
        .append()
        .text(d.artist_name)
      d3.select('.songbox .song')
        .text('')
        .append()
        .text(d.song_name)
      svg
        .selectAll('.id-' + d.id)
        .transition()
        .duration(0)
        .attr('r', 15)
        .attr('fill-opacity', 0.7)
        .raise()
    })
    .on('mouseout', function() {
      svg
        .selectAll('circle')
        .transition()
        .duration(0)
        .attr('r', 5)
        .attr('fill-opacity', 0.5)
    })
    .on('click', function(d) {
      svg
        .selectAll('circle')
        .attr('r', 5)
        .attr('fill-opacity', 0.5)
      svg
        .selectAll('.id-' + d.id)
        .transition()
        .duration(0)
        .attr('r', 15)
        .attr('fill-opacity', 1)

      if (audio) {
        audio.pause()
      }
      audio = new Audio(d.song_preview)
      return audio.play()
    })

  const xAxis = d3
    .axisBottom(xPositionScale)
    .ticks(5)
    .tickFormat(d3.format('.0%'))
  svg
    .append('g')
    .attr('class', 'axis x-axis axisWhite')
    .attr('transform', 'translate(0,' + height + ')')
    .call(xAxis)
}