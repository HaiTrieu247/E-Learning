# Database Migration Guide - ELearning v2.0

## Tổng quan thay đổi

Database version 2.0 đã loại bỏ entity `manageObjects` và tích hợp các thuộc tính của nó trực tiếp vào bảng `users` và `courses`.

### Thay đổi chính:

1. **Loại bỏ bảng `manageObjects`**
2. **Bảng `users` có thêm:**
   - `approvalStatus` (pending, approved, rejected)
   - `accountStatus` (active, inactive, suspended)
   - `createdDate`
3. **Bảng `courses` có thêm:**
   - `approvalStatus` (pending, approved, rejected)
   - `courseStatus` (draft, active, archived)
   - `createdDate`
   - `lastModified`
4. **Bảng `adminManagement` đơn giản hóa:**
   - Quản lý trực tiếp users và courses
   - `targetType` (user, course)
   - `targetID` (userID hoặc courseID)

## Bước 1: Backup Database hiện tại

```powershell
# Export database hiện tại
mysqldump -u root -p elearning > backup_elearning_old.sql
```

## Bước 2: Tạo Database mới

```sql
-- Trong MySQL
DROP DATABASE IF EXISTS elearning;
CREATE DATABASE elearning;
USE elearning;

-- Chạy file schema mới
SOURCE E:/coding/Database/elearning-app/ELearning_v2.sql;

-- Chạy file sample data
SOURCE E:/coding/Database/elearning-app/ELearning_v2_SampleData.sql;
```

## Bước 3: Migrate dữ liệu cũ (nếu cần)

Nếu bạn muốn giữ lại dữ liệu từ database cũ, tạo file migration script:

```sql
-- Migration từ database cũ sang mới
USE elearning;

-- Migrate Users (với dữ liệu từ manageObjects)
INSERT INTO users (FNAME, LNAME, phoneNumber, email, username, password_hashed, role, approvalStatus, accountStatus, createdDate)
SELECT 
    u.FNAME, 
    u.LNAME, 
    u.phoneNumber, 
    u.email, 
    u.username, 
    u.password_hashed, 
    u.role,
    COALESCE(m.objectApprovalStatus, 'approved') as approvalStatus,
    COALESCE(m.objectStatus, 'active') as accountStatus,
    COALESCE(m.createdDate, CURRENT_TIMESTAMP) as createdDate
FROM old_elearning.users u
LEFT JOIN old_elearning.manageObjects m ON u.objectID = m.objectID;

-- Migrate role-specific tables
INSERT INTO learners (userID, enrollmentDate)
SELECT u_new.userID, l_old.enrollmentDate
FROM old_elearning.learners l_old
JOIN old_elearning.users u_old ON l_old.userID = u_old.userID
JOIN users u_new ON u_old.username = u_new.username;

INSERT INTO instructors (userID, Bio, specialty)
SELECT u_new.userID, i_old.Bio, i_old.specialty
FROM old_elearning.instructors i_old
JOIN old_elearning.users u_old ON i_old.userID = u_old.userID
JOIN users u_new ON u_old.username = u_new.username;

INSERT INTO administrators (userID, accessLevel)
SELECT u_new.userID, a_old.accessLevel
FROM old_elearning.administrators a_old
JOIN old_elearning.users u_old ON a_old.userID = u_old.userID
JOIN users u_new ON u_old.username = u_new.username;

-- Migrate Courses (với dữ liệu từ manageObjects)
INSERT INTO courses (courseTitle, courseDescription, categoryID, approvalStatus, courseStatus, createdDate)
SELECT 
    c.courseTitle,
    c.courseDescription,
    c.categoryID,
    COALESCE(m.objectApprovalStatus, 'approved') as approvalStatus,
    CASE 
        WHEN m.objectStatus = 'active' THEN 'active'
        WHEN m.objectStatus = 'inactive' THEN 'archived'
        ELSE 'draft'
    END as courseStatus,
    COALESCE(m.createdDate, CURRENT_TIMESTAMP) as createdDate
FROM old_elearning.courses c
LEFT JOIN old_elearning.manageObjects m ON c.objectID = m.objectID;

-- Continue with other tables...
-- (courseEnrollments, courseDesignments, modules, lessons, etc.)
```

## Bước 4: Cập nhật Connection String

File: `backend/config/db.js` đã được cập nhật để không sử dụng singleton pattern.

## Bước 5: Test Application

### Test Backend Services:
```powershell
# Trong project directory
npm run dev
```

### Test User Management:
1. Login với admin account
2. Navigate to `/admin/users`
3. Test approve/reject/suspend users

### Test Course Management:
1. Login với admin account
2. Navigate to `/admin/courses`
3. Test approve/reject/activate/archive courses

### Test Permission System:
1. Login với instructor (userID=6, instructorID=1)
2. Navigate to course 1 hoặc 2 (đã được assigned)
3. Verify có thể thấy Create/Edit Quiz buttons
4. Navigate to course 3 (không được assigned)
5. Verify không thấy buttons

## Bước 6: Verify Triggers

```sql
-- Test trigger: Check instructor role
INSERT INTO instructors (userID, Bio, specialty) 
VALUES (1, 'Test bio', 'Test'); -- Should fail (userID 1 is learner)

-- Test trigger: Auto complete course
UPDATE courseEnrollments 
SET progressPercentage = 100 
WHERE enrollmentID = 1; -- Should auto set status = 'completed'
```

## Bước 7: Verify Stored Procedures

```sql
-- Test add question
CALL sp_AddQuestion(1, 'What is HTML?', 10);

-- Test delete question (should fail if has options)
CALL sp_DeleteQuestion(1);

-- Test get courses by status
CALL sp_GetCoursesByStatus('approved', 'active');

-- Test get users by status
CALL sp_GetUsersByStatus('learner', 'approved');
```

## Bước 8: Verify Functions

```sql
-- Test update course progress
SELECT UpdateCourseProgress(1, 1);

-- Test calculate punctuality
SELECT CalculatePunctualityScore(1, 1);
```

## Sample Test Data

Database đã có sẵn sample data:
- **Users**: 11 users (5 learners, 4 instructors, 2 admins)
- **Courses**: 6 courses với các trạng thái khác nhau
- **Enrollments**: 6 enrollments
- **Quizzes**: 6 quizzes với questions và options

### Test Accounts:
```
Admin:
- Username: admin
- Password: admin123 (hashed: $2a$10$...)

Instructor:
- Username: mike_instructor (instructorID=1, assigned to courses 1,2)
- Password: password123

Learner:
- Username: john_learner (learnerID=1)
- Password: password123
```

## Troubleshooting

### Error: "Can't add new command when connection is in closed state"
✅ Fixed - db.js đã được cập nhật để tạo connection mới cho mỗi request

### Error: "User does not have the instructor role"
Check xem user có `role='instructor'` và `approvalStatus='approved'` trong bảng users

### Error: "Account is not approved yet"
User cần được admin approve trước khi login

### Admin panel không hiển thị
Check `user.role === 'admin'` và verify `adminID` tồn tại trong localStorage

## Next Steps

1. ✅ Database schema mới đã tạo
2. ✅ Backend services đã cập nhật
3. ✅ API routes đã cập nhật
4. ✅ Frontend types đã cập nhật
5. ✅ Admin panel đã tạo
6. ⏳ Test toàn bộ application
7. ⏳ Update documentation
8. ⏳ Deploy to production

## Rollback Plan

Nếu cần rollback về version cũ:

```powershell
# Restore backup
mysql -u root -p elearning < backup_elearning_old.sql

# Git revert changes
git checkout main
git pull origin main
```

## Notes

- Tất cả queries đã được cập nhật để không sử dụng `manageObjects`
- Admin có thể quản lý approval status của users và courses
- Trigger vẫn hoạt động bình thường với schema mới
- Stored procedures và functions không thay đổi logic
