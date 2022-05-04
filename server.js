const {animals} = require('./data/animals.json');
const express = require('express');
const app = express();

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

app.get('/api/animals', (req, res) => {
    let results = animals;
    if (req.query) {
        results = filterByQuery(req.query, results);
    }
    res.json(results);
});  

app.listen(3001, () => {
    console.log(`API server now on port 3001!`);
});
