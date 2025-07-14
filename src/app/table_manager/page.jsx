// app/table-manager/page.jsx
'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Table from '../components/table';
import Sidebar from '../components/sidebar';
import { useSession } from 'next-auth/react';

const TableManager = () => {
    const session = useSession
    const router = useRouter();
    const [tables, setTables] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [newTableNumber, setNewTableNumber] = useState('');
    const [newTableCapacity, setNewTableCapacity] = useState(4); // State สำหรับความจุโต๊ะใหม่

    const fetchTables = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await fetch('/api/tables');
            if (!response.ok) {
                throw new Error('Failed to fetch tables');
            }
            const data = await response.json();

            const processedTables = data.map(dbTable => {
                let orderIdValue = null;
                if (dbTable && dbTable.currentOrderId) {
                    if (typeof dbTable.currentOrderId === 'object' && dbTable.currentOrderId._id) {
                        orderIdValue = dbTable.currentOrderId._id.toString();
                    } else {
                        orderIdValue = dbTable.currentOrderId.toString();
                    }
                }
                return {
                    _id: dbTable._id,
                    tableNumber: dbTable.tableNumber,
                    status: dbTable.status,
                    currentOrderId: orderIdValue,
                    capacity: dbTable.capacity,
                };
            });

            processedTables.sort((a, b) => a.tableNumber - b.tableNumber);
            setTables(processedTables);
        } catch (err) {
            console.error('Error fetching tables:', err);
            setError('ไม่สามารถโหลดสถานะโต๊ะได้ กรุณาลองใหม่');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchTables();

    }, [fetchTables]);

    // --- ฟังก์ชันเพิ่มโต๊ะ ---
    const handleAddTable = async () => {
        // 1. หาหมายเลขโต๊ะที่มากที่สุดในปัจจุบัน
        const maxTableNumber = tables.length > 0 ? Math.max(...tables.map(t => t.tableNumber)) : 0;
        const nextTableNumber = maxTableNumber + 1;

        try {
            const response = await fetch('/api/tables', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                // 2. ส่ง nextTableNumber ไปยัง API
                body: JSON.stringify({ tableNumber: nextTableNumber }),
            });
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to add table');
            }
            // 3. ถ้าเพิ่มสำเร็จ ให้ดึงข้อมูลโต๊ะใหม่ทั้งหมด
            await fetchTables();
            setError(null);
        } catch (err) {
            console.error('Error adding table:', err);
            setError(`ไม่สามารถเพิ่มโต๊ะได้: ${err.message}`);
        }
    };

    // --- ฟังก์ชันลบโต๊ะ ---
    const handleDeleteTable = async () => {
        // 1. ตรวจสอบว่ามีโต๊ะให้ลบหรือไม่
        if (tables.length === 0) {
            setError('ไม่มีโต๊ะให้ลบ');
            return;
        }

        // 2. หาหมายเลขโต๊ะที่มากที่สุด
        const tableNumberToDelete = Math.max(...tables.map(t => t.tableNumber));

        if (!confirm(`คุณแน่ใจหรือไม่ที่จะลบโต๊ะ ${tableNumberToDelete} ?`)) {
            return;
        }

        try {
            const response = await fetch(`/api/tables?tableNumber=${tableNumberToDelete}`, {
                method: 'DELETE',
            });
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to delete table');
            }
            // 3. ถ้าลบสำเร็จ ให้ดึงข้อมูลโต๊ะใหม่ทั้งหมด
            await fetchTables();
            setError(null);
        } catch (err) {
            console.error('Error deleting table:', err);
            setError(`ไม่สามารถลบโต๊ะได้: ${err.message}`);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-100">
                <p className="text-lg text-gray-700">กำลังโหลดสถานะโต๊ะ...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-100">
                <p className="text-red-500 text-lg">{error}</p>
            </div>
        );
    }

    return (
        <main>
            <Sidebar session={session} />
            <div className="main_container">
                <div>
                    {/* UI สำหรับเพิ่มโต๊ะ - ปรับเปลี่ยนให้ง่ายขึ้น */}
                    <button
                        onClick={handleAddTable}
                        className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                    >
                        เพิ่มโต๊ะ
                    </button>

                    <button
                        onClick={handleDeleteTable}
                        className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
                    >
                        ลบโต๊ะ
                    </button>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-8 max-w-5xl mx-auto">
                        {tables.map((table) => (
                            <Table
                                key={table.tableNumber}
                                tableNumber={table.tableNumber}
                            />
                        ))}
                    </div>
                </div>

            </div>
        </main>
    );
};

export default TableManager;