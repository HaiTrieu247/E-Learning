-- E-Learning Database Schema v2.0
-- Removed manageObjects entity
-- Admin manages users and courses directly

-- Drop existing tables if exist (for clean recreation)
DROP TABLE IF EXISTS submissionQuizzes;
DROP TABLE IF EXISTS submissionExercises;
DROP TABLE IF EXISTS learnerSubmissions;
DROP TABLE IF EXISTS questionOptions;
DROP TABLE IF EXISTS quizQuestions;
DROP TABLE IF EXISTS Quizzes;
DROP TABLE IF EXISTS exercises;
DROP TABLE IF EXISTS lessonAssignments;
DROP TABLE IF EXISTS moduleLessons;
DROP TABLE IF EXISTS courseModules;
DROP TABLE IF EXISTS courseDesignments;
DROP TABLE IF EXISTS courseEnrollments;
DROP TABLE IF EXISTS adminManagement;
DROP TABLE IF EXISTS courses;
DROP TABLE IF EXISTS course_categories;
DROP TABLE IF EXISTS administrators;
DROP TABLE IF EXISTS instructors;
DROP TABLE IF EXISTS learners;
DROP TABLE IF EXISTS users;

-- ============================================
-- 1. USERS TABLE (with embedded approval/status)
-- ============================================
CREATE TABLE users (
    userID INT AUTO_INCREMENT PRIMARY KEY,
    FNAME VARCHAR(50) NOT NULL,
    LNAME VARCHAR(50) NOT NULL,
    phoneNumber VARCHAR(15) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    username VARCHAR(50) UNIQUE NOT NULL,
    password_hashed VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL CHECK (role IN ('learner', 'instructor', 'admin')),
    
    -- Fields from manageObjects
    approvalStatus VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (approvalStatus IN ('pending', 'approved', 'rejected')),
    accountStatus VARCHAR(20) NOT NULL DEFAULT 'active' CHECK (accountStatus IN ('active', 'inactive', 'suspended')),
    createdDate DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    INDEX idx_email (email),
    INDEX idx_username (username),
    INDEX idx_role (role),
    INDEX idx_approval (approvalStatus)
);

-- ============================================
-- 2. ROLE-SPECIFIC TABLES
-- ============================================
CREATE TABLE learners (
    learnerID INT AUTO_INCREMENT PRIMARY KEY,
    userID INT UNIQUE NOT NULL,
    enrollmentDate DATE NOT NULL,
    FOREIGN KEY (userID) REFERENCES users(userID) ON DELETE CASCADE
);

CREATE TABLE instructors (
    instructorID INT AUTO_INCREMENT PRIMARY KEY,
    userID INT UNIQUE NOT NULL,
    Bio TEXT,
    specialty VARCHAR(100),
    FOREIGN KEY (userID) REFERENCES users(userID) ON DELETE CASCADE
);

CREATE TABLE administrators (
    adminID INT AUTO_INCREMENT PRIMARY KEY,
    userID INT UNIQUE NOT NULL,
    accessLevel VARCHAR(50) NOT NULL DEFAULT 'content_manager' CHECK (accessLevel IN ('super_admin', 'moderator', 'content_manager')),
    FOREIGN KEY (userID) REFERENCES users(userID) ON DELETE CASCADE
);

-- ============================================
-- 3. COURSE CATEGORIES
-- ============================================
CREATE TABLE course_categories (
    categoryID INT AUTO_INCREMENT PRIMARY KEY,
    categoryName VARCHAR(100) NOT NULL,
    ParentCategoryID INT,
    FOREIGN KEY (ParentCategoryID) REFERENCES course_categories(categoryID) ON DELETE SET NULL
);

-- ============================================
-- 4. COURSES TABLE (with embedded approval/status)
-- ============================================
CREATE TABLE courses (
    courseID INT AUTO_INCREMENT PRIMARY KEY,
    courseTitle VARCHAR(200) NOT NULL,
    courseDescription TEXT NOT NULL,
    categoryID INT,
    
    -- Fields from manageObjects
    approvalStatus VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (approvalStatus IN ('pending', 'approved', 'rejected')),
    courseStatus VARCHAR(20) NOT NULL DEFAULT 'draft' CHECK (courseStatus IN ('draft', 'active', 'archived')),
    createdDate DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    lastModified DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (categoryID) REFERENCES course_categories(categoryID) ON DELETE SET NULL,
    INDEX idx_category (categoryID),
    INDEX idx_approval (approvalStatus),
    INDEX idx_status (courseStatus)
);

-- ============================================
-- 5. ADMIN MANAGEMENT (simplified)
-- ============================================
CREATE TABLE adminManagement (
    managementID INT AUTO_INCREMENT PRIMARY KEY,
    adminID INT NOT NULL,
    targetType VARCHAR(20) NOT NULL CHECK (targetType IN ('user', 'course')),
    targetID INT NOT NULL,
    actionType VARCHAR(50) NOT NULL CHECK (actionType IN ('approved', 'rejected', 'suspended', 'activated', 'modified')),
    actionDate DATETIME DEFAULT CURRENT_TIMESTAMP,
    actionNotes TEXT,
    
    FOREIGN KEY (adminID) REFERENCES administrators(adminID) ON DELETE CASCADE,
    INDEX idx_target (targetType, targetID),
    INDEX idx_admin (adminID),
    INDEX idx_date (actionDate)
);

-- ============================================
-- 6. COURSE ENROLLMENTS
-- ============================================
CREATE TABLE courseEnrollments (
    enrollmentID INT AUTO_INCREMENT PRIMARY KEY,
    learnerID INT NOT NULL,
    courseID INT NOT NULL,
    enrollmentDate DATETIME DEFAULT CURRENT_TIMESTAMP,
    completionDate DATETIME,
    certificationCode VARCHAR(100) UNIQUE,
    status VARCHAR(20) NOT NULL DEFAULT 'in-progress' CHECK (status IN ('in-progress', 'completed', 'dropped')),
    progressPercentage DECIMAL(5,2) DEFAULT 0.00 CHECK (progressPercentage >= 0 AND progressPercentage <= 100),
    
    UNIQUE KEY unique_enrollment (learnerID, courseID),
    FOREIGN KEY (learnerID) REFERENCES learners(learnerID) ON DELETE CASCADE,
    FOREIGN KEY (courseID) REFERENCES courses(courseID) ON DELETE CASCADE,
    INDEX idx_learner (learnerID),
    INDEX idx_course (courseID),
    INDEX idx_status (status)
);

-- ============================================
-- 7. COURSE DESIGNMENTS (Instructor Assignments)
-- ============================================
CREATE TABLE courseDesignments (
    designmentID INT AUTO_INCREMENT PRIMARY KEY,
    instructorID INT NOT NULL,
    courseID INT NOT NULL,
    assignedDate DATETIME DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE KEY unique_assignment (instructorID, courseID),
    FOREIGN KEY (instructorID) REFERENCES instructors(instructorID) ON DELETE CASCADE,
    FOREIGN KEY (courseID) REFERENCES courses(courseID) ON DELETE CASCADE
);

-- ============================================
-- 8. COURSE STRUCTURE
-- ============================================
CREATE TABLE courseModules (
    moduleID INT AUTO_INCREMENT PRIMARY KEY,
    courseID INT NOT NULL,
    moduleTitle VARCHAR(200) NOT NULL,
    moduleOrder INT NOT NULL,
    
    FOREIGN KEY (courseID) REFERENCES courses(courseID) ON DELETE CASCADE,
    INDEX idx_course (courseID)
);

CREATE TABLE moduleLessons (
    lessonID INT AUTO_INCREMENT PRIMARY KEY,
    moduleID INT NOT NULL,
    lessonTitle VARCHAR(200) NOT NULL,
    lessonOrder INT NOT NULL,
    lessonDuration INT NOT NULL CHECK (lessonDuration > 0),
    lessonMaterialURL VARCHAR(255),
    
    FOREIGN KEY (moduleID) REFERENCES courseModules(moduleID) ON DELETE CASCADE,
    INDEX idx_module (moduleID)
);

CREATE TABLE lessonAssignments (
    assignmentID INT AUTO_INCREMENT PRIMARY KEY,
    lessonID INT NOT NULL,
    startDate DATETIME NOT NULL,
    dueDate DATETIME NOT NULL,
    
    FOREIGN KEY (lessonID) REFERENCES moduleLessons(lessonID) ON DELETE CASCADE,
    CHECK (dueDate > startDate)
);

-- ============================================
-- 9. ASSIGNMENTS (Exercises & Quizzes)
-- ============================================
CREATE TABLE exercises (
    exerciseID INT AUTO_INCREMENT PRIMARY KEY,
    assignmentID INT NOT NULL,
    exerciseTitle VARCHAR(200) NOT NULL,
    exerciseDescription TEXT NOT NULL,
    
    FOREIGN KEY (assignmentID) REFERENCES lessonAssignments(assignmentID) ON DELETE CASCADE
);

CREATE TABLE Quizzes (
    quizID INT AUTO_INCREMENT PRIMARY KEY,
    assignmentID INT NOT NULL,
    quizTitle VARCHAR(200) NOT NULL,
    totalMarks INT NOT NULL CHECK (totalMarks > 0),
    passingMarks INT NOT NULL CHECK (passingMarks > 0),
    quizDuration INT NOT NULL CHECK (quizDuration > 0),
    
    FOREIGN KEY (assignmentID) REFERENCES lessonAssignments(assignmentID) ON DELETE CASCADE,
    CHECK (passingMarks <= totalMarks)
);

CREATE TABLE quizQuestions (
    questionID INT AUTO_INCREMENT PRIMARY KEY,
    quizID INT NOT NULL,
    questionDescription TEXT NOT NULL,
    questionScore INT NOT NULL CHECK (questionScore > 0),
    
    FOREIGN KEY (quizID) REFERENCES Quizzes(quizID) ON DELETE CASCADE
);

CREATE TABLE questionOptions (
    optionID INT AUTO_INCREMENT PRIMARY KEY,
    questionID INT NOT NULL,
    optionText VARCHAR(255) NOT NULL,
    isCorrect BOOLEAN NOT NULL DEFAULT FALSE,
    
    FOREIGN KEY (questionID) REFERENCES quizQuestions(questionID) ON DELETE CASCADE
);

-- ============================================
-- 10. LEARNER SUBMISSIONS
-- ============================================
CREATE TABLE learnerSubmissions (
    submissionID INT AUTO_INCREMENT PRIMARY KEY,
    learnerID INT NOT NULL,
    assignmentID INT NOT NULL,
    dateSubmitted DATETIME DEFAULT CURRENT_TIMESTAMP,
    grade DECIMAL(5,2),
    feedback TEXT,
    
    FOREIGN KEY (learnerID) REFERENCES learners(learnerID) ON DELETE CASCADE,
    FOREIGN KEY (assignmentID) REFERENCES lessonAssignments(assignmentID) ON DELETE CASCADE,
    INDEX idx_learner (learnerID),
    INDEX idx_assignment (assignmentID)
);

CREATE TABLE submissionExercises (
    fileID INT AUTO_INCREMENT PRIMARY KEY,
    submissionID INT NOT NULL,
    exerciseID INT NOT NULL,
    fileURL VARCHAR(255) NOT NULL,
    fileName VARCHAR(100) NOT NULL,
    uploadedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (submissionID) REFERENCES learnerSubmissions(submissionID) ON DELETE CASCADE,
    FOREIGN KEY (exerciseID) REFERENCES exercises(exerciseID) ON DELETE CASCADE
);

CREATE TABLE submissionQuizzes (
    quizSubmissionID INT AUTO_INCREMENT PRIMARY KEY,
    submissionID INT NOT NULL,
    quizID INT NOT NULL,
    score DECIMAL(5,2),
    completedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (submissionID) REFERENCES learnerSubmissions(submissionID) ON DELETE CASCADE,
    FOREIGN KEY (quizID) REFERENCES Quizzes(quizID) ON DELETE CASCADE
);

-- ============================================
-- TRIGGERS
-- ============================================
DELIMITER $$

-- Trigger: Check instructor role before insert
CREATE TRIGGER tg_check_instructor_role
BEFORE INSERT ON instructors
FOR EACH ROW
BEGIN
    DECLARE user_role VARCHAR(20);
    DECLARE user_status VARCHAR(20);
    
    SELECT role, approvalStatus INTO user_role, user_status 
    FROM users WHERE userID = NEW.userID;
    
    IF user_role <> 'instructor' THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Error: User does not have the instructor role.';
    END IF;
    
    IF user_status <> 'approved' THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Error: User account must be approved first.';
    END IF;
END$$

-- Trigger: Check learner role before insert
CREATE TRIGGER tg_check_learner_role
BEFORE INSERT ON learners
FOR EACH ROW
BEGIN
    DECLARE user_role VARCHAR(20);
    DECLARE user_status VARCHAR(20);
    
    SELECT role, approvalStatus INTO user_role, user_status 
    FROM users WHERE userID = NEW.userID;
    
    IF user_role <> 'learner' THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Error: User does not have the learner role.';
    END IF;
    
    IF user_status <> 'approved' THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Error: User account must be approved first.';
    END IF;
END$$

-- Trigger: Check admin role before insert
CREATE TRIGGER tg_check_admin_role
BEFORE INSERT ON administrators
FOR EACH ROW
BEGIN
    DECLARE user_role VARCHAR(20);
    DECLARE user_status VARCHAR(20);
    
    SELECT role, approvalStatus INTO user_role, user_status 
    FROM users WHERE userID = NEW.userID;
    
    IF user_role <> 'admin' THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Error: User does not have the admin role.';
    END IF;
    
    IF user_status <> 'approved' THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Error: User account must be approved first.';
    END IF;
END$$

-- Trigger: Auto complete course when progress = 100%
CREATE TRIGGER tg_auto_complete_course
BEFORE UPDATE ON courseEnrollments
FOR EACH ROW
BEGIN
    IF NEW.progressPercentage = 100 AND OLD.status <> 'completed' THEN
        SET NEW.status = 'completed';
        SET NEW.completionDate = CURRENT_TIMESTAMP;
        
        -- Generate certification code if not exists
        IF NEW.certificationCode IS NULL THEN
            SET NEW.certificationCode = CONCAT('CERT-', NEW.courseID, '-', NEW.learnerID, '-', UNIX_TIMESTAMP());
        END IF;
    END IF;
END$$

-- Trigger: Log admin actions on user approval
CREATE TRIGGER tg_log_user_approval
AFTER UPDATE ON users
FOR EACH ROW
BEGIN
    IF OLD.approvalStatus <> NEW.approvalStatus THEN
        -- This would need the adminID from application context
        -- For now, we'll just log the change
        SET @action = CASE NEW.approvalStatus
            WHEN 'approved' THEN 'approved'
            WHEN 'rejected' THEN 'rejected'
            ELSE 'modified'
        END;
    END IF;
END$$

DELIMITER ;

-- ============================================
-- STORED PROCEDURES
-- ============================================
DELIMITER $$

-- Procedure: Add Question with validation
CREATE PROCEDURE sp_AddQuestion(
    IN p_quizID INT,
    IN p_description TEXT,
    IN p_score INT
)
BEGIN
    IF NOT EXISTS (SELECT 1 FROM Quizzes WHERE quizID = p_quizID) THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Error: The provided quizID does not exist.';
    END IF;

    IF LENGTH(TRIM(p_description)) = 0 THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Error: Question description cannot be empty.';
    END IF;

    IF p_score <= 0 THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Error: Question score must be greater than 0.';
    END IF;

    INSERT INTO quizQuestions (quizID, questionDescription, questionScore)
    VALUES (p_quizID, p_description, p_score);

    SELECT LAST_INSERT_ID() AS questionID, 'Question added successfully' AS message;
END$$

-- Procedure: Update Question
CREATE PROCEDURE sp_UpdateQuestion(
    IN p_questionID INT,
    IN p_newDescription TEXT,
    IN p_newScore INT
)
BEGIN
    IF NOT EXISTS (SELECT 1 FROM quizQuestions WHERE questionID = p_questionID) THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Error: Question ID not found.';
    END IF;

    IF LENGTH(TRIM(p_newDescription)) = 0 THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Error: Question description cannot be empty.';
    END IF;

    IF p_newScore <= 0 THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Error: Question score must be greater than 0.';
    END IF;

    UPDATE quizQuestions
    SET questionDescription = p_newDescription,
        questionScore = p_newScore
    WHERE questionID = p_questionID;

    SELECT 'Question updated successfully' AS message;
END$$

-- Procedure: Delete Question
CREATE PROCEDURE sp_DeleteQuestion(
    IN p_questionID INT
)
BEGIN
    IF NOT EXISTS (SELECT 1 FROM quizQuestions WHERE questionID = p_questionID) THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Error: Question ID not found.';
    END IF;

    IF EXISTS (SELECT 1 FROM questionOptions WHERE questionID = p_questionID) THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Error: Cannot delete question. Options exist for this question. Please delete the options first.';
    END IF;

    DELETE FROM quizQuestions WHERE questionID = p_questionID;

    SELECT 'Question deleted successfully' AS message;
END$$

-- Procedure: Get Quiz Details
CREATE PROCEDURE sp_GetQuizDetails(
    IN p_quizID INT
)
BEGIN
    IF NOT EXISTS (SELECT 1 FROM Quizzes WHERE quizID = p_quizID) THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Error: Quiz ID not found.';
    END IF;

    SELECT 
        q.questionID,
        q.questionDescription,
        q.questionScore,
        o.optionID,
        o.optionText,
        o.isCorrect
    FROM quizQuestions q
    LEFT JOIN questionOptions o ON q.questionID = o.questionID
    WHERE q.quizID = p_quizID
    ORDER BY q.questionID, o.optionID;
END$$

-- Procedure: Get Student Quiz Performance
CREATE PROCEDURE sp_GetStudentQuizPerformance(
    IN p_courseID INT,
    IN p_minScore DECIMAL(5,2)
)
BEGIN
    SELECT 
        u.username AS StudentAccount,
        CONCAT(u.FNAME, ' ', u.LNAME) AS FullName,
        q.quizTitle,
        q.totalMarks AS MaxPossibleScore,
        MAX(sq.score) AS HighestScoreObtained,
        COUNT(sq.submissionID) AS AttemptsCount
    FROM courses c
    JOIN courseModules cm ON c.courseID = cm.courseID
    JOIN moduleLessons ml ON cm.moduleID = ml.moduleID
    JOIN lessonAssignments la ON ml.lessonID = la.lessonID
    JOIN Quizzes q ON la.assignmentID = q.assignmentID
    JOIN submissionQuizzes sq ON q.quizID = sq.quizID
    JOIN learnerSubmissions ls ON sq.submissionID = ls.submissionID
    JOIN learners l ON ls.learnerID = l.learnerID
    JOIN users u ON l.userID = u.userID
    WHERE c.courseID = p_courseID
    GROUP BY u.userID, q.quizID
    HAVING MAX(sq.score) >= p_minScore
    ORDER BY HighestScoreObtained DESC, u.LNAME ASC;
END$$

-- Procedure: Get Courses by Approval Status (Admin Management)
CREATE PROCEDURE sp_GetCoursesByStatus(
    IN p_approvalStatus VARCHAR(20),
    IN p_courseStatus VARCHAR(20)
)
BEGIN
    SELECT 
        c.courseID,
        c.courseTitle,
        c.courseDescription,
        cc.categoryName,
        c.approvalStatus,
        c.courseStatus,
        c.createdDate,
        c.lastModified,
        COUNT(DISTINCT ce.learnerID) AS enrolledCount,
        COUNT(DISTINCT cd.instructorID) AS instructorCount
    FROM courses c
    LEFT JOIN course_categories cc ON c.categoryID = cc.categoryID
    LEFT JOIN courseEnrollments ce ON c.courseID = ce.courseID
    LEFT JOIN courseDesignments cd ON c.courseID = cd.courseID
    WHERE (p_approvalStatus IS NULL OR c.approvalStatus = p_approvalStatus)
      AND (p_courseStatus IS NULL OR c.courseStatus = p_courseStatus)
    GROUP BY c.courseID
    ORDER BY c.createdDate DESC;
END$$

-- Procedure: Get Users by Status (Admin Management)
CREATE PROCEDURE sp_GetUsersByStatus(
    IN p_role VARCHAR(20),
    IN p_approvalStatus VARCHAR(20)
)
BEGIN
    SELECT 
        u.userID,
        u.username,
        u.email,
        CONCAT(u.FNAME, ' ', u.LNAME) AS fullName,
        u.role,
        u.approvalStatus,
        u.accountStatus,
        u.createdDate,
        CASE 
            WHEN u.role = 'learner' THEN l.learnerID
            WHEN u.role = 'instructor' THEN i.instructorID
            WHEN u.role = 'admin' THEN a.adminID
        END AS roleSpecificID
    FROM users u
    LEFT JOIN learners l ON u.userID = l.userID
    LEFT JOIN instructors i ON u.userID = i.userID
    LEFT JOIN administrators a ON u.userID = a.userID
    WHERE (p_role IS NULL OR u.role = p_role)
      AND (p_approvalStatus IS NULL OR u.approvalStatus = p_approvalStatus)
    ORDER BY u.createdDate DESC;
END$$

DELIMITER ;

-- ============================================
-- FUNCTIONS
-- ============================================
DELIMITER $$

-- Function: Update Course Progress
CREATE FUNCTION UpdateCourseProgress(input_learnerID INT, input_courseID INT) 
RETURNS DECIMAL(5,2)
MODIFIES SQL DATA
DETERMINISTIC
BEGIN
    DECLARE done INT DEFAULT FALSE;
    DECLARE v_quizScore DECIMAL(5,2);
    DECLARE v_passingMarks INT;
    DECLARE v_calculatedProgress DECIMAL(5,2) DEFAULT 0.00;
    DECLARE v_enrollmentExists INT;
    
    DECLARE quiz_cursor CURSOR FOR 
        SELECT MAX(sq.score), q.passingMarks
        FROM submissionQuizzes sq
        JOIN learnerSubmissions ls ON sq.submissionID = ls.submissionID
        JOIN Quizzes q ON sq.quizID = q.quizID
        JOIN lessonAssignments la ON q.assignmentID = la.assignmentID
        JOIN moduleLessons ml ON la.lessonID = ml.lessonID
        JOIN courseModules cm ON ml.moduleID = cm.moduleID
        WHERE ls.learnerID = input_learnerID 
          AND cm.courseID = input_courseID
        GROUP BY sq.quizID;

    DECLARE CONTINUE HANDLER FOR NOT FOUND SET done = TRUE;

    SELECT COUNT(*) INTO v_enrollmentExists 
    FROM courseEnrollments 
    WHERE learnerID = input_learnerID AND courseID = input_courseID;

    IF v_enrollmentExists = 0 THEN
        RETURN -1.00;
    END IF;

    OPEN quiz_cursor;

    read_loop: LOOP
        FETCH quiz_cursor INTO v_quizScore, v_passingMarks;
        
        IF done THEN
            LEAVE read_loop;
        END IF;

        IF v_quizScore >= v_passingMarks THEN
            SET v_calculatedProgress = v_calculatedProgress + 10.00;
        END IF;
        
    END LOOP;

    CLOSE quiz_cursor;

    IF v_calculatedProgress > 100.00 THEN
        SET v_calculatedProgress = 100.00;
    END IF;

    UPDATE courseEnrollments
    SET progressPercentage = v_calculatedProgress
    WHERE learnerID = input_learnerID AND courseID = input_courseID;

    RETURN v_calculatedProgress;

END$$

-- Function: Calculate Punctuality Score
CREATE FUNCTION CalculatePunctualityScore(input_learnerID INT, input_courseID INT) 
RETURNS INT
READS SQL DATA
DETERMINISTIC
BEGIN
    DECLARE done INT DEFAULT FALSE;
    DECLARE v_dueDate DATETIME;
    DECLARE v_assignmentID INT;
    DECLARE v_submissionDate DATETIME;
    DECLARE v_currentScore INT DEFAULT 100;
    DECLARE v_enrollmentCheck INT;

    DECLARE assignment_cursor CURSOR FOR 
        SELECT la.assignmentID, la.dueDate
        FROM lessonAssignments la
        JOIN moduleLessons ml ON la.lessonID = ml.lessonID
        JOIN courseModules cm ON ml.moduleID = cm.moduleID
        WHERE cm.courseID = input_courseID;

    DECLARE CONTINUE HANDLER FOR NOT FOUND SET done = TRUE;

    SELECT COUNT(*) INTO v_enrollmentCheck 
    FROM courseEnrollments 
    WHERE learnerID = input_learnerID AND courseID = input_courseID;

    IF v_enrollmentCheck = 0 THEN
        RETURN 0;
    END IF;

    OPEN assignment_cursor;

    check_loop: LOOP
        FETCH assignment_cursor INTO v_assignmentID, v_dueDate;
        
        IF done THEN
            LEAVE check_loop;
        END IF;

        SELECT MIN(ls.dateSubmitted) INTO v_submissionDate
        FROM learnerSubmissions ls
        WHERE ls.learnerID = input_learnerID 
          AND ls.assignmentID = v_assignmentID;

        IF v_submissionDate IS NULL THEN
            SET v_currentScore = v_currentScore - 20;
        ELSEIF v_submissionDate > v_dueDate THEN
            SET v_currentScore = v_currentScore - 10;
        END IF;

        IF v_currentScore < 0 THEN
            SET v_currentScore = 0;
        END IF;
        
    END LOOP;

    CLOSE assignment_cursor;

    RETURN v_currentScore;

END$$

DELIMITER ;
