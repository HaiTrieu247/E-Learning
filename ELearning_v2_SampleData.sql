-- Sample Data for ELearning Database v2.0
-- Without manageObjects entity

-- Clear existing data (in reverse order of dependencies)
SET FOREIGN_KEY_CHECKS = 0;

TRUNCATE TABLE submissionQuizzes;
TRUNCATE TABLE submissionExercises;
TRUNCATE TABLE learnerSubmissions;
TRUNCATE TABLE questionOptions;
TRUNCATE TABLE quizQuestions;
TRUNCATE TABLE Quizzes;
TRUNCATE TABLE exercises;
TRUNCATE TABLE lessonAssignments;
TRUNCATE TABLE moduleLessons;
TRUNCATE TABLE courseModules;
TRUNCATE TABLE courseDesignments;
TRUNCATE TABLE courseEnrollments;
TRUNCATE TABLE adminManagement;
TRUNCATE TABLE courses;
TRUNCATE TABLE course_categories;
TRUNCATE TABLE administrators;
TRUNCATE TABLE instructors;
TRUNCATE TABLE learners;
TRUNCATE TABLE users;

SET FOREIGN_KEY_CHECKS = 1;

-- ============================================
-- 1. USERS
-- ============================================
INSERT INTO users (FNAME, LNAME, phoneNumber, email, username, password_hashed, role, approvalStatus, accountStatus) VALUES
('John', 'Doe', '0123456789', 'john.learner@example.com', 'john_learner', '$2a$10$abcdefghijklmnopqrstuvwxyz123456', 'learner', 'approved', 'active'),
('Jane', 'Smith', '0123456790', 'jane.learner@example.com', 'jane_learner', '$2a$10$abcdefghijklmnopqrstuvwxyz123456', 'learner', 'approved', 'active'),
('Bob', 'Johnson', '0123456791', 'bob.learner@example.com', 'bob_learner', '$2a$10$abcdefghijklmnopqrstuvwxyz123456', 'learner', 'approved', 'active'),
('Alice', 'Williams', '0123456792', 'alice.learner@example.com', 'alice_learner', '$2a$10$abcdefghijklmnopqrstuvwxyz123456', 'learner', 'pending', 'active'),
('Charlie', 'Brown', '0123456793', 'charlie.learner@example.com', 'charlie_learner', '$2a$10$abcdefghijklmnopqrstuvwxyz123456', 'learner', 'approved', 'suspended'),

('Mike', 'Wilson', '0123456794', 'mike.instructor@example.com', 'mike_instructor', '$2a$10$abcdefghijklmnopqrstuvwxyz123456', 'instructor', 'approved', 'active'),
('Sarah', 'Davis', '0123456795', 'sarah.instructor@example.com', 'sarah_instructor', '$2a$10$abcdefghijklmnopqrstuvwxyz123456', 'instructor', 'approved', 'active'),
('David', 'Martinez', '0123456796', 'david.instructor@example.com', 'david_instructor', '$2a$10$abcdefghijklmnopqrstuvwxyz123456', 'instructor', 'approved', 'active'),
('Emily', 'Garcia', '0123456797', 'emily.instructor@example.com', 'emily_instructor', '$2a$10$abcdefghijklmnopqrstuvwxyz123456', 'instructor', 'pending', 'active'),

('Admin', 'User', '0123456798', 'admin@example.com', 'admin', '$2a$10$abcdefghijklmnopqrstuvwxyz123456', 'admin', 'approved', 'active'),
('Super', 'Admin', '0123456799', 'superadmin@example.com', 'superadmin', '$2a$10$abcdefghijklmnopqrstuvwxyz123456', 'admin', 'approved', 'active');

-- ============================================
-- 2. ROLE-SPECIFIC TABLES
-- ============================================
-- Note: Triggers check that users must be approved before inserting into role tables
-- All users above already have approvalStatus='approved' except userID 4 and 9

INSERT INTO learners (userID, enrollmentDate) VALUES
(1, '2024-01-15'),
(2, '2024-02-20'),
(3, '2024-03-10'),
-- (4, '2024-04-05'), -- Skip userID 4 (pending approval)
(5, '2024-05-01');

INSERT INTO instructors (userID, Bio, specialty) VALUES
(6, 'Experienced web developer with 10+ years in full-stack development', 'Web Development'),
(7, 'Data science expert specializing in machine learning', 'Data Science'),
(8, 'Mobile app developer focused on React Native', 'Mobile Development');
-- (9, 'Cloud computing specialist', 'Cloud Computing'); -- Skip userID 9 (pending approval)

INSERT INTO administrators (adminID, userID, accessLevel) VALUES
(1, 10, 'content_manager'),
(2, 11, 'super_admin');

-- ============================================
-- 3. COURSE CATEGORIES
-- ============================================
INSERT INTO course_categories (categoryName, ParentCategoryID) VALUES
('Programming', NULL),
('Web Development', 1),
('Mobile Development', 1),
('Data Science', NULL),
('Machine Learning', 4),
('Business', NULL),
('Design', NULL);

-- ============================================
-- 4. COURSES
-- ============================================
INSERT INTO courses (courseTitle, courseDescription, categoryID, approvalStatus, courseStatus) VALUES
('Introduction to Web Development', 'Learn HTML, CSS, and JavaScript from scratch', 2, 'approved', 'active'),
('React.js Fundamentals', 'Master React.js for building modern web applications', 2, 'approved', 'active'),
('Python for Data Science', 'Comprehensive Python course for data analysis', 4, 'approved', 'active'),
('Mobile App Development with React Native', 'Build cross-platform mobile apps', 3, 'pending', 'draft'),
('Advanced Machine Learning', 'Deep dive into ML algorithms', 5, 'approved', 'active'),
('Cloud Computing Basics', 'Introduction to AWS and Azure', 1, 'pending', 'draft');

-- ============================================
-- 5. ADMIN MANAGEMENT LOGS
-- ============================================
INSERT INTO adminManagement (adminID, targetType, targetID, actionType, actionNotes) VALUES
(2, 'course', 1, 'approved', 'Course content verified and approved'),
(2, 'course', 2, 'approved', 'React course looks good'),
(2, 'course', 3, 'approved', 'Data science curriculum approved'),
(1, 'user', 1, 'approved', 'User account verified'),
(1, 'user', 2, 'approved', 'User account verified'),
(2, 'user', 5, 'suspended', 'Suspicious activity detected');

-- ============================================
-- 6. COURSE ENROLLMENTS
-- ============================================
-- Only use existing learnerIDs (1, 2, 3, 5) - Skip 4 (pending approval)
INSERT INTO courseEnrollments (learnerID, courseID, enrollmentDate, status, progressPercentage) VALUES
(1, 1, '2024-01-20', 'in-progress', 45.00),
(1, 2, '2024-02-01', 'in-progress', 20.00),
(2, 1, '2024-02-25', 'completed', 100.00),
(2, 3, '2024-03-01', 'in-progress', 60.00),
(3, 2, '2024-03-15', 'in-progress', 30.00),
(3, 5, '2024-04-01', 'in-progress', 10.00);

-- ============================================
-- 7. COURSE DESIGNMENTS (Instructor Assignments)
-- ============================================
-- Only use existing instructorIDs (1, 2, 3)
INSERT INTO courseDesignments (instructorID, courseID, assignedDate) VALUES
(1, 1, '2024-01-01'),
(1, 2, '2024-01-01'),
(2, 3, '2024-01-05'),
(3, 4, '2024-01-10'),
(2, 5, '2024-01-15'),
(1, 6, '2024-01-20'); -- Changed from instructorID 4 to 1

-- ============================================
-- 8. COURSE STRUCTURE (Modules & Lessons)
-- ============================================
INSERT INTO courseModules (courseID, moduleTitle, moduleOrder) VALUES
(1, 'HTML Basics', 1),
(1, 'CSS Fundamentals', 2),
(1, 'JavaScript Introduction', 3),
(2, 'React Components', 1),
(2, 'State Management', 2),
(3, 'Python Basics', 1),
(3, 'Data Analysis with Pandas', 2);

INSERT INTO moduleLessons (moduleID, lessonTitle, lessonOrder, lessonDuration, lessonMaterialURL) VALUES
(1, 'HTML Tags and Structure', 1, 45, 'https://example.com/lesson1'),
(1, 'HTML Forms', 2, 60, 'https://example.com/lesson2'),
(2, 'CSS Selectors', 1, 50, 'https://example.com/lesson3'),
(2, 'CSS Flexbox', 2, 70, 'https://example.com/lesson4'),
(3, 'JavaScript Variables', 1, 40, 'https://example.com/lesson5'),
(4, 'Creating Components', 1, 55, 'https://example.com/lesson6'),
(5, 'useState Hook', 1, 65, 'https://example.com/lesson7'),
(6, 'Python Syntax', 1, 45, 'https://example.com/lesson8'),
(7, 'Introduction to Pandas', 1, 80, 'https://example.com/lesson9');

INSERT INTO lessonAssignments (lessonID, startDate, dueDate) VALUES
(1, '2024-01-20 00:00:00', '2024-01-27 23:59:59'),
(2, '2024-01-27 00:00:00', '2024-02-03 23:59:59'),
(3, '2024-02-03 00:00:00', '2024-02-10 23:59:59'),
(4, '2024-02-10 00:00:00', '2024-02-17 23:59:59'),
(5, '2024-02-17 00:00:00', '2024-02-24 23:59:59'),
(6, '2024-02-01 00:00:00', '2024-02-08 23:59:59'),
(7, '2024-02-08 00:00:00', '2024-02-15 23:59:59'),
(8, '2024-03-01 00:00:00', '2024-03-08 23:59:59'),
(9, '2024-03-08 00:00:00', '2024-03-15 23:59:59');

-- ============================================
-- 9. EXERCISES & QUIZZES
-- ============================================
INSERT INTO exercises (assignmentID, exerciseTitle, exerciseDescription) VALUES
(1, 'Build a Simple Webpage', 'Create a basic HTML page with headings, paragraphs, and links'),
(3, 'Style a Webpage', 'Apply CSS styles to the HTML page you created'),
(8, 'Python Hello World', 'Write your first Python program');

INSERT INTO Quizzes (assignmentID, quizTitle, totalMarks, passingMarks, quizDuration) VALUES
(2, 'HTML Forms Quiz', 100, 70, 30),
(4, 'CSS Flexbox Quiz', 100, 70, 25),
(5, 'JavaScript Variables Quiz', 100, 60, 20),
(6, 'React Components Quiz', 100, 70, 35),
(7, 'React Hooks Quiz', 100, 75, 40),
(9, 'Pandas Basics Quiz', 100, 70, 45);

-- ============================================
-- 10. QUIZ QUESTIONS & OPTIONS
-- ============================================
INSERT INTO quizQuestions (quizID, questionDescription, questionScore) VALUES
(1, 'What is the correct HTML tag for creating a form?', 10),
(1, 'Which attribute is used to specify the HTTP method in a form?', 10),
(1, 'What is the purpose of the <input> tag?', 10),
(2, 'What does display: flex do?', 15),
(2, 'Which property is used to control the direction of flex items?', 15),
(3, 'How do you declare a variable in JavaScript?', 20),
(3, 'What is the difference between let and const?', 20),
(4, 'What is a React component?', 25),
(5, 'What does useState return?', 25),
(6, 'What library is Pandas built on top of?', 20);

INSERT INTO questionOptions (questionID, optionText, isCorrect) VALUES
-- Question 1 options
(1, '<form>', TRUE),
(1, '<input>', FALSE),
(1, '<button>', FALSE),
(1, '<field>', FALSE),
-- Question 2 options
(2, 'action', FALSE),
(2, 'method', TRUE),
(2, 'type', FALSE),
(2, 'submit', FALSE),
-- Question 3 options
(3, 'To create input fields', TRUE),
(3, 'To create buttons', FALSE),
(3, 'To create forms', FALSE),
(3, 'To create tables', FALSE),
-- Question 4 options
(4, 'Enables flexbox layout', TRUE),
(4, 'Hides elements', FALSE),
(4, 'Makes elements inline', FALSE),
(4, 'Creates grid layout', FALSE),
-- Question 5 options
(5, 'flex-direction', TRUE),
(5, 'flex-flow', FALSE),
(5, 'flex-align', FALSE),
(5, 'direction', FALSE),
-- Question 6 options
(6, 'var x = 10', TRUE),
(6, 'int x = 10', FALSE),
(6, 'variable x = 10', FALSE),
(6, 'declare x = 10', FALSE),
-- Question 7 options
(7, 'let can be reassigned, const cannot', TRUE),
(7, 'const can be reassigned, let cannot', FALSE),
(7, 'They are the same', FALSE),
(7, 'let is for strings, const is for numbers', FALSE),
-- Question 8 options
(8, 'A reusable piece of UI', TRUE),
(8, 'A database table', FALSE),
(8, 'A CSS class', FALSE),
(8, 'A JavaScript function only', FALSE),
-- Question 9 options
(9, 'An array with state value and setter function', TRUE),
(9, 'A string', FALSE),
(9, 'A number', FALSE),
(9, 'A boolean', FALSE),
-- Question 10 options
(10, 'NumPy', TRUE),
(10, 'jQuery', FALSE),
(10, 'React', FALSE),
(10, 'TensorFlow', FALSE);

-- ============================================
-- 11. LEARNER SUBMISSIONS
-- ============================================
INSERT INTO learnerSubmissions (learnerID, assignmentID, dateSubmitted, grade, feedback) VALUES
(1, 1, '2024-01-25 14:30:00', 85.00, 'Good work! Clean HTML structure.'),
(1, 2, '2024-02-01 16:45:00', 70.00, 'Passed the quiz. Review form validation.'),
(2, 1, '2024-02-27 10:20:00', 95.00, 'Excellent work!'),
(2, 2, '2024-03-05 12:15:00', 90.00, 'Great understanding of HTML forms.'),
(2, 3, '2024-03-10 15:30:00', 80.00, 'Good CSS skills.'),
(3, 6, '2024-03-20 11:00:00', 75.00, 'Good understanding of React components.');

INSERT INTO submissionExercises (submissionID, exerciseID, fileURL, fileName) VALUES
(1, 1, 'https://example.com/submissions/john_html.zip', 'webpage.html'),
(3, 1, 'https://example.com/submissions/jane_html.zip', 'index.html'),
(5, 2, 'https://example.com/submissions/jane_css.zip', 'styles.css');

INSERT INTO submissionQuizzes (submissionID, quizID, score) VALUES
(2, 1, 70.00),
(4, 1, 90.00),
(6, 4, 75.00);

-- ============================================
-- VERIFY DATA
-- ============================================
SELECT 'Users' AS TableName, COUNT(*) AS Count FROM users
UNION ALL
SELECT 'Learners', COUNT(*) FROM learners
UNION ALL
SELECT 'Instructors', COUNT(*) FROM instructors
UNION ALL
SELECT 'Administrators', COUNT(*) FROM administrators
UNION ALL
SELECT 'Courses', COUNT(*) FROM courses
UNION ALL
SELECT 'Course Enrollments', COUNT(*) FROM courseEnrollments
UNION ALL
SELECT 'Course Designments', COUNT(*) FROM courseDesignments
UNION ALL
SELECT 'Course Modules', COUNT(*) FROM courseModules
UNION ALL
SELECT 'Module Lessons', COUNT(*) FROM moduleLessons
UNION ALL
SELECT 'Quizzes', COUNT(*) FROM Quizzes
UNION ALL
SELECT 'Quiz Questions', COUNT(*) FROM quizQuestions
UNION ALL
SELECT 'Question Options', COUNT(*) FROM questionOptions
UNION ALL
SELECT 'Learner Submissions', COUNT(*) FROM learnerSubmissions;
