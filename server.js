const express = require('express')
const firebase = require('firebase')
const app = express()
const bodyParser = require('body-parser')

// Initialize Firebase
  let config = {
  apiKey: "YOUR_KEY",
  authDomain: "YOUR_Domain",
  databaseURL: "Your_URL",
  projectId: "YOUR_project_id",
  storageBucket: "YOUR_storagebucket",
  messagingSenderId: "YOUR_messaging_sending_ID"
};

firebase.initializeApp(config);
//Storage, database and auth
let database = firebase.database()
//References to nodes in app
let sessionData = database.ref('/Posts/')
let userRef = database.ref().child('/Users/')

//Listen to the port
app.listen(process.env.PORT || 3000,()=>{
  console.log('listening on 3000')
})

//Setup
app.set('view engine','ejs')//tell where to look for ejs
app.use(bodyParser.urlencoded({extended: true})) //this allows node to look for the form in the ejs/html
app.use(bodyParser.json())
app.use(express.static('public'))

//an array with all the entries in the database that are passed to the index.ejs file
let resultArray
let timeNow = new Date();
timeNow = Math.floor(timeNow.getTime()/1000)
// loadTable(timeNow)

//Setup API
app.get('/',(req,res)=>{
  // resultArray = loadTable()
  // res.render('index.ejs',{sessions: resultArray})

  //no need to send array from here, we can load the table in the same javascript
  res.render('index.ejs')
})

app.get('/help',(req,res)=>{
  res.render('help.ejs')
})
//Api request to create new sessions
app.post('/postNewSession',(req,res)=>{

  sessionData.push({
    title: req.body.title,
    message: req.body.message,
    time: req.body.time,
    dateUnix: req.body.dateUnix,
    numberOfUsers: req.body.numberOfUsers,
    imageURL: req.body.imageURL,
    sessionDuration: req.body.sessionDuration,
    sessionFreq: req.body.sessionFreq
  });
  res.redirect('/')
})
//Api call that refreshes collective session table.
app.post('/refresh',(req,res)=>{

  console.log(req.body.time)
  loadTable(req.body.time)
  //Send result array from here
  res.send({sessions: resultArray})
})

//function that queries database for sessions
function loadTable(timeNow){

  sessionData = database.ref('/Posts/')
  console.log('Date now = '+timeNow)
  //Provide  current and future sessions only
  let currentSessionRef = sessionData.orderByChild('dateUnix').startAt(timeNow-1200)
  let resultArr = []
  //function to add current and future sessions to resultArray
  currentSessionRef.on('value',function(snapshot){
    resultArr = []
    snapshot.forEach(function(childSnap){
      let childData = childSnap.val()
      //add childData to array
      resultArr.push(childData)
      // console.log(childData)
    })
    //Using global variable. Not best practice
    resultArray = resultArr
  })
  // return resultArr
}
