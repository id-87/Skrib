import React, { useEffect, useState , useRef} from "react"
import { io } from "socket.io-client"

const PORT = import.meta.env.VITE_PORT || 3000

import { socket } from "../socket"

const Home = () => {

    const [name,setName]=useState("")
    const [room,setRoom]=useState("room1")
    const [players,setPlayers]=useState([])
    const canvasRef=useRef(null)

  useEffect(() => {

    // const socket = io(`http://localhost:${PORT}`)

    

    socket.on("connect", () => {
      console.log("Connected to server:", socket.id)
    })

      

    socket.on("player_list",(players)=>{
        setPlayers(players)
    })


    const canvas=canvasRef.current
    const ctx=canvas.getContext("2d")

    let drawing=false

    canvas.addEventListener("mousedown",(e)=>{
        drawing=true
    })

    canvas.addEventListener("mousemove",(e)=>{
        if(!drawing){
            return
        }
        const x=e.offsetX
        const y=e.offsetY

        socket.emit("draw_move",{x,y,z})
    })

    canvas.addEventListener("mouseup",()=>{
        drawing=false
    })

    return () => {
      socket.off("player_list")
    }

    

    }, [])

  const joinRoom=()=>{
    socket.emit("join_room",{
        name,
        room
    })
  }
  


  return (
    <div className="container">
      <div>
        <input
            placeholder="Enter name"
            onChange={(e)=>setName(e.target.value)}
        />

        <button onClick={joinRoom}>
        Join Room
        </button>

        <h3>Players in Lobby</h3>

        {players.map(p => (
        <div key={p.id}>
        {p.name} — {p.score}
        </div>
        ))}
      </div>
      <canvas
      ref={canvasRef}
      width={600}
      height={400}
      style={{border:'2px solid black', marginTop:"20px"}}/>
    </div>
  )
}

export default Home