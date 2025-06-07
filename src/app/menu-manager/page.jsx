// app/menu-manager/page.jsx
'use client';

import React, { useState, useEffect } from 'react';
import MenuItemForm from '../components/MenuItemForm';
import MenuItemCard from '../components/MenuItemCard';
import Sidebar from '../components/sidebar';
import { useSession } from 'next-auth/react';


const MenuManagerPage = () => {
    const { data: session } = useSession();
    const [menuItems, setMenuItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showForm, setShowForm] = useState(false);
    const [editingMenuItem, setEditingMenuItem] = useState(null);

    const fetchMenuItems = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await fetch('/api/menu-items');
            if (!response.ok) {
                throw new Error('Failed to fetch menu items');
            }
            const data = await response.json();
            setMenuItems(data);
        } catch (err) {
            console.error('Error fetching menu items:', err);
            setError('ไม่สามารถโหลดรายการอาหารได้ กรุณาลองใหม่');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchMenuItems();
    }, []);

    const handleFormSubmit = async (formData) => {
        setError(null);
        try {
            const method = editingMenuItem ? 'PUT' : 'POST';
            const url = editingMenuItem ? `/api/menu-items/${editingMenuItem._id}` : '/api/menu-items';

            const response = await fetch(url, {
                method: method,
                headers: {
                    'Content-Type': 'application/json',
                    // 'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
                },
                body: JSON.stringify(formData),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to save menu item');
            }

            await fetchMenuItems();
            setShowForm(false);
            setEditingMenuItem(null);
            alert(`บันทึกรายการอาหาร ${formData.name} สำเร็จ!`);
        } catch (err) {
            console.error('Error saving menu item:', err);
            setError(`เกิดข้อผิดพลาดในการบันทึก: ${err.message}`);
        }
    };

    const handleDeleteMenuItem = async (id) => {
        if (!confirm('คุณแน่ใจหรือไม่ที่จะลบรายการอาหารนี้?')) {
            return;
        }
        setError(null);
        try {
            const response = await fetch(`/api/menu-items/${id}`, {
                method: 'DELETE',
                headers: {
                    // 'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
                },
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to delete menu item');
            }

            await fetchMenuItems();
            alert('ลบรายการอาหารสำเร็จ!');
        } catch (err) {
            console.error('Error deleting menu item:', err);
            setError(`เกิดข้อผิดพลาดในการลบ: ${err.message}`);
        }
    };

    const handleEditMenuItem = (menuItem) => {
        setEditingMenuItem(menuItem);
        setShowForm(true);
    };

    const handleCancelForm = () => {
        setShowForm(false);
        setEditingMenuItem(null);
    };

    // <--- เพิ่มฟังก์ชันนี้สำหรับเพิ่ม Stock
    const handleAddStock = async (id, currentStock) => {
        const quantityStr = prompt(`เพิ่มสต็อกสำหรับ ${id} (ปัจจุบัน: ${currentStock}) จำนวนเท่าไหร่?`);
        if (!quantityStr) return;

        const quantity = parseInt(quantityStr, 10);
        if (isNaN(quantity) || quantity <= 0) {
            alert('กรุณาป้อนจำนวนที่ถูกต้อง');
            return;
        }

        try {
            const response = await fetch(`/api/menu-items/${id}/add-stock`, { // <--- เรียก API ตัวนี้!
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ quantity }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to add stock');
            }

            // หลังจากเพิ่มสต็อกสำเร็จ ให้ดึงข้อมูลเมนูใหม่ทั้งหมดเพื่ออัปเดต UI
            await fetchMenuItems();
            alert('สต็อกถูกเพิ่มแล้ว!');
        } catch (error) {
            console.error('Error adding stock:', error);
            alert(`เกิดข้อผิดพลาดในการเพิ่มสต็อก: ${error.message}`);
        }
    };
    // <--- สิ้นสุดการเพิ่มฟังก์ชัน

    return (
        <main>
            <Sidebar session={session} />
            <div className="min-h-screen bg-gray-100 p-8">
                <h1 className="text-4xl font-bold text-center mb-8 text-gray-800">จัดการรายการอาหาร</h1>

                <div className="max-w-4xl mx-auto mb-6 flex justify-end">
                    <button
                        onClick={() => {
                            setShowForm(true);
                            setEditingMenuItem(null);
                        }}
                        className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-lg shadow-md"
                    >
                        เพิ่มรายการอาหารใหม่
                    </button>
                </div>

                {showForm && (
                    <div className="mb-8">
                        <MenuItemForm
                            initialData={editingMenuItem}
                            onSubmit={handleFormSubmit}
                            onCancel={handleCancelForm}
                        />
                    </div>
                )}

                {loading && <p className="text-center text-lg text-gray-700">กำลังโหลดรายการอาหาร...</p>}
                {error && <p className="text-center text-red-500 text-lg mb-4">{error}</p>}

                {!loading && !error && menuItems.length === 0 && (
                    <p className="text-center text-gray-600 text-lg">ยังไม่มีรายการอาหาร เพิ่มรายการแรกของคุณเลย!</p>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
                    {!loading && menuItems.map((item) => (
                        <MenuItemCard
                            key={item._id}
                            menuItem={item}
                            onEdit={handleEditMenuItem}
                            onDelete={handleDeleteMenuItem}
                            onAddStock={handleAddStock} // <--- ส่งฟังก์ชัน onAddStock ไปให้ MenuItemCard
                        />
                    ))}
                </div>
            </div>
        </main>
    );
};

export default MenuManagerPage;