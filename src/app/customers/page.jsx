'use client';

import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import AddCustomerWithDepositModal from './_components/AddCustomerWithDepositModal'; // เราจะสร้างไฟล์นี้ในขั้นตอนถัดไป
import AddDepositModal from './_components/AddDepositModal'; // เราจะสร้างไฟล์นี้ในขั้นตอนถัดไป
import Sidebar from '../components/sidebar';

const CustomersPage = () => {
    const { data: session, status } = useSession();
    const router = useRouter();

    const [customers, setCustomers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const [showAddCustomerModal, setShowAddCustomerModal] = useState(false);
    const [showAddDepositModal, setShowAddDepositModal] = useState(false);
    const [selectedCustomer, setSelectedCustomer] = useState(null);

    const fetchCustomers = async () => {
        try {
            const response = await fetch('/api/customers');
            if (!response.ok) {
                throw new Error('Failed to fetch customers');
            }
            const data = await response.json();
            setCustomers(data);
        } catch (err) {
            setError('ไม่สามารถโหลดข้อมูลลูกค้าได้');
            console.error('Error fetching customers:', err);
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
        fetchCustomers();
    }, [session, status, router]);

    if (status === 'loading' || loading) {
        return <div className="p-4">Loading...</div>;
    }

    if (error) {
        return <div className="p-4 text-red-500">{error}</div>;
    }

    return (
        <main>
            <Sidebar session={session}/>
            <div className="container mx-auto p-4">
                <h1 className="text-2xl font-bold mb-4">ข้อมูลลูกค้า</h1>
                <div className="flex justify-between mb-4">
                    <button
                        onClick={() => setShowAddCustomerModal(true)}
                        className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                    >
                        ฝากเครื่องดื่ม (ลูกค้าใหม่)
                    </button>
                </div>

                <div className="overflow-x-auto">
                    <table className="min-w-full bg-white">
                        <thead>
                            <tr>
                                <th className="py-2 px-4 border-b text-left">ชื่อลูกค้า</th>
                                <th className="py-2 px-4 border-b text-left">เบอร์โทรศัพท์</th>
                                <th className="py-2 px-4 border-b text-left">ตั๋วที่ซื้อ</th>
                                <th className="py-2 px-4 border-b text-left">รายการฝาก</th>
                                <th className="py-2 px-4 border-b text-left">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {customers.map((customer) => (
                                <tr key={customer._id}>
                                    <td className="py-2 px-4 border-b">{customer.customer_name}</td>
                                    <td className="py-2 px-4 border-b">{customer.customer_phone}</td>
                                    <td className="py-2 px-4 border-b">
                                        {customer.bought_tickets && customer.bought_tickets.map((ticket, index) => (
                                            <div key={index} className="text-sm">
                                                - {ticket.ticket_id.concert_name} ({ticket.quantity} ใบ)
                                            </div>
                                        ))}
                                    </td>
                                    <td className="py-2 px-4 border-b">
                                        {customer.drink_deposits && customer.drink_deposits.map((drink, index) => (
                                            <div key={index} className="text-sm">- {drink.item_name}</div>
                                        ))}
                                    </td>
                                    <td className="py-2 px-4 border-b">
                                        <button
                                            onClick={() => {
                                                setSelectedCustomer(customer);
                                                setShowAddDepositModal(true);
                                            }}
                                            className="bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600"
                                        >
                                            ฝากเพิ่ม
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Modal for adding new customer with deposit */}
                {showAddCustomerModal && (
                    <AddCustomerWithDepositModal
                        onClose={() => setShowAddCustomerModal(false)}
                        onSuccess={fetchCustomers}
                    />
                )}

                {/* Modal for adding deposit to an existing customer */}
                {showAddDepositModal && selectedCustomer && (
                    <AddDepositModal
                        customer={selectedCustomer}
                        onClose={() => {
                            setShowAddDepositModal(false);
                            setSelectedCustomer(null);
                        }}
                        onSuccess={fetchCustomers}
                    />
                )}
            </div>
        </main>
    );
};

export default CustomersPage;