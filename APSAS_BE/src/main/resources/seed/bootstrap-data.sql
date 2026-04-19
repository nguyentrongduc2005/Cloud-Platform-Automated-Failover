-- Idempotent bootstrap data for core learning flow tables.
-- This file is executed by DataSeeder when app.seed.bootstrap-sql-enabled=true.

-- Skills
INSERT INTO
    skills (name, description, category)
SELECT 'Java Basic', 'Java syntax and fundamentals', 'BASIC_SYNTAX'
WHERE
    NOT EXISTS (
        SELECT 1
        FROM skills
        WHERE
            name = 'Java Basic'
    );

INSERT INTO
    skills (name, description, category)
SELECT 'SQL Query', 'Basic relational query skills', 'OTHER'
WHERE
    NOT EXISTS (
        SELECT 1
        FROM skills
        WHERE
            name = 'SQL Query'
    );

-- Tutorial
INSERT INTO
    tutorials (
        created_by,
        title,
        summary,
        status
    )
SELECT COALESCE(
        (
            SELECT id
            FROM users
            WHERE
                email = 'lecturer.demo@apsas.local'
            LIMIT 1
        ), (
            SELECT id
            FROM users
            WHERE
                email = 'admin@apsas.local'
            LIMIT 1
        )
    ), 'Java Core Roadmap', 'Core concepts for Java beginners.', 'PUBLISHED'
WHERE
    NOT EXISTS (
        SELECT 1
        FROM tutorials
        WHERE
            title = 'Java Core Roadmap'
    );

-- Contents
INSERT INTO
    contents (
        tutorial_id,
        title,
        body_md,
        order_no,
        status
    )
SELECT t.id, 'Variables and Data Types', 'Introduction to primitive and reference types.', 1, 'PUBLISHED'
FROM tutorials t
WHERE
    t.title = 'Java Core Roadmap'
    AND NOT EXISTS (
        SELECT 1
        FROM contents c
        WHERE
            c.tutorial_id = t.id
            AND c.title = 'Variables and Data Types'
    );

INSERT INTO
    contents (
        tutorial_id,
        title,
        body_md,
        order_no,
        status
    )
SELECT t.id, 'Control Flow', 'if/else, switch, loop basics.', 2, 'PUBLISHED'
FROM tutorials t
WHERE
    t.title = 'Java Core Roadmap'
    AND NOT EXISTS (
        SELECT 1
        FROM contents c
        WHERE
            c.tutorial_id = t.id
            AND c.title = 'Control Flow'
    );

-- Assignment
INSERT INTO
    assignments (
        tutorial_id,
        skill_id,
        title,
        order_no,
        statement_md,
        max_score,
        attempts_limit,
        proficiency
    )
SELECT t.id, s.id, 'FizzBuzz', 1, 'Implement FizzBuzz from 1 to n.', 100.00, 5, 1
FROM tutorials t
    JOIN skills s ON s.name = 'Java Basic'
WHERE
    t.title = 'Java Core Roadmap'
    AND NOT EXISTS (
        SELECT 1
        FROM assignments a
        WHERE
            a.tutorial_id = t.id
            AND a.title = 'FizzBuzz'
    );

-- Course
INSERT INTO
    courses (
        name,
        description,
        code,
        visibility,
        type,
        avatar_url,
        `limit`,
        created_by
    )
SELECT 'Java Beginner 101', 'Starter course for Java core practice', 'JAVA-101', 'PUBLIC', 'ONLINE', 'https://images.unsplash.com/photo-1515879218367-8466d910aaa4?w=800', 100, COALESCE(
        (
            SELECT id
            FROM users
            WHERE
                email = 'lecturer.demo@apsas.local'
            LIMIT 1
        ), (
            SELECT id
            FROM users
            WHERE
                email = 'admin@apsas.local'
            LIMIT 1
        )
    )
WHERE
    NOT EXISTS (
        SELECT 1
        FROM courses
        WHERE
            code = 'JAVA-101'
    );

-- Link course <-> contents
INSERT INTO
    courses_contents (courses_id, contents_id)
SELECT c.id, ct.id
FROM
    courses c
    JOIN tutorials t ON t.title = 'Java Core Roadmap'
    JOIN contents ct ON ct.tutorial_id = t.id
WHERE
    c.code = 'JAVA-101'
    AND NOT EXISTS (
        SELECT 1
        FROM courses_contents cc
        WHERE
            cc.courses_id = c.id
            AND cc.contents_id = ct.id
    );

-- Link course <-> assignments
INSERT INTO
    courses_assignments (
        courses_id,
        assignments_id,
        open_at,
        due_at
    )
SELECT c.id, a.id, NOW(), DATE_ADD(NOW(), INTERVAL 30 DAY)
FROM
    courses c
    JOIN tutorials t ON t.title = 'Java Core Roadmap'
    JOIN assignments a ON a.tutorial_id = t.id
    AND a.title = 'FizzBuzz'
WHERE
    c.code = 'JAVA-101'
    AND NOT EXISTS (
        SELECT 1
        FROM courses_assignments ca
        WHERE
            ca.courses_id = c.id
            AND ca.assignments_id = a.id
    );

-- Enrollment: lecturer as owner
INSERT INTO
    enrollments (user_id, course_id, role)
SELECT u.id, c.id, 'OWNER'
FROM users u
    JOIN courses c ON c.code = 'JAVA-101'
WHERE
    u.email = 'lecturer.demo@apsas.local'
    AND NOT EXISTS (
        SELECT 1
        FROM enrollments e
        WHERE
            e.user_id = u.id
            AND e.course_id = c.id
    );

-- Enrollment: student demo
INSERT INTO
    enrollments (user_id, course_id, role)
SELECT u.id, c.id, 'STUDENT'
FROM users u
    JOIN courses c ON c.code = 'JAVA-101'
WHERE
    u.email = 'student.demo@apsas.local'
    AND NOT EXISTS (
        SELECT 1
        FROM enrollments e
        WHERE
            e.user_id = u.id
            AND e.course_id = c.id
    );