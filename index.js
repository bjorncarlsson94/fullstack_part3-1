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

// app.get('/', (request, response) => {
//     response.send(`<div>
//         <h1>The best phonebook app ever</h1>
//         <p>Type /api/persons in the url field to go to the phonebook</p>
//         </div>`
//     )
// })

app.get('/api/persons', (request, response) => {
    phoneEntry.find({}).then(entry => {
        response.json(entry)
    })
})

app.get('/info', (request, response, next) => {
    const currentDate = Date(Date.now())
    currentDate.toString()

    phoneEntry.countDocuments({})
    .then(count => {
        const output =  `<div> 
        <div>Phonebook has info for ${count} people
        </div>
        <br/>
        <div>${currentDate}</div>
        </div>`
        response.send(output)
    })
    .catch((error) => next(error))
})

app.get('/api/persons/:id', (request, response, next) => {
    phoneEntry.findById(request.params.id)
    .then(person => {
        if (person){
            response.json(person)
        } else{
            response.send("No such person exists").end()
        }
    })
    .catch(error => next(error))
})

app.delete('/api/persons/:id', (request, response, next) => {
    phoneEntry.findById(request.params.id)
    .then(response2 => phoneEntry.findByIdAndDelete(response2._id))
    .then(response.status(204).end())
    .catch(error => next(error))
})
/*
^Strange behaviour where findByIdAndDelete(request.params.id) didn't work as standalone. 
Probably something fishy with how I pass it into the app.delete from the FE.
*/

app.post('/api/persons', (request, response, next) => {
    const newPerson = request.body;

    const entry = new phoneEntry({
        name: newPerson.name,
        number: newPerson.number
    })
    entry.save().then(savedPerson => {
        response.json(savedPerson)
    })
    .catch(error => next(error))
})

app.put('/api/persons/:id', (request, response, next) => {
    const person = request.body
    console.log(person)
    
    const entry = {
        name: person.name,
        number: person.number,
    }
  
    phoneEntry.findByIdAndUpdate(request.params.id, entry, { new: true })
      .then(updatedPerson => {
        response.json(updatedPerson)
      })
      .catch(error => next(error))
})

const unknownEndpoint = (request, response) => {
    response.status(404).send({ error: 'unknown endpoint' })
  }
  
app.use(unknownEndpoint)

const errorHandler = (error, request, response, next) => {
    console.error(error.message)

    if (error.name === 'CastError') {
        return response.status(400).send({error: 'malformatted id'})
    }
    else if (error.name === 'ValidationError') {
        return response.status(400).send({ error: error.message})
    }
    next(error)
}
app.use(errorHandler)

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`Server running on ${PORT}`);
})