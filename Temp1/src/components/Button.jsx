import React from "react"

const Button = ({title, id ,leftIcon, ContainerClass , rightIcon}) => {
  return (
    <button 
    id={id}
    className={`group relative z-10 w-fit cursor-pointer overflow-hidden 
    rounded-full bg-violet-50 px-7 py-3 text-black flex gap-2 ${ContainerClass}`}
    >
        {leftIcon}
        <span className=" relative incline-flex overflow-hidden font-general text-xs uppercase">
            <div>
                {title}
            </div>
        </span>
        {rightIcon}
    </button>
  )
}

export default Button