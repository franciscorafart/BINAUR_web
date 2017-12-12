# BINAUR

Binaur is a binaural beats collective meditation app built with Node Express and Firebase. It allows users to join and create collective meditation sessions that stimulate the user with binaural beats. Binaural beats is an audio technique to entrain brainwaves and modify states of conciousness by using to slighly different frequencies in each ear. The frequency differenence is perceived as a beat internally, that entrains brainwaves to match that frequency. In this repository I show the main View Controller, where the audio engine and the main user interface are created.

Link to project: https://binaur.herokuapp.com/

How It's Made:

Tech used: Javascript, Firebase, Web Audio API, Node Express, HTML, CSS

The audio engine for this app was made using the Web Audio API , which allows a very comfortable and intuitive way of mixing audio, midi and oscillators. The collective meditation database is built on Firebase. When a user joins a session all the information from the database is loaded into the interface and audio engine. The time schedule of the sessions is displayed on whatever time zone the client's device is in.

Optimizations
I will optimize the load of music files to have them stored outside the app. I will create an authentication page and implement donations to keep the project alive.

Lessons Learned:

With this project I learnt how to integrate Node Express with Firebase, as well as basic audio file management and mixing with the Web Audio API.
