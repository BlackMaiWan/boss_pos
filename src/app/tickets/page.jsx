'use client';

import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import TicketFormModal from './_components/TicketFormModal';
import Sidebar from '../components/sidebar';

const TicketsPage = () => {
    const { data: session, status } = useSession();
    const router = useRouter();

    const [tickets, setTickets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const [showAddModal, setShowAddModal] = useState(false);
    
    // State ใหม่สำหรับการจัดการรายการที่เลือก
    const [selectedItems, setSelectedItems] = useState([]);
    const [total, setTotal] = useState(0);

    const fetchTickets = async () => {
        try {
            const response = await fetch('/api/tickets');
            if (!response.ok) {
                throw new Error('Failed to fetch tickets');
            }
            const data = await response.json();
            
            // แก้ไขส่วนนี้: กรองข้อมูลที่ concert_date มีค่า
            const today = new Date().toISOString().split('T')[0];
            const activeTickets = data.filter(ticket => ticket.concert_date && new Date(ticket.concert_date).toISOString().split('T')[0] >= today);
            
            setTickets(activeTickets);
        } catch (err) {
            setError('ไม่สามารถโหลดข้อมูลตั๋วได้');
            console.error('Error fetching tickets:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (status === 'authenticated') {
            fetchTickets();
        }
    }, [status]);
    
    useEffect(() => {
        const newTotal = selectedItems.reduce((sum, item) => sum + (item.ticket_price * item.quantity), 0);
        setTotal(newTotal);
    }, [selectedItems]);
    
    const handleAddItem = (ticket) => {
        setSelectedItems(prevItems => {
            const itemExists = prevItems.find(item => item._id === ticket._id);
            if (itemExists) {
                if (itemExists.quantity >= ticket.quantity) {
                    alert('ไม่สามารถเพิ่มได้อีก ตั๋วมีจำนวนไม่พอ');
                    return prevItems;
                }
                return prevItems.map(item =>
                    item._id === ticket._id ? { ...item, quantity: item.quantity + 1 } : item
                );
            } else {
                return [
                    ...prevItems,
                    {
                        ...ticket,
                        quantity: 1,
                    }
                ];
            }
        });
    };

    const handleRemoveItem = (ticketId) => {
        setSelectedItems(prevItems => prevItems.filter(item => item._id !== ticketId));
    };

    const handleCreateOrder = async () => {
        if (selectedItems.length === 0) {
            alert('กรุณาเลือกตั๋วก่อน');
            return;
        }

        try {
            const response = await fetch('/api/orders', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    items: selectedItems.map(item => ({
                        item_id: item._id,
                        item_name: item.concert_name,
                        price: item.ticket_price,
                        quantity: item.quantity,
                        subtotal: item.ticket_price * item.ticket_quantity,
                        item_type: 'Ticket'
                    })),
                    total_amount: total,
                })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to create order');
            }

            const data = await response.json();
            const orderId = data.orderId;
            router.push(`/checkout?orderId=${orderId}`); 
            
        } catch (err) {
            console.error('Order creation error:', err);
            alert(`ข้อผิดพลาด: ${err.message}`);
        }
    };

    if (status === 'loading' || loading) {
        return <div className="p-4">กำลังโหลด...</div>;
    }

    return (
        <main>
            <Sidebar session={session}/>
            <div className="main_container">
                <div className="flex justify-between items-center mb-4">
                    <h1 className="text-2xl font-bold">จัดการตั๋ว</h1>
                    <button
                        onClick={() => setShowAddModal(true)}
                        className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                    >
                        เพิ่มตั๋วใหม่
                    </button>
                </div>
                {error && <div className="text-red-500 mb-4">{error}</div>}
                
                <div className="bg-white shadow-md rounded-lg p-4 mb-8">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ชื่อคอนเสิร์ต</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">วันที่</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ราคา</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">จำนวนคงเหลือ</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"></th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {tickets.map((ticket) => (
                                <tr key={ticket._id}>
                                    <td className="px-6 py-4 whitespace-nowrap">{ticket.concert_name}</td>
                                    {/* แก้ไขส่วนนี้: เพิ่มเงื่อนไขตรวจสอบก่อนแสดงผล */}
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        {ticket.concert_date ? `${new Date(ticket.concert_date).toLocaleDateString()}` : 'ไม่ระบุ'}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">{ticket.ticket_price}</td>
                                    <td className="px-6 py-4 whitespace-nowrap">{ticket.quantity}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <button
                                            onClick={() => handleAddItem(ticket)}
                                            className="bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600 disabled:bg-gray-400"
                                            disabled={ticket.quantity <= 0}
                                        >
                                            เพิ่มลงตะกร้า
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                <div className="bg-white shadow-md rounded-lg p-4">
                    <h2 className="text-xl font-bold mb-4">รายการที่เลือก</h2>
                    <ul>
                        {selectedItems.length > 0 ? (
                            selectedItems.map((item) => (
                                <li key={item._id} className="flex justify-between items-center mb-2">
                                    <span>{item.concert_name} x {item.quantity}</span>
                                    <button onClick={() => handleRemoveItem(item._id)} className="text-red-500 ml-4">ลบ</button>
                                </li>
                            ))
                        ) : (
                            <p>ไม่มีรายการที่เลือก</p>
                        )}
                    </ul>
                    <div className="mt-4 border-t pt-4">
                        <div className="flex justify-between font-bold text-lg">
                            <span>ยอดรวมทั้งหมด:</span>
                            <span>{total} บาท</span>
                        </div>
                    </div>
                    <button
                        onClick={handleCreateOrder}
                        className="w-full bg-blue-500 text-white py-2 rounded mt-4 hover:bg-blue-600 disabled:bg-gray-400"
                        disabled={selectedItems.length === 0}
                    >
                        ไปหน้าชำระเงิน
                    </button>
                </div>

                {showAddModal && (
                    <TicketFormModal
                        onClose={() => setShowAddModal(false)}
                        onSuccess={fetchTickets}
                    />
                )}
            </div>
        </main>
    );
};

export default TicketsPage;