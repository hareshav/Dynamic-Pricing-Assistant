import { useState } from "react";
import { Link } from "react-router-dom";

const Navbar = () => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <nav className=" bg-gray-900 opacity-95 border-gray-700 mb-10 sticky top-0 z-10">
      <div className="max-w-screen-xl flex flex-wrap items-center justify-between mx-auto p-4">
        <Link to="/" className="flex items-center space-x-3 rtl:space-x-reverse">
          <img src="https://cdn-icons-png.flaticon.com/512/8071/8071223.png" className="h-10" alt="Logo" />
          <span className="self-center text-2xl font-semibold whitespace-nowrap dark:text-white">Price Tracker</span>
        </Link>
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          type="button"
          className="inline-flex items-center p-2 w-10 h-10 justify-center text-sm text-gray-500 rounded-lg md:hidden hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-200 dark:text-gray-400 dark:hover:bg-gray-700 dark:focus:ring-gray-600"
          aria-expanded={mobileMenuOpen}
        >
          <span className="sr-only">Open main menu</span>
          <svg className="w-5 h-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 17 14">
            <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M1 1h15M1 7h15M1 13h15" />
          </svg>
        </button>
        <div className={`${mobileMenuOpen ? "block" : "hidden"} w-full md:block md:w-auto`}>
          <ul className="flex flex-col font-medium p-4 md:p-0 mt-4 border border-gray-100 rounded-lg bg-gray-50 md:space-x-8 rtl:space-x-reverse md:flex-row md:mt-0 md:border-0 md:bg-white dark:bg-gray-800 md:dark:bg-gray-900 dark:border-gray-700">
            <li>
              <Link to="/" className="block py-2 px-3 hover:text-zinc-400 text-white bg-blue-700 rounded-sm md:bg-transparent md:text-blue-700 md:p-0 md:dark:text-zinc-200">Home</Link>
            </li>
            <li>
              <Link to="/dashboard" className="block py-2 px-3 hover:text-zinc-400 text-white bg-blue-700 rounded-sm md:bg-transparent md:text-blue-700 md:p-0 md:dark:text-zinc-200">Dashboard</Link>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
