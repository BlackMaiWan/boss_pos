// app/tables/page.jsx (แก้ไข)
'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Table from '../components/table';
import Sidebar from '../components/sidebar';
import { useSession } from 'next-auth/react';

const Tables = () => {
    const { data: session, status } = useSession();
    const router = useRouter();
    const [tables, setTables] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedZone, setSelectedZone] = useState('All');
    const [zones, setZones] = useState(['All']);

    // 💡 NEW HELPER FUNCTION: แยกชื่อโต๊ะ (เช่น 'A1' -> { zone: 'A', tableNumber: 1 })
    const parseTableName = (fullTableName) => {
        const zoneMatch = fullTableName.match(/[a-zA-Z]+/);
        const numMatch = fullTableName.match(/\d+/);
        
        return {
            zone: zoneMatch ? zoneMatch[0] : null,
            tableNumber: numMatch ? Number(numMatch[0]) : null,
        };
    };

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
                    zone: dbTable.zone || 'A',
                    name: (dbTable.zone || 'A') + dbTable.tableNumber, // ชื่อโต๊ะ A1, B2, ฯลฯ
                };
            });

            const uniqueZones = [...new Set(processedTables.map(t => t.zone))].filter(z => z);
            setZones(['All', ...uniqueZones.sort()]);

            processedTables.sort((a, b) => {
                if (a.zone < b.zone) return -1;
                if (a.zone > b.zone) return 1;
                return a.tableNumber - b.tableNumber;
            });

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

    const filteredTables = tables.filter(table =>
        selectedZone === 'All' || table.zone === selectedZone
    );

    // --- 1. HANDLE OPEN TABLE (ปรับปรุงการอัปเดต State) ---
    const handleOpenTable = async (fullTableName) => {
        const { zone, tableNumber } = parseTableName(fullTableName); // A1 -> A, 1

        try {
            const response = await fetch(`/api/tables/${tableNumber}/open`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ zone: zone }), // ส่ง zone ใน Body
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || `Failed to open table ${fullTableName}`);
            }

            const data = await response.json();
            if (!data.orderId) { 
                throw new Error('No orderId received from backend');
            }

            // FIX: อัปเดต State โดยใช้ table.name (ชื่อเต็ม A1, B2) เพื่อระบุโต๊ะอย่างแม่นยำ
            setTables((prevTables) =>
                prevTables.map((table) =>
                    table.name === fullTableName // <--- ใช้ table.name
                        ? {
                            ...table,
                            status: 'in-use',
                            currentOrderId: data.orderId,
                        }
                        : table
                )
            );

            alert(`โต๊ะที่ ${fullTableName} เปิดแล้ว! Order ID: ${data.orderId}`);
            router.push(`/order/${data.orderId}`);

        } catch (error) {
            console.error('Error opening table:', error);
            alert(`เกิดข้อผิดพลาดในการเปิดโต๊ะที่ ${fullTableName}: ${error.message}`);
        }
    };

    // --- 2. HANDLE ORDER FOOD (ปรับปรุงการค้นหา) ---
    const handleOrderFood = (fullTableName) => {
        // FIX: ค้นหาโต๊ะโดยใช้ table.name (ชื่อเต็ม A1, B2)
        const table = tables.find(t => t.name === fullTableName); 
        if (table && table.currentOrderId) {
            router.push(`/order/${table.currentOrderId}`);
        } else {
            alert('โต๊ะยังไม่มี Order ID หรือยังไม่ได้เปิด กรุณาเปิดโต๊ะก่อน');
        }
    };

    // --- 3. HANDLE VIEW ORDER (ปรับปรุงการค้นหา) ---
    const handleViewOrder = (fullTableName) => {
        // FIX: ค้นหาโต๊ะโดยใช้ table.name (ชื่อเต็ม A1, B2)
        const table = tables.find(t => t.name === fullTableName); 
        if (table && table.currentOrderId) {
            router.push(`/order/${table.currentOrderId}?viewOnly=true`);
        } else {
            alert('โต๊ะยังไม่มี Order ID ที่ใช้งานอยู่');
        }
    };

    // --- 4. HANDLE CHECKOUT (ปรับปรุงการค้นหา) ---
    const handleCheckout = (fullTableName) => { 
        // FIX: ค้นหาโต๊ะโดยใช้ table.name (ชื่อเต็ม A1, B2)
        const table = tables.find(t => t.name === fullTableName); 
        if (!table || !table.currentOrderId) {
            alert('โต๊ะยังไม่มี Order ID ที่ใช้งานอยู่');
            return;
        }

        router.push(`/checkout?orderId=${table.currentOrderId}`);
    };

    // --- 5. ON CLOSE TABLE (ปรับปรุงการส่งข้อมูลและอัปเดต State) ---
    const onCloseTable = async (fullTableName) => {
        // FIX: ใช้ fullTableName ในการค้นหา
        const table = tables.find(t => t.name === fullTableName); 
        
        if (table && table.currentOrderId && table.status === 'in-use') {
            alert('กรุณาชำระเงินก่อนปิดโต๊ะ');
            return;
        }
        
        const { zone, tableNumber } = parseTableName(fullTableName); // A1 -> A, 1
        
        if (!confirm(`คุณแน่ใจหรือไม่ที่จะปิดโต๊ะที่ ${fullTableName}?`)) {
            return;
        }

        try {
            // FIX: API ต้องรับ zone เข้าไปเพื่อระบุโต๊ะอย่างแม่นยำ
            const response = await fetch(`/api/tables/${tableNumber}/close`, { 
                method: 'POST', // สมมติว่า close API ใช้ POST
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: 'available', zone: zone }), // ส่ง zone ไปด้วย
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || `Failed to close table ${fullTableName}`);
            }

            // FIX: อัปเดต State โดยใช้ table.name (ชื่อเต็ม A1, B2)
            setTables((prevTables) =>
                prevTables.map((t) =>
                    t.name === fullTableName // <--- ใช้ t.name
                        ? { ...t, status: 'available', currentOrderId: null }
                        : t
                )
            );
            alert(`โต๊ะที่ ${fullTableName} ถูกปิดแล้ว`);
        } catch (error) {
            console.error('Error closing table:', error);
            alert(`เกิดข้อผิดพลาดในการปิดโต๊ะที่ ${fullTableName}: ${error.message}`);
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
            <div className="main_container p-6">
                <h1 className="text-3xl font-bold mb-6 text-gray-800">รายการโต๊ะ</h1>

                {/* UI สำหรับเลือก Zone */}
                <div className="mb-6 flex space-x-3 items-center">
                    <label className="text-lg font-semibold text-gray-700">กรองตาม Zone:</label>
                    {zones.map(zone => (
                        <button
                            key={zone}
                            onClick={() => setSelectedZone(zone)}
                            className={`px-4 py-2 rounded-lg font-semibold transition-colors duration-200 
                                ${selectedZone === zone
                                    ? 'bg-purple-600 text-white shadow-md'
                                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`
                            }
                        >
                            {zone === 'All' ? 'ทั้งหมด' : `Zone ${zone}`}
                        </button>
                    ))}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8 max-w-7xl mx-auto">
                    {filteredTables.map((table) => (
                        <Table
                            key={table._id}
                            tableNumber={table.name} // ส่งชื่อโต๊ะ A1, B2 ไปแสดงผล
                            initialStatus={table.status}
                            initialOrderId={table.currentOrderId}
                            capacity={table.capacity}
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