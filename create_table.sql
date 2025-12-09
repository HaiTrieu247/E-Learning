-- Create USER table (Top-level parent table)
CREATE TABLE USER (
    UserID INT PRIMARY KEY,
    FullName VARCHAR(255),
    DateCreated DATETIME,
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
    CategoryID INT PRIMARY KEY,
    Name VARCHAR(255),
    Parent_ID INT,
    -- Recursive foreign key
    FOREIGN KEY (Parent_ID) REFERENCES Course_category(CategoryID)
);

-- Create Course table
CREATE TABLE Course (
    CourseID INT PRIMARY KEY,
    CTitle VARCHAR(255),
    Created_date DATETIME,
    Description TEXT,
    Status VARCHAR(50),
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
    ModuleID INT PRIMARY KEY,
    Title VARCHAR(255),
    Order_Num INT, -- "Order" is a keyword, so use Order_Num or enclose it in `Order`
    CourseID INT,
    FOREIGN KEY (CourseID) REFERENCES Course(CourseID)
);

-- Lesson Table
CREATE TABLE Lesson (
    LessonID INT PRIMARY KEY,
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
    materialID INT PRIMARY KEY,
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
    AssignmentID INT PRIMARY KEY,
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
    ExerciseID INT PRIMARY KEY,
    Title VARCHAR(255),
    Description TEXT,
    AssignmentID INT,
    FOREIGN KEY (AssignmentID) REFERENCES Assignment(AssignmentID)
);

-- Quiz Table (Inherits from or details of Assignment)
CREATE TABLE Quiz (
    quizID INT PRIMARY KEY,
    Passing_Score FLOAT,
    Duration INT,
    totalScore FLOAT,
    AssignmentID INT,
    FOREIGN KEY (AssignmentID) REFERENCES Assignment(AssignmentID)
);

-- Question Table
CREATE TABLE Question (
    questionID INT PRIMARY KEY,
    qText TEXT,
    score FLOAT,
    quizID INT,
    AssignmentID INT,
    FOREIGN KEY (quizID) REFERENCES Quiz(quizID),
    FOREIGN KEY (AssignmentID) REFERENCES Assignment(AssignmentID)
);

-- Option Table (Choices for questions)
CREATE TABLE Option_Table ( -- "Option" is often a keyword, add a suffix to be safe
    optionID INT PRIMARY KEY,
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
    SubmissionID INT PRIMARY KEY,
    Time DATETIME,
    Grade FLOAT,
    AssignmentID INT,
    Learner_UserID INT,
    FOREIGN KEY (AssignmentID) REFERENCES Assignment(AssignmentID),
    FOREIGN KEY (Learner_UserID) REFERENCES LEARNER(UserID)
);

-- Answer Table (Detailed answers from learners)
CREATE TABLE Answer (
    AnswerID INT PRIMARY KEY,
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
    FileID INT PRIMARY KEY,
    fileName VARCHAR(255),
    fileURL VARCHAR(500),
    ExerciseID INT,
    AssignmentID INT,
    SubmissionID INT,
    FOREIGN KEY (ExerciseID) REFERENCES Exercise(ExerciseID),
    FOREIGN KEY (AssignmentID) REFERENCES Assignment(AssignmentID),
    FOREIGN KEY (SubmissionID) REFERENCES Submission(SubmissionID)
);