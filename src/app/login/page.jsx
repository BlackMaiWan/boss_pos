"use client"

import React, { useState } from 'react'
import { signIn } from 'next-auth/react'
import { redirect } from 'next/navigation';
import { useSession } from 'next-auth/react'

function LoginPage() {

    const [uid, setUID] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");


    const { data: session } = useSession();
    if (session) redirect("/tables")

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

            redirect("/tables")
        } catch (error) {
            console.log(error)
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100">

            {/* 2. กล่อง Login Card */}
            <div className="bg-white p-8 rounded-xl shadow-2xl w-full max-w-sm">

                {/* 3. Header/Title */}
                <h2 className="text-2xl font-bold text-center mb-6 text-gray-800">Login</h2>

                {/* 4. Form/Inputs */}
                <form
                    onSubmit={handleSubmit} // ใส่ฟังก์ชัน handleSubmit ของคุณ
                    className="space-y-4"
                >
                    <div>
                        <label htmlFor="uid" className="block text-sm font-medium text-gray-700">UID</label>
                        <input
                            type="text"
                            id="uid"
                            placeholder="UID"
                            value={uid} // ใส่ value และ onChange ของคุณ
                            onChange={(e) => setUID(e.target.value)} 
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500"
                        />
                    </div>
                    <div>
                        <label htmlFor="password" className="block text-sm font-medium text-gray-700">Password</label>
                        <input
                            type="password"
                            id="password"
                            placeholder="Password"
                            value={password} // ใส่ value และ onChange ของคุณ
                            onChange={(e) => setPassword(e.target.value)} 
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500"
                        />
                    </div>

                    <button
                        type="submit"
                        className="w-full bg-black hover:bg-gray-700 text-white font-bold py-2 px-4 rounded-md transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-opacity-50"
                    >
                        Sign In
                    </button>
                </form>

                {/* 5. Link ไปหน้า Register (ถ้ามี) */}
                <p className="mt-6 text-center text-sm text-gray-600">
                    ยังไม่มีบัญชี?{' '}
                    <a href="/register" className="font-medium text-green-600 hover:text-green-500">
                        Sign Up
                    </a>
                </p>

            </div>
        </div>
    )
}

export default LoginPage
