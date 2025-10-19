// app/order/[orderId]/page.jsx
'use client';

import { useParams, useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import React, { useState, useEffect } from 'react';
import MenuItemCard from '../../components/MenuItemCard';
import QuantityModal from '../../components/QuantityModal';
import Sidebar from '../../components/sidebar';

const OrderPage = () => {
  const router = useRouter();
  const { data: session } = useSession();
  const { orderId } = useParams();

  const [order, setOrder] = useState(null);
  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showQuantityModal, setShowQuantityModal] = useState(false);
  const [selectedMenuItem, setSelectedMenuItem] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [categories, setCategories] = useState(['All']);

  useEffect(() => {
    const fetchData = async () => {
      if (!orderId) {
        setError('ไม่มี Order ID');
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);
      try {
        const orderResponse = await fetch(`/api/orders/${orderId}`);
        if (!orderResponse.ok) {
          throw new Error('Failed to fetch order details');
        }
        const orderData = await orderResponse.json();
        setOrder(orderData);

        const menuResponse = await fetch('/api/menu-items');
        if (!menuResponse.ok) {
          throw new Error('Failed to fetch menu items');
        }
        const menuData = await menuResponse.json();
        setMenuItems(menuData);

        const uniqueCategories = [...new Set(menuData.map(item => item.category))];
        setCategories(['All', ...uniqueCategories.filter(c => c)]);

      } catch (err) {
        console.error('Error fetching data for order page:', err);
        setError(`เกิดข้อผิดพลาด: ${err.message}`);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [orderId]);

  const filteredMenuItems = menuItems.filter(item =>
    selectedCategory === 'All' || item.category === selectedCategory
  );

  const handleAddItemClick = (menuItem) => {
    // ตรวจสอบสต็อกและ isAvailable ทันทีที่คลิก
    if (menuItem.stock <= 0 || !menuItem.isAvailable) { // ตรวจสอบอีกครั้งก่อนเปิด Modal
      alert('สินค้านี้หมดสต็อกหรือไม่พร้อมขาย');
      return;
    }
    setSelectedMenuItem(menuItem);
    setShowQuantityModal(true);
  };

  const handleConfirmQuantity = async (quantity) => {
    setError(null);
    if (!orderId || !selectedMenuItem) {
      alert('ไม่สามารถเพิ่มรายการอาหารได้: ไม่มี Order ID หรือ MenuItem ที่เลือก');
      return;
    }

    // ตรวจสอบ Stock อีกครั้งที่ Frontend ก่อนส่งไป Backend
    if (selectedMenuItem.stock < quantity) {
      alert(`สินค้า ${selectedMenuItem.name} มีในสต็อกไม่พอ (เหลือ ${selectedMenuItem.stock} ชิ้น)`);
      return; // เอา setSelectedMenuItem(null) ออกจากตรงนี้
    }

    // const newSubtotal = parseFloat(selectedMenuItem.price) * parseFloat(quantity);
    // const currentTotal = parseFloat(order?.total_amount) || 0;
    // const newTotalAmount = currentTotal + newSubtotal; // เพิ่มเงื่อนไขเพื่อป้องกันค่า total_amount เป็น undefined

    try {
      const response = await fetch(`/api/orders/${orderId}/items`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          menuItemId: selectedMenuItem._id,
          name: selectedMenuItem.name,
          price: selectedMenuItem.price,
          quantity: quantity,
          // subtotal: newSubtotal,
          // total_amount: newTotalAmount,
          // item_type: 'MenuItem'
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to add item to order');
      }

      const updatedOrder = await response.json();
      setOrder(updatedOrder);
      alert(`${selectedMenuItem.name} จำนวน ${quantity} ถูกเพิ่มใน Order แล้ว!`);

      // อัปเดต stock และ isAvailable ใน UI ทันที
      await fetchMenuItemsData();

      // ย้ายโค้ด 2 บรรทัดนี้มาไว้ตรงนี้
      setShowQuantityModal(false);
      setSelectedMenuItem(null);

    } catch (err) {
      console.error('Error adding item to order:', err);
      setError(`เกิดข้อผิดพลาดในการเพิ่มรายการอาหาร: ${err.message}`);
      setSelectedMenuItem(null);
    }
  };

  const fetchMenuItemsData = async () => {
    try {
      const menuResponse = await fetch('/api/menu-items');
      if (!menuResponse.ok) {
        throw new Error('Failed to fetch menu items');
      }
      const menuData = await menuResponse.json();
      setMenuItems(menuData);
    } catch (err) {
      console.error('Error re-fetching menu items:', err);
      // จัดการ error ในการ fetch menu items
    }
  };

  const handleGoBackToTable = () => {
    router.push('/tables'); // นำทางกลับไปยังหน้าจัดการโต๊ะ
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center bg-gray-100"><p className="text-lg text-gray-700">กำลังโหลดรายการ...</p></div>;
  }

  if (error) {
    return <div className="min-h-screen flex items-center justify-center bg-gray-100"><p className="text-red-500 text-lg">{error}</p></div>;
  }

  return (
    <main>
      <Sidebar session={session} />
      <div className='main_container'>
        <div className="min-h-screen bg-gray-100 p-8">
          <h1 className="text-4xl font-bold text-center mb-6 text-gray-800">
            สั่งอาหารสำหรับโต๊ะที่ {order?.tableNumber} (Order ID: {orderId})
          </h1>

          <div className="max-w-4xl mx-auto bg-white p-6 rounded-lg shadow-md mb-8">
            <h2 className="text-2xl font-semibold mb-4 text-gray-800">รายการในบิล</h2>
            {order?.items && order.items.length > 0 ? (
              <ul>
                {order.items.map((item, index) => (
                  <li key={index} className="flex justify-between items-center py-2 border-b last:border-b-0">
                    <span className="text-lg text-gray-700">{item.item_name} x {item.quantity}</span>
                    <span className="font-bold text-gray-800">฿{item.subtotal ? item.subtotal.toFixed(2) : '0.00'}</span>
                  </li>
                ))}
                <li className="flex justify-between items-center py-2 font-bold text-xl text-gray-900 mt-4">
                  <span>รวมทั้งหมด:</span>
                  <span>฿{order.total_amount ? order.total_amount.toFixed(2) : 0}</span>
                </li>
                {/* <span>฿{(order.items.subtotal || 0).toFixed(2)}</span> */}
              </ul>
            ) : (
              <p className="text-gray-600">ยังไม่มีรายการอาหารในบิลนี้</p>
            )}
          </div>

          <div className="max-w-4xl mx-auto mb-6 flex justify-end">
            {/* เพิ่มปุ่ม ยกเลิก/ย้อนกลับ */}
            <button
              onClick={handleGoBackToTable} // <--- เรียกฟังก์ชันย้อนกลับ
              className="bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded-lg shadow-md mr-2"
            >
              ยกเลิก/ย้อนกลับ
            </button>
          </div>

          <h2 className="text-3xl font-bold text-center mb-6 text-gray-800">เลือกรายการอาหาร</h2>
          {/* แถบเลือกหมวดหมู่ */}
          <div className="mb-6 flex flex-wrap justify-center gap-3">
            {categories.map(category => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-4 py-2 rounded-lg font-semibold transition-colors duration-200
                                ${selectedCategory === category
                    ? 'bg-purple-600 text-white shadow-md'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`
                }
              >
                {category}
              </button>
            ))}
          </div>

          {/* รายการเมนูที่ถูกกรอง */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {filteredMenuItems.map((item) => (
              <div key={item._id} className="relative">
                <MenuItemCard
                  menuItem={item}
                  onEdit={() => { }}
                  onDelete={() => { }}
                  onAddStock={() => { }}
                  showActions={false}
                />
                <button
                  onClick={() => handleAddItemClick(item)}
                  disabled={item.stock === 0 || !item.isAvailable}
                  className={`absolute bottom-4 right-4 bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded-full shadow-lg transition-transform transform hover:scale-105
                                    ${item.stock === 0 || !item.isAvailable ? 'opacity-50 cursor-not-allowed' : ''}`
                  }
                >
                  เพิ่ม
                </button>
              </div>
            ))}
          </div>

          {showQuantityModal && selectedMenuItem && (
            <QuantityModal
              menuItem={selectedMenuItem}
              onClose={() => setShowQuantityModal(false)}
              onConfirm={handleConfirmQuantity}
            />
          )}
        </div>
      </div>
    </main>
  );
};

export default OrderPage;