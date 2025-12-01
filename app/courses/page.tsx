// 'use client'; 

// import React from 'react';
// import { Search, Plus, X, User, Users, ChevronLeft } from 'lucide-react';

// export default function InstructorCoursesPage() {
//   // 1. DỮ LIỆU GIẢ (MOCK DATA)
//   // Đây là phần bạn "hard code" để hiển thị được lên màn hình
//   const courses = [
//     { id: 1, name: 'Database System', instructor: 'Nguyen Van A', current: 15, max: 30 },
//     { id: 2, name: 'General Physics', instructor: 'Nguyen Van A', current: 20, max: 30 },
//     { id: 3, name: 'Database System', instructor: 'Nguyen Van A', current: 15, max: 30 },
//   ];

//   return (
//     <div style={{ 
//       fontFamily: 'Arial, sans-serif', 
//       minHeight: '100vh', 
//       backgroundColor: '#fff',
//       paddingBottom: '50px'
//     }}>
      
//       {/* --- PHẦN HEADER (Giả lập thanh điều hướng trên cùng) --- */}
//       {/* Lưu ý: Thường phần này nằm ở layout.tsx, nhưng mình để đây để bạn dễ nhìn tổng thể */}
//       <div style={{ backgroundColor: '#0078d4', padding: '10px 20px', display: 'flex', justifyContent: 'space-between', color: 'white', alignItems: 'center' }}>
//         <div style={{ fontWeight: 'bold', fontSize: '1.2rem' }}>BKTutor</div>
//         <div style={{ display: 'flex', gap: '20px', fontSize: '0.9rem' }}>
//             <span>Home</span>
//             <span>Courses</span>
//             <span style={{fontWeight: 'bold'}}>PROFILE</span>
//         </div>
//       </div>

//       {/* --- NỘI DUNG CHÍNH --- */}
//       <div style={{ maxWidth: '800px', margin: '0 auto', padding: '20px' }}>
        
//         {/* Nút Back */}
//         <div style={{ marginBottom: '10px', cursor: 'pointer' }}>
//             <ChevronLeft size={30} />
//         </div>

//         {/* Tiêu đề COURSES to đùng */}
//         <h1 style={{ 
//             textAlign: 'center', 
//             fontSize: '3rem', 
//             fontWeight: '900', 
//             margin: '0 0 30px 0',
//             fontFamily: 'Impact, sans-serif' // Font đậm giống hình
//         }}>
//             Courses
//         </h1>

//         {/* Thanh tìm kiếm & Nút Create */}
//         <div style={{ display: 'flex', gap: '15px', marginBottom: '30px' }}>
//             {/* Ô tìm kiếm */}
//             <div style={{ 
//                 flex: 1, 
//                 backgroundColor: '#9ca3af', // Màu xám background input
//                 borderRadius: '5px',
//                 display: 'flex',
//                 alignItems: 'center',
//                 padding: '5px 15px'
//             }}>
//                 <Search color="white" size={20} />
//                 <input 
//                     type="text" 
//                     placeholder="Search for course" 
//                     style={{
//                         background: 'transparent',
//                         border: 'none',
//                         outline: 'none',
//                         color: 'white',
//                         width: '100%',
//                         marginLeft: '10px',
//                         fontWeight: '500'
//                     }}
//                 />
//             </div>

//             {/* Nút Create màu xanh cyan */}
//             <button style={{
//                 backgroundColor: '#00bcd4',
//                 border: 'none',
//                 borderRadius: '5px',
//                 padding: '10px 20px',
//                 display: 'flex',
//                 alignItems: 'center',
//                 gap: '5px',
//                 color: 'black',
//                 fontWeight: 'bold',
//                 cursor: 'pointer',
//                 boxShadow: '0 2px 5px rgba(0,0,0,0.2)'
//             }}>
//                 <div style={{ background:'black', borderRadius:'50%', padding:'2px', display:'flex'}}>
//                     <Plus size={12} color="white" />
//                 </div>
//                 Create
//             </button>
//         </div>

//         {/* DANH SÁCH KHÓA HỌC (Mapping dữ liệu giả ra giao diện) */}
//         <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
//             {courses.map((course) => (
//                 <div key={course.id} style={{
//                     borderRadius: '15px',
//                     overflow: 'hidden',
//                     boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
//                     fontFamily: 'sans-serif'
//                 }}>
//                     {/* Header của thẻ Card (Màu xanh đậm) */}
//                     <div style={{
//                         backgroundColor: '#1e293b', // Màu xanh đen
//                         padding: '12px 20px',
//                         display: 'flex',
//                         justifyContent: 'space-between',
//                         alignItems: 'center',
//                         color: 'white'
//                     }}>
//                         <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 'bold' }}>{course.name}</h3>
//                         <button style={{ background: 'transparent', border: 'none', cursor: 'pointer' }}>
//                             <div style={{ background:'#00bcd4', borderRadius:'50%', padding:'2px', display:'flex'}}>
//                                 <X size={14} color="white" />
//                             </div>
//                         </button>
//                     </div>

//                     {/* Phần thân của thẻ Card (Màu xám nhạt) */}
//                     <div style={{
//                         backgroundColor: '#e5e7eb', // Màu xám nhạt
//                         padding: '15px 20px',
//                         color: '#374151'
//                     }}>
//                         <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '5px' }}>
//                             <User size={18} />
//                             <span style={{ fontWeight: '600' }}>{course.instructor}</span>
//                         </div>
//                         <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
//                             <Users size={18} />
//                             <span style={{ fontWeight: '600' }}>{course.current}/{course.max}</span>
//                         </div>
//                     </div>
//                 </div>
//             ))}
//         </div>

//         {/* Nút More ở dưới cùng */}
//         <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '20px' }}>
//             <button style={{
//                 backgroundColor: '#d1d5db',
//                 border: 'none',
//                 padding: '5px 25px',
//                 borderRadius: '20px',
//                 fontWeight: 'bold',
//                 cursor: 'pointer'
//             }}>
//                 More
//             </button>
//         </div>

//       </div>
//     </div>
//   );
// }




'use client'; 

import React, { useState, useEffect } from 'react';
import { Search, Plus, X, User, Users, ChevronLeft } from 'lucide-react';

export default function InstructorCoursesPage() {
  // 1. KHAI BÁO STATE
  // courses: chứa dữ liệu thật lấy từ DB
  const [courses, setCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  // 2. HÀM LẤY DỮ LIỆU TỪ API (FETCH DATA)
  const fetchCourses = async (search = '') => {
    try {
      setLoading(true);
      // Gọi cái API mình vừa tạo ở Bước 1
      const res = await fetch(`/api/courses?search=${search}`);
      if (!res.ok) throw new Error('Failed to fetch');
      const data = await res.json();
      setCourses(data);
    } catch (error) {
      console.error("Lỗi tải dữ liệu:", error);
    } finally {
      setLoading(false);
    }
  };

  // 3. GỌI HÀM KHI TRANG VỪA TẢI
  useEffect(() => {
    fetchCourses();
  }, []);

  // Xử lý khi bấm Enter tìm kiếm
  const handleSearch = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
        fetchCourses(searchTerm);
    }
  };

  return (
    <div style={{ 
      fontFamily: 'Arial, sans-serif', 
      minHeight: '100vh', 
      backgroundColor: '#fff',
      paddingBottom: '50px'
    }}>
      
      {/* --- HEADER --- */}
      {/* <div style={{ backgroundColor: '#0078d4', padding: '10px 20px', display: 'flex', justifyContent: 'space-between', color: 'white', alignItems: 'center' }}>
        <div style={{ fontWeight: 'bold', fontSize: '1.2rem' }}>BKTutor</div>
        <div style={{ display: 'flex', gap: '20px', fontSize: '0.9rem' }}>
            <span>Home</span>
            <span>Courses</span>
            <span style={{fontWeight: 'bold'}}>PROFILE</span>
        </div>
      </div> */}

      {/* --- BODY --- */}
      <div style={{ maxWidth: '800px', margin: '0 auto', padding: '20px' }}>
        
        <h1 style={{ textAlign: 'center', fontSize: '3rem', fontWeight: '900', margin: '0 0 30px 0', fontFamily: 'Impact, sans-serif' }}>
            Courses
        </h1>

        {/* --- THANH TÌM KIẾM --- */}
        <div style={{ display: 'flex', gap: '15px', marginBottom: '30px' }}>
            <div style={{ flex: 1, backgroundColor: '#9ca3af', borderRadius: '5px', display: 'flex', alignItems: 'center', padding: '5px 15px' }}>
                <Search color="white" size={20} />
                <input 
                    type="text" 
                    placeholder="Search for course (Enter to search)" 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    onKeyDown={handleSearch}
                    style={{ background: 'transparent', border: 'none', outline: 'none', color: 'white', width: '100%', marginLeft: '10px', fontWeight: '500' }}
                />
            </div>

            <button style={{ backgroundColor: '#00bcd4', border: 'none', borderRadius: '5px', padding: '10px 20px', display: 'flex', alignItems: 'center', gap: '5px', color: 'black', fontWeight: 'bold', cursor: 'pointer', boxShadow: '0 2px 5px rgba(0,0,0,0.2)' }}>
                <div style={{ background:'black', borderRadius:'50%', padding:'2px', display:'flex'}}>
                    <Plus size={12} color="white" />
                </div>
                Create
            </button>
        </div>

        {/* --- DANH SÁCH KHÓA HỌC (DATA THẬT) --- */}
        {loading ? (
            <p style={{textAlign: 'center', color: '#666'}}>Đang tải dữ liệu từ Database...</p>
        ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                {courses.length === 0 ? (
                    <p style={{textAlign: 'center'}}>Không tìm thấy khóa học nào.</p>
                ) : (
                    courses.map((course) => (
                        <div key={course.courseID || course.id} style={{ borderRadius: '15px', overflow: 'hidden', boxShadow: '0 4px 6px rgba(0,0,0,0.1)', fontFamily: 'sans-serif' }}>
                            {/* Header Card */}
                            <div style={{ backgroundColor: '#1e293b', padding: '12px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: 'white' }}>
                                {/* Lưu ý: course.name hoặc course.title tùy vào tên cột trong DB */}
                                <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 'bold' }}>
                                    {course.name || course.title || "No Name"}
                                </h3>
                                <button style={{ background: 'transparent', border: 'none', cursor: 'pointer' }}>
                                    <div style={{ background:'#00bcd4', borderRadius:'50%', padding:'2px', display:'flex'}}>
                                        <X size={14} color="white" />
                                    </div>
                                </button>
                            </div>

                            {/* Body Card */}
                            <div style={{ backgroundColor: '#e5e7eb', padding: '15px 20px', color: '#374151' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '5px' }}>
                                    <User size={18} />
                                    <span style={{ fontWeight: '600' }}>
                                        {course.instructor || "Unknown Instructor"}
                                    </span>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                    <Users size={18} />
                                    <span style={{ fontWeight: '600' }}>
                                        {/* Nếu DB chưa có số liệu này thì hiển thị mặc định */}
                                        {course.current_students || 0}/{course.max_students || 30}
                                    </span>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        )}

        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '20px' }}>
            <button style={{ backgroundColor: '#d1d5db', border: 'none', padding: '5px 25px', borderRadius: '20px', fontWeight: 'bold', cursor: 'pointer' }}>
                More
            </button>
        </div>

      </div>
    </div>
  );
}