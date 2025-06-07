// components/QuantityModal.jsx
'use client';

import React, { useState } from 'react';

const QuantityModal = ({ menuItem, onClose, onConfirm }) => {
  const [quantity, setQuantity] = useState(1);

  const handleQuantityChange = (e) => {
    const value = e.target.value;
    if (value === '' || (value.match(/^\d+$/) && parseInt(value, 10) >= 0)) {
        setQuantity(value);
    }
  };

  const handleConfirm = () => {
    const parsedQuantity = parseInt(quantity, 10);

    if (isNaN(parsedQuantity) || parsedQuantity <= 0) {
      alert('กรุณาป้อนจำนวนที่ถูกต้องและเป็นบวก');
      return;
    }

    if (parsedQuantity > menuItem.stock) {
      alert(`จำนวนเกินสต็อก! มีเพียง ${menuItem.stock} ชิ้น`);
      return;
    }

    onConfirm(parsedQuantity);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-sm mx-auto">
        <h2 className="text-2xl font-semibold mb-4 text-gray-800">
          เพิ่ม {menuItem.name}
        </h2>
        <p className="text-gray-600 mb-4">ราคา: ฿{menuItem.price.toFixed(2)} | คงเหลือ: {menuItem.stock}</p>

        <div className="mb-6">
          <label htmlFor="quantity" className="block text-gray-700 text-sm font-bold mb-2">
            จำนวน:
          </label>
          <input
            type="number"
            id="quantity"
            value={quantity}
            onChange={handleQuantityChange}
            min="1"
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          />
        </div>

        <div className="flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded"
          >
            ยกเลิก
          </button>
          <button
            onClick={handleConfirm}
            disabled={isNaN(parseInt(quantity, 10)) || parseInt(quantity, 10) <= 0 || parseInt(quantity, 10) > menuItem.stock}
            className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded"
          >
            ยืนยัน
          </button>
        </div>
      </div>
    </div>
  );
};

export default QuantityModal;