// app/table-manager/page.jsx
'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Table from '../components/table';
import Sidebar from '../components/sidebar';
import { useSession } from 'next-auth/react';

const TableManager = () => {
    const { data: session } = useSession();
    const router = useRouter();
    const [tables, setTables] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedZone, setSelectedZone] = useState('A'); // Zone ที่กำลังจะเพิ่ม/ลบ
    const [zones, setZones] = useState(['A']); // รายการ Zones ทั้งหมด (ควรดึงจาก API จริง)

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
                    } else if (dbTable.currentOrderId.toString) {
                        orderIdValue = dbTable.currentOrderId.toString();
                    }
                }
                return {
                    _id: dbTable._id,
                    tableNumber: dbTable.tableNumber,
                    status: dbTable.status,
                    currentOrderId: orderIdValue,
                    capacity: dbTable.capacity,
                    zone: dbTable.zone || 'A', // NEW: ดึง Zone มาด้วย
                    name: (dbTable.zone || 'A') + dbTable.tableNumber, // NEW: สร้างชื่อโต๊ะ A1, B2, ฯลฯ
                };
            });

            const uniqueZones = [...new Set(processedTables.map(t => t.zone))].filter(z => z);
            setZones(['A', ...uniqueZones.filter(z => z !== 'A')].sort()); // จัดเรียงและกำหนด A เป็นค่าเริ่มต้น

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

    // ฟังก์ชันหาหมายเลขโต๊ะถัดไปสำหรับ Zone ที่เลือก
    const getNextTableNumber = (zone) => {
        const tablesInZone = tables.filter(t => t.zone === zone);
        if (tablesInZone.length === 0) {
            return 1;
        }

        // 3. หาหมายเลขโต๊ะที่มากที่สุดใน Zone นั้น
        const maxTableNumber = Math.max(...tablesInZone.map(t => t.tableNumber));

        // 4. คืนค่าหมายเลขถัดไป
        return maxTableNumber + 1;
    };

    // --- ฟังก์ชันเพิ่มโต๊ะ ---
    const handleAddTable = async () => {
        if (!selectedZone || selectedZone.trim() === '') {
            setError('กรุณาเลือก Zone ก่อนเพิ่มโต๊ะ');
            return;
        }

        const nextTableNumber = getNextTableNumber(selectedZone);
        const payload = {
            tableNumber: nextTableNumber,
            zone: selectedZone, // ตรวจสอบว่า `selectedZone` มีค่า
            capacity: 4
        };

        // DEBUG LOG 1: แสดงข้อมูลที่กำลังจะส่ง
        console.log("Request Payload:", payload);

        try {
            const response = await fetch('/api/tables', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });

            if (!response.ok) {

                // DEBUG LOG 2: แสดง HTTP Status Code
                console.error("API Response Status:", response.status);

                // พยายามอ่าน Body ของ Error Response
                let errorData = {};
                const contentType = response.headers.get("content-type");

                if (contentType && contentType.includes("application/json")) {
                    errorData = await response.json();
                    // DEBUG LOG 3: แสดง Error Body ตัวเต็มจาก API
                    console.error("API Error Body (JSON):", errorData);
                } else {
                    // ถ้าไม่ใช่ JSON ก็ลองอ่านเป็นข้อความธรรมดา
                    const errorText = await response.text();
                    errorData.message = `API returned non-JSON error: ${errorText.substring(0, 100)}...`;
                    console.error("API Error Body (Text):", errorText);
                }

                // ใช้ข้อความ error จาก API ถ้ามี หรือใช้ข้อความสำรอง
                throw new Error(errorData.message || 'Failed to add table: Unknown Error or Empty Message');
            }

            await fetchTables();
            setError(null);
        } catch (err) {
            console.error('Error in handleAddTable:', err);
            setError(`ไม่สามารถเพิ่มโต๊ะได้: ${err.message}`);
        }
    };

    // --- ฟังก์ชันลบโต๊ะ ---
    const handleDeleteTable = async () => {
        const tablesInZone = tables.filter(t => t.zone === selectedZone);

        if (tablesInZone.length === 0) {
            setError(`ไม่มีโต๊ะใน Zone ${selectedZone} ให้ลบ`);
            return;
        }

        // หาหมายเลขโต๊ะที่มากที่สุดใน Zone นั้น
        const tableToDelete = tablesInZone.reduce((max, t) => (t.tableNumber > max.tableNumber ? t : max), tablesInZone[0]);
        const tableNumberToDelete = tablesInZone.length > 0 ? Math.max(...tablesInZone.map(t => t.tableNumber)) : null;
        const tableIdToDelete = tableToDelete._id;

        if (!confirm(`คุณแน่ใจหรือไม่ที่จะลบโต๊ะ ${selectedZone}${tableNumberToDelete} (ID: ${tableIdToDelete}) ?`)) {
            return;
        }

        try {
            // NEW: API ควรรับ _id หรือ tableNumber + zone เพื่อความแม่นยำ
            const response = await fetch(
                `/api/tables?tableNumber=${tableNumberToDelete}&zone=${selectedZone}`,
                {
                    method: 'DELETE',
                }
            );
            // ... (โค้ด error handling เดิม)
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to delete table');
            }
            await fetchTables();
            setError(null);
        } catch (err) {
            console.error('Error deleting table:', err);
            setError(`ไม่สามารถลบโต๊ะได้: ${err.message}`);
        }
    };

    // NEW: ฟังก์ชันเพิ่ม Zone
    const handleAddZone = () => {
        const newZoneName = prompt("กรุณาใส่ชื่อ Zone ใหม่ (เช่น D, VIP):");
        if (newZoneName && newZoneName.trim() && !zones.includes(newZoneName.trim().toUpperCase())) {
            setZones([...zones, newZoneName.trim().toUpperCase()].sort());
            setSelectedZone(newZoneName.trim().toUpperCase());
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
                <h1 className="text-3xl font-bold mb-8 text-gray-800">Table Manager: จัดการโต๊ะ</h1>

                {/* ---------------------------------- */}
                {/* NEW: UI สำหรับจัดการ Zone และเพิ่ม/ลบโต๊ะ */}
                {/* ---------------------------------- */}
                <div className="bg-white p-6 rounded-lg shadow-lg mb-8">
                    <h2 className="text-xl font-semibold mb-4 text-gray-700">จัดการ Zone และเพิ่ม/ลบโต๊ะ</h2>

                    <div className="flex flex-wrap gap-3 mb-6 items-center">
                        <label className="text-sm font-medium text-gray-700">Zone ปัจจุบัน:</label>
                        <select
                            value={selectedZone}
                            onChange={(e) => setSelectedZone(e.target.value)}
                            className="p-2 border rounded-md shadow-sm focus:ring-purple-500 focus:border-purple-500"
                        >
                            {zones.map(zone => (
                                <option key={zone} value={zone}>{zone}</option>
                            ))}
                        </select>
                        <button
                            onClick={handleAddZone}
                            className="bg-green-500 text-white px-3 py-1.5 rounded-md text-sm hover:bg-green-600 transition-colors"
                        >
                            + เพิ่ม Zone ใหม่
                        </button>
                    </div>

                    <div className="flex space-x-4">
                        <button
                            onClick={handleAddTable}
                            className="flex-1 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors font-semibold"
                        >
                            เพิ่มโต๊ะใหม่ใน Zone {selectedZone} (เป็น {selectedZone}{getNextTableNumber(selectedZone)})
                        </button>
                        <button
                            onClick={handleDeleteTable}
                            disabled={tables.filter(t => t.zone === selectedZone).length === 0}
                            className="flex-1 bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors font-semibold disabled:opacity-50"
                        >
                            ลบโต๊ะล่าสุดใน Zone {selectedZone} ({selectedZone}{getNextTableNumber(selectedZone) - 1 || 'N/A'})
                        </button>
                    </div>
                </div>

                {/* ---------------------------------- */}
                {/* NEW: แสดงผลรายการโต๊ะตาม Zone */}
                {/* ---------------------------------- */}
                <h2 className="text-3xl font-bold mb-6 mt-10 text-gray-800">รายการโต๊ะทั้งหมด</h2>

                {tables.length > 0 ? (
                    zones.filter(zone => tables.some(t => t.zone === zone)).map(zone => (
                        <div key={zone} className="mb-10">
                            <h3 className="text-2xl font-bold mb-4 border-b-2 pb-2 text-purple-700">Zone {zone}</h3>
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
                                {tables.filter(t => t.zone === zone).map((table) => (
                                    <div
                                        key={table._id}
                                        className="p-4 border rounded-lg text-center shadow hover:shadow-md transition-shadow cursor-pointer"
                                    >
                                        <p className="text-3xl font-extrabold text-gray-800 mb-2">{table.name}</p>
                                        <p className="text-lg text-gray-600">ความจุ: {table.capacity}</p>
                                        <p className={`font-semibold ${table.status === 'in-use' ? 'text-red-600' : 'text-green-600'}`}>
                                            ({table.status === 'in-use' ? 'ไม่ว่าง' : 'ว่าง'})
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))
                ) : (
                    <p className="text-gray-500">ยังไม่มีโต๊ะในระบบ</p>
                )}
            </div>
        </main>
    );
};

export default TableManager;