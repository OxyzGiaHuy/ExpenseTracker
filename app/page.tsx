'use client' // Chỉ định đây là Client Component trong Next.js, cho phép sử dụng các hooks và tương tác người dùng

import React, { useState, useEffect } from 'react';
import { Calendar, ChevronLeft, ChevronRight } from 'lucide-react'; // Import các icon
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'; // Import components UI
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'; // Import components biểu đồ

// Danh sách các danh mục chi tiêu cố định
const categories = [
  "Ăn uống",
  "Di chuyển",
  "Mua sắm",
  "Giải trí",
  "Hóa đơn",
  "Y tế",
  "Khác"
];

export default function Home() {
  // Khởi tạo state cho danh sách chi tiêu, đọc từ localStorage nếu có
  const [expenses, setExpenses] = useState(() => {
    if (typeof window !== 'undefined') { // Kiểm tra môi trường browser
      const saved = localStorage.getItem('expenses');
      return saved ? JSON.parse(saved) : [];
    }
    return [];
  });
  
  // State cho ngày hiện tại và chi tiêu mới
  const [currentDate, setCurrentDate] = useState(new Date());
  const [newExpense, setNewExpense] = useState({
    name: '',
    amount: '',
    category: categories[0]
  });

  // Lưu expenses vào localStorage mỗi khi có thay đổi
  useEffect(() => {
    localStorage.setItem('expenses', JSON.stringify(expenses));
  }, [expenses]);

  // Xử lý chuyển đổi ngày trước/sau
  const handlePrevDay = () => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      newDate.setDate(prev.getDate() - 1);
      return newDate;
    });
  };

  const handleNextDay = () => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      newDate.setDate(prev.getDate() + 1);
      return newDate;
    });
  };

  // Xử lý thêm chi tiêu mới
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newExpense.name || !newExpense.amount) return; // Kiểm tra dữ liệu đầu vào

    const expense = {
      ...newExpense,
      date: currentDate.toISOString(),
      id: Date.now(), // Tạo ID duy nhất
      amount: parseFloat(newExpense.amount)
    };

    setExpenses((prev: any[]) => [...prev, expense]);
    setNewExpense({ name: '', amount: '', category: categories[0] }); // Reset form
  };

  // Tính toán thống kê theo tháng cho biểu đồ
  const getMonthlyStats = () => {
    const currentMonth = currentDate.getMonth();
    const currentYear = currentDate.getFullYear();
    
    // Lọc chi tiêu trong tháng hiện tại
    const monthExpenses = expenses.filter(expense => {
      const expenseDate = new Date(expense.date);
      return expenseDate.getMonth() === currentMonth && 
             expenseDate.getFullYear() === currentYear;
    });

    // Tính tổng cho từng danh mục
    return categories.map(category => ({
      name: category,
      total: monthExpenses
        .filter(e => e.category === category)
        .reduce((sum, e) => sum + e.amount, 0)
    }));
  };

  // Lấy danh sách chi tiêu của ngày hiện tại
  const getTodayExpenses = () => {
    return expenses.filter(expense => {
      const expenseDate = new Date(expense.date);
      return expenseDate.toDateString() === currentDate.toDateString();
    });
  };

  // Định dạng số tiền theo định dạng tiền tệ Việt Nam
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };

  // Giao diện người dùng
  return (
    <div className="max-w-4xl mx-auto p-4 space-y-6">
      {/* Card nhập liệu chi tiêu */}
      <Card>
        <CardHeader>
          <CardTitle>
            <div className="flex flex-col items-center gap-2">
              <button onClick={handlePrevDay} className="w-full p-2 hover:bg-gray-100 rounded">
                <ChevronLeft className="w-6 h-6 mx-auto" />
              </button>
              <div className="flex items-center gap-2 py-2">
                <Calendar className="w-5 h-5" />
                {currentDate.toLocaleDateString('vi-VN')}
              </div>
              <button onClick={handleNextDay} className="w-full p-2 hover:bg-gray-100 rounded">
                <ChevronRight className="w-6 h-6 mx-auto" />
              </button>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {/* Form nhập chi tiêu mới */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="flex gap-4">
              <input
                type="text"
                placeholder="Tên chi tiêu"
                value={newExpense.name}
                onChange={e => setNewExpense(prev => ({ ...prev, name: e.target.value }))}
                className="flex-1 p-2 border rounded"
              />
              <input
                type="number"
                placeholder="Số tiền"
                value={newExpense.amount}
                onChange={e => setNewExpense(prev => ({ ...prev, amount: e.target.value }))}
                className="w-32 p-2 border rounded"
              />
              <select
                value={newExpense.category}
                onChange={e => setNewExpense(prev => ({ ...prev, category: e.target.value }))}
                className="w-40 p-2 border rounded"
              >
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                Thêm
              </button>
            </div>
          </form>

          {/* Danh sách chi tiêu trong ngày */}
          <div className="mt-6 space-y-4">
            {getTodayExpenses().map(expense => (
              <div key={expense.id} className="flex justify-between items-center p-3 bg-gray-50 rounded">
                <div>
                  <div className="font-medium">{expense.name}</div>
                  <div className="text-sm text-gray-600">{expense.category}</div>
                </div>
                <div className="font-medium">
                  {formatCurrency(expense.amount)}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Card biểu đồ thống kê */}
      <Card>
        <CardHeader>
          <CardTitle>Thống kê tháng {currentDate.getMonth() + 1}/{currentDate.getFullYear()}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={getMonthlyStats()}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                <Bar dataKey="total" fill="#3b82f6" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}