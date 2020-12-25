import * as d3 from 'd3'
import { Howl, Howler } from 'howler'

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
    id: 'card-2.1',
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
    card: 'card-3'
  }
]

const cardSequence = null
let currentId = 'intro'
let currentCard = 0
const currentSound = null
const currentSoundTrack = 'null'
let lastAudio = 'null'
const noiseArray = []

currentId = cardNames[currentCard].card

function stopLastAudio() {
  console.log('stop last audio')
  if (noiseArray.length > 0) {
    for (const noise in noiseArray) {
      noiseArray[noise].stop()
    }
  }
}

window.onblur = function () {
  console.log('blurring')
  stopLastAudio()
}

function playSound() {
  console.log('playing sound', cardNames[currentCard].audio)
  const newSound = new Howl({
    src: [cardNames[currentCard].audio],
    volume: 0.8,
    loop: true
  })
  stopLastAudio()
  newSound.play()
  noiseArray.push(newSound)
}

function updateCard(direction) {
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

  console.log(
    'touched:',
    direction,
    '\nCURRENTLY AT CARD::',
    currentCard,
    '\nCURRENTLY AT ID::',
    currentId
  )

  lastAudio = cardNames[currentCard].audio
}

updateCard('none')

d3.select('#touch')
  .selectAll('div')
  .on('click', function () {
    updateCard(d3.select(this).attr('class'))
  })

document.onkeydown = checkKey

function checkKey(e) {
  console.log(e)
  e = e || window.event
  if (e.key === 'ArrowLeft') {
    updateCard('left')
    console.log('arrow left')
  } else if (e.key == 'ArrowRight') {
    console.log('arrow right')
    updateCard('right')
  }
}
