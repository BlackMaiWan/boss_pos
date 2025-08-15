'use client';

import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import TicketFormModal from './_components/TicketFormModal'; // เราจะสร้างไฟล์นี้ในขั้นตอนถัดไป
import SellTicketModal from './_components/SellTicketModal'; // เราจะสร้างไฟล์นี้ในขั้นตอนถัดไป
import Sidebar from '../components/sidebar';

const TicketsPage = () => {
    const { data: session, status } = useSession();
    const router = useRouter();

    const [tickets, setTickets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const [showAddModal, setShowAddModal] = useState(false);
    const [showSellModal, setShowSellModal] = useState(false);
    const [selectedTicket, setSelectedTicket] = useState(null);

    const fetchTickets = async () => {
        try {
            const response = await fetch('/api/tickets');
            if (!response.ok) {
                throw new Error('Failed to fetch tickets');
            }
            const data = await response.json();
            const today = new Date().toISOString().split('T')[0];
            const activeTickets = data.filter(ticket => new Date(ticket.concert_date).toISOString().split('T')[0] >= today);
            setTickets(activeTickets);
        } catch (err) {
            setError('ไม่สามารถโหลดข้อมูลตั๋วได้');
            console.error('Error fetching tickets:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (status === 'loading') {
            return;
        }
        if (!session || (session.user.role !== 'Owner' && session.user.role !== 'Admin')) {
            router.push('/');
            return;
        }
        fetchTickets();
    }, [session, status, router]);

    if (status === 'loading' || loading) {
        return <div className="p-4">Loading...</div>;
    }

    if (error) {
        return <div className="p-4 text-red-500">{error}</div>;
    }

    return (
        <main>
            <Sidebar session={session} />
            <div className="container mx-auto p-4">
                <h1 className="text-2xl font-bold mb-4">การจัดการตั๋วคอนเสิร์ต</h1>
                <div className="flex justify-end mb-4">
                    <button
                        onClick={() => setShowAddModal(true)}
                        className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                    >
                        เพิ่มตั๋วคอนเสิร์ต
                    </button>
                </div>

                <div className="overflow-x-auto">
                    <table className="min-w-full bg-white">
                        <thead>
                            <tr>
                                <th className="py-2 px-4 border-b text-left">ชื่อคอนเสิร์ต</th>
                                <th className="py-2 px-4 border-b text-left">วันที่จัด</th>
                                <th className="py-2 px-4 border-b text-left">ราคาตั๋ว</th>
                                <th className="py-2 px-4 border-b text-left">จำนวนคงเหลือ</th>
                                <th className="py-2 px-4 border-b text-left">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {tickets.map((ticket) => (
                                <tr key={ticket._id}>
                                    <td className="py-2 px-4 border-b">{ticket.concert_name}</td>
                                    <td className="py-2 px-4 border-b">{new Date(ticket.concert_date).toLocaleDateString()}</td>
                                    <td className="py-2 px-4 border-b">{ticket.ticket_price}</td>
                                    <td className="py-2 px-4 border-b">{ticket.quantity}</td>
                                    <td className="py-2 px-4 border-b">
                                        <button
                                            onClick={() => {
                                                setSelectedTicket(ticket);
                                                setShowSellModal(true);
                                            }}
                                            className="bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600 disabled:bg-gray-400"
                                            disabled={ticket.quantity <= 0}
                                        >
                                            ขายตั๋ว
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Modal for adding new tickets */}
                {showAddModal && (
                    <TicketFormModal
                        onClose={() => setShowAddModal(false)}
                        onSuccess={fetchTickets}
                    />
                )}

                {/* Modal for selling a ticket */}
                {showSellModal && selectedTicket && (
                    <SellTicketModal
                        ticket={selectedTicket}
                        onClose={() => {
                            setShowSellModal(false);
                            setSelectedTicket(null);
                        }}
                        onSuccess={fetchTickets}
                    />
                )}
            </div>
        </main>
    );
};

export default TicketsPage;