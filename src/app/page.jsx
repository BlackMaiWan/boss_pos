"use client"

import Sidebar from "./components/sidebar";
import { useSession } from "next-auth/react";

export default function Home() {

  const { data: session } = useSession();

  return (
    <main>
      {/* <Navbar session={session}/> */}
      <Sidebar session={session}/>
      <div className="container ml-72 mt-10">
        <h3> Home Page </h3>
        <hr className="my-3" />
      </div>
    </main>
  );
}
