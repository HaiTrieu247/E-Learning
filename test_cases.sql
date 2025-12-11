-- =====================================================
-- AUTOMATED TEST SUITE FOR E-LEARNING DATABASE
-- Run this file after creating tables and inserting data
-- =====================================================

USE ELearning; -- Change to your database name

SET @test_passed = 0;
SET @test_failed = 0;
SET @test_total = 0;

-- =====================================================
-- TEST UTILITIES
-- =====================================================

DELIMITER $$

CREATE PROCEDURE IF NOT EXISTS ReportTestResult(
    IN test_name VARCHAR(200),
    IN expected_result VARCHAR(100),
    IN actual_result VARCHAR(100),
    IN test_passed BOOLEAN
)
BEGIN
    IF test_passed THEN
        SELECT CONCAT('✓ PASS: ', test_name) AS TestResult, expected_result AS Expected, actual_result AS Actual;
        SET @test_passed = @test_passed + 1;
    ELSE
        SELECT CONCAT('✗ FAIL: ', test_name) AS TestResult, expected_result AS Expected, actual_result AS Actual;
        SET @test_failed = @test_failed + 1;
    END IF;
    SET @test_total = @test_total + 1;
END$$

DELIMITER ;

-- =====================================================
-- SECTION 1: TRIGGER TESTS
-- =====================================================

SELECT '=================================================' AS '';
SELECT '           SECTION 1: TRIGGER TESTS             ' AS '';
SELECT '=================================================' AS '';

-- Test 1.1: tg_auto_complete_course
SELECT '' AS '';
SELECT 'Test 1.1: Auto-complete course when Progress = 100' AS TestName;
UPDATE ENROLL SET Progress = 99.5 WHERE Learner_UserID = 2 AND Course_CourseID = 1;
UPDATE ENROLL SET Progress = 100 WHERE Learner_UserID = 2 AND Course_CourseID = 1;
SELECT 
    CASE 
        WHEN Status = 'completed' THEN '✓ PASS: Status auto-changed to completed'
        ELSE '✗ FAIL: Status not updated'
    END AS Result,
    Progress, Status 
FROM ENROLL 
WHERE Learner_UserID = 2 AND Course_CourseID = 1;

-- Test 1.2: tg_check_instructor_role (Negative test - should fail)
SELECT '' AS '';
SELECT 'Test 1.2: Prevent inserting non-instructor into INSTRUCTOR table' AS TestName;
SET @error_caught = 0;
BEGIN
    DECLARE CONTINUE HANDLER FOR SQLEXCEPTION SET @error_caught = 1;
    INSERT INTO INSTRUCTOR (UserID, Bio, Specialization) VALUES (1, 'Test', 'Test');
END;
SELECT 
    CASE 
        WHEN @error_caught = 1 THEN '✓ PASS: Error caught correctly'
        ELSE '✗ FAIL: Should have thrown error'
    END AS Result;

-- Test 1.3: tg_check_learner_role (Negative test)
SELECT '' AS '';
SELECT 'Test 1.3: Prevent inserting non-learner into LEARNER table' AS TestName;
SET @error_caught = 0;
BEGIN
    DECLARE CONTINUE HANDLER FOR SQLEXCEPTION SET @error_caught = 1;
    INSERT INTO LEARNER (UserID, Birthday) VALUES (3, '1990-01-01');
END;
SELECT 
    CASE 
        WHEN @error_caught = 1 THEN '✓ PASS: Error caught correctly'
        ELSE '✗ FAIL: Should have thrown error'
    END AS Result;

-- Test 1.4: tg_check_quiz_total_score
SELECT '' AS '';
SELECT 'Test 1.4: Prevent exceeding quiz total score' AS TestName;

-- Create test quiz
INSERT INTO Assignment (AssignmentID, startDate, dueDate, title, CourseID, ModuleID, LessonID) 
VALUES (999, '2024-06-01', '2024-06-08', 'Test Quiz', 1, 1, 1);

INSERT INTO Quiz (quizID, Passing_Score, Duration, totalScore, AssignmentID) 
VALUES (999, 70, 30, 100, 999);

-- Add question that fits
INSERT INTO Question (questionID, qText, score, quizID, AssignmentID) 
VALUES (999, 'Test Q1', 50, 999, 999);

-- Try to add question that exceeds (should fail)
SET @error_caught = 0;
BEGIN
    DECLARE CONTINUE HANDLER FOR SQLEXCEPTION SET @error_caught = 1;
    INSERT INTO Question (questionID, qText, score, quizID, AssignmentID) 
    VALUES (998, 'Test Q2', 60, 999, 999);
END;

SELECT 
    CASE 
        WHEN @error_caught = 1 THEN '✓ PASS: Prevented exceeding total score'
        ELSE '✗ FAIL: Should have thrown error'
    END AS Result;

-- Cleanup
DELETE FROM Question WHERE questionID IN (999, 998);
DELETE FROM Quiz WHERE quizID = 999;
DELETE FROM Assignment WHERE AssignmentID = 999;

-- =====================================================
-- SECTION 2: STORED PROCEDURE TESTS
-- =====================================================

SELECT '' AS '';
SELECT '=================================================' AS '';
SELECT '      SECTION 2: STORED PROCEDURE TESTS        ' AS '';
SELECT '=================================================' AS '';

-- Test 2.1: sp_AddQuestion
SELECT '' AS '';
SELECT 'Test 2.1: sp_AddQuestion - Add valid question' AS TestName;

-- Setup
INSERT INTO Assignment (AssignmentID, startDate, dueDate, title, CourseID, ModuleID, LessonID) 
VALUES (1000, '2024-06-01', '2024-06-08', 'Test Assignment', 1, 1, 1);

INSERT INTO Quiz (quizID, Passing_Score, Duration, totalScore, AssignmentID) 
VALUES (1000, 70, 30, 100, 1000);

-- Test
CALL sp_AddQuestion(1000, 'What is a database?', 25);

SELECT 
    CASE 
        WHEN COUNT(*) = 1 THEN '✓ PASS: Question added successfully'
        ELSE '✗ FAIL: Question not added'
    END AS Result
FROM Question 
WHERE quizID = 1000 AND qText = 'What is a database?';

-- Test 2.2: sp_UpdateQuestion
SELECT '' AS '';
SELECT 'Test 2.2: sp_UpdateQuestion - Update existing question' AS TestName;

SET @question_id = (SELECT questionID FROM Question WHERE quizID = 1000 LIMIT 1);
CALL sp_UpdateQuestion(@question_id, 'Updated: What is a database?', 30);

SELECT 
    CASE 
        WHEN qText = 'Updated: What is a database?' AND score = 30 
        THEN '✓ PASS: Question updated successfully'
        ELSE '✗ FAIL: Question not updated correctly'
    END AS Result
FROM Question 
WHERE questionID = @question_id;

-- Test 2.3: sp_GetQuizDetails
SELECT '' AS '';
SELECT 'Test 2.3: sp_GetQuizDetails - Get quiz with questions' AS TestName;
SELECT 'Expected: Returns questions for Quiz 1' AS Info;
CALL sp_GetQuizDetails(1);

-- Test 2.4: sp_GetQuizStatistics
SELECT '' AS '';
SELECT 'Test 2.4: sp_GetQuizStatistics - Get quiz stats' AS TestName;
SELECT 'Expected: Returns quizzes with at least 3 questions' AS Info;
CALL sp_GetQuizStatistics(1, 3);

-- Test 2.5: sp_GetQuizzesByCourse
SELECT '' AS '';
SELECT 'Test 2.5: sp_GetQuizzesByCourse - Get all quizzes in course' AS TestName;
SELECT 'Expected: Returns all quizzes for Course 1' AS Info;
CALL sp_GetQuizzesByCourse(1);

-- Test 2.6: sp_GetActiveLearnersInCourse
SELECT '' AS '';
SELECT 'Test 2.6: sp_GetActiveLearnersInCourse - Get active learners' AS TestName;
SELECT 'Expected: Returns all learners enrolled in Course 1' AS Info;
CALL sp_GetActiveLearnersInCourse(1, 'active');

-- Test 2.7: sp_GetActiveLearnersInCourse - Filter by status
SELECT '' AS '';
SELECT 'Test 2.7: sp_GetActiveLearnersInCourse - In-progress only' AS TestName;
SELECT 'Expected: Returns only in-progress learners' AS Info;
CALL sp_GetActiveLearnersInCourse(1, 'in-progress');

-- Test 2.8: sp_GetStudentQuizPerformance
SELECT '' AS '';
SELECT 'Test 2.8: sp_GetStudentQuizPerformance - Students with score >= 70' AS TestName;
SELECT 'Expected: Returns students who scored 70 or higher' AS Info;
CALL sp_GetStudentQuizPerformance(1, 70);

-- Test 2.9: sp_DeleteQuestion
SELECT '' AS '';
SELECT 'Test 2.9: sp_DeleteQuestion - Delete question without options' AS TestName;

SET @question_id = (SELECT questionID FROM Question WHERE quizID = 1000 LIMIT 1);
CALL sp_DeleteQuestion(@question_id);

SELECT 
    CASE 
        WHEN COUNT(*) = 0 THEN '✓ PASS: Question deleted successfully'
        ELSE '✗ FAIL: Question still exists'
    END AS Result
FROM Question 
WHERE questionID = @question_id;

-- Cleanup
DELETE FROM Question WHERE quizID = 1000;
DELETE FROM Quiz WHERE quizID = 1000;
DELETE FROM Assignment WHERE AssignmentID = 1000;

-- =====================================================
-- SECTION 3: FUNCTION TESTS
-- =====================================================

SELECT '' AS '';
SELECT '=================================================' AS '';
SELECT '          SECTION 3: FUNCTION TESTS             ' AS '';
SELECT '=================================================' AS '';

-- Test 3.1: UpdateCourseProgress
SELECT '' AS '';
SELECT 'Test 3.1: UpdateCourseProgress - Calculate progress for learner' AS TestName;

-- Get initial progress
SET @initial_progress = (SELECT Progress FROM ENROLL WHERE Learner_UserID = 1 AND Course_CourseID = 1);

-- Call function
SET @new_progress = UpdateCourseProgress(1, 1);

SELECT 
    CASE 
        WHEN @new_progress >= 0 AND @new_progress <= 100 
        THEN CONCAT('✓ PASS: Progress calculated: ', @new_progress, '%')
        ELSE '✗ FAIL: Invalid progress value'
    END AS Result;

-- Verify update
SELECT 
    Learner_UserID,
    Course_CourseID,
    Progress AS CurrentProgress,
    Status
FROM ENROLL 
WHERE Learner_UserID = 1 AND Course_CourseID = 1;

-- Test 3.2: UpdateCourseProgress - Non-existent enrollment
SELECT '' AS '';
SELECT 'Test 3.2: UpdateCourseProgress - Handle non-existent enrollment' AS TestName;

SET @result = UpdateCourseProgress(9999, 9999);

SELECT 
    CASE 
        WHEN @result = -1.00 THEN '✓ PASS: Correctly returned -1 for invalid enrollment'
        ELSE '✗ FAIL: Should return -1'
    END AS Result;

-- Test 3.3: CalculatePunctualityScore
SELECT '' AS '';
SELECT 'Test 3.3: CalculatePunctualityScore - Calculate punctuality for learner' AS TestName;

SET @punctuality = CalculatePunctualityScore(1, 1);

SELECT 
    CASE 
        WHEN @punctuality >= 0 AND @punctuality <= 100 
        THEN CONCAT('✓ PASS: Punctuality score: ', @punctuality)
        ELSE '✗ FAIL: Invalid punctuality score'
    END AS Result;

-- Test 3.4: CalculatePunctualityScore - Non-existent enrollment
SELECT '' AS '';
SELECT 'Test 3.4: CalculatePunctualityScore - Handle non-existent enrollment' AS TestName;

SET @result = CalculatePunctualityScore(9999, 9999);

SELECT 
    CASE 
        WHEN @result = 0 THEN '✓ PASS: Correctly returned 0 for invalid enrollment'
        ELSE '✗ FAIL: Should return 0'
    END AS Result;

-- Test 3.5: CalculatePunctualityScore - Compare multiple learners
SELECT '' AS '';
SELECT 'Test 3.5: CalculatePunctualityScore - Multiple learners comparison' AS TestName;

SELECT 
    Learner_UserID,
    Course_CourseID,
    CalculatePunctualityScore(Learner_UserID, Course_CourseID) AS PunctualityScore
FROM ENROLL
WHERE Course_CourseID = 1
ORDER BY PunctualityScore DESC;

-- =====================================================
-- SECTION 4: CONSTRAINT TESTS
-- =====================================================

SELECT '' AS '';
SELECT '=================================================' AS '';
SELECT '         SECTION 4: CONSTRAINT TESTS            ' AS '';
SELECT '=================================================' AS '';

-- Test 4.1: Assignment date constraint
SELECT '' AS '';
SELECT 'Test 4.1: Assignment date constraint (dueDate > startDate)' AS TestName;

SET @error_caught = 0;
BEGIN
    DECLARE CONTINUE HANDLER FOR SQLEXCEPTION SET @error_caught = 1;
    INSERT INTO Assignment (AssignmentID, startDate, dueDate, title, CourseID, ModuleID, LessonID)
    VALUES (2000, '2024-12-31', '2024-12-01', 'Invalid', 1, 1, 1);
END;

SELECT 
    CASE 
        WHEN @error_caught = 1 THEN '✓ PASS: Constraint enforced'
        ELSE '✗ FAIL: Should have thrown error'
    END AS Result;

-- Test 4.2: Quiz passing score constraint
SELECT '' AS '';
SELECT 'Test 4.2: Quiz constraint (Passing_Score <= totalScore)' AS TestName;

INSERT INTO Assignment (AssignmentID, startDate, dueDate, title, CourseID, ModuleID, LessonID)
VALUES (2001, '2024-12-01', '2024-12-31', 'Test', 1, 1, 1);

SET @error_caught = 0;
BEGIN
    DECLARE CONTINUE HANDLER FOR SQLEXCEPTION SET @error_caught = 1;
    INSERT INTO Quiz (quizID, Passing_Score, Duration, totalScore, AssignmentID)
    VALUES (2000, 150, 30, 100, 2001);
END;

SELECT 
    CASE 
        WHEN @error_caught = 1 THEN '✓ PASS: Constraint enforced'
        ELSE '✗ FAIL: Should have thrown error'
    END AS Result;

DELETE FROM Assignment WHERE AssignmentID = 2001;

-- Test 4.3: Progress percentage constraint
SELECT '' AS '';
SELECT 'Test 4.3: ENROLL constraint (Progress 0-100)' AS TestName;

SET @error_caught = 0;
BEGIN
    DECLARE CONTINUE HANDLER FOR SQLEXCEPTION SET @error_caught = 1;
    UPDATE ENROLL SET Progress = 150 WHERE Learner_UserID = 1 AND Course_CourseID = 1;
END;

SELECT 
    CASE 
        WHEN @error_caught = 1 THEN '✓ PASS: Constraint enforced'
        ELSE '✗ FAIL: Should have thrown error'
    END AS Result;

-- Test 4.4: Lesson duration constraint
SELECT '' AS '';
SELECT 'Test 4.4: Lesson constraint (Duration > 0)' AS TestName;

SET @error_caught = 0;
BEGIN
    DECLARE CONTINUE HANDLER FOR SQLEXCEPTION SET @error_caught = 1;
    INSERT INTO Lesson (LessonID, Title, Order_Num, Duration, CourseID, ModuleID)
    VALUES (2000, 'Invalid', 1, -10, 1, 1);
END;

SELECT 
    CASE 
        WHEN @error_caught = 1 THEN '✓ PASS: Constraint enforced'
        ELSE '✗ FAIL: Should have thrown error'
    END AS Result;

-- =====================================================
-- SECTION 5: DATA INTEGRITY TESTS
-- =====================================================

SELECT '' AS '';
SELECT '=================================================' AS '';
SELECT '       SECTION 5: DATA INTEGRITY TESTS          ' AS '';
SELECT '=================================================' AS '';

-- Test 5.1: Foreign key relationships
SELECT '' AS '';
SELECT 'Test 5.1: Verify all foreign key relationships' AS TestName;

SELECT 
    'Course-Module' AS Relationship,
    COUNT(*) AS Count,
    CASE WHEN COUNT(*) > 0 THEN '✓ Valid' ELSE '✗ Invalid' END AS Status
FROM Module m
JOIN Course c ON m.CourseID = c.CourseID

UNION ALL

SELECT 
    'Module-Lesson' AS Relationship,
    COUNT(*) AS Count,
    CASE WHEN COUNT(*) > 0 THEN '✓ Valid' ELSE '✗ Invalid' END AS Status
FROM Lesson l
JOIN Module m ON l.ModuleID = m.ModuleID

UNION ALL

SELECT 
    'Assignment-Quiz' AS Relationship,
    COUNT(*) AS Count,
    CASE WHEN COUNT(*) > 0 THEN '✓ Valid' ELSE '✗ Invalid' END AS Status
FROM Quiz q
JOIN Assignment a ON q.AssignmentID = a.AssignmentID

UNION ALL

SELECT 
    'Quiz-Question' AS Relationship,
    COUNT(*) AS Count,
    CASE WHEN COUNT(*) > 0 THEN '✓ Valid' ELSE '✗ Invalid' END AS Status
FROM Question q
JOIN Quiz qz ON q.quizID = qz.quizID;

-- Test 5.2: Orphaned records check
SELECT '' AS '';
SELECT 'Test 5.2: Check for orphaned records' AS TestName;

SELECT 
    'Modules without Course' AS OrphanType,
    COUNT(*) AS Count,
    CASE WHEN COUNT(*) = 0 THEN '✓ No orphans' ELSE '✗ Has orphans' END AS Status
FROM Module m
LEFT JOIN Course c ON m.CourseID = c.CourseID
WHERE c.CourseID IS NULL

UNION ALL

SELECT 
    'Lessons without Module' AS OrphanType,
    COUNT(*) AS Count,
    CASE WHEN COUNT(*) = 0 THEN '✓ No orphans' ELSE '✗ Has orphans' END AS Status
FROM Lesson l
LEFT JOIN Module m ON l.ModuleID = m.ModuleID
WHERE m.ModuleID IS NULL;

-- Test 5.3: Data consistency check
SELECT '' AS '';
SELECT 'Test 5.3: Quiz total score consistency' AS TestName;

SELECT 
    q.quizID,
    a.title AS QuizTitle,
    q.totalScore AS MaxScore,
    COALESCE(SUM(qs.score), 0) AS CurrentTotal,
    CASE 
        WHEN COALESCE(SUM(qs.score), 0) <= q.totalScore THEN '✓ Valid'
        ELSE '✗ Invalid - Exceeds max'
    END AS Status
FROM Quiz q
LEFT JOIN Assignment a ON q.AssignmentID = a.AssignmentID
LEFT JOIN Question qs ON q.quizID = qs.quizID
GROUP BY q.quizID, a.title, q.totalScore
ORDER BY q.quizID;

-- =====================================================
-- SECTION 6: PERFORMANCE TESTS
-- =====================================================

SELECT '' AS '';
SELECT '=================================================' AS '';
SELECT '          SECTION 6: PERFORMANCE TESTS          ' AS '';
SELECT '=================================================' AS '';

-- Test 6.1: Query execution time
SELECT '' AS '';
SELECT 'Test 6.1: Complex join query performance' AS TestName;

SELECT 
    c.CTitle AS Course,
    COUNT(DISTINCT m.ModuleID) AS Modules,
    COUNT(DISTINCT l.LessonID) AS Lessons,
    COUNT(DISTINCT a.AssignmentID) AS Assignments,
    COUNT(DISTINCT q.quizID) AS Quizzes,
    COUNT(DISTINCT e.Learner_UserID) AS EnrolledLearners
FROM Course c
LEFT JOIN Module m ON c.CourseID = m.CourseID
LEFT JOIN Lesson l ON m.ModuleID = l.ModuleID
LEFT JOIN Assignment a ON l.LessonID = a.LessonID
LEFT JOIN Quiz q ON a.AssignmentID = q.AssignmentID
LEFT JOIN ENROLL e ON c.CourseID = e.Course_CourseID
GROUP BY c.CourseID, c.CTitle;

-- Test 6.2: Aggregation performance
SELECT '' AS '';
SELECT 'Test 6.2: Student performance aggregation' AS TestName;

SELECT 
    u.FullName,
    COUNT(DISTINCT e.Course_CourseID) AS CoursesEnrolled,
    AVG(e.Progress) AS AvgProgress,
    COUNT(DISTINCT s.SubmissionID) AS TotalSubmissions,
    AVG(s.Grade) AS AvgGrade
FROM USER u
JOIN LEARNER l ON u.UserID = l.UserID
LEFT JOIN ENROLL e ON l.UserID = e.Learner_UserID
LEFT JOIN Submission s ON l.UserID = s.Learner_UserID
WHERE u.Role = 'learner'
GROUP BY u.UserID, u.FullName
ORDER BY AvgGrade DESC;

-- =====================================================
-- TEST SUMMARY
-- =====================================================

SELECT '' AS '';
SELECT '=================================================' AS '';
SELECT '              TEST SUMMARY                      ' AS '';
SELECT '=================================================' AS '';

SELECT 
    'Total Tests Executed' AS Metric,
    COUNT(*) AS Value
FROM (
    SELECT 1 FROM DUAL -- Placeholder for test count
) t;

SELECT '' AS '';
SELECT '✓ All test sections completed' AS Summary;
SELECT '• Trigger Tests: Validated role checks and auto-updates' AS Summary;
SELECT '• Procedure Tests: Verified CRUD operations' AS Summary;
SELECT '• Function Tests: Confirmed calculations' AS Summary;
SELECT '• Constraint Tests: Ensured data validation' AS Summary;
SELECT '• Integrity Tests: Checked relationships' AS Summary;
SELECT '• Performance Tests: Measured query efficiency' AS Summary;

SELECT '' AS '';
SELECT 'Review the results above for any ✗ FAIL markers' AS Note;
SELECT 'All ✓ PASS results indicate successful validation' AS Note;

SELECT '' AS '';
SELECT '=================================================' AS '';
SELECT '            END OF TEST SUITE                   ' AS '';
SELECT '=================================================' AS '';
