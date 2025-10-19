"use client"

import React from 'react'
import { useSession } from 'next-auth/react'
import { redirect } from 'next/navigation'
import Sidebar from '../app/components/sidebar'

export default function Home() {

  const { data: session } = useSession();
  console.log(session);

  if (!session) redirect("/login");

  return (
    <div>
      <div>
        <Sidebar session={session} />
      </div>
      <div className='container mx-auto flex-1 p-4 ml-64'>
        <h3 className='text-3xl my-3'>Welcome {session?.user?.name}!</h3>
        <hr className='my-3' />
        <p>Welcome to the Boss POS System!</p>
      </div>
    </div>
  )

}
