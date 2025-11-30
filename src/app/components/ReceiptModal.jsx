// app/components/ReceiptModal.jsx
'use client';

import React, { useRef, useEffect } from 'react';

const ReceiptModal = ({ order, cashGiven, change, onClose }) => {
    const receiptRef = useRef(null);

    // ใช้ useEffect เพื่อให้ฟังก์ชัน print ทำงานหลังจาก Modal ถูก Render แล้ว
    useEffect(() => {
        // หน่วงเวลาเล็กน้อยเพื่อให้แน่ใจว่า DOM ถูก Render สมบูรณ์ก่อนพิมพ์
        const timer = setTimeout(() => {
            // if (receiptRef.current) {
            //     window.print();
            // }
        }, 100);
        
        // Cleanup function
        return () => clearTimeout(timer);
    }, []);

    // ฟังก์ชันสำหรับฟอร์แมตวันที่
    const formatDateTime = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('th-TH', { 
            year: 'numeric', 
            month: 'short', 
            day: 'numeric', 
            hour: '2-digit', 
            minute: '2-digit' 
        });
    };
    
    // ฟังก์ชันสำหรับฟอร์แมตสกุลเงิน
    const formatCurrency = (amount) => {
        return parseFloat(amount).toFixed(2);
    };

    return (
        <div 
            className="fixed inset-0 bg-gray-600 bg-opacity-75 overflow-y-auto h-full w-full flex justify-center items-center print:hidden"
        >
            <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-sm">
                
                {/* ส่วนใบเสร็จ (สำหรับพิมพ์) - มี class 'print:block' เพื่อให้แสดงเฉพาะตอนสั่งพิมพ์ */}
                <div 
                    ref={receiptRef} 
                    className="p-4 border border-gray-300 print:block"
                >
                    <div className="text-center mb-4">
                        <h4 className="text-lg font-bold">ชื่อร้านของคุณ</h4>
                        <p className="text-xs">ที่อยู่: 123 ถนนสมมติ, กรุงเทพฯ 10000</p>
                        <p className="text-xs">เบอร์โทร: 099-XXX-XXXX</p>
                        <p className="text-sm mt-2 font-semibold">ใบเสร็จรับเงิน</p>
                    </div>

                    <div className="text-xs mb-3 border-t border-b border-dashed py-1">
                        <p>รหัสคำสั่งซื้อ: {order._id ? order._id.substring(18) : 'N/A'}</p>
                        <p>โต๊ะ: {order.tableNumber || '-'}</p>
                        <p>วันที่/เวลา: {formatDateTime(order.createdAt)}</p>
                    </div>
                    
                    {/* รายการสินค้า */}
                    <div className="mb-3">
                        <p className="text-xs font-semibold border-b border-dashed mb-1">รายละเอียด</p>
                        {order.items.map((item, index) => (
                            <div key={index} className="flex justify-between text-xs">
                                <span>{item.item_name} x {item.quantity}</span>
                                <span>{formatCurrency(item.subtotal)}</span>
                            </div>
                        ))}
                    </div>

                    {/* สรุปยอดเงิน */}
                    <div className="border-t border-dashed pt-2">
                        <div className="flex justify-between text-sm font-bold">
                            <span>ยอดรวมสุทธิ:</span>
                            <span>{formatCurrency(order.total_amount)} บาท</span>
                        </div>

                        {/* แสดงรายละเอียดการชำระเงิน */}
                        <div className="mt-2 text-xs">
                            <p>วิธีชำระ: {order.payment_method === 'cash' ? 'เงินสด' : order.payment_method === 'promptpay' ? 'PromptPay QR' : 'อื่นๆ'}</p>
                            {order.payment_method === 'cash' && (
                                <>
                                    <div className="flex justify-between">
                                        <span>รับเงินมา:</span>
                                        <span>{formatCurrency(cashGiven)} บาท</span>
                                    </div>
                                    <div className="flex justify-between font-bold">
                                        <span>เงินทอน:</span>
                                        <span>{formatCurrency(change)} บาท</span>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>

                    <div className="text-center mt-4 text-xs">
                        <p>--- ขอบคุณที่ใช้บริการ ---</p>
                    </div>
                </div>

                {/* ปุ่มปิด Modal (ซ่อนตอนสั่งพิมพ์) */}
                <button
                    onClick={onClose}
                    className="w-full bg-blue-500 text-white py-2 rounded mt-4 hover:bg-blue-600 print:hidden"
                >
                    ปิดใบเสร็จ & กลับหน้าหลัก
                </button>
            </div>
        </div>
    );
};

export default ReceiptModal;