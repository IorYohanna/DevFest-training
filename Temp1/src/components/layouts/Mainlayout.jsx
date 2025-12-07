import React from "react";
import { Outlet } from "react-router-dom";
import MenuBar from "../MenuBar";

export default function Mainlayout() {
  return (
    <div className="w-full min-h-screen bg-black text-white">
      <MenuBar />
      <div className="pt-0"> 
        <Outlet />
      </div>
    </div>
  );
}
