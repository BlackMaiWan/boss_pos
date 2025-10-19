// Sidebar.js
import React from 'react';
import { signOut } from 'next-auth/react'

const Sidebar = ({ session }) => {
    // กำหนดรายการ Role ที่มีสิทธิ์เข้าถึงหน้า Admin/Manager
    const authorizedRoles = ['Admin', 'Owner'];

    // ตรวจสอบว่าผู้ใช้มี Role ที่ได้รับอนุญาตหรือไม่
    const isAdminOrOwner = session && session.user && authorizedRoles.includes(session.user.role);

    // *สมมติว่าข้อมูล Role ถูกส่งมาใน session.user.role*

    return (
        <div className="flex">
            {/* Sidebar */}
            <div className="bg-[#3a322e] text-white fixed h-screen w-64 z-10">
                {/* Sidebar content */}
                <div className='flex flex-col h-full text-lg font-semibold'>
                    <div className="flex flex-col items-center flex-grow">
                        {/* Home Link */}
                        {/* <div className="mt-10">
                            <a href="/" className="text-white hover:text-gray-300">
                                Home
                            </a>
                        </div> */}

                        {session && (
                            <>
                                {/* Table Link (ทุกคนควรเข้าถึงได้เพื่อรับออร์เดอร์) */}
                                <div className="mt-10">
                                    <a href="tables" className="text-white hover:text-gray-300">
                                        Table
                                    </a>
                                </div>
                                
                                {/* ลิงก์ที่จำกัดสิทธิ์การเข้าถึง */}
                                {isAdminOrOwner && (
                                    <>
                                        {/* Table_manager (Manager/Admin/Owner only) */}
                                        <div className="mt-10">
                                            <a href="table_manager" className="text-white hover:text-gray-300">
                                                Table_manager
                                            </a>
                                        </div>

                                        {/* Inventory (Manager/Admin/Owner only) */}
                                        <div className="mt-10">
                                            <a href="menu-manager" className="text-white hover:text-gray-300">
                                                Inventory
                                            </a>
                                        </div>

                                        {/* user (Manager/Admin/Owner only) */}
                                        <div className="mt-10">
                                            <a href="user" className="text-white hover:text-gray-300">
                                                user
                                            </a>
                                        </div>
                                        
                                        {/* reports (Manager/Admin/Owner only) */}
                                        <div className="mt-10">
                                            <a href="reports" className="text-white hover:text-gray-300">
                                                reports
                                            </a>
                                        </div>
                                    </>
                                )}
                                
                                {/* customers Link (ทุกคนที่ Login แล้วควรเข้าถึงได้) */}
                                <div className="mt-10">
                                    <a href="customers" className="text-white hover:text-gray-300">
                                        customers
                                    </a>
                                </div>
                                
                                {/* tickets Link (ทุกคนที่ Login แล้วควรเข้าถึงได้) */}
                                <div className="mt-10">
                                    <a href="tickets" className="text-white hover:text-gray-300">
                                        tickets
                                    </a>
                                </div>
                            </>
                        )}
                    </div>

                    {/* Sign In/Sign Out Section */}
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
                            <div className="mb-4">
                                <button onClick={() => signOut({ callbackUrl: '/' })} className="text-white hover:text-gray-300">
                                    Sign Out
                                </button>
                                {/* แสดง Role ของผู้ใช้ (เป็นทางเลือก) */}
                                <p className="text-xs text-gray-400 mt-2">Role: {session.user.role}</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Sidebar;