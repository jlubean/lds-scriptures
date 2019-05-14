const express = require('express')
const cors = require('cors')
const path = require('path')
const PORT = process.env.PORT || 5000
const scriptures = require('./lds-scriptures.json')

const app = express();

app.use(cors())

app.use(express.static(path.join(__dirname, 'public')))
  .set('views', path.join(__dirname, 'views'))
  .set('view engine', 'ejs')
  .get('/', (req, res) => res.render('pages/index'))
  .listen(PORT, () => console.log(`Listening on ${ PORT }`))

let scriptureCounts = null

function getCounts() {
  if (!scriptureCounts) {
    const chapterIds = []
    const bookIds = []

    scriptures.verses.forEach(verse => {
      if (!bookIds.includes(verse.boi)) {
        bookIds.push(verse.boi)
      }
      if (!chapterIds.includes(verse.chi)) {
        chapterIds.push(verse.chi)
      }
    })

    scriptureCounts = {
      volumeCount: scriptures.volumes.length,
      bookCount: bookIds.length,
      chapterCount: chapterIds.length,
      verseCount: scriptures.verses.length,
    }
  }
  return scriptureCounts
}


app.get('/api/stats', (req, res) => {
  res.json(getCounts())
})

app.get('/api/random-verse', (req, res) => {
  const { verseCount } = getCounts()
  const verseId = Math.floor(Math.random() * verseCount)
  res.json(scriptures.verses[verseId])
})

app.get('/api/volumes', (req, res) => {
  res.json(scriptures.volumes)
})

app.get('/api/volumes/:volumeId/books', (req, res) => {
  const books = []
  const foundBooks = []
  const volumeId = parseInt(req.params.volumeId, 10)
  let foundVolume = false
  let verse = {}
  let index = 0
  const len = scriptures.verses.length
  while (index < len) {
    verse = scriptures.verses[index]
    if (verse.voi === volumeId) {
      foundVolume = true
      if (!foundBooks.includes(verse.boi)) {
        const book = {
          id: verse.boi,
          title: verse.bot,
          longTitle: verse.bolt,
          shortTitle: verse.bosh,
          url: verse.bou,
        }
        books.push(book)
        foundBooks.push(verse.boi)
      }
    } else if (foundVolume) {
      break
    }
    index += 1
  }
  res.json(books)
})

app.get('/api/volumes/:volumeId/books/:bookId/chapters', (req, res) => {
  const chapters = []
  const foundChapters = []
  const volumeId = parseInt(req.params.volumeId, 10)
  const bookId = parseInt(req.params.bookId, 10)
  let foundBook = false
  let verse = {}
  let index = 0
  const len = scriptures.verses.length
  while (index < len) {
    verse = scriptures.verses[index]
    if (verse.voi === volumeId && verse.boi === bookId) {
      foundBook = true
      if (!foundChapters.includes(verse.chi)) {
        const chapter = {
          id: verse.chi,
          number: verse.chn,
        }
        chapters.push(chapter)
        foundChapters.push(verse.chi)
      }
    } else if (foundBook) {
      break
    }
    index += 1
  }
  res.json(chapters)
})

app.get(
  '/api/volumes/:volumeId/books/:bookId/chapters/:chapterId/verses',
  (req, res) => {
    const verses = []
    const volumeId = parseInt(req.params.volumeId, 10)
    const bookId = parseInt(req.params.bookId, 10)
    const chapterId = parseInt(req.params.chapterId, 10)
    let foundChapter = false
    let record = {}
    let index = 0
    const len = scriptures.verses.length
    while (index < len) {
      record = scriptures.verses[index]
      if (record.voi === volumeId && record.boi === bookId && record.chi === chapterId) {
        foundChapter = true
        const verse = {
          id: record.vei,
          number: record.ven,
          text: record.sct,
        }
        verses.push(verse)
      } else if (foundChapter) {
        break
      }
      index += 1
    }
    res.json(verses)
  }
)
