//Explanation
//This is a collective meditation app that uses binaural beats.
//This app is able to post and read session information from a database in Firebase, and play audio from it.

//Collective Meditation section:
//The information that is read in the Firebase app is placed in a table in the .collective section of the HTML.
//If a session is currently active (pink background) the user can join in by clicking on it in the table

//Individual Meditation Session:
//If the user can't find an active collective session or doesn't want to use this features they can setup individual sessions
//The user inputs different parameters for their session. When "Start Session" in presses, an audio file is
// pulled from a url and its mixed with two oscillators. All this process is made with the web Audio API.

//Create Session Section:
//In this section the user can post his own collective meditation sessions. Eventually this will only be
//available for subscribers.

//Audio variables
var AudioContext = window.AudioContext || window.webkitAudioContext;
var audioCtx = new AudioContext();
var bufferLoader; //Variable that will store the audio file
var source = audioCtx.createBufferSource(); //create Source as global variable
var freq = 200; //Base frequency for oscillators
var startBinBeat = 4; //default start binaural beat value
var binBeat = 4; //defalut end binaural beat value
var sessionDuration = 300; //default duration in milliseconds

//Timer variable and other timer ids
var timerId = 0;
var fadeId = 0;
var fadeDir = -1;
var deltaPerTime = 0;

//audio tracks url array
//TODO: Outsource the file storage
var urlArray = [
  '../audio/Dream.mp3',
  '../audio/Healing.mp3'
];

//Oscillators
var osci1= audioCtx.createOscillator();
var osci2= audioCtx.createOscillator();
var gainNode = audioCtx.createGain();
var pan1 = audioCtx.createStereoPanner();
var pan2 = audioCtx.createStereoPanner();

//Connect and define initial values
osci1.connect(pan1);
osci2.connect(pan2);
pan1.connect(gainNode);
pan2.connect(gainNode);

gainNode.connect(audioCtx.destination);
gainNode.gain.value = 0; //set
osci1.start(0);
osci2.start(0);
osci1.frequency.value = freq;
osci2.frequency.value = freq+200;
osci1.type = 'sine';
osci2.type = 'sine';
pan1.pan.value = 1;
pan2.pan.value = -1;

//Firebase
//Define time right now
var timeNow = new Date();
timeNow = timeNow.getTime()/1000;
console.log("Time now = "+timeNow)

$(document).ready(function(){

    //Add hover and click listener
    //Remove hover listers First
    $(".collective tr").unbind("mouseenter mouseleave");
    $(".classActive").off();

    //add hover listener
    $(".collective tr+tr").hover(function(){
      $(this).toggleClass("hover");
      console.log("hover collective");
    });

    $(".classActive").on('click',function(){

      //Extract frequency and time information from the table content in the DOM
      //Frequency
      binBeat = parseInt($(this)[0].children[4].textContent);
      startBinBeat = binBeat;//Both start and finishing frequencies are the same in collective meditations

      //Duration time left
      //In the mean time session time
      sessionDuration = parseInt($(this)[0].children[5].textContent)*60;

      //Trigger audio
      //Activate Fade
      activateFade();
    });


  //Load default music track
  bufferLoader = new BufferLoader(
    audioCtx,
    [
      urlArray[0]
    ],
    finishedLoading
  );
  bufferLoader.load();

// Individual sessions setup.
  //Play button listener
  $("#startSession").on("click", function(){

    //Activate audio fade
    activateFade();

    //Toggle html of start button. Fade dir determines in what direction the fade will go next. 1 for fade in and -1 for fade out.
    if(fadeDir==1){
      $(this).html("Stop session");
    }else {
      $(this).html("Start session");
    }
    console.log("deltaPerTime = "+deltaPerTime);
  });

  //TODO:Refactor on click functions. Not DRY
  $('.userFeel').on('click',function(event){

    //Change color of buttons
    for (i = 1; i <=5; i+=1 ){
      if (i != $(this).index()){
        // $('.userFeel')[i-1].style.background= '#4874F7';
        $('.userFeel')[i-1].style.background= '#4874F7';
      } else {
        $('.userFeel')[$(this).index()-1].style.background = '#012549';
        console.log($(this).index());
      }
    }
    //Determine which button was pressed
    startBinBeat = whichFreq($(this).index());
    osci2.frequency.value = freq+startBinBeat;
  });

//Define individual session target frequency
  $('.userWantsFeel').on('click', function(event){

    for (i = 1; i <=4; i+=1 ){
      if (i != $(this).index()){
        $('.userWantsFeel')[i-1].style.background= '#4874F7';
      } else{
        $('.userWantsFeel')[$(this).index()-1].style.background = '#012549';
        console.log($(this).index());
      }
    }
    binbeat = whichFreq($(this).index()); //Assign frequency from index of the button
  });

  //Define individual session time
  $('.sessionTime').on('click', function(event){

    for (i = 1; i <=4; i+=1 ){
      if (i != $(this).index()){
        $('.sessionTime')[i-1].style.background= '#4874F7';
      } else{
        $('.sessionTime')[$(this).index()-1].style.background = '#012549';
        console.log($(this).index());
      }
    }
    sessionDuration = whichDuration($(this).index());

  });

  //Define collective session time
  $('.collSessionTime').on('click', function(event){

    for (i = 1; i <=4; i+=1 ){
      if (i != $(this).index()){
        $('.collSessionTime')[i-1].style.background= '#4874F7';
      } else{
        $('.collSessionTime')[$(this).index()-1].style.background = '#012549';
        console.log($(this).index());
      }
    }
    sessionDuration = whichDuration($(this).index());
  });

  //Define collective frequency
  $('.collectiveFreq').on('click', function(event){

    for (i = 1; i <=4; i+=1 ){
      if (i != $(this).index()){
        $('.collectiveFreq')[i-1].style.background= '#4874F7';
      } else{
        $('.collectiveFreq')[$(this).index()-1].style.background = '#012549';
        console.log($(this).index());
      }
    }
    binBeat = whichFreq($(this).index());
  });

/*MUSIC SECTION*/

  //Select music
  $(".selectMusic tr + tr").on('click', function(){
    //Attach tick to selected track
    $(".selectMusic tr + tr").children("td:last-of-type").children("img").attr("src","#");
    $(this).children("td:last-of-type").children("img").attr("src","img/tick.png");

    //Stop source audio
    source.stop();
    console.log("source stopped");

    //Define which track was selected and assign url
    console.log($(this).index()-1);
    var trackSelected = $(this).index()-1;

    //Attach track into audio engine
    bufferLoader = new BufferLoader(
      audioCtx,
      [
        urlArray[trackSelected]
      ],
      finishedLoading
    );
    bufferLoader.load();
  });

  //Hover for music table
  $(".selectMusic tr + tr").hover(function(){
    $(this).toggleClass("hover");
    console.log("hover");
  });

/*Functions*/

  //Function that creates session
  $("#create").on("click", function(){
    //Extract data from inputs
    var date = new Date($("#dateInput").val());

    //Define the time from the hour input

    var timestamp = date/1000;
    var dateFormat = dateString(date);
    var title = $("#titleInput").val();
    var description = $("#desInput").val();
    var freqSes = startBinBeat;
    var colDur = sessionDuration;
    //TODO: Implement image upload to replace default image of session
    createMeditation(title,description,dateFormat,timestamp,1,"https://firebasestorage.googleapis.com/v0/b/testfirebase1-726b7.appspot.com/o/sessionImage%2FMorning%20focus2017-10-10%2012%3A00%3A00%20%200000?alt=media&token=ff43fd91-4e08-4ebc-b930-c5f5a3c0e79e",colDur,freqSes);
  });

  //Function that sets the timer for stoping the session once it started
  function startClock(){
    //First we evaluate if time is out
    if(sessionDuration <= 0){
      console.log("Session over")
      clearInterval(timerId);
      //change direcion of fade
      fadeDir = fadeDir* -1;
      //fade audio.
      fadeId = setInterval(fade, 100);
      //TODO: Should audio stop as well?

    } else {
    sessionDuration-=1;
    //Change oscillators frequencies
    osci2.frequency.value += deltaPerTime;
    console.log("osci2 freq = "+osci2.frequency.value);
    console.log("sessionDuration = "+sessionDuration);
    }
  }

  function fade(){
    if (fadeDir == 1){
      gainNode.gain.value += 0.05;
      if (gainNode.gain.value >=0.3) { //0.3 because at 1.0 sound gets distorted
        gainNode.gain.value = 0.3;
        clearInterval(fadeId);
      }
    } else if (fadeDir == -1){
      gainNode.gain.value -=0.05;
      if (gainNode.gain.value <=0){
        gainNode.gain.value = 0;
        clearInterval(fadeId);
        //TODO: stop audio here?
      }
    }
    console.log(gainNode.gain.value);
  }

  function activateFade(){
    //Fade in or Fade out
    fadeDir = fadeDir* -1;
    fadeId = setInterval(fade, 100);
    //Define deltaTime
    deltaPerTime = (binBeat-startBinBeat)/(sessionDuration);
  }

  //Function to turn unix date into a date with the format we need for the database
  function dateString(x){
  var hours = "0" + x.getUTCHours();
  // Minutes part from the timestamp
  var minutes = "0" + x.getUTCMinutes();
  // Seconds part from the timestamp
  var seconds = "0" + x.getUTCSeconds();

  // Will display time in hh:mm:ss format
  var formattedTime = hours + ':' + minutes.substr(-2) + ':' + seconds.substr(-2);
    var month = x.getUTCMonth()+1;
    var formatDate = x.getUTCFullYear()+"-"+month+"-"+x.getUTCDate()+" "+hours.substr(-2)+":"+minutes.substr(-2)+":"+seconds.substr(-2)+" +0000";
    return formatDate;
  }

  //Function to create meditation in the database
  function createMeditation(titleSession,description,timeFormat,unix,numberUsers,img,duration,sessionFrequency){
    //TODO: Send as a fetch request

    //fetch request to the API
    fetch('postNewSession',{
      method: 'post',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({
        'title': titleSession,
        'message': description,
        'time': timeFormat,
        'dateUnix': unix,
        'numberOfUsers': numberUsers,
        'imageURL': img,
        'sessionDuration': duration,
        'sessionFreq': sessionFrequency
      })
    }).then(response =>{
      if (response.ok) return response.json()
    }).then(data=>{
      console.log(data)
      alert('Your session was created')
      window.location.reload(true)
    })
  }
//Function that determines which frequency was selected
  function whichFreq(x){
    var result;
    switch (x) {
      case 1: result = 4;
      break;
      case 2: result = 6;
      break;
      case 3: result = 10;
      break;
      case 4: result = 14;
      break;
      case 5: result = 30;
      break;

        break;
      default: console.log("nothing");
    }
    return result;
  }

  //Function that determines which Duration was selected
  function whichDuration(x){
    var result;
    switch (x) {
      case 1: result = 15; //5minutes 300
      break;
      case 2: result = 600;// 10 minutes
      break;
      case 3: result = 900;//15 minutes
      break;
      case 4: result = 1200;//20 minutes
      break;

        break;
      default: console.log("nothing");
    }
    return result;
  }

});


//Global functions.
function finishedLoading(bufferList){
  // var source = audioCtx.createBufferSource();
  // debugger
  source.disconnect();
  source = audioCtx.createBufferSource();
  source.buffer = bufferList[0];
  source.connect(gainNode);
  source.start(0);
  console.log("finishedLoading function");
}

/*Buffer Loader class. Copied from the internet, not my work: http://middleearmedia.com/web-audio-api-bufferloader/*/
function BufferLoader(context, urlList, callback) {
  this.context = context;
  this.urlList = urlList;
  this.onload = callback;
  this.bufferList = new Array();
  this.loadCount = 0;
}

BufferLoader.prototype.loadBuffer = function(url, index) {
  // Load buffer asynchronously
  var request = new XMLHttpRequest();
  request.open("GET", url, true);
  request.responseType = "arraybuffer";

  var loader = this;

  request.onload = function() {
    // Asynchronously decode the audio file data in request.response
    loader.context.decodeAudioData(
      request.response,
      function(buffer) {
        if (!buffer) {
          alert('error decoding file data: ' + url);
          return;
        }
        loader.bufferList[index] = buffer;
        if (++loader.loadCount == loader.urlList.length)
          loader.onload(loader.bufferList);
      },
      function(error) {
        console.error('decodeAudioData error', error);
      }
    );
  }

  request.onerror = function() {
    alert('BufferLoader: XHR error. Activate CORS plugin in Chrome');
  }

  request.send();
}

BufferLoader.prototype.load = function() {
  for (var i = 0; i < this.urlList.length; ++i)
  this.loadBuffer(this.urlList[i], i);
}
