# Asteroids-Game

Asteroids game clone with HTML5 Canvas, Javascript

Control with arrow keys or WAD, shoot with spacebar, S, or arrow down.

High score saved with Local Storage

Live site at https://eg744.github.io/Asteroids-Game/

Simple Neural Network included as an option to play the game automatically. Takes a number of inputs, outputs, hidden values, and the number of samples it should iterate through. 

I enjoyed learning some of the basics of machine learning, and a good way to exercise my knowledge of Object Oriented Programming. It's not my area of expertise but it was interesting. I'll continue iterating on it in the future. 

Known issue with computer player: Ship's bullet coordinates are undefined when colliding with asteroid on the edge of the play area. 
Implementing simple Neural Network as an option to play the game automatically when COMPUTER_ACTIVE bool is true. 
Neural network takes number of inputs, number of hidden values and number of expected outputs. Matrix methods throw errors if the given arguments are invalid. Currently produces output of 0 or 1 signifying turning the player's ship left or right. 
