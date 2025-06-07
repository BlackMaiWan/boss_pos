// components/Table.jsx
'use client'

import React, { useState, useEffect } from 'react';

const Table = ({
  tableNumber,
  initialStatus,
  initialOrderId,
  onOpenTable,
  onOrderFood,
  onViewOrder,
  onCheckout,
  onCloseTable,
}) => {
  const [status, setStatus] = useState(initialStatus);
  const [orderId, setOrderId] = useState(initialOrderId);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    setStatus(initialStatus);
    setOrderId(initialOrderId);
  }, [initialStatus, initialOrderId]);

  const handleOpen = () => {
    onOpenTable(tableNumber);
  };

  const handleOrder = () => {
    onOrderFood(tableNumber);
  };

  const handleView = () => {
    onViewOrder(tableNumber);
  };

  const handleCheckoutClick = () => {
    onCheckout(tableNumber);
  };

  const handleClose = () => {
    onCloseTable(tableNumber);
  };

  const statusColorClass = status === 'in-use' ? 'bg-red-800' : 'bg-green-700';
  const statusText = status === 'in-use' ? 'ไม่ว่าง' : 'ว่าง';

  return (
    <div
      className={`relative ${statusColorClass} text-white p-6 rounded-lg shadow-lg flex flex-col items-center justify-between transition-colors duration-300 h-64`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Default Table Button */}
      {!isHovered && (
        <div className="w-full h-full flex text-center items-center justify-center rounded-lg cursor-pointer">
          <div className='text-2xl font-bold mb-2'>โต๊ะที่ {tableNumber} ({statusText})<br />
            {status === 'in-use' && orderId && (
              <p className="text-sm">Order ID: {orderId.substring(0, 8)}...</p>
            )}
          </div>
        </div>
      )}

      {/* Hover State */}
      {isHovered && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-700 bg-opacity-90 rounded-lg p-2">
          {status === 'available' ? (
            <button
              onClick={handleOpen}
              className="w-full h-full bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded-lg transition-colors duration-200"
            >
              <h2 className='text-2xl font-bold mb-2'>เปิดโต๊ะ</h2>
            </button>
          ) : (
            <>
              <button
                onClick={handleOrder}
                className="w-full bg-yellow-500 hover:bg-yellow-600 text-white text-sm font-bold py-1 px-2 rounded mb-1 transition-colors duration-200"
              >
                สั่งอาหาร
              </button>
              <button
                onClick={handleView}
                className="w-full bg-purple-500 hover:bg-purple-600 text-white text-sm font-bold py-1 px-2 rounded mb-1 transition-colors duration-200"
              >
                รายการอาหารที่สั่ง
              </button>
              <button
                onClick={handleCheckoutClick}
                className="w-full bg-green-500 hover:bg-green-600 text-white text-sm font-bold py-1 px-2 rounded mb-1 transition-colors duration-200"
              >
                จ่ายเงิน
              </button>
              <button
                onClick={handleClose}
                className="w-full bg-red-600 hover:bg-red-700 text-white text-sm font-bold py-1 px-2 rounded transition-colors duration-200"
              >
                ปิดโต๊ะ
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default Table;