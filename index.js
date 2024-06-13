const express = require('express')
const morgan = require('morgan')
const app = express()

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

let phonebook = [
    { 
      "id": 1,
      "name": "Arto Hellas", 
      "number": "040-123456"
    },
    { 
      "id": 2,
      "name": "Ada Lovelace", 
      "number": "39-44-5323523"
    },
    { 
      "id": 3,
      "name": "Dan Abramov", 
      "number": "12-43-234345"
    },
    { 
      "id": 4,
      "name": "Mary Poppendieck", 
      "number": "39-23-6423122"
    }
]

/*
app.get('/', (request, response) => {
    response.send('<h1>Hello World!</h1>')
})
*/


app.get('/api/persons', (request, response) => {
    response.json(phonebook)
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
    const person = phonebook.find(person => person.id == id)

    if (person){
        response.json(person)
    } else{
        response.send("No such person exists").end()
    }
})

app.delete('/api/persons/:id', (request, response) => {
    //console.log(request.params.id)
    const id = Number(request.params.id);
    phonebook = phonebook.filter(person => person.id !== id)

    response.status(204).end()
})

const generateId = () => {
    return Math.floor(Math.random()*10000);
}

app.post('/api/persons', (request, response) => {
    const newPerson = request.body;
    newPerson.id = generateId();

    if (!newPerson.name || !newPerson.number) {
        return response.status(400).json({
            error: "content missing"})
    } 
    else if (phonebook.find(person => person.name.includes(newPerson.name))){
        return response.status(400).json({
            error: "name must be unique"
        })
    }

    phonebook = phonebook.concat(newPerson)

    response.json(newPerson)
})


const unknownEndpoint = (request, response) => {
    response.status(404).send({ error: 'unknown endpoint' })
  }
  
app.use(unknownEndpoint)

const PORT = 3001;
app.listen(PORT, () => {
    console.log(`Server running on ${PORT}`);
})