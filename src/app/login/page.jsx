"use client"

import React, { useState } from 'react'
import { signIn } from 'next-auth/react'
import { redirect } from 'next/navigation';
import { useSession } from 'next-auth/react'
import Sidebar from '../components/sidebar'

function LoginPage() {

    const [uid, setUID] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");


    const { data: session } = useSession();
    if (session) redirect("/welcome")

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            const res = await signIn("credentials", {
                uid, password, redirect: false
            })

            if (res.error) {
                setError("Invalid credentials");
                return;
            }

            redirect("/welcome")
        } catch (error) {
            console.log(error)
        }
    }

    return (
        <div>
            <div>
                <Sidebar />
            </div>
            <div className='ml-64'>
                <div className='container mx-auto py-10 justify-items-center'>
                    <h1>Login</h1>
                    <hr className='my-3' />
                    <form onSubmit={handleSubmit}>

                        {error && (
                            <div className='bg-red-500 w-fit text-sm text-white py-1 px-3 rounded-md mt-2'>
                                {error}
                            </div>
                        )}

                        <input onChange={(e) => setUID(e.target.value)} className='block bg-gray-300 p-2 my-2 rounded-md' type="text" placeholder='UID' />
                        <input onChange={(e) => setPassword(e.target.value)} className='block bg-gray-300 p-2 my-2 rounded-md' type="password" placeholder='Password' />
                        <button type='submit' className='bg-green-500 p-2 m-3 rounded-md text-white'>Sign In</button>
                    </form>
                    {/* need config!!! */}
                    {/* <Link className='text-gray-500 hover:underline' href="/">Forgot Password?</Link><br/>
                    <Link className='text-gray-500 hover:underline' href="register">Register</Link> */}
                </div>
            </div>
        </div>
    )
}

export default LoginPage
