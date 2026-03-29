
import React,{useEffect,useState,useRef} from "react"
import {socket} from "../socket"
import './Home.css'

const Home=()=>{

const [name,setName]=useState("")
const [room,setRoom]=useState("")
const [roomCode,setRoomCode]=useState("")
const [players,setPlayers]=useState([])
const [guess,setGuess]=useState("")
const [messages,setMessages]=useState([])
const [isDrawer,setIsDrawer]=useState(false)
const [isHost,setIsHost]=useState(false)
const [wordChoices,setWordChoices]=useState([])
const [currentWord,setCurrentWord]=useState("")
const [maxRounds,setMaxRounds]=useState(7)

const canvasRef=useRef(null)

useEffect(()=>{

socket.on("room_created",(code)=>{
setRoom(code)
setRoomCode(code)
})

socket.on("player_list",(players)=>{
setPlayers(players)
if(players[0]?.id===socket.id){
setIsHost(true)
}else{
setIsHost(false)
}
})

socket.on("word_options",(options)=>{
setWordChoices(options)
})

socket.on("word_selected",(word)=>{
setCurrentWord(word)
})

socket.on("round_start",(data)=>{
const canvas=canvasRef.current
const ctx=canvas.getContext("2d")
ctx.clearRect(0,0,canvas.width,canvas.height)
if(socket.id===data.drawer){
setIsDrawer(true)
}else{
setIsDrawer(false)
}
})

socket.on("chat_message",(msg)=>{
setMessages(prev=>[...prev,msg])
})

socket.on("game_over",(data)=>{
alert(`Game Over! Winner: ${data.winner} (${data.score})`)
})

const canvas=canvasRef.current
if(!canvas) return
const ctx=canvas.getContext("2d")

let drawing=false
let lastX=0
let lastY=0

const handleMouseDown=(e)=>{
drawing=true
lastX=e.offsetX
lastY=e.offsetY
ctx.beginPath()
ctx.moveTo(lastX,lastY)
}

const handleMouseMove=(e)=>{
if(!drawing) return

const x=e.offsetX
const y=e.offsetY

ctx.lineTo(x,y)
ctx.stroke()

socket.emit("draw_move",{x,y,lastX,lastY,room})

lastX=x
lastY=y
}

const handleMouseUp=()=>{
drawing=false
}

canvas.addEventListener("mousedown",handleMouseDown)
canvas.addEventListener("mousemove",handleMouseMove)
canvas.addEventListener("mouseup",handleMouseUp)

socket.on("draw_move",(data)=>{
ctx.beginPath()
ctx.moveTo(data.lastX,data.lastY)
ctx.lineTo(data.x,data.y)
ctx.stroke()
})

return()=>{
socket.off("player_list")
socket.off("draw_move")
socket.off("chat_message")
}

},[room])

const createRoom=()=>{
socket.emit("create_room",name)
}

const joinRoom=()=>{
socket.emit("join_room",{name,room:roomCode})
setRoom(roomCode)
}

const startGame=()=>{
socket.emit("start_game",{room,maxRounds})
}

const chooseWord=(word)=>{
socket.emit("select_word",{room,word})
setWordChoices([])
}

const sendGuess=()=>{
socket.emit("guess",{name,room,guess})
setGuess("")
}

return(

<div className="container">

<div>

<input placeholder="Enter name" onChange={(e)=>setName(e.target.value)}/>

<button onClick={createRoom}>Create Room</button>

<input placeholder="Room Code" onChange={(e)=>setRoomCode(e.target.value)}/>

<button onClick={joinRoom}>Join Room</button>

{room && <h3>Room Code: {room}</h3>}

{isHost &&
<div>
<label>Rounds:</label>
<input type="number" value={maxRounds} onChange={(e)=>setMaxRounds(Number(e.target.value))}/>
<button onClick={startGame}>Start Game</button>
</div>
}

<h3>Players</h3>

{players.map(p=>(
<div key={p.id}>
{p.name} — {p.score}
</div>
))}

</div>

{wordChoices.length>0 &&
<div>
<h3>Choose Word</h3>
{wordChoices.map(w=>(
<button key={w} onClick={()=>chooseWord(w)}>
{w}
</button>
))}
</div>
}

{isDrawer && currentWord &&
<h3>Your Word: {currentWord}</h3>
}

<canvas
ref={canvasRef}
width={600}
height={400}
style={{border:"2px solid black",marginTop:"20px"}}
/>

<div style={{marginTop:"20px"}}>

<input
disabled={isDrawer}
placeholder="Enter guess"
value={guess}
onChange={(e)=>setGuess(e.target.value)}
/>

<button onClick={sendGuess}>Guess</button>

</div>

<div style={{marginTop:"20px"}}>

<h3>Chat</h3>

{messages.map((m,i)=>(
<div key={i}>{m}</div>
))}

</div>

</div>

)

}

export default Home