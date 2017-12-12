const express = require('express')
const firebase = require('firebase')
const app = express()
const bodyParser = require('body-parser')

// Initialize Firebase
  let config = {
  apiKey: "Your_api_key",
  authDomain: "Your_auth_domain",
  databaseURL: "Your_database_url",
  projectId: "Yopur_project_id",
  storageBucket: "Your_storage_bucket",
  messagingSenderId: "Your_messaging_id"
};
//Start app
firebase.initializeApp(config);

//Storage, database and auth
let database = firebase.database()
//References to nodes in app
let sessionData = database.ref('/Posts/')
let userRef = database.ref().child('/Users/')

//Listen to the server port
app.listen(process.env.PORT || 3000,()=>{
  console.log('listening on 3000')
})

//Setup
app.set('view engine','ejs')//tell where to look for ejs
app.use(bodyParser.urlencoded({extended: true})) //this allows node to look for the form in the ejs/html
app.use(bodyParser.json())
app.use(express.static('public'))

//an array with all the entries in the database that are passed to the index.ejs file
let resultArray = loadTable()

//Setup API
app.get('/',(req,res)=>{
  res.render('index.ejs',{sessions: resultArray})
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

function loadTable(){
  //TODO: Solve date now issue. Only using the initial server time
  sessionData = database.ref('/Posts/')
  var timeNow = new Date();
  timeNow = Math.floor(timeNow.getTime()/1000)
  console.log('Date now = '+timeNow)
  //Provide  current and future sessions only
  let currentSessionRef = sessionData.orderByChild('dateUnix').startAt(timeNow-1200)
  let resultArray = []
  //function to add current and future sessions to resultArray
  currentSessionRef.once('value',function(snapshot){
    snapshot.forEach(function(childSnap){
      let childData = childSnap.val()
      //add childData to array
      resultArray.push(childData)
    })
  })

  return resultArray
}
