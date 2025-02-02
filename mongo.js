const mongoose = require('mongoose')

const inputName = process.argv[3]
const inputNumber = process.argv[4]

const url =
mongoose.set('strictQuery',false)

mongoose.connect(url)

const phonebookSchema = new mongoose.Schema({
  name: String,
  number: String,
})

const PhoneEntry = mongoose.model('Note', phonebookSchema)

const entry = new PhoneEntry({
  name: inputName,
  number: inputNumber,
})


if (process.argv.length>3){
    entry.save().then(result => {
        //console.log('phonebook entry saved!', result)
        console.log("Added:", result.name, "", result.number, "to the phonebook")
        mongoose.connection.close()
    })
}

if (process.argv.length == 3) {
    console.log("Phonebook:")
    PhoneEntry.find({}).then(result => {
        result.forEach(entry => {
          console.log(entry.name, entry.number)
        })
        mongoose.connection.close()
      })
}