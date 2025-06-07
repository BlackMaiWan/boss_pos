"use client"

import React, {useState } from 'react'
import { useSession } from 'next-auth/react';
import { redirect } from 'next/navigation';
import Sidebar from '../components/sidebar';

function RegisterPage() {

    const [uid, setUID] = useState("");
    const [name, setName] = useState("");
    const [surname, setSurname] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const { data: session } = useSession();
    if (session) redirect("/welcome")

    const handleSubmit = async (e) => {
        e.preventDefault();

        if(password != confirmPassword) {
            setError("Passwords do not match!");
            return;
        }

        if(!uid || !name || !surname || !password || !confirmPassword) {
            setError("Please enter all inputs!");
            return;
        }

        try {
            
            const resCheckUser = await fetch("http://localhost:3000/api/checkUID", {
                method: "POST",
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ uid })
            })

            const { user } = await resCheckUser.json();

            if (user) {
                setError("UID already exists!");
                return;
            }

            const res = await fetch("http://localhost:3000/api/register", {
                method: "POST",
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    uid, name, surname, password
                })
            })

            if (res.ok) {
                const form = e.target;
                setError("");
                setSuccess("User registration successful!");
                form.reset();
            } else {
                console.log("User registration failed.");
            }
        } catch (error) {
            console.log("Error during registration: ", error);
        }
    }
  return (
    <div>
      <Sidebar session={session}/>
      <div className='container mt-10 mx-auto py-5 justify-items-center'>
        <h3>RegisterPage</h3>
        <hr className='my-3' />
        <form onSubmit={handleSubmit}>
            {error &&(
                <div className='bg-red-500 w-fit text-sm text-white py-1 px-3 rounded-md mt-2'>
                    {error}
                </div>
            )}

            {success &&(
                <div className='bg-green-500 w-fit text-sm text-white py-1 px-3 rounded-md mt-2'>
                    {success}
                </div>
            )}  

            <input onChange={(e) => setUID(e.target.value)} className='block bg-gray-300 p-2 my-2 rounded-md' type="text" placeholder='UID' />
            <input onChange={(e) => setName(e.target.value)} className='block bg-gray-300 p-2 my-2 rounded-md' type="text" placeholder='Name' />
            <input onChange={(e) => setSurname(e.target.value)} className='block bg-gray-300 p-2 my-2 rounded-md' type="text" placeholder='Surname' />
            <input onChange={(e) => setPassword(e.target.value)} className='block bg-gray-300 p-2 my-2 rounded-md' type="password" placeholder='Enter password' />
            <input onChange={(e) => setConfirmPassword(e.target.value)} className='block bg-gray-300 p-2 my-2 rounded-md' type="password" placeholder='Confirm password' />
            <button type='submit' className='bg-green-500 p-2 rounded-md text-white'>Sign Up</button>
        </form>
      </div>
    </div>
  )
}

export default RegisterPage
