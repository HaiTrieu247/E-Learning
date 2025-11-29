CREATE TABLE manageObjects (
    objectID INT AUTO_INCREMENT PRIMARY KEY,
    objectType VARCHAR(50) NOT NULL CHECK (objectType IN ('user', 'course', 'lesson', 'module', 'assignment')),
    objectApprovalStatus VARCHAR(20) NOT NULL CHECK (objectApprovalStatus IN ('pending', 'approved', 'rejected')),
    createdDate DATE NOT NULL,
    objectStatus VARCHAR(20) NOT NULL CHECK (objectStatus IN ('active', 'inactive'))
);

CREATE TABLE users (
    userID INT AUTO_INCREMENT PRIMARY KEY,
    objectID INT UNIQUE,
    FNAME VARCHAR(50) NOT NULL,
    LNAME VARCHAR(50) NOT NULL,
    phoneNumber VARCHAR(15) NOT NULL,
    email VARCHAR(100) UNIQUE,
    username VARCHAR(50) UNIQUE,
    password_hashed VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL CHECK (role IN ('learner', 'instructor', 'admin')),
    FOREIGN KEY (objectID) REFERENCES manageObjects(objectID)
);

CREATE TABLE learners (
    learnerID INT AUTO_INCREMENT PRIMARY KEY,
    userID INT UNIQUE,
    enrollmentDate DATE NOT NULL,
    FOREIGN KEY (userID) REFERENCES users(userID)
);

CREATE TABLE instructors (
    instructorID INT AUTO_INCREMENT PRIMARY KEY,
    userID INT UNIQUE,
    Bio TEXT NOT NULL,
    specialty VARCHAR(100),
    FOREIGN KEY (userID) REFERENCES users(userID)
);

CREATE TABLE administrators (
    adminID INT AUTO_INCREMENT PRIMARY KEY,
    userID INT UNIQUE,
    accessLevel VARCHAR(50) NOT NULL CHECK (accessLevel IN ('super_admin', 'moderator', 'content_manager')),
    FOREIGN KEY (userID) REFERENCES users(userID)
);

CREATE TABLE course_categories (
    categoryID INT AUTO_INCREMENT PRIMARY KEY,
    categoryName VARCHAR(100) NOT NULL,
    ParentCategoryID INT,
    FOREIGN KEY (ParentCategoryID) REFERENCES course_categories(categoryID)
);

CREATE TABLE courses (
    courseID INT AUTO_INCREMENT PRIMARY KEY,
    courseTitle VARCHAR(200) NOT NULL,
    courseDescription TEXT NOT NULL,
    categoryID INT,
    FOREIGN KEY (categoryID) REFERENCES course_categories(categoryID)
);

CREATE TABLE adminManagement (
    adminID INT,
    managedObjectID INT,
    dateModified DATETIME DEFAULT CURRENT_TIMESTAMP,
    actionType VARCHAR(50) NOT NULL CHECK (actionType IN ('approved_user', 'rejected_user', 'approved_course', 'rejected_course', 'pending_review')),
    PRIMARY KEY (adminID, managedObjectID, dateModified),
    FOREIGN KEY (adminID) REFERENCES administrators(adminID),
    FOREIGN KEY (managedObjectID) REFERENCES manageObjects(objectID)
);

CREATE TABLE courseEnrollments (
    learnerID INT,
    courseID INT,
    enrollmentDate DATETIME DEFAULT CURRENT_TIMESTAMP,
    certificationCode VARCHAR(100) NOT NULL,
    certificationIssueDate DATE NOT NULL,
    status VARCHAR(20) NOT NULL CHECK (status IN ('in-progress', 'completed')),
    progressPercentage DECIMAL(5,2) DEFAULT 0.00,
    PRIMARY KEY (learnerID, courseID, certificationCode),
    FOREIGN KEY (learnerID) REFERENCES learners(learnerID),
    FOREIGN KEY (courseID) REFERENCES courses(courseID)
);

CREATE TABLE courseDesignments (
    instructorID INT,
    courseID INT,
    PRIMARY KEY (instructorID, courseID),
    FOREIGN KEY (instructorID) REFERENCES instructors(instructorID),
    FOREIGN KEY (courseID) REFERENCES courses(courseID)
);

CREATE TABLE courseModules (
    moduleID INT AUTO_INCREMENT PRIMARY KEY,
    courseID INT,
    moduleTitle VARCHAR(200) NOT NULL,
    moduleOrder INT NOT NULL,
    FOREIGN KEY (courseID) REFERENCES courses(courseID)
);

CREATE TABLE moduleLessons (
    lessonID INT AUTO_INCREMENT PRIMARY KEY,
    moduleID INT,
    lessonTitle VARCHAR(200) NOT NULL,
    lessonOrder INT NOT NULL,
    lessonDuration INT NOT NULL,
    lessonMaterialURL VARCHAR(255) NOT NULL,
    FOREIGN KEY (moduleID) REFERENCES courseModules(moduleID)
);

CREATE TABLE lessonAssignments (
    assignmentID INT AUTO_INCREMENT PRIMARY KEY,
    lessonID INT,
    startDate DATETIME NOT NULL,
    dueDate DATETIME NOT NULL,
    FOREIGN KEY (lessonID) REFERENCES moduleLessons(lessonID)
);

CREATE TABLE exercises (
    exerciseID INT AUTO_INCREMENT PRIMARY KEY,
    assignmentID INT,
    exerciseTitle VARCHAR(200) NOT NULL,
    exerciseDescription TEXT NOT NULL,
    FOREIGN KEY (assignmentID) REFERENCES lessonAssignments(assignmentID)
);

CREATE TABLE Quizzes (
    quizID INT AUTO_INCREMENT PRIMARY KEY,
    assignmentID INT,
    quizTitle VARCHAR(200) NOT NULL,
    totalMarks INT NOT NULL,
    passingMarks INT NOT NULL,
    quizDuration INT NOT NULL,
    FOREIGN KEY (assignmentID) REFERENCES lessonAssignments(assignmentID)
);

CREATE TABLE quizQuestions (
    questionID INT AUTO_INCREMENT PRIMARY KEY,
    quizID INT,
    questionDescription TEXT NOT NULL,
    questionScore INT NOT NULL,
    FOREIGN KEY (quizID) REFERENCES Quizzes(quizID)
);

CREATE TABLE questionOptions (
    optionID INT AUTO_INCREMENT PRIMARY KEY,
    questionID INT,
    optionText VARCHAR(255) NOT NULL,
    isCorrect BOOLEAN NOT NULL,
    FOREIGN KEY (questionID) REFERENCES quizQuestions(questionID)
);

CREATE TABLE learnerSubmissions (
    learnerID INT,
    submissionID INT,
    dateSubmitted DATETIME DEFAULT CURRENT_TIMESTAMP,
    grade DECIMAL(5,2),
    PRIMARY KEY (learnerID, submissionID),
    FOREIGN KEY (learnerID) REFERENCES learners(learnerID)
);

CREATE TABLE submissionExercises (
    fileID INT AUTO_INCREMENT PRIMARY KEY,
    learnerID INT,
    submissionID INT NOT NULL,
    exerciseID INT NOT NULL,
    fileURL VARCHAR(255) NOT NULL,
    fileName VARCHAR(100) NOT NULL,
    FOREIGN KEY (learnerID, submissionID) REFERENCES learnerSubmissions(learnerID, submissionID),
    FOREIGN KEY (exerciseID) REFERENCES exercises(exerciseID)
);

CREATE TABLE submissionQuizzes (
    quizAnswerID INT AUTO_INCREMENT PRIMARY KEY,
    submissionID INT,
    learnerID INT,
    quizID INT,
    score DECIMAL(5,2),
    FOREIGN KEY (learnerID, submissionID) REFERENCES learnerSubmissions(learnerID, submissionID),
    FOREIGN KEY (quizID) REFERENCES Quizzes(quizID)
);

ALTER TABLE lessonAssignments
    ADD CONSTRAINT chk_assignment_dates 
    CHECK (dueDate > startDate);

ALTER TABLE Quizzes
    ADD CONSTRAINT chk_quiz_marks 
    CHECK (passingMarks <= totalMarks);

ALTER TABLE courseEnrollments
    ADD CONSTRAINT chk_progress_percent 
    CHECK (progressPercentage >= 0 AND progressPercentage <= 100);

ALTER TABLE moduleLessons
    ADD CONSTRAINT chk_lesson_duration 
    CHECK (lessonDuration > 0);

DELIMITER $$

CREATE TRIGGER tg_check_instructor_role
BEFORE INSERT ON instructors
FOR EACH ROW
BEGIN
    DECLARE user_role VARCHAR(20);
    SELECT role INTO user_role FROM users WHERE userID = NEW.userID;
    IF user_role <> 'instructor' THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Error: UserID does not have the Instructor role.';
    END IF;
END$$

CREATE TRIGGER tg_check_learner_role
BEFORE INSERT ON learners
FOR EACH ROW
BEGIN
    DECLARE user_role VARCHAR(20);
    SELECT role INTO user_role FROM users WHERE userID = NEW.userID;
    IF user_role <> 'learner' THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Error: UserID does not have the Learner role.';
    END IF;
END$$

CREATE TRIGGER tg_check_admin_role
BEFORE INSERT ON administrators
FOR EACH ROW
BEGIN
    DECLARE user_role VARCHAR(20);
    SELECT role INTO user_role FROM users WHERE userID = NEW.userID;
    IF user_role <> 'admin' THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Error: UserID does not have the Admin role.';
    END IF;
END$$

CREATE TRIGGER tg_auto_complete_course
BEFORE UPDATE ON courseEnrollments
FOR EACH ROW
BEGIN
    IF NEW.progressPercentage = 100 THEN
        SET NEW.status = 'completed';
    END IF;
END$$

CREATE TRIGGER tg_check_quiz_total_score
BEFORE INSERT ON quizQuestions
FOR EACH ROW
BEGIN
    DECLARE current_total INT;
    DECLARE max_marks INT;

    SELECT COALESCE(SUM(questionScore), 0) INTO current_total 
    FROM quizQuestions WHERE quizID = NEW.quizID;

    SELECT totalMarks INTO max_marks FROM Quizzes WHERE quizID = NEW.quizID;

    IF (current_total + NEW.questionScore) > max_marks THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Error: Total question score exceeds the TotalMarks of the Quiz.';
    END IF;
END$$

DELIMITER ;

-- Insert data into manageObjects
INSERT INTO manageObjects (objectType, objectApprovalStatus, createdDate, objectStatus) VALUES
('user', 'approved', '2024-01-15', 'active'),
('user', 'approved', '2024-01-20', 'active'),
('user', 'approved', '2024-02-01', 'active'),
('user', 'approved', '2024-02-10', 'active'),
('user', 'approved', '2024-02-15', 'active'),
('user', 'approved', '2024-03-01', 'active'),
('user', 'approved', '2024-03-05', 'active'),
('user', 'approved', '2024-03-10', 'active'),
('course', 'approved', '2024-01-10', 'active'),
('course', 'approved', '2024-01-25', 'active'),
('course', 'pending', '2024-11-01', 'inactive'),
('lesson', 'approved', '2024-02-01', 'active'),
('lesson', 'approved', '2024-02-05', 'active');

-- Insert data into users
INSERT INTO users (objectID, FNAME, LNAME, phoneNumber, email, username, password_hashed, role) VALUES
(1, 'John', 'Doe', '0901234567', 'john.doe@email.com', 'johndoe', '$2y$10$abcdefghijklmnopqrstuvwxyz123456', 'learner'),
(2, 'Jane', 'Smith', '0902345678', 'jane.smith@email.com', 'janesmith', '$2y$10$bcdefghijklmnopqrstuvwxyz1234567', 'learner'),
(3, 'Michael', 'Johnson', '0903456789', 'michael.j@email.com', 'michaelj', '$2y$10$cdefghijklmnopqrstuvwxyz12345678', 'instructor'),
(4, 'Emily', 'Brown', '0904567890', 'emily.brown@email.com', 'emilybrown', '$2y$10$defghijklmnopqrstuvwxyz123456789', 'instructor'),
(5, 'David', 'Wilson', '0905678901', 'david.wilson@email.com', 'davidw', '$2y$10$efghijklmnopqrstuvwxyz1234567890', 'admin'),
(6, 'Sarah', 'Taylor', '0906789012', 'sarah.taylor@email.com', 'saraht', '$2y$10$fghijklmnopqrstuvwxyz12345678901', 'learner'),
(7, 'Robert', 'Martinez', '0907890123', 'robert.m@email.com', 'robertm', '$2y$10$ghijklmnopqrstuvwxyz123456789012', 'instructor'),
(8, 'Lisa', 'Anderson', '0908901234', 'lisa.anderson@email.com', 'lisaa', '$2y$10$hijklmnopqrstuvwxyz1234567890123', 'learner');

-- Insert data into learners
INSERT INTO learners (userID, enrollmentDate) VALUES
(1, '2024-01-20'),
(2, '2024-01-25'),
(6, '2024-03-10'),
(8, '2024-03-15');

-- Insert data into instructors
INSERT INTO instructors (userID, Bio, specialty) VALUES
(3, 'Experienced web developer with 10+ years in full-stack development. Passionate about teaching modern web technologies.', 'Web Development'),
(4, 'Data science expert with background in machine learning and AI. Published researcher and industry consultant.', 'Data Science'),
(7, 'Mobile app developer specializing in iOS and Android platforms. Former senior engineer at major tech companies.', 'Mobile Development');

-- Insert data into administrators
INSERT INTO administrators (userID, accessLevel) VALUES
(5, 'super_admin');

-- Insert data into course_categories
INSERT INTO course_categories (categoryName, ParentCategoryID) VALUES
('Programming', NULL),
('Data Science', NULL),
('Mobile Development', NULL),
('Web Development', 1),
('Backend Development', 1),
('Machine Learning', 2),
('iOS Development', 3),
('Android Development', 3);

-- Insert data into courses
INSERT INTO courses (courseTitle, courseDescription, categoryID) VALUES
('Complete Web Development Bootcamp', 'Master modern web development with HTML, CSS, JavaScript, React, Node.js, and MongoDB. Build real-world projects and deploy them.', 4),
('Python for Data Science', 'Learn Python programming and data analysis libraries like NumPy, Pandas, and Matplotlib. Perfect for aspiring data scientists.', 6),
('iOS App Development with Swift', 'Build beautiful iOS applications using Swift and SwiftUI. From basics to App Store deployment.', 7),
('React.js Mastery', 'Deep dive into React.js, including hooks, context API, Redux, and advanced patterns for building scalable applications.', 4),
('Machine Learning Fundamentals', 'Introduction to machine learning algorithms, supervised and unsupervised learning, and practical implementations.', 6);

-- Insert data into adminManagement
INSERT INTO adminManagement (adminID, managedObjectID, dateModified, actionType) VALUES
(1, 1, '2024-01-15 10:30:00', 'approved_user'),
(1, 2, '2024-01-20 14:15:00', 'approved_user'),
(1, 9, '2024-01-10 09:00:00', 'approved_course'),
(1, 10, '2024-01-25 11:20:00', 'approved_course'),
(1, 11, '2024-11-01 16:45:00', 'pending_review');

-- Insert data into courseEnrollments
INSERT INTO courseEnrollments (learnerID, courseID, enrollmentDate, certificationCode, certificationIssueDate, status, progressPercentage) VALUES
(1, 1, '2024-02-01 08:00:00', 'CERT-WEB-2024-001', '2024-05-15', 'completed', 100.00),
(1, 4, '2024-06-01 09:30:00', 'CERT-REACT-2024-001', '2024-06-01', 'in-progress', 65.50),
(2, 2, '2024-02-05 10:00:00', 'CERT-DS-2024-001', '2024-02-05', 'in-progress', 40.00),
(3, 1, '2024-03-15 14:00:00', 'CERT-WEB-2024-002', '2024-03-15', 'in-progress', 25.75),
(4, 3, '2024-04-01 11:00:00', 'CERT-IOS-2024-001', '2024-04-01', 'in-progress', 50.00);

-- Insert data into courseDesignments
INSERT INTO courseDesignments (instructorID, courseID) VALUES
(1, 1),
(1, 4),
(2, 2),
(2, 5),
(3, 3);

-- Insert data into courseModules
INSERT INTO courseModules (courseID, moduleTitle, moduleOrder) VALUES
(1, 'HTML & CSS Fundamentals', 1),
(1, 'JavaScript Essentials', 2),
(1, 'React.js Introduction', 3),
(1, 'Backend with Node.js', 4),
(2, 'Python Basics', 1),
(2, 'Data Manipulation with Pandas', 2),
(2, 'Data Visualization', 3),
(3, 'Swift Programming', 1),
(3, 'UIKit Fundamentals', 2),
(3, 'SwiftUI and Modern iOS', 3);

-- Insert data into moduleLessons
INSERT INTO moduleLessons (moduleID, lessonTitle, lessonOrder, lessonDuration, lessonMaterialURL) VALUES
(1, 'Introduction to HTML', 1, 45, 'https://elearning.com/materials/html-intro.mp4'),
(1, 'CSS Styling Basics', 2, 60, 'https://elearning.com/materials/css-basics.mp4'),
(1, 'Responsive Web Design', 3, 75, 'https://elearning.com/materials/responsive-design.mp4'),
(2, 'Variables and Data Types', 1, 50, 'https://elearning.com/materials/js-variables.mp4'),
(2, 'Functions and Scope', 2, 55, 'https://elearning.com/materials/js-functions.mp4'),
(2, 'DOM Manipulation', 3, 70, 'https://elearning.com/materials/js-dom.mp4'),
(3, 'React Components', 1, 65, 'https://elearning.com/materials/react-components.mp4'),
(3, 'State and Props', 2, 60, 'https://elearning.com/materials/react-state.mp4'),
(5, 'Python Installation and Setup', 1, 30, 'https://elearning.com/materials/python-setup.mp4'),
(5, 'Python Syntax and Variables', 2, 45, 'https://elearning.com/materials/python-syntax.mp4');

-- Insert data into lessonAssignments
INSERT INTO lessonAssignments (lessonID, startDate, dueDate) VALUES
(1, '2024-02-01 00:00:00', '2024-02-08 23:59:59'),
(2, '2024-02-08 00:00:00', '2024-02-15 23:59:59'),
(3, '2024-02-15 00:00:00', '2024-02-22 23:59:59'),
(4, '2024-02-22 00:00:00', '2024-03-01 23:59:59'),
(5, '2024-03-01 00:00:00', '2024-03-08 23:59:59'),
(6, '2024-03-08 00:00:00', '2024-03-15 23:59:59'),
(7, '2024-03-15 00:00:00', '2024-03-22 23:59:59');

-- Insert data into exercises
INSERT INTO exercises (assignmentID, exerciseTitle, exerciseDescription) VALUES
(1, 'Build Your First HTML Page', 'Create a personal portfolio page using HTML. Include headings, paragraphs, images, and links.'),
(2, 'Style a Webpage with CSS', 'Apply CSS styling to your HTML page. Use colors, fonts, layouts, and animations.'),
(3, 'Create a Responsive Layout', 'Make your webpage responsive using media queries and flexbox/grid layouts.'),
(4, 'JavaScript Calculator', 'Build a simple calculator that can perform basic arithmetic operations.'),
(5, 'Interactive Form Validation', 'Create a form with client-side validation using JavaScript.'),
(6, 'DOM Manipulation Project', 'Build a to-do list application that adds, removes, and marks tasks as complete.');

-- Insert data into Quizzes
INSERT INTO Quizzes (assignmentID, quizTitle, totalMarks, passingMarks, quizDuration) VALUES
(1, 'HTML Fundamentals Quiz', 100, 70, 30),
(2, 'CSS Basics Assessment', 100, 70, 30),
(4, 'JavaScript Variables and Types', 100, 70, 25),
(7, 'React Components Quiz', 100, 70, 35);

-- Insert data into quizQuestions
INSERT INTO quizQuestions (quizID, questionDescription, questionScore) VALUES
(1, 'What does HTML stand for?', 10),
(1, 'Which tag is used to create a hyperlink?', 10),
(1, 'What is the purpose of the <head> tag?', 15),
(1, 'How do you create a numbered list in HTML?', 15),
(1, 'What attribute specifies an alternative text for an image?', 10),
(1, 'Which HTML element defines the title of a document?', 10),
(1, 'What is the correct HTML element for the largest heading?', 10),
(1, 'How can you make a text bold in HTML?', 10),
(1, 'What is the correct HTML for creating a text input field?', 10),
(2, 'What does CSS stand for?', 10),
(2, 'Which property is used to change the background color?', 15),
(2, 'How do you center a block element horizontally?', 20),
(2, 'What is the CSS box model?', 25),
(2, 'Which property is used to change the font size?', 15),
(2, 'What is the difference between padding and margin?', 15),
(3, 'How do you declare a variable in JavaScript?', 15),
(3, 'What are the primitive data types in JavaScript?', 20),
(3, 'What is the difference between let, const, and var?', 25),
(3, 'How do you check the type of a variable?', 20),
(3, 'What is type coercion in JavaScript?', 20),
(4, 'What is a React component?', 20),
(4, 'What is the difference between functional and class components?', 25),
(4, 'How do you pass data to a component?', 20),
(4, 'What is JSX?', 15),
(4, 'What are React Hooks?', 20);

-- Insert data into questionOptions
INSERT INTO questionOptions (questionID, optionText, isCorrect) VALUES
(1, 'Hyper Text Markup Language', TRUE),
(1, 'High Tech Modern Language', FALSE),
(1, 'Home Tool Markup Language', FALSE),
(1, 'Hyperlinks and Text Markup Language', FALSE),
(2, '<a>', TRUE),
(2, '<link>', FALSE),
(2, '<href>', FALSE),
(2, '<hyperlink>', FALSE),
(3, 'Contains metadata about the document', TRUE),
(3, 'Contains the main content', FALSE),
(3, 'Defines the footer', FALSE),
(3, 'Creates a heading', FALSE),
(4, 'Using <ol> tag', TRUE),
(4, 'Using <ul> tag', FALSE),
(4, 'Using <list> tag', FALSE),
(4, 'Using <nl> tag', FALSE),
(5, 'alt', TRUE),
(5, 'title', FALSE),
(5, 'src', FALSE),
(5, 'alternative', FALSE),
(10, 'Cascading Style Sheets', TRUE),
(10, 'Computer Style Sheets', FALSE),
(10, 'Creative Style Sheets', FALSE),
(10, 'Colorful Style Sheets', FALSE),
(17, 'Using var, let, or const keywords', TRUE),
(17, 'Using declare keyword', FALSE),
(17, 'Using variable keyword', FALSE),
(17, 'Using def keyword', FALSE),
(22, 'A reusable piece of UI', TRUE),
(22, 'A CSS file', FALSE),
(22, 'A database table', FALSE),
(22, 'A JavaScript function only', FALSE);

-- Insert data into learnerSubmissions
INSERT INTO learnerSubmissions (learnerID, submissionID, dateSubmitted, grade) VALUES
(1, 1, '2024-02-07 15:30:00', 95.00),
(1, 2, '2024-02-14 18:45:00', 88.50),
(1, 3, '2024-02-21 20:00:00', 92.00),
(2, 4, '2024-02-10 14:20:00', 75.00),
(2, 5, '2024-02-17 16:30:00', NULL),
(3, 6, '2024-03-20 19:15:00', 68.50);

-- Insert data into submissionExercises
INSERT INTO submissionExercises (learnerID, submissionID, exerciseID, fileURL, fileName) VALUES
(1, 1, 1, 'https://elearning.com/submissions/john_html_portfolio.zip', 'portfolio.html'),
(1, 2, 2, 'https://elearning.com/submissions/john_css_styling.zip', 'styled_portfolio.html'),
(1, 3, 3, 'https://elearning.com/submissions/john_responsive.zip', 'responsive_portfolio.html'),
(2, 4, 1, 'https://elearning.com/submissions/jane_html_portfolio.zip', 'my_portfolio.html'),
(2, 5, 4, 'https://elearning.com/submissions/jane_calculator.zip', 'calculator.html'),
(3, 6, 1, 'https://elearning.com/submissions/sarah_portfolio.zip', 'portfolio_sarah.html');

-- Insert data into submissionQuizzes
INSERT INTO submissionQuizzes (submissionID, learnerID, quizID, score) VALUES
(1, 1, 1, 95.00),
(2, 1, 2, 88.50),
(3, 1, 3, 92.00),
(4, 2, 1, 75.00),
(6, 3, 1, 68.50);

------- Làm tiếp ở đây --------