'use client';

import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import AddCustomerWithDepositModal from './_components/AddCustomerWithDepositModal';
import AddDepositModal from './_components/AddDepositModal';
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
        fetchCustomers();
    }, [status, router]);

    const handleWithdraw = async (customerId, itemId) => {
        // เพิ่มการตรวจสอบค่าที่นี่
        if (!confirm("คุณแน่ใจหรือไม่ที่จะรับรายการนี้?")) {
            return;
        }

        console.log(`Attempting to withdraw. Customer ID: ${customerId}, Item ID: ${itemId}`);

        if (!customerId || !itemId) {
            console.error("Error: Missing Customer ID or Item ID.");
            alert("ไม่พบข้อมูลลูกค้าหรือรายการที่ต้องการรับ กรุณาลองอีกครั้ง");
            return;
        }

        try {
            const response = await fetch(`/api/customers/${customerId}/withdraw`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ itemId: itemId }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || "Failed to withdraw item.");
            }

            alert("รับของเรียบร้อยแล้ว!");
            fetchCustomers(); // โหลดข้อมูลลูกค้าใหม่
        } catch (error) {
            console.error("Error during withdrawal:", error);
            alert(error.message);
        }

    };

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
                                <th className="py-2 px-4 border-b text-left">รายการฝาก</th>
                                <th className="py-2 px-4 border-b text-left">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {customers.map((customer) => (
                                <tr key={customer._id}>
                                    <td className="py-2 px-4 border-b">{customer.customer_name}</td>
                                    <td className="py-2 px-4 border-b">{customer.customer_phone}</td>
                                    <td className="py-3 px-6 text-left">
                                        {customer.drink_deposits && customer.drink_deposits.map((drink, index) => (
                                            <div key={index} className="flex justify-between items-center py-1">
                                                <span className="text-gray-700">
                                                    - {drink.item_name} (
                                                    {/* 💡 FIX 3: ตรวจสอบและแสดงผลวันที่ฝากอย่างถูกต้อง */}
                                                    {drink.deposit_date
                                                        ? new Date(drink.deposit_date).toLocaleDateString('th-TH', {
                                                            year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
                                                        })
                                                        : 'ไม่ระบุวันที่'
                                                    }
                                                    )
                                                </span>
                                                {/* เพิ่มการตรวจสอบก่อนเรียก onClick */}
                                                {(customer._id && drink._id) && ( // drink._id คือ _id ของ subdocument
                                                    <button
                                                        onClick={() => handleWithdraw(customer._id, drink._id)}
                                                        className="ml-2 bg-red-500 hover:bg-red-600 text-white text-xs font-bold py-1 px-2 rounded transition-colors duration-200"
                                                    >
                                                        รับของ
                                                    </button>
                                                )}
                                            </div>
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