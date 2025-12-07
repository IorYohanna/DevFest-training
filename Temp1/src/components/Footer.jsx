import { FaDiscord, FaTwitter, FaGithub, FaFacebook } from 'react-icons/fa'

const links = [
  { href: 'https://discord.com', icon: <FaDiscord /> },
  { href: 'https://Twitter.com', icon: <FaTwitter /> },
  { href: 'https://GitHub.com', icon: <FaGithub /> },
  { href: 'https://Facebook.com', icon: <FaFacebook /> }
]

const Footer = () => {
  return (
    <footer className="w-screen bg-violet-200 py-40 text-black">
      <div className="container mx-auto flex flex-col items-center justify-between gap-4 px-4 md:flex-row">
        <p className="text-center text-lg md:text-left">
          &copy; OUTSIDERS 2025. <br/> ALL RIGHTS RESERVED
        </p>

        <div className=''>
          <h4>Supportez Nous </h4>
          <p>Universite de Fianarantsoa</p>
          <p>ENI Fianarantsoa</p>
          <p>Outsiders@gmail.com</p>

        </div>

        <div className="flex justify-center gap-7 md:justify-start">
          {links.map((link, index) => (
            <a
              key={index}
              href={link.href}
              target="_blank"
              rel="noopener noreferrer"
              className="text-black transition-colors duration-500 ease-in-out hover:text-white text-2xl"
            >
              {link.icon}
            </a>
          ))}
        </div>

        <a href="#privacy-policy" className="text-center text-sm hover:underline md:text-right">
          Privacy Policy
        </a>
      </div>
    </footer>
  )
}

export default Footer
