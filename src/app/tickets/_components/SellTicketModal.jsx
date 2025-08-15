'use client';

import React, { useState } from 'react';

const SellTicketModal = ({ ticket, onClose, onSuccess }) => {
    const [customerInfo, setCustomerInfo] = useState({
        customer_name: '',
        customer_phone: '',
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const handleChange = (e) => {
        setCustomerInfo({ ...customerInfo, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const response = await fetch('/api/tickets/sell', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ticket_id: ticket._id,
                    ...customerInfo,
                }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to sell ticket');
            }

            alert('ขายตั๋วสำเร็จ');
            onSuccess(); // ดึงข้อมูลตั๋วใหม่เพื่ออัปเดตจำนวนคงเหลือ
            onClose(); // ปิด Modal
        } catch (err) {
            console.error('Error selling ticket:', err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex justify-center items-center">
            <div className="bg-white p-6 rounded-lg shadow-xl w-96">
                <h3 className="text-lg font-bold mb-4">ขายตั๋ว: {ticket.concert_name}</h3>
                <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                        <label className="block text-gray-700">ชื่อลูกค้า</label>
                        <input
                            type="text"
                            name="customer_name"
                            value={customerInfo.customer_name}
                            onChange={handleChange}
                            className="w-full p-2 border rounded mt-1"
                            required
                        />
                    </div>
                    <div className="mb-4">
                        <label className="block text-gray-700">เบอร์โทรศัพท์ลูกค้า</label>
                        <input
                            type="tel"
                            name="customer_phone"
                            value={customerInfo.customer_phone}
                            onChange={handleChange}
                            className="w-full p-2 border rounded mt-1"
                            required
                        />
                    </div>
                    {error && <div className="text-red-500 mb-4">{error}</div>}
                    <div className="flex justify-end space-x-2">
                        <button
                            type="submit"
                            className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 disabled:bg-gray-400"
                            disabled={loading}
                        >
                            {loading ? 'กำลังขาย...' : 'ยืนยันการขาย'}
                        </button>
                        <button
                            type="button"
                            onClick={onClose}
                            className="bg-gray-300 text-black px-4 py-2 rounded hover:bg-gray-400"
                            disabled={loading}
                        >
                            ยกเลิก
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default SellTicketModal;