import React, { useEffect } from "react"
import { io } from "socket.io-client"

const PORT = import.meta.env.VITE_PORT || 3000

const Home = () => {

  useEffect(() => {

    const socket = io(`http://localhost:${PORT}`)

    socket.on("connect", () => {
      console.log("Connected to server:", socket.id)
    })

    return () => {
      socket.disconnect()
    }

  }, [])   

  return (
    <div className="container">
      <h2>Home</h2>
    </div>
  )
}

export default Home