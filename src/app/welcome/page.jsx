// "use client"

// import React from 'react'
// import { useSession } from 'next-auth/react'
// import { redirect } from 'next/navigation'
// import Sidebar from '../components/sidebar'

// function WelcomePage() {

//     const { data: session } = useSession();
//     console.log(session);
    
//     if(!session) redirect("/login");

//   return (
//     <div>
//       {/* <Navbar session={session} /> */}
//       <div>
//         <Sidebar session={session}/>
//       </div>
//       <div className='container mx-auto flex-1 p-4 ml-64'>
//         <h3 className='text-3xl my-3'>Welcome {session?.user?.name}!</h3>
//         <p>UID: {session?.user?.uid}</p>
//         <hr className='my-3' />
//         <p>Welcome to the Boss POS System!</p>
//       </div>
//     </div>
//   )
// }

// export default WelcomePage
