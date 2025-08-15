"use client"

// Sidebar.js
import React from 'react';
import { signOut } from 'next-auth/react'

const Sidebar = ({ session }) => {
  return (
    <div className="flex">
      {/* Sidebar */}
      <div className="bg-[#333] text-white fixed h-screen w-64 z-10">
        {/* Sidebar content */}
        <div className='flex flex-col h-full'>
          <div className="flex flex-col items-center flex-grow">
            <div className="mt-10">
              <a href="/" className="text-white hover:text-gray-300">
                Home
              </a>
            </div>
            {!session ? (
              <>

              </>
            ) : (
              <>
                <div className="mt-10">
                  <a href="tables" className="text-white hover:text-gray-300">
                    Table
                  </a>
                </div>
                <div className="mt-10">
                  <a href="table_manager" className="text-white hover:text-gray-300">
                    Table_manager
                  </a>
                </div>
                {/* <div className="mt-10">
                  <a href="menu" className="text-white hover:text-gray-300">
                    Menu
                  </a>
                </div> */}
                <div className="mt-10">
                  <a href="menu-manager" className="text-white hover:text-gray-300">
                    Inventory
                  </a>
                </div>
                <div className="mt-10">
                  <a href="user" className="text-white hover:text-gray-300">
                    user
                  </a>
                </div>
                <div className="mt-10">
                  <a href="report" className="text-white hover:text-gray-300">
                    report
                  </a>
                </div>
                <div className="mt-10">
                  <a href="customers" className="text-white hover:text-gray-300">
                    customers
                  </a>
                </div>
                <div className="mt-10">
                  <a href="tickets" className="text-white hover:text-gray-300">
                    tickets
                  </a>
                </div>
              </>
            )}

          </div>
          <div className='flex flex-col items-center mb-10'>
            {!session ? (
              <>
                <div className="mb-4">
                  <a href="login" className="text-white hover:text-gray-300">
                    Sign In
                  </a>
                </div>
                <div className="mb-4">
                  <a href="register" className="text-white hover:text-gray-300">
                    Sign Up
                  </a>
                </div>
              </>
            ) : (
              <>
                <div className="mb-4">
                  <button onClick={() => signOut({ callbackUrl: '/' })} className="text-white hover:text-gray-300">
                    Sign Out
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;