'use client';

import React, { useState } from 'react';

const AddDepositModal = ({ customer, onClose, onSuccess }) => {
  const [item_name, setItemName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/customers/deposit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customer_phone: customer.customer_phone,
          item_name,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to add drink deposit');
      }

      alert('ฝากเครื่องดื่มสำเร็จ');
      onSuccess();
      onClose();
    } catch (err) {
      console.error('Error adding drink deposit:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex justify-center items-center">
      <div className="bg-white p-6 rounded-lg shadow-xl w-96">
        <h3 className="text-lg font-bold mb-4">ฝากเครื่องดื่มเพิ่มสำหรับ: {customer.customer_name}</h3>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-gray-700">รายการที่ฝาก</label>
            <input
              type="text"
              name="item_name"
              value={item_name}
              onChange={(e) => setItemName(e.target.value)}
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
              {loading ? 'กำลังฝาก...' : 'ยืนยัน'}
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

export default AddDepositModal;