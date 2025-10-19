// app/reports/page.jsx (ปรับปรุง)
'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Sidebar from '../components/sidebar';
import { useSession } from 'next-auth/react';
// 💡 NEW: Chart Imports
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Pie } from 'react-chartjs-2'; 

// 💡 NEW: Register Chart.js components
ChartJS.register(ArcElement, Tooltip, Legend);

// 💡 NEW: กำหนดประเภทการชำระเงินที่รองรับ
const PAYMENT_METHODS = ['All', 'cash', 'promptpay'];

const getToday = () => new Date().toISOString().split('T')[0];

const getStartOfWeek = (dateString) => {
    const date = new Date(dateString);
    const day = date.getDay(); // 0 for Sunday, 1 for Monday, etc.
    const diff = date.getDate() - day + (day === 0 ? -6 : 1); // ปรับให้เริ่มต้นที่วันจันทร์
    const startOfWeek = new Date(date.setDate(diff));
    return startOfWeek.toISOString().split('T')[0];
};

const getStartOfMonth = (dateString) => {
    const date = new Date(dateString);
    return new Date(date.getFullYear(), date.getMonth(), 1).toISOString().split('T')[0];
}

const ReportsPage = () => {
    const { data: session } = useSession();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [filter, setFilter] = useState('daily'); // สถานะเริ่มต้นเป็นรายวัน

    // State สำหรับเก็บวันที่เฉพาะเจาะจง
    const [selectedDate, setSelectedDate] = useState(getToday());
    const [selectedWeek, setSelectedWeek] = useState(getStartOfWeek(getToday())); 
    const [selectedMonth, setSelectedMonth] = useState(getStartOfMonth(getToday())); 
    
    // 💡 NEW: State สำหรับตัวกรองการชำระเงินและข้อมูลกราฟ
    const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('All');
    const [filteredOrders, setFilteredOrders] = useState([]); // ข้อมูลที่ถูกกรองตามวิธีชำระ
    const [chartData, setChartData] = useState({});

    // คำนวณวันที่สิ้นสุดตาม filter ปัจจุบัน
    const getEndDateForFilter = (currentFilter, currentDate) => {
        const date = new Date(currentDate);
        if (currentFilter === 'daily') {
            return currentDate;
        } else if (currentFilter === 'weekly') {
            const endOfWeek = new Date(date);
            endOfWeek.setDate(date.getDate() + 6);
            return endOfWeek.toISOString().split('T')[0];
        } else if (currentFilter === 'monthly') {
            const endOfMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0);
            return endOfMonth.toISOString().split('T')[0];
        }
        return '';
    };

    const fetchReports = async (currentFilter) => {
        setLoading(true);
        setError(null);
        try {
            let url = `/api/reports/orders?filter=${currentFilter}`;
            let startDate = '';
            let endDate = '';

            // กำหนด Start Date และ End Date ตาม filter ที่เลือก
            if (currentFilter === 'daily') {
                startDate = selectedDate;
                endDate = selectedDate;
            } else if (currentFilter === 'weekly') {
                startDate = selectedWeek;
                endDate = getEndDateForFilter('weekly', selectedWeek);
            } else if (currentFilter === 'monthly') {
                startDate = selectedMonth;
                endDate = getEndDateForFilter('monthly', selectedMonth);
            }

            if (startDate && endDate) {
                url += `&startDate=${startDate}&endDate=${endDate}`;
            }

            const response = await fetch(url);

            if (!response.ok) {
                throw new Error('Failed to fetch sales report');
            }
            const data = await response.json();
            setOrders(data);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchReports(filter);
    }, [filter, selectedDate, selectedWeek, selectedMonth]);

    // 💡 NEW useEffect: สำหรับการกรองข้อมูลและการคำนวณ Chart Data (Client-Side)
    useEffect(() => {
        // 1. Client-side Filtering: กรองตามวิธีชำระ
        const dataToFilter = orders || [];
        const filtered = selectedPaymentMethod === 'All'
            ? dataToFilter
            : dataToFilter.filter(order => order.payment_method === selectedPaymentMethod);
        
        setFilteredOrders(filtered);

        // 2. Chart Data Calculation: คำนวณสัดส่วนจากข้อมูลทั้งหมดที่ดึงมา (orders)
        const paymentCounts = orders.reduce((acc, order) => {
            const method = order.payment_method || 'N/A';
            acc[method] = (acc[method] || 0) + 1;
            return acc;
        }, {});

        const chartLabels = Object.keys(paymentCounts);
        const chartValues = Object.values(paymentCounts);
        
        // กำหนดสี
        const backgroundColors = chartLabels.map(label => {
            switch(label) {
                case 'cash': return 'rgba(75, 192, 192, 0.7)';
                case 'promptpay': return 'rgba(54, 162, 235, 0.7)';
                default: return 'rgba(201, 203, 207, 0.7)';
            }
        });

        setChartData({
            labels: chartLabels,
            datasets: [
                {
                    label: 'จำนวนรายการชำระเงิน',
                    data: chartValues,
                    backgroundColor: backgroundColors,
                    borderColor: backgroundColors.map(color => color.replace('0.7', '1')),
                    borderWidth: 1,
                },
            ],
        });

    }, [orders, selectedPaymentMethod]);

    const totalRevenue = filteredOrders.reduce((sum, order) => sum + order.total_amount, 0);

    const filterOptions = [
        { label: 'รายวัน', value: 'daily' },
        { label: 'รายสัปดาห์', value: 'weekly' },
        { label: 'รายเดือน', value: 'monthly' },
        { label: 'ทั้งหมด', value: 'all' },
    ];

    if (loading) return <div>Loading reports...</div>;
    if (error) return <div className="text-red-500">Error: {error}</div>;

    return (
        <main>
            <Sidebar session={session} />
            <div className="main_container p-6">
                <h1 className="text-3xl font-bold mb-6 text-gray-800">รายงานยอดขาย</h1>

                {/* ปุ่มเลือก Daily/Weekly/Monthly/All (เดิม) */}
                <div className="mb-6 flex space-x-4">
                    {filterOptions.map((option) => (
                        <button
                            key={option.value}
                            onClick={() => {
                                setFilter(option.value);
                                setSelectedPaymentMethod('All'); // Reset payment filter เมื่อเปลี่ยนช่วงเวลา
                            }}
                            className={`px-4 py-2 rounded-lg font-semibold transition-colors duration-200 
                                ${filter === option.value
                                    ? 'bg-blue-600 text-white shadow-md'
                                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`
                            }
                        >
                            {option.label}
                        </button>
                    ))}
                </div>

                {/* Input Fields สำหรับเลือกช่วงเวลาเฉพาะ (เดิม) */}
                <div className="mb-6 p-4 border rounded-lg bg-gray-50 flex space-x-4 items-end">
                    {filter === 'daily' && (
                        <div className='flex flex-col'>
                            <label className="text-sm font-medium text-gray-700 mb-1">เลือกวัน</label>
                            <input
                                type="date"
                                value={selectedDate}
                                onChange={(e) => setSelectedDate(e.target.value)}
                                className="p-2 border rounded-md"
                            />
                        </div>
                    )}

                    {filter === 'weekly' && (
                        <div className='flex flex-col'>
                            <label className="text-sm font-medium text-gray-700 mb-1">เลือกสัปดาห์ (วันเริ่มต้น)</label>
                            <input
                                type="date"
                                value={selectedWeek}
                                onChange={(e) => setSelectedWeek(e.target.value)}
                                className="p-2 border rounded-md"
                            />
                        </div>
                    )}

                    {filter === 'monthly' && (
                        <div className='flex flex-col'>
                            <label className="text-sm font-medium text-gray-700 mb-1">เลือกเดือน</label>
                            <input
                                type="month"
                                value={selectedMonth.substring(0, 7)} // แสดงเฉพาะ YYYY-MM
                                onChange={(e) => setSelectedMonth(e.target.value + '-01')} // ตั้งค่ากลับเป็นวันที่ 1
                                className="p-2 border rounded-md"
                            />
                        </div>
                    )}

                    {filter !== 'all' && (
                        <span className="text-sm text-gray-500">
                            แสดงข้อมูลตั้งแต่วันที่ {filter === 'daily' ? selectedDate : (filter === 'weekly' ? selectedWeek : selectedMonth)} ถึง {getEndDateForFilter(filter, filter === 'daily' ? selectedDate : (filter === 'weekly' ? selectedWeek : selectedMonth))}
                        </span>
                    )}
                </div>

                {/* 💡 NEW: ปุ่มเลือกประเภทการชำระเงิน */}
                <div className="mb-8 p-4 bg-white shadow-lg rounded-lg">
                    <h2 className="text-xl font-semibold mb-3">ตัวกรองประเภทการชำระเงิน</h2>
                    <div className="flex space-x-3">
                        {PAYMENT_METHODS.map((method) => (
                            <button
                                key={method}
                                onClick={() => setSelectedPaymentMethod(method)}
                                className={`px-4 py-2 rounded-full font-medium transition-all duration-200 
                                    ${selectedPaymentMethod === method
                                        ? 'bg-purple-600 text-white shadow-md'
                                        : 'bg-gray-200 text-gray-700 hover:bg-purple-100'}`
                                }
                            >
                                {method}
                            </button>
                        ))}
                    </div>
                </div>


                {/* รายงานสรุปและกราฟ */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
                    {/* ยอดรวมทั้งหมด (ใช้ filteredOrders) */}
                    <div className="bg-white p-6 rounded-lg shadow-xl md:col-span-1">
                        <h2 className="text-xl font-semibold text-gray-600">ยอดรวมทั้งหมด</h2>
                        <p className="text-4xl font-bold text-green-600 mt-2">{totalRevenue.toFixed(2)} บาท</p>
                        <p className="text-sm text-gray-500">
                            สำหรับช่วงเวลา: {filterOptions.find(o => o.value === filter).label}<br/>
                            กรองตามวิธีชำระ: **{selectedPaymentMethod}**
                        </p>
                    </div>

                    {/* 💡 NEW: กราฟแสดงสัดส่วน */}
                    <div className="p-6 bg-white shadow-xl rounded-lg flex flex-col items-center justify-center md:col-span-2">
                        <h2 className="text-2xl font-semibold mb-4 text-gray-800">สัดส่วนประเภทการชำระเงิน</h2>
                        {orders.length > 0 && chartData.datasets ? (
                            <div className="w-full max-w-md">
                                <Pie data={chartData} options={{ responsive: true, plugins: { legend: { position: 'right' } } }} />
                            </div>
                        ) : (
                            <p className='text-center text-gray-500'>ไม่มีข้อมูลการชำระเงินในรอบนี้สำหรับทำกราฟ</p>
                        )}
                    </div>
                </div>

                {/* รายละเอียดคำสั่งซื้อ (ใช้ filteredOrders) */}
                <div className="bg-white p-6 rounded-lg shadow-xl">
                    <h2 className="text-2xl font-semibold mb-4 text-gray-800">
                        รายละเอียดคำสั่งซื้อ ({filteredOrders.length} รายการ)
                    </h2>
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order ID</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">โต๊ะ</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ยอดรวม</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">เวลา</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">วิธีชำระ</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {filteredOrders.map((order) => ( // 💡 ใช้ filteredOrders
                                    <tr key={order._id}>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{order._id.substring(18)}...</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{order.tableNumber || 'N/A'}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600 font-bold">{order.total_amount.toFixed(2)}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(order.createdAt).toLocaleString()}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{order.payment_method || 'N/A'}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </main>
    );
};

export default ReportsPage;