-- Complete Database Setup Script
-- Run this file to create the entire database from scratch

-- ============================================
-- STEP 1: Create and use database
-- ============================================
DROP DATABASE IF EXISTS elearning;
CREATE DATABASE elearning;
USE elearning;

-- ============================================
-- STEP 2: Run schema
-- ============================================
SOURCE E:/coding/Database/elearning-app/ELearning_v2.sql;

-- ============================================
-- STEP 3: Insert sample data
-- ============================================
SOURCE E:/coding/Database/elearning-app/ELearning_v2_SampleData.sql;

-- ============================================
-- STEP 4: Verify installation
-- ============================================
SELECT '=== DATABASE SETUP COMPLETE ===' AS Status;

SELECT 'Tables Created' AS Info, COUNT(*) AS Count 
FROM information_schema.tables 
WHERE table_schema = 'elearning';

SELECT 'Triggers Created' AS Info, COUNT(*) AS Count 
FROM information_schema.triggers 
WHERE trigger_schema = 'elearning';

SELECT 'Stored Procedures' AS Info, COUNT(*) AS Count 
FROM information_schema.routines 
WHERE routine_schema = 'elearning' AND routine_type = 'PROCEDURE';

SELECT 'Functions' AS Info, COUNT(*) AS Count 
FROM information_schema.routines 
WHERE routine_schema = 'elearning' AND routine_type = 'FUNCTION';

SELECT '=== DATA SUMMARY ===' AS Status;

SELECT 'Users' AS TableName, COUNT(*) AS RecordCount FROM users
UNION ALL SELECT 'Courses', COUNT(*) FROM courses
UNION ALL SELECT 'Enrollments', COUNT(*) FROM courseEnrollments
UNION ALL SELECT 'Modules', COUNT(*) FROM courseModules
UNION ALL SELECT 'Lessons', COUNT(*) FROM moduleLessons
UNION ALL SELECT 'Quizzes', COUNT(*) FROM Quizzes
UNION ALL SELECT 'Questions', COUNT(*) FROM quizQuestions
UNION ALL SELECT 'Options', COUNT(*) FROM questionOptions;

SELECT '=== TEST ACCOUNTS ===' AS Status;

SELECT 
    username,
    role,
    approvalStatus,
    accountStatus,
    CASE 
        WHEN role = 'learner' THEN l.learnerID
        WHEN role = 'instructor' THEN i.instructorID
        WHEN role = 'admin' THEN a.adminID
    END AS roleID
FROM users u
LEFT JOIN learners l ON u.userID = l.userID
LEFT JOIN instructors i ON u.userID = i.userID
LEFT JOIN administrators a ON u.userID = a.adminID
ORDER BY role, userID;

SELECT '=== SETUP COMPLETE - Ready to use! ===' AS Status;
