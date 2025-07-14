// app/table-manager/page.jsx
'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Table from '../components/table';
import Sidebar from '../components/sidebar';
import { useSession } from 'next-auth/react';

const Tables = () => {
    const session = useSession
    const router = useRouter();
    const [tables, setTables] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

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

    const handleOpenTable = async (tableNumber) => {
        try {
            const response = await fetch(`/api/tables/${tableNumber}/open`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || `Failed to open table ${tableNumber}`);
            }

            const data = await response.json();
            if (!data.orderId) { // <--- ตรวจสอบว่ามี orderId กลับมา
                throw new Error('No orderId received from backend');
            }

            setTables((prevTables) =>
                prevTables.map((table) =>
                    table.tableNumber === tableNumber
                        ? {
                            ...table,
                            status: 'in-use',
                            currentOrderId: data.orderId, // <-- เก็บ orderId ที่ได้จาก Backend
                        }
                        : table
                )
            );

            alert(`โต๊ะที่ ${tableNumber} เปิดแล้ว! Order ID: ${data.orderId}`);
            router.push(`/order/${data.orderId}`);

        } catch (error) {
            console.error('Error opening table:', error);
            alert(`เกิดข้อผิดพลาดในการเปิดโต๊ะที่ ${tableNumber}: ${error.message}`);
        }
    };

    const handleOrderFood = (tableNumber) => {
        const table = tables.find(t => t.tableNumber === tableNumber);
        if (table && table.currentOrderId) {
            router.push(`/order/${table.currentOrderId}`); // <--- ส่ง orderId ไปยังหน้าสั่งอาหาร
        } else {
            alert('โต๊ะยังไม่มี Order ID หรือยังไม่ได้เปิด กรุณาเปิดโต๊ะก่อน');
        }
    };

    const handleViewOrder = (tableNumber) => {
        const table = tables.find(t => t.tableNumber === tableNumber);
        if (table && table.currentOrderId) {
            router.push(`/order/${table.currentOrderId}?viewOnly=true`); // อาจจะเพิ่ม query param สำหรับดูอย่างเดียว
        } else {
            alert('โต๊ะยังไม่มี Order ID ที่ใช้งานอยู่');
        }
    };

    const handleCheckout = async (tableNumber) => {
        const table = tables.find(t => t.tableNumber === tableNumber);
        if (!table || !table.currentOrderId) {
            alert('โต๊ะยังไม่มี Order ID ที่ใช้งานอยู่');
            return;
        }

        if (!confirm(`ต้องการชำระเงินสำหรับโต๊ะที่ ${tableNumber} (Order ID: ${table.currentOrderId}) ใช่หรือไม่?`)) {
            return;
        }

        try {
            const response = await fetch(`/api/orders/${table.currentOrderId}/checkout`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to checkout table');
            }

            setTables((prevTables) =>
                prevTables.map((t) =>
                    t.tableNumber === tableNumber
                        ? { ...t, status: 'available', currentOrderId: null }
                        : t
                )
            );
            alert(`โต๊ะที่ ${tableNumber} ชำระเงินเรียบร้อยแล้ว!`);
        } catch (error) {
            console.error('Error during checkout:', error);
            alert(`เกิดข้อผิดพลาดในการชำระเงินโต๊ะที่ ${tableNumber}: ${error.message}`);
        }
    };

    const onCloseTable = async (tableNumber) => {
        const table = tables.find(t => t.tableNumber === tableNumber);
        if (table && table.currentOrderId && table.status === 'in-use') {
            alert('กรุณาชำระเงินก่อนปิดโต๊ะ');
            return;
        }

        if (!confirm(`คุณแน่ใจหรือไม่ที่จะปิดโต๊ะที่ ${tableNumber}?`)) {
            return;
        }

        try {
            // หากไม่มี Order ที่เกี่ยวข้อง ก็แค่เปลี่ยนสถานะโต๊ะใน DB
            const response = await fetch(`/api/tables/${tableNumber}/status`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: 'available' }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to close table');
            }

            setTables((prevTables) =>
                prevTables.map((t) =>
                    t.tableNumber === tableNumber
                        ? { ...t, status: 'available', currentOrderId: null }
                        : t
                )
            );
            alert(`โต๊ะที่ ${tableNumber} ถูกปิดแล้ว`);
        } catch (error) {
            console.error('Error closing table:', error);
            alert(`เกิดข้อผิดพลาดในการปิดโต๊ะที่ ${tableNumber}: ${error.message}`);
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
                <h1 className="text-4xl font-bold text-center mb-10 text-gray-800">Table Management</h1>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-8 max-w-5xl mx-auto">
                    {tables.map((table) => (
                        <Table
                            key={table.tableNumber}
                            tableNumber={table.tableNumber}
                            initialStatus={table.status}
                            initialOrderId={table.currentOrderId}
                            onOpenTable={handleOpenTable}
                            onOrderFood={handleOrderFood}
                            onViewOrder={handleViewOrder}
                            onCheckout={handleCheckout}
                            onCloseTable={onCloseTable}
                        />
                    ))}
                </div>
            </div>
        </main>
    );
};

export default Tables;