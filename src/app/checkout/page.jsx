'use client';

import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import { QRCodeCanvas } from 'qrcode.react'; // ต้อง import แบบนี้
import promptpay from 'promptpay-qr';

const CheckoutPage = () => {
    const { data: session, status } = useSession();
    const router = useRouter();
    const searchParams = useSearchParams();
    const orderId = searchParams.get('orderId');

    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    
    // State สำหรับการชำระเงิน
    const [paymentMethod, setPaymentMethod] = useState('');
    const [cashGiven, setCashGiven] = useState('');
    const [change, setChange] = useState(0);
    const [promptpayQR, setPromptpayQR] = useState('');

    useEffect(() => {
        const fetchOrder = async () => {
            if (!orderId) {
                setError('Order ID not found.');
                setLoading(false);
                return;
            }
            try {
                const response = await fetch(`/api/orders/${orderId}`);
                if (!response.ok) {
                    throw new Error('Failed to fetch order details');
                }
                const data = await response.json();
                setOrder(data);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        if (status === 'authenticated') {
            fetchOrder();
        } else if (status === 'unauthenticated') {
            router.push('/');
        }
    }, [status, orderId, router]);

    // คำนวณเงินทอน
    useEffect(() => {
        if (paymentMethod === 'cash' && order) {
            const given = parseFloat(cashGiven);
            if (!isNaN(given) && given >= order.total_amount) {
                setChange(given - order.total_amount);
            } else {
                setChange(0);
            }
        } else {
            setChange(0);
        }
    }, [cashGiven, paymentMethod, order]);

    const handleFinalizePayment = async () => {
        if (!order || !paymentMethod) {
            alert('ข้อมูลไม่ครบถ้วน');
            return;
        }
        if (paymentMethod === 'cash' && parseFloat(cashGiven) < order.total_amount) {
            alert('เงินสดไม่เพียงพอ!');
            return;
        }

        try {
            const response = await fetch(`/api/orders/${orderId}/pay`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ paymentMethod })
            });
            
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Payment failed');
            }
            alert('การชำระเงินสำเร็จ! รายการถูกบันทึกแล้ว');
            router.push('/tables'); 
        } catch (err) {
            setError(err.message);
        }
    };
    
    // แก้ไขฟังก์ชันนี้เพื่อสร้าง QR code ที่ถูกต้อง
    const generatePromptpayQR = () => {
        if (order && order.total_amount) {
            const promptpayID = '0617745231'; // <-- ใส่ PromptPay ID ของคุณ
            const amount = order.total_amount.toFixed(2);
            // สร้าง String ที่เป็นไปตามมาตรฐาน EMV QR code
            const qrString = promptpay(promptpayID, { amount: parseFloat(amount) });
            setPromptpayQR(qrString);
        }
    };

    if (loading || status === 'loading') {
        return <div className="p-4">กำลังโหลด...</div>;
    }

    if (error) {
        return <div className="p-4 text-red-500">ข้อผิดพลาด: {error}</div>;
    }
    
    if (!order) {
      return <div className="p-4">ไม่พบข้อมูลคำสั่งซื้อ</div>;
    }

    return (
        <div className="container mx-auto p-4">
            <h1 className="text-2xl font-bold mb-4">หน้าคิดเงิน</h1>
            <div className="bg-white p-4 rounded-md shadow-md mb-4">
                <h2 className="text-lg font-semibold mb-2">สรุปคำสั่งซื้อ</h2>
                <ul>
                    {order.items && order.items.map((item, index) => (
                        <li key={index} className="flex justify-between border-b py-1">
                            <span>{item.item_name} x {item.quantity}</span>
                            <span>{item.price * item.quantity} บาท</span>
                        </li>
                    ))}
                </ul>
                <div className="mt-4 text-xl font-bold flex justify-between">
                    <span>ยอดรวมทั้งหมด:</span>
                    <span>{order.total_amount.toFixed(2)} บาท</span>
                </div>
            </div>

            <div className="bg-white p-4 rounded-md shadow-md">
                <h2 className="text-lg font-semibold mb-2">ช่องทางการชำระเงิน</h2>
                <div className="mb-4">
                    <label className="inline-flex items-center mr-6">
                        <input type="radio" name="paymentMethod" value="cash" checked={paymentMethod === 'cash'} onChange={() => setPaymentMethod('cash')} className="form-radio text-blue-600" />
                        <span className="ml-2">เงินสด</span>
                    </label>
                    <label className="inline-flex items-center">
                        <input type="radio" name="paymentMethod" value="promptpay" checked={paymentMethod === 'promptpay'} onChange={() => { setPaymentMethod('promptpay'); generatePromptpayQR(); }} className="form-radio text-blue-600" />
                        <span className="ml-2">QR PromptPay</span>
                    </label>
                </div>
                
                {paymentMethod === 'cash' && (
                    <div className="mb-4">
                        <label className="block text-gray-700">รับเงินมา (บาท)</label>
                        <input type="number" value={cashGiven} onChange={(e) => setCashGiven(e.target.value)} className="w-full p-2 border rounded mt-1" placeholder="จำนวนเงินที่ลูกค้าจ่าย" />
                        <div className="mt-2 text-lg font-bold">เงินทอน: {change.toFixed(2)} บาท</div>
                    </div>
                )}
                
                {paymentMethod === 'promptpay' && promptpayQR && (
                    <div className="flex flex-col items-center justify-center p-4 border rounded-lg">
                        <p className="text-center font-bold mb-2">สแกนเพื่อชำระเงิน</p>
                        <QRCodeCanvas value={promptpayQR} size={256} />
                    </div>
                )}
                
                <div className="mt-4">
                    <button
                        onClick={handleFinalizePayment}
                        className="w-full bg-green-500 text-white py-2 rounded mt-4 hover:bg-green-600 disabled:bg-gray-400"
                        disabled={!paymentMethod || (paymentMethod === 'cash' && parseFloat(cashGiven) < order.total_amount)}
                    >
                        ยืนยันการชำระเงิน
                    </button>
                </div>
            </div>
        </div>
    );
};
export default CheckoutPage;