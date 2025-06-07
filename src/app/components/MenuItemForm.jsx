// components/MenuItemForm.jsx
'use client';

import React, { useState, useEffect } from 'react';

const MenuItemForm = ({ initialData = null, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    category: '',
    imageUrl: '',
    isAvailable: true,
    stock: '',
  });

  const categories = ['Drink', 'Snack', 'Other'];

  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name || '',
        description: initialData.description || '',
        price: initialData.price || '',
        category: initialData.category || '',
        imageUrl: initialData.imageUrl || '',
        isAvailable: initialData.isAvailable !== undefined ? initialData.isAvailable : true,
        stock: initialData.stock !== undefined ? initialData.stock : '',
      });
    } else {
      setFormData({
        name: '',
        description: '',
        price: '',
        category: '',
        imageUrl: '',
        isAvailable: true,
        stock: '',
      });
    }
  }, [initialData]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({
      ...formData,
      price: parseFloat(formData.price),
      stock: parseInt(formData.stock, 10),
    });
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-md max-w-lg mx-auto">
      <h2 className="text-2xl font-semibold mb-4 text-gray-800">{initialData ? 'แก้ไขรายการอาหาร' : 'เพิ่มรายการอาหารใหม่'}</h2>
      {/* Name */}
      <div className="mb-4">
        <label htmlFor="name" className="block text-gray-700 text-sm font-bold mb-2">ชื่อเมนู:</label>
        <input type="text" id="name" name="name" value={formData.name} onChange={handleChange} className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" required />
      </div>
      {/* Description */}
      <div className="mb-4">
        <label htmlFor="description" className="block text-gray-700 text-sm font-bold mb-2">คำอธิบาย:</label>
        <textarea id="description" name="description" value={formData.description} onChange={handleChange} className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" rows="3"></textarea>
      </div>
      {/* Price */}
      <div className="mb-4">
        <label htmlFor="price" className="block text-gray-700 text-sm font-bold mb-2">ราคา:</label>
        <input type="number" id="price" name="price" value={formData.price} onChange={handleChange} className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" step="0.01" required />
      </div>

      {/* Category */}
      <div className="mb-4">
        <label htmlFor="category" className="block text-gray-700 text-sm font-bold mb-2">หมวดหมู่:</label>
        <select
          id="category"
          name="category"
          value={formData.category}
          onChange={handleChange}
          className="shadow border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          required
        >
          {/* Option default เพื่อให้ผู้ใช้เลือก */}
          <option value="" disabled>--- เลือกหมวดหมู่ ---</option>
          {/* Loop เพื่อสร้าง Option จาก Array categories */}
          {categories.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>
      </div>

      {/* Stock */}
      <div className="mb-4">
        <label htmlFor="stock" className="block text-gray-700 text-sm font-bold mb-2">จำนวนคงเหลือ:</label>
        <input type="number" id="stock" name="stock" value={formData.stock} onChange={handleChange} className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" min="0" required />
      </div>
      {/* Image URL */}
      <div className="mb-4">
        <label htmlFor="imageUrl" className="block text-gray-700 text-sm font-bold mb-2">URL รูปภาพ:</label>
        <input type="url" id="imageUrl" name="imageUrl" value={formData.imageUrl} onChange={handleChange} className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" />
      </div>
      {/* Is Available */}
      <div className="mb-4 flex items-center">
        <input type="checkbox" id="isAvailable" name="isAvailable" checked={formData.isAvailable} onChange={handleChange} className="mr-2 leading-tight" />
        <label htmlFor="isAvailable" className="text-gray-700 text-sm font-bold">พร้อมขาย</label>
      </div>
      <div className="flex items-center justify-between">
        <button type="submit" className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline">
          {initialData ? 'บันทึกการแก้ไข' : 'เพิ่มเมนู'}
        </button>
        <button type="button" onClick={onCancel} className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline">
          ยกเลิก
        </button>
      </div>
    </form>
  );
};

export default MenuItemForm;