const fs = require('fs');
const path = require('path');
const {animals} = require('./data/animals.json');
const express = require('express');
const { type } = require('express/lib/response');
const PORT = process.env.PORT || 3001;
const app = express();
//parse incoming string or array data
app.use(express.urlencoded({ extended: true}));
//parse incoming JSON data 
app.use(express.json());

function filterByQuery(query, animalsArray) {
    //saved animals array as a filtered results
    let filteredResults = animalsArray;
    //saved personality traits as a separate dedicated array
    //if personality traits returns a string stick it into a new array and save it
    let personalityTraitsArray = [];
    if(query.personalityTraits) {
        if(typeof query.personalityTraits === 'string') {
            personalityTraitsArray = [query.personalityTraits];
        } else {
            personalityTraitsArray = query.personalityTraits;
        }
        //loop through each trait in the personality traits array:
        personalityTraitsArray.forEach(trait => {
            //check the trait against each animal in the filteredResults array
            //essentially this is making a copy of the filteredResults array given the foreach
            //but it is updating it for each trait in the .forEach()loop.
            //filteredResults array will only contain the entries that contain the trait that was asked for 
            filteredResults = filteredResults.filter(
                animal => animal.personalityTraits.indexOf(trait) !== -1
            );
        });
    }
    if (query.diet) {
        filteredResults = filteredResults.filter(animal => animal.diet === query.diet);
    }
    if(query.species) {
        filteredResults = filteredResults.filter(animal => animal.species === query.species);
    }
    if(query.name) {
        filteredResults = filteredResults.filter(animal => animal.name === query.name);
    }
    return filteredResults;
}
function findById(id, animalsArray) {
    const result = animalsArray.filter(animal => animal.id === id)[0];
    return result;
}

app.get('/api/animals', (req, res) => {
    let results = animals;
    if (req.query) {
      results = filterByQuery(req.query, results);
    }
    res.json(results);
  });

app.get('/api/animals:id', (req, res) => {
    const result = findById(req.params.id, animals);
        if(result) {
            res.json(result);
        } else {
            res.send(404)
        }
});  

function createNewAnimal(body, animalsArray) {

    const animal = body;
    animalsArray.push(animal);
    fs.writeFileSync(
        path.join(__dirname, './data/animals.json'),
        JSON.stringify({ animals: animalsArray}, null, 2)
    );
    return animal;
}

function validateAnimal(animal) {
    if (!animal.name || typeof animal.name !== 'string') {
        return false;
    }
    if (!animal.species || typeof animal.species !== 'string') {
        return false;
    }
    if (!animal.diet || typeof animal.diet !== 'string') {
        return false;
    }
    if (!animal.personalityTraits || !Array.isArray(animal.personalityTraits)) {
        return false;
    }
    return true;
}

app.post("/api/animals", (req,res) => {
    // set id based on what the next index of the array will be
    req.body.id = animals.length.toString();

    // if any data in req.body is incorrect, send 400 error back
    if (!validateAnimal(req.body)) {
        res.status(400).send('The animal is not properly formatted.');
    } else {
         // add animal to json file and animals array in this function
        const animal = createNewAnimal(req.body, animals);
        res.json(req.body); 
    }
});

app.listen(PORT, () => {
    console.log(`API server now on port ${PORT}`);
});
