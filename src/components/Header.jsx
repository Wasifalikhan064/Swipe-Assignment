import { Navbar } from "flowbite-react";
import { Link } from "react-router-dom";
import { useState } from "react";

export default function Header() {
  return (
    <Navbar className="border-b-2 ">
      <div className="flex justify-start place-items-end w-full  py-2">
        {/* Logo */}
        <div className="flex items-center ">
          <Link
            to="/"
            className="self-center whitespace-nowrap text-sm sm:text-xl font-semibold dark:text-white"
          >
            <span className="px-2 py-1 bg-gradient-to-r from-gray-500 via-gray-500 to-gray-500 rounded-lg text-white">
               Invoice Management App
            </span>
          </Link>
        </div>
      </div>
    </Navbar>
  );
}
