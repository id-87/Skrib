

const express=require("express")
const http=require("http")
const {Server}=require("socket.io")
const cors=require("cors")

const app=express()
app.use(cors())
app.use(express.json())

const server=http.createServer(app)

const io=new Server(server,{
cors:{origin:"*"}
})

let rooms={}

const words=["apple","car","house","tree","cat","phone"]

function generateRoomCode(){
return Math.random().toString(36).substring(2,8).toUpperCase()
}

function startRound(room){

if(!rooms[room]) return

rooms[room].round++

if(rooms[room].round>rooms[room].maxRounds){

const winner=rooms[room].players.sort((a,b)=>b.score-a.score)[0]

io.to(room).emit("game_over",{winner:winner.name,score:winner.score})

return
}

rooms[room].drawerIndex++

if(rooms[room].drawerIndex>=rooms[room].players.length){
rooms[room].drawerIndex=0
}

const drawer=rooms[room].players[rooms[room].drawerIndex]

rooms[room].drawer=drawer.id
rooms[room].currentWord=null

const options=[]

for(let i=0;i<3;i++){
options.push(words[Math.floor(Math.random()*words.length)])
}

io.to(room).emit("round_start",{drawer:drawer.id})

io.to(drawer.id).emit("word_options",options)

}

io.on("connection",(socket)=>{

socket.on("create_room",(name)=>{

const room=generateRoomCode()

rooms[room]={
players:[],
host:socket.id,
drawer:null,
drawerIndex:-1,
currentWord:null,
round:0,
maxRounds:7
}

socket.join(room)

rooms[room].players.push({
id:socket.id,
name,
score:0
})

socket.emit("room_created",room)

io.to(room).emit("player_list",rooms[room].players)

})

socket.on("join_room",({name,room})=>{

if(!rooms[room]) return

socket.join(room)

rooms[room].players.push({
id:socket.id,
name,
score:0
})

io.to(room).emit("player_list",rooms[room].players)

})

socket.on("start_game",({room,maxRounds})=>{

if(!rooms[room]) return

if(socket.id!==rooms[room].host) return

rooms[room].maxRounds=maxRounds
rooms[room].round=0
rooms[room].drawerIndex=-1

startRound(room)

})

socket.on("select_word",({room,word})=>{

if(!rooms[room]) return

if(socket.id!==rooms[room].drawer) return

rooms[room].currentWord=word

io.to(room).emit("word_selected",word)

io.to(room).emit("chat_message","Word selected. Start guessing!")

})

socket.on("guess",({name,room,guess})=>{

if(!rooms[room]) return

const word=rooms[room].currentWord

if(!word) return

if(guess.toLowerCase()===word){

const player=rooms[room].players.find(p=>p.name===name)

if(player) player.score+=10

io.to(room).emit("player_list",rooms[room].players)

io.to(room).emit("chat_message",`${name} guessed correctly`)

startRound(room)

}else{

io.to(room).emit("chat_message",`${name}: ${guess}`)

}

})

socket.on("draw_move",(data)=>{

const {room}=data

if(!rooms[room]) return

if(socket.id!==rooms[room].drawer) return

socket.to(room).emit("draw_move",data)

})

socket.on("disconnect",()=>{

for(const room in rooms){

rooms[room].players=rooms[room].players.filter(p=>p.id!==socket.id)

io.to(room).emit("player_list",rooms[room].players)

}

})

})

server.listen(3000)