'use client'; // ต้องเพิ่มบรรทัดนี้สำหรับ Client Component

import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation'; // App Router ใช้ 'next/navigation'
import Sidebar from '../components/sidebar';

const UserPage = () => {
    const { data: session, status } = useSession();
    const router = useRouter();

    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isUpdating, setIsUpdating] = useState(false);
    const [newPassword, setNewPassword] = useState('');
    const [targetUid, setTargetUid] = useState(null);

    useEffect(() => {
        // 1. ตรวจสอบสถานะการโหลดและ Session
        if (status === 'loading') {
            return;
        }

        // // 2. ตรวจสอบสิทธิ์การเข้าถึง
        // if (!session || (session.user.role !== 'Owner' && session.user.role !== 'Admin')) {
        //   router.push('/');
        //   return;
        // }

        // 3. ดึงข้อมูลผู้ใช้เมื่อมีสิทธิ์
        const fetchUsers = async () => {
            try {
                const response = await fetch('/api/user');
                if (!response.ok) {
                    throw new Error('Failed to fetch user data');
                }
                const data = await response.json();
                setUsers(data);
            } catch (err) {
                setError('ไม่สามารถโหลดข้อมูลผู้ใช้ได้');
                console.error('Error fetching users:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchUsers();
    }, [session, status, router]);

    const handleResetPassword = async (uid) => {
        if (!newPassword) {
            alert('กรุณาใส่รหัสผ่านใหม่');
            return;
        }

        if (!confirm(`คุณแน่ใจหรือไม่ที่จะรีเซ็ตรหัสผ่านของ UID: ${uid}?`)) {
            return;
        }

        try {
            setIsUpdating(true);
            const response = await fetch('/api/user/updatePassword', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ uid, newPassword }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to reset password');
            }

            alert(`รีเซ็ตรหัสผ่านของ UID: ${uid} สำเร็จ`);
            setTargetUid(null); // ปิด modal
            setNewPassword(''); // ล้างรหัสผ่านใหม่
        } catch (err) {
            console.error('Error resetting password:', err);
            setError(`ไม่สามารถรีเซ็ตรหัสผ่านได้: ${err.message}`);
        } finally {
            setIsUpdating(false);
        }
    };

    if (status === 'loading' || loading) {
        return <div>Loading...</div>;
    }

    return (
        <main>
            <Sidebar session={session} />
            <div className="main_container">
                <h1 className="text-2xl font-bold mb-4">Users</h1>
                {error && <div className="text-red-500 mb-4">{error}</div>}
                <div className="overflow-x-auto">
                    <table className="min-w-full bg-white">
                        <thead>
                            <tr>
                                <th className="py-2 px-4 border-b text-left">UID</th>
                                <th className="py-2 px-4 border-b text-left">Name</th>
                                <th className="py-2 px-4 border-b text-left">Surname</th>
                                <th className="py-2 px-4 border-b text-left">Role</th>
                                <th className="py-2 px-4 border-b text-left">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {users.map((user) => (
                                <tr key={user.uid}>
                                    <td className="py-2 px-4 border-b">{user.uid}</td>
                                    <td className="py-2 px-4 border-b">{user.name}</td>
                                    <td className="py-2 px-4 border-b">{user.surname}</td>
                                    <td className="py-2 px-4 border-b">{user.role}</td>
                                    <td className="py-2 px-4 border-b">
                                        <button
                                            onClick={() => setTargetUid(user.uid)}
                                            className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 disabled:bg-gray-400"
                                            disabled={isUpdating}
                                        >
                                            Reset Password
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                {targetUid && (
                    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex justify-center items-center">
                        <div className="bg-white p-6 rounded-lg shadow-xl">
                            <h3 className="text-lg font-bold mb-4">Reset Password for UID: {targetUid}</h3>
                            <input
                                type="password"
                                className="w-full p-2 border rounded mb-4"
                                placeholder="Enter new password"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                            />
                            <div className="flex justify-end space-x-2">
                                <button
                                    onClick={() => handleResetPassword(targetUid)}
                                    className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:bg-gray-400"
                                    disabled={isUpdating}
                                >
                                    {isUpdating ? 'Updating...' : 'Confirm Reset'}
                                </button>
                                <button
                                    onClick={() => { setTargetUid(null); setNewPassword(''); }}
                                    className="bg-gray-300 text-black px-4 py-2 rounded hover:bg-gray-400"
                                    disabled={isUpdating}
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </main>
    );
};

export default UserPage;