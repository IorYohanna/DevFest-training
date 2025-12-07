import React from 'react'
import MenuBar from '../MenuBar'
import { Outlet } from 'react-router-dom'

const Mainlayout = () => {
  return (
    <div className="flex h-screen bg-linear-to-br from-[#73839E] to-[#5a729b] relative overflow-hidden">
        <MenuBar/>
        <Outlet/>
    </div>
  )
}

export default Mainlayout