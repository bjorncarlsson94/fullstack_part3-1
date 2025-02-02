require('dotenv').config()
const express = require('express')
const morgan = require('morgan')
const cors = require('cors')

const app = express()
const phoneEntry = require('./models/phoneEntries')


const requestLogger = (request, response, next) => {
    console.log('Method:', request.method)
    console.log('Path:  ', request.path)
    console.log('Body:  ', request.body)
    console.log('---')
    next()
  }

morgan.token('body', req => {
    return JSON.stringify(req.body)
})

app.use(express.json())
app.use(morgan(':method :url :status :response-time ms - :res[content-length] :body'))
app.use(requestLogger)
app.use(cors())
app.use(express.static('dist'))

let phonebook = []

app.get('/', (request, response) => {
    response.send(`<div>
        <h1>The best phonebook app ever</h1>
        <p>Type /api/persons in the url field to go to the phonebook</p>
        </div>`
    )
})

app.get('/api/persons', (request, response) => {
    phoneEntry.find({}).then(entry => {
        response.json(entry)
    })
})

app.get('/info', (request, response) => {
    const getNumber = () => {
        return phonebook.length
    }
    const currentDate = Date(Date.now())
    currentDate.toString()
    const output =  `<div> 
        <div>Phonebook has info for ${getNumber()} people
        </div>
        <br/>
        <div>${currentDate}</div>
        </div>`
    response.send(output)
})

app.get('/api/persons/:id', (request, response) => {
    //console.log(request.params.id)
    const id = request.params.id;
    const person = phoneEntry.findbyId(person => person.id == id)

    if (person){
        response.json(person)
    } else{
        response.send("No such person exists").end()
    }
})

app.delete('/api/persons/:id', (request, response) => {
    console.log("id: ", request.params.id)
    // const id = Number(request.params.id);
    phoneEntry.findById(request.params.id).then(response2 =>
        phoneEntry.findByIdAndDelete(response2._id))
    response.status(204).end()
})


app.post('/api/persons', (request, response) => {
    const newPerson = request.body;

    if (!newPerson.name || !newPerson.number) {
        return response.status(400).json({
            error: "content missing"})
    } 
    const entry = new phoneEntry({
        name: newPerson.name,
        number: newPerson.number
    })
    entry.save().then(savedPerson => {
        response.json(savedPerson)
    })

})


const unknownEndpoint = (request, response) => {
    response.status(404).send({ error: 'unknown endpoint' })
  }
  
app.use(unknownEndpoint)

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`Server running on ${PORT}`);
})