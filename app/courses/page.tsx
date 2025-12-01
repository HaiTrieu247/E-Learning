'use client'; 

import React, { useState } from 'react'; // Thêm useState
import { Search, Plus, X, User, Users, ChevronLeft, ArrowUpDown } from 'lucide-react'; // Thêm icon ArrowUpDown

export default function InstructorCoursesPage() {
  
  // 1. DỮ LIỆU GIẢ (MOCK DATA) - Đã chỉnh sửa cho phong phú hơn
  const initialCourses = [
    { id: 1, name: 'Database System', instructor: 'Nguyen Van A', current: 15, max: 30 },
    { id: 2, name: 'General Physics', instructor: 'Tran Van B', current: 28, max: 30 }, // Đông học sinh
    { id: 3, name: 'Web Development', instructor: 'Le Thi C', current: 5, max: 30 },   // Ít học sinh
    { id: 4, name: 'Algorithms', instructor: 'Nguyen Van A', current: 20, max: 40 },   // Tên vần A
    { id: 5, name: 'Machine Learning', instructor: 'Pham Van D', current: 30, max: 30 }, // Full lớp
  ];

  // 2. STATE QUẢN LÝ (Tìm kiếm & Sắp xếp)
  const [searchTerm, setSearchTerm] = useState('');
  const [sortType, setSortType] = useState('default'); // 'default', 'name-asc', 'students-desc'

  // 3. LOGIC XỬ LÝ (Filter -> Sort)
  // Bước 1: Lọc theo từ khóa tìm kiếm
  const filteredCourses = initialCourses.filter((course) => 
    course.name.toLowerCase().startsWith(searchTerm.toLowerCase())
  );

  // Bước 2: Sắp xếp kết quả đã lọc
  const sortedCourses = [...filteredCourses].sort((a, b) => {
    if (sortType === 'name-asc') {
        return a.name.localeCompare(b.name); // Sắp xếp A-Z
    }
    if (sortType === 'students-desc') {
        return b.current - a.current; // Sắp xếp số lượng từ Cao xuống Thấp
    }
    return 0; // Mặc định giữ nguyên
  });

  return (
    <div style={{ 
      fontFamily: 'Arial, sans-serif', 
      minHeight: '100vh', 
      backgroundColor: '#fff',
      paddingBottom: '50px'
    }}>
      
      {/* --- NỘI DUNG CHÍNH --- */}
      <div style={{ maxWidth: '800px', margin: '0 auto', padding: '20px' }}>
        
        {/* Nút Back */}
        {/* <div style={{ marginBottom: '10px', cursor: 'pointer' }}><ChevronLeft size={30} /></div> */}

        <h1 style={{ 
            textAlign: 'center', 
            fontSize: '3rem', 
            fontWeight: '900', 
            margin: '0 0 30px 0',
            fontFamily: 'Impact, sans-serif'
        }}>
            Courses
        </h1>

        {/* --- THANH CÔNG CỤ: SEARCH + SORT + CREATE --- */}
        <div style={{ display: 'flex', gap: '10px', marginBottom: '30px', flexWrap: 'wrap' }}>
            
            {/* 1. Ô tìm kiếm */}
            <div style={{ 
                flex: 1, 
                backgroundColor: '#9ca3af', 
                borderRadius: '5px',
                display: 'flex',
                alignItems: 'center',
                padding: '5px 15px',
                minWidth: '200px'
            }}>
                <Search color="white" size={20} />
                <input 
                    type="text" 
                    placeholder="Search by name..." 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)} // Cập nhật state khi gõ
                    style={{
                        background: 'transparent',
                        border: 'none',
                        outline: 'none',
                        color: 'white',
                        width: '100%',
                        marginLeft: '10px',
                        fontWeight: '500'
                    }}
                />
            </div>

            {/* 2. Dropdown Sắp xếp (Sort)*/}
            <div style={{
                position: 'relative',
                backgroundColor: '#f3f4f6',
                borderRadius: '5px',
                border: '1px solid #d1d5db'
            }}>
                <div style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)' }}>
                    <ArrowUpDown size={16} color="#4b5563" />
                </div>
                <select 
                    onChange={(e) => setSortType(e.target.value)}
                    style={{
                        height: '100%',
                        padding: '10px 10px 10px 35px',
                        border: 'none',
                        background: 'transparent',
                        cursor: 'pointer',
                        outline: 'none',
                        fontWeight: '600',
                        color: '#374151'
                    }}
                >
                    <option value="default">Sort by...</option>
                    <option value="name-asc">Name (A-Z)</option>
                    <option value="students-desc">Most Students</option>
                </select>
            </div>

            {/* 3. Nút Create */}
            <button style={{
                backgroundColor: '#00bcd4',
                border: 'none',
                borderRadius: '5px',
                padding: '10px 20px',
                display: 'flex',
                alignItems: 'center',
                gap: '5px',
                color: 'black',
                fontWeight: 'bold',
                cursor: 'pointer',
                boxShadow: '0 2px 5px rgba(0,0,0,0.2)'
            }}>
                <div style={{ background:'black', borderRadius:'50%', padding:'2px', display:'flex'}}>
                    <Plus size={12} color="white" />
                </div>
                Create
            </button>
        </div>

        {/* --- DANH SÁCH KHÓA HỌC (Render biến sortedCourses) --- */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {sortedCourses.length > 0 ? (
                sortedCourses.map((course) => (
                    <div key={course.id} style={{
                        borderRadius: '15px',
                        overflow: 'hidden',
                        boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
                        fontFamily: 'sans-serif'
                    }}>
                        <div style={{
                            backgroundColor: '#1e293b',
                            padding: '12px 20px',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            color: 'white'
                        }}>
                            <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 'bold' }}>{course.name}</h3>
                            <button style={{ background: 'transparent', border: 'none', cursor: 'pointer' }}>
                                <div style={{ background:'#00bcd4', borderRadius:'50%', padding:'2px', display:'flex'}}>
                                    <X size={14} color="white" />
                                </div>
                            </button>
                        </div>

                        <div style={{
                            backgroundColor: '#e5e7eb',
                            padding: '15px 20px',
                            color: '#374151'
                        }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '5px' }}>
                                <User size={18} />
                                <span style={{ fontWeight: '600' }}>{course.instructor}</span>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <Users size={18} />
                                <span style={{ fontWeight: '600' }}>{course.current}/{course.max}</span>
                            </div>
                        </div>
                    </div>
                ))
            ) : (
                <p style={{ textAlign: 'center', color: '#666' }}>No courses found.</p>
            )}
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '20px' }}>
            <button style={{
                backgroundColor: '#d1d5db',
                border: 'none',
                padding: '5px 25px',
                borderRadius: '20px',
                fontWeight: 'bold',
                cursor: 'pointer'
            }}>
                More
            </button>
        </div>

      </div>
    </div>
  );
}

