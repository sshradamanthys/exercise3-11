const express = require('express')
const morgan = require('morgan')
const cors = require('cors')
let persons = require('./db.json')
const app = express()

app.use(express.json())
app.use(express.static('dist'))
app.use(cors())

morgan.token('body', (req) => JSON.stringify(req.body))
app.use(
  morgan(':method :url :status :res[content-length] - :response-time ms :body')
)

const len = persons.length
const now = new Date()
const html = `
    <div>
        <h1>Phonebook has info for ${len} peoples</h1>
        <h2>${now}</h2>
    </div>
`
app.get('/', (_, res) => res.send('<a href="/api/persons">go to API</a>'))
app.get('/info', (_, res) => res.send(html))
app.get('/api/persons', (_, res) => res.json(persons))
app.get('/api/persons/:id', (req, res) => {
  const id = Number(req.params.id)
  if (isNaN(id)) return res.json({ error: 'ID should be a number' })

  const person = persons.filter((p) => p.id === id)

  if (person.length === 0) return res.status(404).end()
  return res.json(person)
})

app.delete('/api/persons/:id', (req, res) => {
  const id = Number(req.params.id)
  if (isNaN(id)) return res.status(400).end()

  if (!persons.some((p) => p.id === id)) return res.status(404).end()

  persons = persons.filter((p) => p.id !== id)

  return res.status(204).end()
})

app.post('/api/persons', (req, res) => {
  if (!req.body) return res.status(400).end()

  const { name, number } = req.body

  if (!name || !number)
    return res.json({ error: 'The name or number is missing' })

  if (persons.some((p) => p.name === name))
    return res.json({ error: 'The name already exists in the phonebook' })

  const ids = persons.map((p) => p.id)
  const id = Math.max(...ids) + 1

  const newPerson = {
    id,
    name,
    number
  }

  persons = [...persons, newPerson]

  res.json(persons)
})

const PORT = process.env.PORT || 3001
app.listen(PORT, () => console.log(`Server running on port: ${PORT}`))
