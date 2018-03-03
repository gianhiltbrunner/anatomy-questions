var fs = require('fs')
var _ = require('lodash');

eval(fs.readFileSync('TEAmcq-a.js')+'')
eval(fs.readFileSync('TEAmcq-q.js')+'')

//Combine questions and answers
var ansQuest = _.merge(gaoA, gaoQ)

//Filter questions
const regex = /\bA.*/g //Match all 'Anatomie'-Questions
Object.values(ansQuest).map((elem)=> {
    if(elem.id ){console.log(elem.id)}
    else {console.log("ss");
    }
    //return elem.id.match(regex)
})
console.log(Object.values(ansQuest)[1].id)
