-- Create USER table (Top-level parent table)
CREATE TABLE USER (
    UserID INT AUTO_INCREMENT PRIMARY KEY,
    FullName VARCHAR(255),
    username VARCHAR(100) UNIQUE,
    phoneNumber VARCHAR(20),
    Email VARCHAR(255),
    Password_hash VARCHAR(255),
    Role ENUM('learner', 'instructor', 'admin')
);

-- Create child tables inheriting from USER
CREATE TABLE LEARNER (
    UserID INT PRIMARY KEY,
    Birthday DATE,
    FOREIGN KEY (UserID) REFERENCES USER(UserID)
);

CREATE TABLE INSTRUCTOR (
    UserID INT PRIMARY KEY,
    Bio TEXT,
    Specialization VARCHAR(255),
    FOREIGN KEY (UserID) REFERENCES USER(UserID)
);

CREATE TABLE ADMIN (
    UserID INT PRIMARY KEY,
    adminID INT, -- Could be a separate identifier
    accessLevel INT,
    FOREIGN KEY (UserID) REFERENCES USER(UserID)
);

-- MANAGE relationship table (Between Admin and User)
CREATE TABLE MANAGE (
    Admin_UserID INT,
    Target_UserID INT,
    accessLevel INT,
    dataModify DATETIME,
    actionType VARCHAR(50),
    PRIMARY KEY (Admin_UserID, Target_UserID),
    FOREIGN KEY (Admin_UserID) REFERENCES ADMIN(UserID),
    FOREIGN KEY (Target_UserID) REFERENCES USER(UserID)
);

-- Create Category table first (since Course table depends on it)
CREATE TABLE Course_category (
    CategoryID INT AUTO_INCREMENT PRIMARY KEY,
    Name VARCHAR(255),
    Parent_ID INT,
    -- Recursive foreign key
    FOREIGN KEY (Parent_ID) REFERENCES Course_category(CategoryID)
);

-- Create Course table
CREATE TABLE Course (
    CourseID INT AUTO_INCREMENT PRIMARY KEY,
    CTitle VARCHAR(255),
    Created_date DATETIME DEFAULT CURRENT_TIMESTAMP,
    Description TEXT,
    Status VARCHAR(50) DEFAULT 'active',
    CategoryID INT NOT NULL, -- NOT NULL because of total participation in ERD
    -- Foreign key linking to category
    FOREIGN KEY (CategoryID) REFERENCES Course_category(CategoryID)
);

-- Relationship tables with Course
CREATE TABLE ENROLL (
    Learner_UserID INT,
    Course_CourseID INT,
    Certificate_code VARCHAR(100),
    Issue_date DATE,
    Date_signed DATE,
    Status VARCHAR(50),
    Progress FLOAT,
    PRIMARY KEY (Learner_UserID, Course_CourseID),
    FOREIGN KEY (Learner_UserID) REFERENCES LEARNER(UserID),
    FOREIGN KEY (Course_CourseID) REFERENCES Course(CourseID)
);

CREATE TABLE DESIGN (
    Instructor_UserID INT,
    Course_CourseID INT,
    PRIMARY KEY (Instructor_UserID, Course_CourseID),
    FOREIGN KEY (Instructor_UserID) REFERENCES INSTRUCTOR(UserID),
    FOREIGN KEY (Course_CourseID) REFERENCES Course(CourseID)
);

CREATE TABLE ACCESS (
    Admin_UserID INT,
    Course_CourseID INT,
    PRIMARY KEY (Admin_UserID, Course_CourseID),
    FOREIGN KEY (Admin_UserID) REFERENCES ADMIN(UserID),
    FOREIGN KEY (Course_CourseID) REFERENCES Course(CourseID)
);

-- Module Table
CREATE TABLE Module (
    ModuleID INT AUTO_INCREMENT PRIMARY KEY,
    Title VARCHAR(255),
    Order_Num INT, -- "Order" is a keyword, so use Order_Num or enclose it in `Order`
    CourseID INT,
    FOREIGN KEY (CourseID) REFERENCES Course(CourseID)
);

-- Lesson Table
CREATE TABLE Lesson (
    LessonID INT AUTO_INCREMENT PRIMARY KEY,
    Title VARCHAR(255),
    Order_Num INT,
    Duration INT, -- Assuming in minutes
    CourseID INT,
    ModuleID INT,
    FOREIGN KEY (CourseID) REFERENCES Course(CourseID),
    FOREIGN KEY (ModuleID) REFERENCES Module(ModuleID)
);

-- Material Table
CREATE TABLE Material (
    materialID INT AUTO_INCREMENT PRIMARY KEY,
    materialName VARCHAR(255),
    materialURL VARCHAR(500),
    LessonID INT,
    CourseID INT,
    ModuleID INT,
    FOREIGN KEY (LessonID) REFERENCES Lesson(LessonID),
    FOREIGN KEY (CourseID) REFERENCES Course(CourseID),
    FOREIGN KEY (ModuleID) REFERENCES Module(ModuleID)
);

-- Assignment Table (General exercises)
CREATE TABLE Assignment (
    AssignmentID INT AUTO_INCREMENT PRIMARY KEY,
    startDate DATETIME,
    dueDate DATETIME,
    title VARCHAR(255),
    CourseID INT,
    ModuleID INT,
    LessonID INT,
    FOREIGN KEY (CourseID) REFERENCES Course(CourseID),
    FOREIGN KEY (ModuleID) REFERENCES Module(ModuleID),
    FOREIGN KEY (LessonID) REFERENCES Lesson(LessonID)
);

-- Exercise Table (Inherits from or details of Assignment)
CREATE TABLE Exercise (
    ExerciseID INT AUTO_INCREMENT PRIMARY KEY,
    Title VARCHAR(255),
    Description TEXT,
    AssignmentID INT,
    FOREIGN KEY (AssignmentID) REFERENCES Assignment(AssignmentID)
);

-- Quiz Table (Inherits from or details of Assignment)
CREATE TABLE Quiz (
    quizID INT AUTO_INCREMENT PRIMARY KEY,
    Passing_Score FLOAT,
    Duration INT,
    totalScore FLOAT,
    AssignmentID INT,
    FOREIGN KEY (AssignmentID) REFERENCES Assignment(AssignmentID)
);

-- Question Table
CREATE TABLE Question (
    questionID INT AUTO_INCREMENT PRIMARY KEY,
    qText TEXT,
    score FLOAT,
    quizID INT,
    AssignmentID INT,
    FOREIGN KEY (quizID) REFERENCES Quiz(quizID),
    FOREIGN KEY (AssignmentID) REFERENCES Assignment(AssignmentID)
);

-- Option Table (Choices for questions)
CREATE TABLE Option_Table ( -- "Option" is often a keyword, add a suffix to be safe
    optionID INT AUTO_INCREMENT PRIMARY KEY,
    oText TEXT,
    is_correct BOOLEAN, -- Or BIT
    questionID INT,
    quizID INT,
    AssignmentID INT,
    FOREIGN KEY (questionID) REFERENCES Question(questionID),
    FOREIGN KEY (quizID) REFERENCES Quiz(quizID),
    FOREIGN KEY (AssignmentID) REFERENCES Assignment(AssignmentID)
);

-- Submission Table (Submitting work)
CREATE TABLE Submission (
    SubmissionID INT AUTO_INCREMENT PRIMARY KEY,
    Time DATETIME DEFAULT CURRENT_TIMESTAMP,
    Grade FLOAT,
    AssignmentID INT,
    Learner_UserID INT,
    FOREIGN KEY (AssignmentID) REFERENCES Assignment(AssignmentID),
    FOREIGN KEY (Learner_UserID) REFERENCES LEARNER(UserID)
);

-- Answer Table (Detailed answers from learners)
CREATE TABLE Answer (
    AnswerID INT AUTO_INCREMENT PRIMARY KEY,
    optionID INT,
    questionID INT,
    Learner_UserID INT,
    SubmissionID INT,
    AssignmentID INT,
    FOREIGN KEY (optionID) REFERENCES Option_Table(optionID),
    FOREIGN KEY (questionID) REFERENCES Question(questionID),
    FOREIGN KEY (Learner_UserID) REFERENCES LEARNER(UserID),
    FOREIGN KEY (SubmissionID) REFERENCES Submission(SubmissionID),
    FOREIGN KEY (AssignmentID) REFERENCES Assignment(AssignmentID)
);

-- File Table (Attached documents for Exercise or Submission)
CREATE TABLE File (
    FileID INT AUTO_INCREMENT PRIMARY KEY,
    fileName VARCHAR(255),
    fileURL VARCHAR(500),
    ExerciseID INT,
    AssignmentID INT,
    SubmissionID INT,
    FOREIGN KEY (ExerciseID) REFERENCES Exercise(ExerciseID),
    FOREIGN KEY (AssignmentID) REFERENCES Assignment(AssignmentID),
    FOREIGN KEY (SubmissionID) REFERENCES Submission(SubmissionID)
);
-- Add constraints for new tables
ALTER TABLE Assignment
    ADD CONSTRAINT chk_assignment_dates 
    CHECK (dueDate > startDate);

ALTER TABLE Quiz
    ADD CONSTRAINT chk_quiz_marks 
    CHECK (Passing_Score <= totalScore);

ALTER TABLE ENROLL
    ADD CONSTRAINT chk_progress_percent 
    CHECK (Progress >= 0 AND Progress <= 100);

ALTER TABLE Lesson
    ADD CONSTRAINT chk_lesson_duration 
    CHECK (Duration > 0);

DELIMITER $$

CREATE TRIGGER tg_check_instructor_role
BEFORE INSERT ON INSTRUCTOR
FOR EACH ROW
BEGIN
    DECLARE user_role VARCHAR(20);
    SELECT Role INTO user_role FROM USER WHERE UserID = NEW.UserID;
    IF user_role <> 'instructor' THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Error: UserID does not have the Instructor role.';
    END IF;
END$$

CREATE TRIGGER tg_check_learner_role
BEFORE INSERT ON LEARNER
FOR EACH ROW
BEGIN
    DECLARE user_role VARCHAR(20);
    SELECT Role INTO user_role FROM USER WHERE UserID = NEW.UserID;
    IF user_role <> 'learner' THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Error: UserID does not have the Learner role.';
    END IF;
END$$

CREATE TRIGGER tg_check_admin_role
BEFORE INSERT ON ADMIN
FOR EACH ROW
BEGIN
    DECLARE user_role VARCHAR(20);
    SELECT Role INTO user_role FROM USER WHERE UserID = NEW.UserID;
    IF user_role <> 'admin' THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Error: UserID does not have the Admin role.';
    END IF;
END$$

CREATE TRIGGER tg_auto_complete_course
BEFORE UPDATE ON ENROLL
FOR EACH ROW
BEGIN
    IF NEW.Progress = 100 THEN
        SET NEW.Status = 'completed';
    END IF;
END$$

DELIMITER ;

-- Insert data into USER (UserID will be auto-incremented)
INSERT INTO USER (FullName, username, phoneNumber, Email, Password_hash, Role) VALUES
('John Doe', 'johndoe', '0901234567', 'john.doe@email.com', '$2y$10$abcdefghijklmnopqrstuvwxyz123456', 'learner'),
('Jane Smith', 'janesmith', '0902345678', 'jane.smith@email.com', '$2y$10$bcdefghijklmnopqrstuvwxyz1234567', 'learner'),
('Michael Johnson', 'michaelj', '0903456789', 'michael.j@email.com', '$2y$10$cdefghijklmnopqrstuvwxyz12345678', 'instructor'),
('Emily Brown', 'emilybrown', '0904567890', 'emily.brown@email.com', '$2y$10$defghijklmnopqrstuvwxyz123456789', 'instructor'),
('David Wilson', 'davidwilson', '0905678901', 'david.wilson@email.com', '$2y$10$efghijklmnopqrstuvwxyz1234567890', 'admin'),
('Sarah Taylor', 'sarahtaylor', '0906789012', 'sarah.taylor@email.com', '$2y$10$fghijklmnopqrstuvwxyz12345678901', 'learner'),
('Robert Martinez', 'robertm', '0907890123', 'robert.m@email.com', '$2y$10$ghijklmnopqrstuvwxyz123456789012', 'instructor'),
('Lisa Anderson', 'lisaanderson', '0908901234', 'lisa.anderson@email.com', '$2y$10$hijklmnopqrstuvwxyz1234567890123', 'learner');

-- Insert data into LEARNER
INSERT INTO LEARNER (UserID, Birthday) VALUES
(1, '2000-05-15'),
(2, '1999-08-22'),
(6, '2001-03-10'),
(8, '2000-11-30');

-- Insert data into INSTRUCTOR
INSERT INTO INSTRUCTOR (UserID, Bio, Specialization) VALUES
(3, 'Experienced web developer with 10+ years in full-stack development. Passionate about teaching modern web technologies.', 'Web Development'),
(4, 'Data science expert with background in machine learning and AI. Published researcher and industry consultant.', 'Data Science'),
(7, 'Mobile app developer specializing in iOS and Android platforms. Former senior engineer at major tech companies.', 'Mobile Development');

-- Insert data into ADMIN
INSERT INTO ADMIN (UserID, adminID, accessLevel) VALUES
(5, 1, 3);

-- Insert data into Course_category (CategoryID will be auto-incremented)
INSERT INTO Course_category (Name, Parent_ID) VALUES
('Programming', NULL),
('Data Science', NULL),
('Mobile Development', NULL),
('Web Development', 1),
('Backend Development', 1),
('Machine Learning', 2),
('iOS Development', 3),
('Android Development', 3);

-- Insert data into Course (CourseID will be auto-incremented)
INSERT INTO Course (CTitle, Created_date, Description, Status, CategoryID) VALUES
('Complete Web Development Bootcamp', '2024-01-10 09:00:00', 'Master modern web development with HTML, CSS, JavaScript, React, Node.js, and MongoDB. Build real-world projects and deploy them.', 'active', 4),
('Python for Data Science', '2024-01-25 10:00:00', 'Learn Python programming and data analysis libraries like NumPy, Pandas, and Matplotlib. Perfect for aspiring data scientists.', 'active', 6),
('iOS App Development with Swift', '2024-02-05 11:00:00', 'Build beautiful iOS applications using Swift and SwiftUI. From basics to App Store deployment.', 'active', 7),
('React.js Mastery', '2024-02-15 12:00:00', 'Deep dive into React.js, including hooks, context API, Redux, and advanced patterns for building scalable applications.', 'active', 4),
('Machine Learning Fundamentals', '2024-03-01 13:00:00', 'Introduction to machine learning algorithms, supervised and unsupervised learning, and practical implementations.', 'active', 6);

-- Insert data into MANAGE
INSERT INTO MANAGE (Admin_UserID, Target_UserID, accessLevel, dataModify, actionType) VALUES
(5, 1, 1, '2024-01-15 10:30:00', 'approved_user'),
(5, 2, 1, '2024-01-20 14:15:00', 'approved_user'),
(5, 3, 2, '2024-02-01 09:00:00', 'approved_instructor'),
(5, 4, 2, '2024-02-10 10:00:00', 'approved_instructor');

-- Insert data into ENROLL
INSERT INTO ENROLL (Learner_UserID, Course_CourseID, Certificate_code, Issue_date, Date_signed, Status, Progress) VALUES
(1, 1, 'CERT-WEB-2024-001', '2024-05-15', '2024-02-01', 'completed', 100.00),
(1, 4, 'CERT-REACT-2024-001', '2024-06-01', '2024-06-01', 'in-progress', 65.50),
(2, 2, 'CERT-DS-2024-001', '2024-02-05', '2024-02-05', 'in-progress', 40.00),
(2, 1, 'CERT-WEB-2024-002', '2024-02-10', '2024-02-10', 'in-progress', 35.00),
(6, 1, 'CERT-WEB-2024-003', '2024-03-15', '2024-03-15', 'in-progress', 25.75),
(6, 3, 'CERT-IOS-2024-001', '2024-04-01', '2024-04-01', 'in-progress', 50.00),
(8, 1, 'CERT-WEB-2024-004', '2024-03-20', '2024-03-20', 'in-progress', 20.00),
(8, 2, 'CERT-DS-2024-002', '2024-04-05', '2024-04-05', 'in-progress', 30.00);

-- Insert data into DESIGN
INSERT INTO DESIGN (Instructor_UserID, Course_CourseID) VALUES
(3, 1),
(3, 4),
(4, 2),
(4, 5),
(7, 3);

-- Insert data into ACCESS
INSERT INTO ACCESS (Admin_UserID, Course_CourseID) VALUES
(5, 1),
(5, 2),
(5, 3),
(5, 4),
(5, 5);

-- Insert data into Module
INSERT INTO Module (Title, Order_Num, CourseID) VALUES
('HTML & CSS Fundamentals', 1, 1),
('JavaScript Essentials', 2, 1),
('React.js Introduction', 3, 1),
('Backend with Node.js', 4, 1),
('Python Basics', 1, 2),
('Data Manipulation with Pandas', 2, 2),
('Data Visualization', 3, 2),
('Swift Programming', 1, 3),
('UIKit Fundamentals', 2, 3),
('SwiftUI and Modern iOS', 3, 3);

-- Insert data into Lesson
INSERT INTO Lesson (Title, Order_Num, Duration, CourseID, ModuleID) VALUES
('Introduction to HTML', 1, 45, 1, 1),
('CSS Styling Basics', 2, 60, 1, 1),
('Responsive Web Design', 3, 75, 1, 1),
('Variables and Data Types', 1, 50, 1, 2),
('Functions and Scope', 2, 55, 1, 2),
('DOM Manipulation', 3, 70, 1, 2),
('React Components', 1, 65, 1, 3),
('State and Props', 2, 60, 1, 3),
('Python Installation and Setup', 1, 30, 2, 5),
('Python Syntax and Variables', 2, 45, 2, 5);

-- Insert data into Material
INSERT INTO Material (materialName, materialURL, LessonID, CourseID, ModuleID) VALUES
('HTML Introduction Video', 'https://elearning.com/materials/html-intro.mp4', 1, 1, 1),
('CSS Basics Video', 'https://elearning.com/materials/css-basics.mp4', 2, 1, 1),
('Responsive Design Guide', 'https://elearning.com/materials/responsive-design.mp4', 3, 1, 1),
('JavaScript Variables Tutorial', 'https://elearning.com/materials/js-variables.mp4', 4, 1, 2),
('JavaScript Functions Guide', 'https://elearning.com/materials/js-functions.mp4', 5, 1, 2),
('DOM Manipulation Workshop', 'https://elearning.com/materials/js-dom.mp4', 6, 1, 2),
('React Components Lecture', 'https://elearning.com/materials/react-components.mp4', 7, 1, 3),
('React State Management', 'https://elearning.com/materials/react-state.mp4', 8, 1, 3),
('Python Setup Guide', 'https://elearning.com/materials/python-setup.mp4', 9, 2, 5),
('Python Syntax Overview', 'https://elearning.com/materials/python-syntax.mp4', 10, 2, 5);

-- Insert data into Assignment
INSERT INTO Assignment (startDate, dueDate, title, CourseID, ModuleID, LessonID) VALUES
('2024-02-01 00:00:00', '2024-02-08 23:59:59', 'HTML Fundamentals Quiz', 1, 1, 1),
('2024-02-09 00:00:00', '2024-02-16 23:59:59', 'Build Your First HTML Page', 1, 1, 1),
('2024-02-08 00:00:00', '2024-02-15 23:59:59', 'CSS Basics Assessment', 1, 1, 2),
('2024-02-16 00:00:00', '2024-02-23 23:59:59', 'Style a Webpage with CSS', 1, 1, 2),
('2024-02-15 00:00:00', '2024-02-22 23:59:59', 'Create a Responsive Layout', 1, 1, 3),
('2024-02-22 00:00:00', '2024-03-01 23:59:59', 'JavaScript Variables and Types', 1, 2, 4),
('2024-03-01 00:00:00', '2024-03-08 23:59:59', 'Interactive Form Validation', 1, 2, 5),
('2024-03-08 00:00:00', '2024-03-15 23:59:59', 'DOM Manipulation Project', 1, 2, 6),
('2024-03-15 00:00:00', '2024-03-22 23:59:59', 'React Components Quiz', 1, 3, 7);

-- Insert data into Exercise
INSERT INTO Exercise (Title, Description, AssignmentID) VALUES
('Build Your First HTML Page', 'Create a personal portfolio page using HTML. Include headings, paragraphs, images, and links.', 2),
('Style a Webpage with CSS', 'Apply CSS styling to your HTML page. Use colors, fonts, layouts, and animations.', 4),
('Create a Responsive Layout', 'Make your webpage responsive using media queries and flexbox/grid layouts.', 5),
('Interactive Form Validation', 'Create a form with client-side validation using JavaScript.', 7),
('DOM Manipulation Project', 'Build a to-do list application that adds, removes, and marks tasks as complete.', 8);

-- Insert data into Quiz
INSERT INTO Quiz (Passing_Score, Duration, totalScore, AssignmentID) VALUES
(70, 30, 100, 1),
(70, 30, 100, 3),
(70, 25, 100, 6),
(70, 35, 100, 9);

-- Insert data into Question
INSERT INTO Question (qText, score, quizID, AssignmentID) VALUES
-- Quiz 1 questions
('What does HTML stand for?', 10, 1, 1),
('Which tag is used to create a hyperlink?', 10, 1, 1),
('What is the purpose of the <head> tag?', 15, 1, 1),
('How do you create a numbered list in HTML?', 15, 1, 1),
('What attribute specifies an alternative text for an image?', 10, 1, 1),
('Which HTML element defines the title of a document?', 10, 1, 1),
('What is the correct HTML element for the largest heading?', 10, 1, 1),
('How can you make a text bold in HTML?', 10, 1, 1),
('What is the correct HTML for creating a text input field?', 10, 1, 1),
-- Quiz 2 questions
('What does CSS stand for?', 10, 2, 3),
('Which property is used to change the background color?', 15, 2, 3),
('How do you center a block element horizontally?', 20, 2, 3),
('What is the CSS box model?', 25, 2, 3),
('Which property is used to change the font size?', 15, 2, 3),
('What is the difference between padding and margin?', 15, 2, 3),
-- Quiz 3 questions
('How do you declare a variable in JavaScript?', 15, 3, 6),
('What are the primitive data types in JavaScript?', 20, 3, 6),
('What is the difference between let, const, and var?', 25, 3, 6),
('How do you check the type of a variable?', 20, 3, 6),
('What is type coercion in JavaScript?', 20, 3, 6),
-- Quiz 4 questions
('What is a React component?', 20, 4, 9),
('What is the difference between functional and class components?', 25, 4, 9),
('How do you pass data to a component?', 20, 4, 9),
('What is JSX?', 15, 4, 9),
('What are React Hooks?', 20, 4, 9);

-- Insert data into Option_Table
INSERT INTO Option_Table (oText, is_correct, questionID, quizID, AssignmentID) VALUES
-- Question 1 options
('Hyper Text Markup Language', TRUE, 1, 1, 1),
('High Tech Modern Language', FALSE, 1, 1, 1),
('Home Tool Markup Language', FALSE, 1, 1, 1),
('Hyperlinks and Text Markup Language', FALSE, 1, 1, 1),
-- Question 2 options
('<a>', TRUE, 2, 1, 1),
('<link>', FALSE, 2, 1, 1),
('<href>', FALSE, 2, 1, 1),
('<hyperlink>', FALSE, 2, 1, 1),
-- Question 3 options
('Contains metadata about the document', TRUE, 3, 1, 1),
('Contains the main content', FALSE, 3, 1, 1),
('Defines the footer', FALSE, 3, 1, 1),
('Creates a heading', FALSE, 3, 1, 1),
-- Question 4 options
('Using <ol> tag', TRUE, 4, 1, 1),
('Using <ul> tag', FALSE, 4, 1, 1),
('Using <list> tag', FALSE, 4, 1, 1),
('Using <nl> tag', FALSE, 4, 1, 1),
-- Question 5 options
('alt', TRUE, 5, 1, 1),
('title', FALSE, 5, 1, 1),
('src', FALSE, 5, 1, 1),
('alternative', FALSE, 5, 1, 1),
-- Question 6 options
('<title>', TRUE, 6, 1, 1),
('<meta>', FALSE, 6, 1, 1),
('<head>', FALSE, 6, 1, 1),
('<body>', FALSE, 6, 1, 1),
-- Question 7 options
('<h1>', TRUE, 7, 1, 1),
('<h6>', FALSE, 7, 1, 1),
('<head>', FALSE, 7, 1, 1),
('<heading>', FALSE, 7, 1, 1),
-- Question 8 options
('<b>', TRUE, 8, 1, 1),
('<bold>', FALSE, 8, 1, 1),
('<bb>', FALSE, 8, 1, 1),
('<fat>', FALSE, 8, 1, 1),
-- Question 9 options
('<input type="text">', TRUE, 9, 1, 1),
('<textfield>', FALSE, 9, 1, 1),
('<textinput>', FALSE, 9, 1, 1),
('<input type="textfield">', FALSE, 9, 1, 1),
-- Question 10 options
('Cascading Style Sheets', TRUE, 10, 2, 3),
('Computer Style Sheets', FALSE, 10, 2, 3),
('Creative Style Sheets', FALSE, 10, 2, 3),
('Colorful Style Sheets', FALSE, 10, 2, 3),
-- Question 11 options
('background-color', TRUE, 11, 2, 3),
('color', FALSE, 11, 2, 3),
('bgcolor', FALSE, 11, 2, 3),
('bg-color', FALSE, 11, 2, 3),
-- Question 12 options
('margin: 0 auto;', TRUE, 12, 2, 3),
('text-align: center;', FALSE, 12, 2, 3),
('align: center;', FALSE, 12, 2, 3),
('float: center;', FALSE, 12, 2, 3),
-- Question 13 options
('It consists of: margins, borders, padding, and the actual content', TRUE, 13, 2, 3),
('It is a box to put text in', FALSE, 13, 2, 3),
('It creates a checkbox', FALSE, 13, 2, 3),
('It is a layout model for headers only', FALSE, 13, 2, 3),
-- Question 14 options
('font-size', TRUE, 14, 2, 3),
('text-size', FALSE, 14, 2, 3),
('font-style', FALSE, 14, 2, 3),
('text-style', FALSE, 14, 2, 3),
-- Question 15 options
('Padding is inside the border, Margin is outside', TRUE, 15, 2, 3),
('Margin is inside the border, Padding is outside', FALSE, 15, 2, 3),
('There is no difference', FALSE, 15, 2, 3),
('Padding adds color, Margin adds space', FALSE, 15, 2, 3),
-- Question 16 options
('var, let, const', TRUE, 16, 3, 6),
('variable myVar', FALSE, 16, 3, 6),
('v myVar', FALSE, 16, 3, 6),
('dim myVar', FALSE, 16, 3, 6),
-- Question 17 options
('String, Number, Boolean, Null, Undefined, Symbol', TRUE, 17, 3, 6),
('Array, Object, Function', FALSE, 17, 3, 6),
('Integer, Float, Character', FALSE, 17, 3, 6),
('List, Map, Set', FALSE, 17, 3, 6),
-- Question 18 options
('Scope and reassignment rules differ', TRUE, 18, 3, 6),
('They are exactly the same', FALSE, 18, 3, 6),
('const can be reassigned, let cannot', FALSE, 18, 3, 6),
('var is a new feature in ES6', FALSE, 18, 3, 6),
-- Question 19 options
('typeof variableName', TRUE, 19, 3, 6),
('checkType(variableName)', FALSE, 19, 3, 6),
('typeOf(variableName)', FALSE, 19, 3, 6),
('dataType variableName', FALSE, 19, 3, 6),
-- Question 20 options
('Automatic or implicit conversion of values from one data type to another', TRUE, 20, 3, 6),
('Forcing a variable to be a constant', FALSE, 20, 3, 6),
('Removing a variable from memory', FALSE, 20, 3, 6),
('Compiling JavaScript code', FALSE, 20, 3, 6),
-- Question 21 options
('Independent and reusable bits of code that return HTML', TRUE, 21, 4, 9),
('A database table', FALSE, 21, 4, 9),
('A CSS framework', FALSE, 21, 4, 9),
('A server-side function', FALSE, 21, 4, 9),
-- Question 22 options
('A reusable piece of UI', TRUE, 22, 4, 9),
('A CSS file', FALSE, 22, 4, 9),
('A database table', FALSE, 22, 4, 9),
('A JavaScript function only', FALSE, 22, 4, 9),
-- Question 23 options
('Using Props', TRUE, 23, 4, 9),
('Using State', FALSE, 23, 4, 9),
('Using Render', FALSE, 23, 4, 9),
('Using HTML attributes only', FALSE, 23, 4, 9),
-- Question 24 options
('A syntax extension to JavaScript', TRUE, 24, 4, 9),
('A new programming language', FALSE, 24, 4, 9),
('A database query language', FALSE, 24, 4, 9),
('A CSS preprocessor', FALSE, 24, 4, 9),
-- Question 25 options
('Functions that let you hook into React state and lifecycle features', TRUE, 25, 4, 9),
('Errors in React code', FALSE, 25, 4, 9),
('External libraries', FALSE, 25, 4, 9),
('Database connections', FALSE, 25, 4, 9);

-- Insert data into Submission
INSERT INTO Submission (Time, Grade, AssignmentID, Learner_UserID) VALUES
('2024-02-07 15:30:00', 95.00, 1, 1),
('2024-02-14 18:45:00', 88.50, 3, 1),
('2024-02-21 20:00:00', 92.00, 6, 1),
('2024-02-10 14:20:00', 75.00, 1, 2),
('2024-02-17 16:30:00', NULL, 2, 2),
('2024-03-20 19:15:00', 68.50, 1, 6),
('2024-02-12 10:00:00', 82.00, 1, 2),
('2024-03-18 15:00:00', 78.00, 1, 6),
('2024-03-22 14:00:00', 65.00, 1, 8),
('2024-03-25 16:00:00', 72.00, 3, 8);

-- Insert data into File (for Exercise submissions)
INSERT INTO File (fileName, fileURL, ExerciseID, AssignmentID, SubmissionID) VALUES
('portfolio.html', 'https://elearning.com/submissions/john_html_portfolio.zip', 1, 2, 5),
('styled_portfolio.html', 'https://elearning.com/submissions/john_css_styling.zip', 2, 4, 5),
('responsive_portfolio.html', 'https://elearning.com/submissions/john_responsive.zip', 3, 5, 5),
('my_portfolio.html', 'https://elearning.com/submissions/jane_html_portfolio.zip', 1, 2, 5),
('calculator.html', 'https://elearning.com/submissions/jane_calculator.zip', 4, 7, 5),
('portfolio_sarah.html', 'https://elearning.com/submissions/sarah_portfolio.zip', 1, 2, 6);

-- Insert data into Answer (Quiz answers)
INSERT INTO Answer (optionID, questionID, Learner_UserID, SubmissionID, AssignmentID) VALUES
-- John's first quiz (SubmissionID 1, Grade 95)
(1, 1, 1, 1, 1),
(5, 2, 1, 1, 1),
(9, 3, 1, 1, 1),
(13, 4, 1, 1, 1),
(17, 5, 1, 1, 1),
(21, 6, 1, 1, 1),
(25, 7, 1, 1, 1),
(29, 8, 1, 1, 1),
(33, 9, 1, 1, 1),
-- John's CSS quiz (SubmissionID 2, Grade 88.5)
(37, 10, 1, 2, 3),
(41, 11, 1, 2, 3),
(45, 12, 1, 2, 3),
(49, 13, 1, 2, 3),
(53, 14, 1, 2, 3),
(58, 15, 1, 2, 3),
-- John's JS quiz (SubmissionID 3, Grade 92)
(61, 16, 1, 3, 6),
(65, 17, 1, 3, 6),
(69, 18, 1, 3, 6),
(73, 19, 1, 3, 6),
(77, 20, 1, 3, 6);

------- Stored Procedures and Functions --------
---2.1 - Quiz Management---
DELIMITER $$

CREATE TRIGGER tg_check_quiz_total_score
BEFORE INSERT ON Question
FOR EACH ROW
BEGIN
    DECLARE current_total FLOAT;
    DECLARE max_marks FLOAT;

    SELECT COALESCE(SUM(score), 0) INTO current_total 
    FROM Question WHERE quizID = NEW.quizID;

    SELECT totalScore INTO max_marks FROM Quiz WHERE quizID = NEW.quizID;

    IF (current_total + NEW.score) > max_marks THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Error: Total question score exceeds the totalScore of the Quiz.';
    END IF;
END$$

CREATE TRIGGER tg_check_quiz_total_score_update
BEFORE UPDATE ON Question
FOR EACH ROW
BEGIN
    DECLARE current_total FLOAT;
    DECLARE max_marks FLOAT;

    SELECT COALESCE(SUM(score), 0) INTO current_total 
    FROM Question 
    WHERE quizID = NEW.quizID AND questionID != OLD.questionID;

    SELECT totalScore INTO max_marks FROM Quiz WHERE quizID = NEW.quizID;

    IF (current_total + NEW.score) > max_marks THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Error: Update failed. Total question score exceeds the totalScore of the Quiz.';
    END IF;
END$$

CREATE PROCEDURE sp_AddQuestion(
    IN p_quizID INT,
    IN p_description TEXT,
    IN p_score FLOAT
)
BEGIN
    DECLARE v_assignmentID INT;
    
    IF NOT EXISTS (SELECT 1 FROM Quiz WHERE quizID = p_quizID) THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Error: The provided quizID does not exist.';
    END IF;

    IF LENGTH(TRIM(p_description)) = 0 THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Error: Question description cannot be empty or whitespace only.';
    END IF;

    IF p_score <= 0 THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Error: Question score must be greater than 0.';
    END IF;

    SELECT AssignmentID INTO v_assignmentID FROM Quiz WHERE quizID = p_quizID;

    INSERT INTO Question (qText, score, quizID, AssignmentID)
    VALUES (p_description, p_score, p_quizID, v_assignmentID);

    SELECT 'Question added successfully' AS Message;
END$$

CREATE PROCEDURE sp_UpdateQuestion(
    IN p_questionID INT,
    IN p_newDescription TEXT,
    IN p_newScore FLOAT
)
BEGIN
    IF NOT EXISTS (SELECT 1 FROM Question WHERE questionID = p_questionID) THEN
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

    UPDATE Question
    SET qText = p_newDescription,
        score = p_newScore
    WHERE questionID = p_questionID;

    SELECT 'Question updated successfully' AS Message;
END$$

CREATE PROCEDURE sp_DeleteQuestion(
    IN p_questionID INT
)
BEGIN
    -- 1. Check if the question exists
    IF NOT EXISTS (SELECT 1 FROM Question WHERE questionID = p_questionID) THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Error: Question ID not found.';
    END IF;

    -- 2. Delete all answers that reference this question
    DELETE FROM Answer WHERE questionID = p_questionID;

    -- 3. Delete all options for this question
    DELETE FROM Option_Table WHERE questionID = p_questionID;

    -- 4. Delete the question itself
    DELETE FROM Question WHERE questionID = p_questionID;

    -- 5. Return success message
    SELECT 'Question deleted successfully' AS Message;
END$$

DELIMITER ;

DELIMITER $$

CREATE PROCEDURE sp_GetQuizDetails(
    IN p_quizID INT
)
BEGIN
    IF NOT EXISTS (SELECT 1 FROM Quiz WHERE quizID = p_quizID) THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Error: Quiz ID not found.';
    END IF;

    SELECT 
        q.questionID,
        q.qText AS questionDescription,
        q.score AS questionScore,
        o.optionID,
        o.oText AS optionText,
        CASE 
            WHEN o.is_correct = 1 THEN 'True' 
            ELSE 'False' 
        END AS IsCorrectAnswer
    FROM Question q
    LEFT JOIN Option_Table o ON q.questionID = o.questionID
    WHERE q.quizID = p_quizID
    ORDER BY q.questionID ASC, o.optionID ASC;

END$$

CREATE PROCEDURE sp_GetQuizStatistics(
    IN p_assignmentID INT,
    IN p_minQuestions INT
)
BEGIN
    SELECT 
        a.title AS quizTitle,
        z.totalScore AS MaxAllowedScore,
        COUNT(q.questionID) AS TotalQuestions,
        SUM(q.score) AS CurrentTotalScore
    FROM Quiz z
    JOIN Assignment a ON z.AssignmentID = a.AssignmentID
    JOIN Question q ON z.quizID = q.quizID
    WHERE z.AssignmentID = p_assignmentID
    GROUP BY z.quizID, a.title, z.totalScore
    HAVING COUNT(q.questionID) >= p_minQuestions
    ORDER BY CurrentTotalScore DESC;

END$$

CREATE PROCEDURE sp_GetQuizzesByCourse(
    IN p_courseID INT
)
BEGIN
    SELECT DISTINCT
        qz.quizID,
        a.title AS quizTitle,
        qz.totalScore AS totalMarks,
        qz.Passing_Score AS passingMarks,
        qz.Duration AS quizDuration,
        qz.AssignmentID,
        l.LessonID,
        l.Title AS lessonTitle,
        m.ModuleID,
        m.Title AS moduleTitle,
        m.CourseID,
        COUNT(DISTINCT q.questionID) AS questionCount,
        COALESCE(SUM(q.score), 0) AS currentTotalScore
    FROM Course c
    JOIN Module m ON c.CourseID = m.CourseID
    JOIN Lesson l ON m.ModuleID = l.ModuleID
    JOIN Assignment a ON l.LessonID = a.LessonID
    JOIN Quiz qz ON a.AssignmentID = qz.AssignmentID
    LEFT JOIN Question q ON qz.quizID = q.quizID
    WHERE c.CourseID = p_courseID
    GROUP BY qz.quizID, a.title, qz.totalScore, qz.Passing_Score, qz.Duration,
             qz.AssignmentID, l.LessonID, l.Title, m.ModuleID, m.Title, m.CourseID
    ORDER BY m.Order_Num ASC, l.Order_Num ASC;
END$$

DROP PROCEDURE IF EXISTS sp_GetActiveLearnersInCourse$$
CREATE PROCEDURE sp_GetActiveLearnersInCourse(
    IN p_courseID INT,
    IN p_enrollmentStatus VARCHAR(20)
)
BEGIN
    IF p_enrollmentStatus = 'active' THEN
        SELECT 
            u.FullName,
            u.Email,
            e.Date_signed AS enrollmentDate,
            e.Progress AS progressPercentage,
            e.Status
        FROM USER u
        JOIN LEARNER l ON u.UserID = l.UserID
        JOIN ENROLL e ON l.UserID = e.Learner_UserID
        WHERE e.Course_CourseID = p_courseID
        ORDER BY u.FullName ASC;
    ELSE
        SELECT 
            u.FullName,
            u.Email,
            e.Date_signed AS enrollmentDate,
            e.Progress AS progressPercentage,
            e.Status
        FROM USER u
        JOIN LEARNER l ON u.UserID = l.UserID
        JOIN ENROLL e ON l.UserID = e.Learner_UserID
        WHERE e.Course_CourseID = p_courseID 
          AND e.Status = p_enrollmentStatus
        ORDER BY u.FullName ASC;
    END IF;
END$$

DROP PROCEDURE IF EXISTS sp_GetStudentQuizPerformance$$
CREATE PROCEDURE sp_GetStudentQuizPerformance(
    IN p_courseID INT,
    IN p_minScore DECIMAL(5,2)
)
BEGIN
    SELECT 
        u.Email AS StudentAccount,
        u.FullName,
        a.title AS quizTitle,
        qz.totalScore AS MaxPossibleScore,
        MAX(s.Grade) AS HighestScoreObtained,
        COUNT(s.SubmissionID) AS AttemptsCount
    FROM Course c
    JOIN Module m ON c.CourseID = m.CourseID
    JOIN Lesson l ON m.ModuleID = l.ModuleID
    JOIN Assignment a ON l.LessonID = a.LessonID
    JOIN Quiz qz ON a.AssignmentID = qz.AssignmentID
    JOIN Submission s ON a.AssignmentID = s.AssignmentID
    JOIN LEARNER lr ON s.Learner_UserID = lr.UserID
    JOIN USER u ON lr.UserID = u.UserID
    WHERE c.CourseID = p_courseID
      AND s.Grade IS NOT NULL
    GROUP BY u.UserID, qz.quizID
    HAVING MAX(s.Grade) >= p_minScore
    ORDER BY HighestScoreObtained DESC, u.FullName ASC;
END$$

DELIMITER ;

---2.4 - Functions for Progress and Punctuality Tracking---
DELIMITER $$

CREATE FUNCTION UpdateCourseProgress(input_learnerID INT, input_courseID INT) 
RETURNS DECIMAL(5,2)
MODIFIES SQL DATA
DETERMINISTIC
BEGIN
    DECLARE done INT DEFAULT FALSE;
    DECLARE v_quizScore DECIMAL(5,2);
    DECLARE v_passingScore FLOAT;
    DECLARE v_calculatedProgress DECIMAL(5,2) DEFAULT 0.00;
    DECLARE v_enrollmentExists INT;
    
    DECLARE quiz_cursor CURSOR FOR 
        SELECT MAX(s.Grade), qz.Passing_Score
        FROM Submission s
        JOIN Assignment a ON s.AssignmentID = a.AssignmentID
        JOIN Quiz qz ON a.AssignmentID = qz.AssignmentID
        JOIN Lesson l ON a.LessonID = l.LessonID
        JOIN Module m ON l.ModuleID = m.ModuleID
        WHERE s.Learner_UserID = input_learnerID 
          AND m.CourseID = input_courseID
          AND s.Grade IS NOT NULL
        GROUP BY qz.quizID;

    DECLARE CONTINUE HANDLER FOR NOT FOUND SET done = TRUE;

    SELECT COUNT(*) INTO v_enrollmentExists 
    FROM ENROLL 
    WHERE Learner_UserID = input_learnerID AND Course_CourseID = input_courseID;

    IF v_enrollmentExists = 0 THEN
        RETURN -1.00;
    END IF;

    OPEN quiz_cursor;

    read_loop: LOOP
        FETCH quiz_cursor INTO v_quizScore, v_passingScore;
        
        IF done THEN
            LEAVE read_loop;
        END IF;

        IF v_quizScore >= v_passingScore THEN
            SET v_calculatedProgress = v_calculatedProgress + 10.00;
        END IF;
        
    END LOOP;

    CLOSE quiz_cursor;

    IF v_calculatedProgress > 100.00 THEN
        SET v_calculatedProgress = 100.00;
    END IF;

    UPDATE ENROLL
    SET Progress = v_calculatedProgress,
        Status = IF(v_calculatedProgress = 100, 'completed', 'in-progress')
    WHERE Learner_UserID = input_learnerID AND Course_CourseID = input_courseID;

    RETURN v_calculatedProgress;

END$$

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
        SELECT a.AssignmentID, a.dueDate
        FROM Assignment a
        JOIN Lesson l ON a.LessonID = l.LessonID
        JOIN Module m ON l.ModuleID = m.ModuleID
        WHERE m.CourseID = input_courseID;

    DECLARE CONTINUE HANDLER FOR NOT FOUND SET done = TRUE;

    SELECT COUNT(*) INTO v_enrollmentCheck 
    FROM ENROLL 
    WHERE Learner_UserID = input_learnerID AND Course_CourseID = input_courseID;

    IF v_enrollmentCheck = 0 THEN
        RETURN 0;
    END IF;

    OPEN assignment_cursor;

    check_loop: LOOP
        FETCH assignment_cursor INTO v_assignmentID, v_dueDate;
        
        IF done THEN
            LEAVE check_loop;
        END IF;

        SELECT MIN(s.Time) INTO v_submissionDate
        FROM Submission s
        JOIN Exercise ex ON s.AssignmentID = ex.AssignmentID
        WHERE s.Learner_UserID = input_learnerID 
          AND ex.AssignmentID = v_assignmentID;

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
