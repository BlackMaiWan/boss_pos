'use client';

import React, { useState } from 'react';

const AddCustomerWithDepositModal = ({ onClose, onSuccess }) => {
    const [formData, setFormData] = useState({
        customer_name: '',
        customer_phone: '',
        item_name: '',
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        console.log("FormData to be sent:", formData);
        
        try {
            const response = await fetch('/api/customers', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });

            if (!response.ok) {
                let errorData = {};
                try {
                    errorData = await response.json();
                } catch (jsonError) {
                    // หาก response ไม่ใช่ JSON ให้จัดการตรงนี้
                    console.error('Failed to parse JSON error response:', jsonError);
                    throw new Error(`Server responded with status ${response.status} but no valid JSON.`);
                }
                throw new Error(errorData.message || `Failed to add customer. Status: ${response.status}`);
            }

            alert('เพิ่มลูกค้าและฝากเครื่องดื่มสำเร็จ');
            onSuccess();
            onClose();
        } catch (err) {
            console.error('Error adding customer:', err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex justify-center items-center">
            <div className="bg-white p-6 rounded-lg shadow-xl w-96">
                <h3 className="text-lg font-bold mb-4">ฝากเครื่องดื่ม (ลูกค้าใหม่)</h3>
                <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                        <label className="block text-gray-700">ชื่อลูกค้า</label>
                        <input
                            type="text"
                            name="customer_name"
                            value={formData.customer_name}
                            onChange={handleChange}
                            className="w-full p-2 border rounded mt-1"
                            required
                        />
                    </div>
                    <div className="mb-4">
                        <label className="block text-gray-700">เบอร์โทรศัพท์</label>
                        <input
                            type="tel"
                            name="customer_phone"
                            value={formData.customer_phone}
                            onChange={handleChange}
                            className="w-full p-2 border rounded mt-1"
                            required
                        />
                    </div>
                    <div className="mb-4">
                        <label className="block text-gray-700">รายการที่ฝาก</label>
                        <input
                            type="text"
                            name="item_name"
                            value={formData.item_name}
                            onChange={handleChange}
                            className="w-full p-2 border rounded mt-1"
                            required
                        />
                    </div>
                    {error && <div className="text-red-500 mb-4">{error}</div>}
                    <div className="flex justify-end space-x-2">
                        <button
                            type="submit"
                            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:bg-gray-400"
                            disabled={loading}
                        >
                            {loading ? 'กำลังเพิ่ม...' : 'ยืนยัน'}
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

export default AddCustomerWithDepositModal;