import { Navbar } from "flowbite-react";
import { Link } from "react-router-dom";
import { useState } from "react";

export default function Header() {
  return (
    <Navbar className="border-b-2 ">
      <div className="flex justify-between place-items-end w-full px-4 py-2">
        {/* Logo */}
        <div className="flex items-center ">
          <div className="hidden lg:block mr-96 ">
            <a href="/">
              <img
                width="90"
                height="33.41"
                
                src="https://getswipe.in/static/img/brand_logo.svg"
                alt="Logo"
              />
            </a>
          </div>
          <Link
            to="/"
            className="self-center whitespace-nowrap text-sm sm:text-xl font-semibold dark:text-white"
          >
            <span className="px-2 py-1 bg-gradient-to-r from-gray-500 via-gray-500 to-gray-500 rounded-lg text-white">
              Swipe Invoice Management App
            </span>
          </Link>
        </div>
      </div>
    </Navbar>
  );
}
