/* eslint-disable @typescript-eslint/no-explicit-any */
'use client' // Chỉ định đây là Client Component trong Next.js, cho phép sử dụng các hooks và tương tác người dùng

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'; // Import components UI
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts'; // Import components biểu đồ
import { 
  Calendar,
  ChevronLeft, ChevronRight,
  Utensils, // Ăn uống
  Car, // Di chuyển
  ShoppingBag, // Mua sắm
  GraduationCap, // Học tập
  Gamepad2, // Giải trí
  Receipt, // Hóa đơn
  Stethoscope, // Y tế
  Bath, // Tắm giặt 
  MoreHorizontal // Khác
} from 'lucide-react';

// Định nghĩa kiểu dữ liệu cho chi tiêu
type Expense = {
  id: number;
  name: string;
  amount: number;
  category: string;
  date: string;
};

// Danh sách các danh mục chi tiêu cố định
const categories = [
  "Ăn uống",
  "Di chuyển",
  "Mua sắm",
  "Học tập",
  "Giải trí",
  "Hóa đơn",
  "Y tế",
  "Tắm giặt",
  "Khác"
];

// Cập nhật bảng màu với các màu tương phản hơn
const COLORS = [
  '#FF6B6B', // Đỏ san hô
  '#4ECDC4', // Xanh ngọc
  '#FFD93D', // Vàng
  '#6C5CE7', // Tím
  '#A8E6CF', // Xanh mint
  '#FF8B94', // Hồng
  '#98DDCA', // Xanh lá nhạt
  '#FF9A8B', // Cam hồng
  '#45B7D1'  // Xanh dương
];

// Icon mapping cho từng category
const categoryIcons = {
  "Ăn uống": Utensils,
  "Di chuyển": Car,
  "Mua sắm": ShoppingBag,
  "Học tập": GraduationCap,
  "Giải trí": Gamepad2,
  "Hóa đơn": Receipt,
  "Y tế": Stethoscope,
  "Tắm giặt": Bath,
  "Khác": MoreHorizontal
};

// Custom label cho biểu đồ tròn
const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, name }: { cx: number, cy: number, midAngle: number, innerRadius: number, outerRadius: number, percent: number, name: string }) => {
  const RADIAN = Math.PI / 180;
  const radius = innerRadius + (outerRadius - innerRadius) * 1.4; // Tăng khoảng cách để tránh chồng chéo
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);

  return (
    <text 
      x={x} 
      y={y} 
      fill="black" 
      textAnchor={x > cx ? 'start' : 'end'} 
      dominantBaseline="central"
      fontSize={12}
    >
      {`${name} (${(percent * 100).toFixed(0)}%)`}
    </text>
  );
};

export default function Home() {
  // Khởi tạo state cho danh sách chi tiêu, đọc từ localStorage nếu có
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    const saved = localStorage.getItem('expenses');
    if (saved) {
      setExpenses(JSON.parse(saved));
    }
    setIsLoading(false);
  }, []);

  // State cho ngày hiện tại, chi tiêu mới và tháng đang chọn để xem thống kê
  const [currentDate, setCurrentDate] = useState(() => new Date().toISOString());
  const [newExpense, setNewExpense] = useState({
    name: '',
    amount: '',
    category: categories[0]
  });
  const [selectedMonth, setSelectedMonth] = useState(() => {
    const today = new Date();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const year = today.getFullYear();
    return `${year}-${month}`;
  });

  // Lưu expenses vào localStorage mỗi khi có thay đổi
  useEffect(() => {
    localStorage.setItem('expenses', JSON.stringify(expenses));
  }, [expenses]);

  // Xử lý chuyển đổi ngày trước/sau
  const handlePrevDay = () => {
    setCurrentDate(prev => {
      const date = new Date(prev);
      date.setDate(date.getDate() - 1);
      return date.toISOString();
    });
  };

  const handleNextDay = () => {
    setCurrentDate(prev => {
      const date = new Date(prev);
      date.setDate(date.getDate() + 1);
      return date.toISOString();
    });
  };

  // Xử lý thêm chi tiêu mới
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newExpense.name || !newExpense.amount) return; // Kiểm tra dữ liệu đầu vào

    const expense = {
      ...newExpense,
      date: new Date(currentDate).toISOString(),
      id: Date.now(), // Tạo ID duy nhất
      amount: parseFloat(newExpense.amount)
    };

    setExpenses((prev: any[]) => [...prev, expense]);
    setNewExpense({ name: '', amount: '', category: categories[0] }); // Reset form
  };

  // Hàm lấy tất cả các tháng có dữ liệu
  const getAvailableMonths = () => {
    const months = new Set();
    expenses.forEach((expense: Expense) => {
      const date = new Date(expense.date);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      months.add(monthKey);
    });
    return Array.from(months).sort((a, b) => new Date(b as string).getTime() - new Date(a as string).getTime());
  };

  // Tính toán thống kê theo tháng cho biểu đồ
  // Sửa đổi hàm getMonthlyStats để sử dụng selectedMonth
  const getMonthlyStats = () => {
    const [year, month] = selectedMonth.split('-').map(Number);
    
    const monthExpenses: Expense[] = expenses.filter((expense: Expense) => {
      const expenseDate = new Date(expense.date);
      return expenseDate.getMonth() === month - 1 && 
        expenseDate.getFullYear() === year;
    });

    return categories.map(category => {
      const total = monthExpenses
        .filter(e => e.category === category)
        .reduce((sum, e) => sum + e.amount, 0);
      return {
        name: category,
        total: total
      };
    }).filter(item => item.total > 0); // Chỉ hiển thị các danh mục có chi tiêu
  };

  // Lấy danh sách chi tiêu của ngày hiện tại
  const getTodayExpenses = (): Expense[] => {
    return expenses.filter((expense: Expense) => {
      const expenseDate = new Date(expense.date);
      return expenseDate.toDateString() === new Date(currentDate).toDateString();
    });
  };

  // Định dạng số tiền theo định dạng tiền tệ Việt Nam
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };

  // Định dạng hiển thị số
  const formatCompactNumber = (number: number) => {
    if (number >= 1000000) {
      return (number / 1000000).toFixed(1) + 'tr';
    } else if (number >= 1000) {
      return (number / 1000).toFixed(1) + 'k';
    }
    return number;
  }

  // Xóa bản ghi chi tiêu
  const handleDeleteExpense = (id: number) => {
  // Hiện hộp thoại xác nhận trước khi xóa
  if (window.confirm('Bạn có chắc chắn muốn xóa khoản chi tiêu này?')) {
      // Lọc ra danh sách mới không bao gồm expense có id được chọn
      setExpenses(prev => prev.filter(expense => expense.id !== id));
    }
  };

  // Hàm để render icon cho XAxis
  const renderCategoryIcon = (props: { x: number; y: number; payload: { value: string } }) => {
    const { x, y, payload } = props;
    const IconComponent = categoryIcons[payload.value as keyof typeof categoryIcons];
    
    return (
      <g transform={`translate(${x},${y})`}>
        <IconComponent size={16} strokeWidth={2} className="text-gray-600" />
      </g>
    );
  };

  // Giao diện người dùng
  if (isLoading) {
    return <div className="max-w-4xl mx-auto p-4">Đang tải dữ liệu...</div>;
  }

  return (
    <div className="max-w-6xl mx-auto p-4 space-y-6">
      {/* Card nhập liệu chi tiêu */}
      <Card>
        <CardHeader>
          <CardTitle>
            <div className="flex items-center justify-center gap-4">
              <button onClick={handlePrevDay} className="w-full p-2 hover:bg-gray-100 rounded">
                <ChevronLeft className="w-6 h-6 mx-auto" />
              </button>
              <div className="flex items-center gap-2 py-2">
                <Calendar className="w-5 h-5" />
                {new Date(currentDate).toLocaleDateString('vi-VN')}
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
                className="flex-1 px-4 py-2 rounded-lg border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <input
                type="number"
                placeholder="Số tiền"
                value={newExpense.amount}
                onChange={e => setNewExpense(prev => ({ ...prev, amount: e.target.value }))}
                className="w-32 px-4 py-2 rounded-lg border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <select
                value={newExpense.category}
                onChange={e => setNewExpense(prev => ({ ...prev, category: e.target.value }))}
                className="w-40 px-4 py-2 rounded-lg border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
              <button
                type="submit"
                className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                Thêm
              </button>
            </div>
          </form>

          {/* Danh sách chi tiêu trong ngày */}
          <div className="mt-6 space-y-4">
            {getTodayExpenses().map(expense => (
              <div key={expense.id} className="flex justify-between items-center p-3 bg-gray-50 rounded">
                <div className="flex-1">
                  <div className="font-medium text-gray-900">{expense.name}</div>
                  <div className="text-sm text-gray-600">{expense.category}</div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="font-medium text-gray-900">
                    {formatCurrency(expense.amount)}
                  </div>
                  <button
                    onClick={() => handleDeleteExpense(expense.id)}
                    className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors"
                    title="Xóa chi tiêu"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M3 6h18" />
                      <path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6" />
                      <path d="M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2" />
                      <line x1="10" y1="11" x2="10" y2="17" />
                      <line x1="14" y1="11" x2="14" y2="17" />
                    </svg>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Card biểu đồ thống kê */}
      <Card>
        <CardHeader>
          <CardTitle className="flex justify-between items-center gap-4">
            <span>Thống kê chi tiêu </span>
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="p-2 border rounded"
            >
              {getAvailableMonths().map((month) => (
                <option key={month as string} value={month as string}>
                  Tháng {(month as string).split('-')[1]}/{(month as string).split('-')[0]}
                </option>
              ))}
            </select>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Biểu đồ cột hiện tại */}
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={getMonthlyStats()} margin={{ left: 20, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="name" 
                    tick={renderCategoryIcon}
                    interval={0}
                    height={40}
                  />
                  <YAxis 
                    width={80} // Điều chỉnh độ rộng của trục Y
                    tickFormatter={(value) => String(formatCompactNumber(value))} // Định dạng số
                  />
                  <Tooltip 
                    formatter={(value) => formatCurrency(Number(value))}
                    labelFormatter={(label) => `${label}`} // Hiển thị tên category đầy đủ trong tooltip
                  />
                  <Bar dataKey="total" fill={COLORS[0]}>
                    {/* Thêm các Cell để match màu với biểu đồ tròn */}
                    {getMonthlyStats().map((entry, index) => (
                      <Cell key={entry.name} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
            
            {/* Biểu đồ tròn mới */}
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={getMonthlyStats()}
                    dataKey="total"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    labelLine={true}
                    label={renderCustomizedLabel}
                  >
                    {getMonthlyStats().map((entry, index) => (
                      <Cell key={entry.name} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                  <Legend formatter={(value) => {
                    const IconComponent = categoryIcons[value as keyof typeof categoryIcons];
                    return (
                      <span className="flex items-center gap-2">
                        <IconComponent size={16} className="inline" />
                        {value}
                      </span>
                    );
                  }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
          
          {/* Tổng chi tiêu */}
          <div className="mt-6 p-4 bg-gray-50 rounded">
            <h4 className="font-semibold">Tổng chi tiêu: {
              formatCurrency(getMonthlyStats().reduce((sum, item) => sum + item.total, 0))
            }</h4>
          </div>
        </CardContent>
      </Card>

      {/* Thêm credit */}
      <footer className="text-center text-gray-500 text-sm py-4">
        Made with ❤️ by Gia Huy Thai
      </footer>
    </div>
  );
}