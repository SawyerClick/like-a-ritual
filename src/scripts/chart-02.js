import * as d3 from 'd3'
import { graphScroll } from 'graph-scroll'

d3.graphScroll()
  .graph(d3.selectAll('#graph'))
  .container(d3.select('#container'))
  .sections(d3.selectAll('#sections > div'))
  .on('active', function(i) {
    console.log(i + 'th section active')
  })

const margin = { top: 50, right: 50, bottom: 50, left: 150 }
const width = 750 - margin.left - margin.right
const height = 350 - margin.top - margin.bottom

const svg = d3
  .select('#chart2')
  .append('svg')
  .style('margin-left', '12%')
  .style('margin-right', '5%')
  .style('display', 'inline')
  .attr('width', width + margin.left + margin.right)
  .attr('height', height + margin.top + margin.bottom)
  .append('g')
  .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')')

// Build your scales here
const widthScale = d3
  .scaleLinear()
  .domain([0, 24])
  .range([0, width])

const opacityScale = d3
  .scaleLinear()
  .domain([5, 10])
  .range([0.6, 1])

const yPositionScale = d3
  .scaleBand()
  .range([0, height])
  .paddingInner(0.3)

d3.csv('/data/artist_counts.csv')
  .then(ready)
  .catch(function(err) {
    console.log('Failed with', err)
  })

function ready(datapoints) {
  const names = datapoints.map(function(d) {
    return d.artist_name
  })
  yPositionScale.domain(names)

  // console.log(datapoints)

  const genres = datapoints.map(function(d) {
    return d.genres
  })

  graphScroll.eventId('uniqueId1')
  // var genres = Array.from(genres)
  // console.log(genres)
  // colored bars for artists in playlists
  svg
    .selectAll('rect')
    .data(datapoints)
    .enter()
    .append('rect')
    .attr('fill', '#C7493A')
    .attr('fill-opacity', d => opacityScale(d.playlists_in))
    .attr('width', 0)
    .attr('y', d => yPositionScale(d.artist_name))
    .attr('height', yPositionScale.bandwidth())
    // .transition()
    // .duration(1000)
    // .ease(d3.easeQuad)
    .attr('width', d => widthScale(d.playlists_in))
    .on('mouseover', handleMouseOver)
    .on('mouseout', handleMouseOut)

  // Create Event Handlers for mouse
  function handleMouseOver(d, i) {
    // Select the element by class, use .text to set the content
    d3.select('.infobox .genre').text(d.genres)
    d3.select('.infobox').style('visibility', 'visible')
    d3.select(this)
      .transition()
      .duration(50)
      .attr('fill', 'pink')
      .attr('fill-opacity', '1')
  }

  function handleMouseOut(d, i) {
    // Hide the infobox
    d3.select('.infobox').style('visibility', 'hidden')
    // return the mouseover'd element
    // to being smaller and black
    d3.select(this)
      .transition()
      .duration(100)
      .attr('fill', '#C7493A')
  }

  svg
    .selectAll('svg')
    .data(datapoints)
    .enter()
    .append('rect')
    .attr('fill', '#252525')
    .attr('width', d => width - widthScale(d.playlists_in))
    .attr('height', yPositionScale.bandwidth())
    .attr('x', d => widthScale(d.playlists_in))
    .attr('y', d => yPositionScale(d.artist_name))

  // This puts annotations at the end of the chart
  svg
    .selectAll('svg')
    .data(datapoints)
    .enter()
    .append('text')
    .attr('x', 0)
    .attr('y', d => yPositionScale(d.artist_name) + 15)
    .text(d => d.playlists_in)
    .transition()
    .duration(1000)
    .ease(d3.easeQuad)
    .attr('x', d => widthScale(d.playlists_in) + 7)
    .attr('fill', 'lightgray')

  const yAxis = d3.axisLeft(yPositionScale)
  svg
    .append('g')
    .attr('class', 'axis y-axis axisWhite')
    .call(yAxis)
}
