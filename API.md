#  Module Group Project 2
#### These two APIs will output the first login page, which asks player to input the username.


#### This API will lead players to logout their accounts.
> curl https://obscure-plateau-80187.herokuapp.com/

> curl https://obscure-plateau-80187.herokuapp.com/login

#### This API will lead players to logout their accounts.
> curl https://obscure-plateau-80187.herokuapp.com/logout

#### This API will post a player and save the player account to database, it will also lead players to the game rooms lists.
> curl --data 'true' https://obscure-plateau-80187.herokuapp.com/create-player

#### This API will post a room for player who want to be the painter role in this game, and also allow painter to draw on canvas.
> curl --data 'true' https://obscure-plateau-80187.herokuapp.com/create-room


#### This API will get a room in viewer mode.
> curl https://obscure-plateau-80187.herokuapp.com/room/:roomname/view

#### This API will get a room in guesser mode.
> curl https://obscure-plateau-80187.herokuapp.com/room/:roomname/join

#### This API will get the current roomname and close the room if the players quit this room.
> curl --data 'true' https://obscure-plateau-80187.herokuapp.com/room/:roomname/kill

#### This API will get the canvas associated with the room.
> curl https://obscure-plateau-80187.herokuapp.com/api/room/:roomname/getCanvas

#### This API will post and save it to the database.
> curl --data 'true' https://obscure-plateau-80187.herokuapp.com/api/room/:roomname/saveCanvas
 
#### This API will get a random word from database.
> curl https://obscure-plateau-80187.herokuapp.com/api/word/getRandom
