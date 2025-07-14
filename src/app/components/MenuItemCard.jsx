// components/MenuItemCard.jsx 
'use client';

import React from 'react';

const MenuItemCard = ({ menuItem, onEdit, onDelete, onAddStock, showActions = true }) => { // <--- เพิ่ม onAddStock
    const isLowStock = menuItem.stock <= 5 && menuItem.stock > 0; // ตัวอย่าง: ต่ำกว่า 5 ถือว่า Low Stock
    const isOutOfStock = menuItem.stock === 0;

    return (
        <div className="bg-white p-4 rounded-lg shadow-md flex flex-col md:flex-row items-center gap-4">
            {menuItem.imageUrl && (
                <img
                    src={menuItem.imageUrl}
                    alt={menuItem.name}
                    className="w-24 h-24 object-cover rounded-md flex-shrink-0"
                />
            )}
            <div className="flex-grow text-center md:text-left">
                <h3 className="text-xl font-semibold text-gray-800">{menuItem.name}</h3>
                <p className="text-gray-600 text-sm">{menuItem.category}</p>
                <p className="text-gray-700 font-bold text-lg">฿{menuItem.price.toFixed(2)}</p>

                {/* แสดง Stock */}
                <p className={`text-sm mt-1 font-medium ${isOutOfStock ? 'text-red-600 font-bold' : isLowStock ? 'text-orange-500' : 'text-gray-700'}`}>
                    จำนวนคงเหลือ: {menuItem.stock} {isOutOfStock ? '(หมด)' : isLowStock ? '(เหลือน้อย)' : ''}
                </p>
                <p className={`text-sm ${menuItem.isAvailable ? 'text-green-600' : 'text-red-600'}`}>
                    สถานะ: {menuItem.isAvailable ? 'พร้อมขาย' : 'ไม่พร้อมขาย'}
                </p>

                {menuItem.description && (
                    <p className="text-gray-500 text-sm mt-1">{menuItem.description}</p>
                )}
            </div>
            {/* ซ่อนกลุ่มปุ่มถ้า showActions เป็น false */}
            {showActions && (
                <div className="flex flex-col gap-2 mt-4 md:mt-0">
                    <button
                        onClick={() => onEdit(menuItem)}
                        className="bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-1 px-3 rounded text-sm"
                    >
                        แก้ไข
                    </button>
                    <button
                        onClick={() => onAddStock(menuItem._id, menuItem.name, menuItem.stock)}
                        className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-1 px-3 rounded text-sm"
                    >
                        เพิ่มสต็อก
                    </button>
                    <button
                        onClick={() => onDelete(menuItem._id)}
                        className="bg-red-500 hover:bg-red-600 text-white font-bold py-1 px-3 rounded text-sm"
                    >
                        ลบ
                    </button>
                </div>
            )}
        </div>
    );
};

export default MenuItemCard;