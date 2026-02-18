-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users Table (stores basic info, linked to Firebase UID)
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    firebase_uid VARCHAR(255) UNIQUE NOT NULL, -- Link to Firebase Auth
    email VARCHAR(255) UNIQUE NOT NULL,
    full_name VARCHAR(255),
    role VARCHAR(50) CHECK (role IN ('student', 'tutor', 'admin')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Students Profile
CREATE TABLE students (
    user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    grade_level VARCHAR(50),
    board VARCHAR(50), -- CBSE, ICSE, etc.
    location POINT, -- For geolocation matching
    address TEXT,
    preferences JSONB -- Flexible preferences
);

-- Tutors Profile
CREATE TABLE tutors (
    user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    bio TEXT,
    experience_years INTEGER,
    hourly_rate DECIMAL(10, 2),
    qualifications TEXT,
    verification_documents TEXT[], -- Array of URLs
    is_verified BOOLEAN DEFAULT FALSE,
    rating DECIMAL(3, 2) DEFAULT 0.0,
    total_reviews INTEGER DEFAULT 0,
    availability JSONB -- Structure: { "Monday": ["10:00-12:00"], ... }
);

-- Subjects Review (Standard list of subjects)
CREATE TABLE subjects (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL
);

-- Tutor Subjects (Many-to-Many)
CREATE TABLE tutor_subjects (
    tutor_id UUID REFERENCES tutors(user_id) ON DELETE CASCADE,
    subject_id INTEGER REFERENCES subjects(id) ON DELETE CASCADE,
    PRIMARY KEY (tutor_id, subject_id)
);

-- Requirements (Posted by Students)
CREATE TABLE requirements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID REFERENCES students(user_id) ON DELETE CASCADE,
    subject_id INTEGER REFERENCES subjects(id),
    title VARCHAR(255),
    description TEXT,
    budget_min DECIMAL(10, 2),
    budget_max DECIMAL(10, 2),
    location_preference VARCHAR(50) CHECK (location_preference IN ('online', 'offline', 'both')),
    status VARCHAR(50) DEFAULT 'open' CHECK (status IN ('open', 'closed', 'fulfilled')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Bids (Submitted by Tutors)
CREATE TABLE bids (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    requirement_id UUID REFERENCES requirements(id) ON DELETE CASCADE,
    tutor_id UUID REFERENCES tutors(user_id) ON DELETE CASCADE,
    amount DECIMAL(10, 2),
    message TEXT,
    status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Sessions (Scheduled classes)
CREATE TABLE sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID REFERENCES students(user_id),
    tutor_id UUID REFERENCES tutors(user_id),
    requirement_id UUID REFERENCES requirements(id),
    start_time TIMESTAMP WITH TIME ZONE,
    end_time TIMESTAMP WITH TIME ZONE,
    status VARCHAR(50) DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'completed', 'cancelled')),
    meeting_link VARCHAR(255), -- For online sessions
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Reviews
CREATE TABLE reviews (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    session_id UUID REFERENCES sessions(id),
    reviewer_id UUID REFERENCES users(id),
    reviewee_id UUID REFERENCES users(id),
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Messages (Chat)
CREATE TABLE messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    sender_id UUID REFERENCES users(id),
    receiver_id UUID REFERENCES users(id),
    content TEXT,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
