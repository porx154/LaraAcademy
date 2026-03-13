import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import Database from "better-sqlite3";
import fs from "fs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const db = new Database("academy.db");

// Initialize Database
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    role TEXT CHECK(role IN ('admin', 'teacher', 'student')) NOT NULL
  );

  CREATE TABLE IF NOT EXISTS courses (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    description TEXT,
    teacher_id INTEGER,
    start_date TEXT,
    end_date TEXT,
    image_url TEXT,
    FOREIGN KEY(teacher_id) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS enrollments (
    user_id INTEGER,
    course_id INTEGER,
    PRIMARY KEY(user_id, course_id),
    FOREIGN KEY(user_id) REFERENCES users(id),
    FOREIGN KEY(course_id) REFERENCES courses(id)
  );

  CREATE TABLE IF NOT EXISTS materials (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    course_id INTEGER,
    title TEXT NOT NULL,
    file_path TEXT NOT NULL,
    type TEXT,
    FOREIGN KEY(course_id) REFERENCES courses(id)
  );

  CREATE TABLE IF NOT EXISTS links (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    course_id INTEGER,
    title TEXT NOT NULL,
    url TEXT NOT NULL,
    FOREIGN KEY(course_id) REFERENCES courses(id)
  );

  CREATE TABLE IF NOT EXISTS assignments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    course_id INTEGER,
    title TEXT NOT NULL,
    description TEXT,
    deadline TEXT,
    FOREIGN KEY(course_id) REFERENCES courses(id)
  );

  CREATE TABLE IF NOT EXISTS submissions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    assignment_id INTEGER,
    student_id INTEGER,
    file_path TEXT NOT NULL,
    submitted_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(assignment_id) REFERENCES assignments(id),
    FOREIGN KEY(student_id) REFERENCES users(id)
  );

  -- Seed Data
  INSERT OR IGNORE INTO users (id, name, email, password, role) VALUES (1, 'Admin Academy', 'admin@academy.com', 'admin123', 'admin');
  INSERT OR IGNORE INTO users (id, name, email, password, role) VALUES (2, 'Profesor Señas', 'profe@academy.com', 'profe123', 'teacher');

  INSERT OR IGNORE INTO courses (id, title, description, teacher_id, start_date, end_date, image_url) VALUES 
  (1, 'Introducción a la LSE', 'Aprende los fundamentos básicos de la Lengua de Señas Española. Saludos, abecedario y expresiones comunes.', 2, '2024-03-01', '2024-04-01', 'https://picsum.photos/seed/lse1/800/600');
  
  INSERT OR IGNORE INTO courses (id, title, description, teacher_id, start_date, end_date, image_url) VALUES 
  (2, 'LSE Nivel Intermedio', 'Profundiza en la gramática y vocabulario avanzado. Ideal para quienes ya conocen lo básico.', 2, '2024-03-15', '2024-05-15', 'https://picsum.photos/seed/lse2/800/600');

  INSERT OR IGNORE INTO courses (id, title, description, teacher_id, start_date, end_date, image_url) VALUES 
  (3, 'Cultura Sorda y Comunidad', 'Un viaje por la historia, valores y cultura de la comunidad sorda en el mundo.', 1, '2024-04-01', '2024-05-01', 'https://picsum.photos/seed/lse3/800/600');

  INSERT OR IGNORE INTO materials (course_id, title, file_path, type) VALUES (1, 'Guía del Abecedario', '/materials/abc.pdf', 'PDF');
  INSERT OR IGNORE INTO links (course_id, title, url) VALUES (1, 'Video: Saludos Básicos', 'https://youtube.com/example');
  INSERT OR IGNORE INTO assignments (course_id, title, description, deadline) VALUES (1, 'Video de Presentación', 'Graba un video presentándote usando LSE.', '2024-03-10');
  
  INSERT OR IGNORE INTO users (id, name, email, password, role) VALUES (3, 'Estudiante Demo', 'estudiante@demo.com', 'estudiante123', 'student');
  INSERT OR IGNORE INTO enrollments (user_id, course_id) VALUES (3, 1);
  INSERT OR IGNORE INTO submissions (id, assignment_id, student_id, file_path) VALUES (1, 1, 3, '/uploads/presentacion.mp4');
`);

// Migrations
try {
  db.prepare("ALTER TABLE courses ADD COLUMN image_url TEXT").run();
} catch (e) {
  // Column already exists or table doesn't exist yet
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // --- API Routes ---

  // Auth
  app.post("/api/auth/register", (req, res) => {
    const { name, email, password, role = 'student' } = req.body;
    try {
      const stmt = db.prepare("INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)");
      const info = stmt.run(name, email, password, role);
      res.status(201).json({ id: info.lastInsertRowid, name, email, role });
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  });

  app.post("/api/auth/login", (req, res) => {
    const { email, password } = req.body;
    const user = db.prepare("SELECT * FROM users WHERE email = ? AND password = ?").get(email, password) as any;
    if (user) {
      const { password, ...userWithoutPassword } = user;
      res.json(userWithoutPassword);
    } else {
      res.status(401).json({ error: "Credenciales inválidas" });
    }
  });

  // Courses
  app.get("/api/courses", (req, res) => {
    const courses = db.prepare(`
      SELECT c.*, u.name as teacher_name 
      FROM courses c 
      LEFT JOIN users u ON c.teacher_id = u.id
    `).all();
    res.json(courses);
  });

  app.post("/api/courses", (req, res) => {
    const { title, description, teacher_id, start_date, end_date } = req.body;
    const stmt = db.prepare("INSERT INTO courses (title, description, teacher_id, start_date, end_date) VALUES (?, ?, ?, ?, ?)");
    const info = stmt.run(title, description, teacher_id, start_date, end_date);
    res.status(201).json({ id: info.lastInsertRowid, title });
  });

  app.get("/api/courses/:id", (req, res) => {
    const course = db.prepare("SELECT * FROM courses WHERE id = ?").get(req.params.id) as any;
    if (course) {
      const materials = db.prepare("SELECT * FROM materials WHERE course_id = ?").all(req.params.id);
      const links = db.prepare("SELECT * FROM links WHERE course_id = ?").all(req.params.id);
      const assignments = db.prepare("SELECT * FROM assignments WHERE course_id = ?").all(req.params.id) as any[];
      
      const userId = req.query.user_id;
      if (userId) {
        assignments.forEach(a => {
          const submission = db.prepare("SELECT * FROM submissions WHERE assignment_id = ? AND student_id = ?").get(a.id, userId);
          a.submission = submission || null;
        });
      }
      
      res.json({ ...course, materials, links, assignments });
    } else {
      res.status(404).json({ error: "Curso no encontrado" });
    }
  });

  app.get("/api/teachers/:id/courses", (req, res) => {
    const courses = db.prepare(`
      SELECT * FROM courses 
      WHERE teacher_id = ?
    `).all(req.params.id);
    res.json(courses);
  });

  // Enrollments
  app.post("/api/enrollments", (req, res) => {
    const { user_id, course_id } = req.body;
    try {
      db.prepare("INSERT INTO enrollments (user_id, course_id) VALUES (?, ?)").run(user_id, course_id);
      res.status(201).json({ success: true });
    } catch (err: any) {
      res.status(400).json({ error: "Ya estás matriculado o error en la base de datos" });
    }
  });

  app.get("/api/users/:id/courses", (req, res) => {
    const courses = db.prepare(`
      SELECT c.* 
      FROM courses c 
      JOIN enrollments e ON c.id = e.course_id 
      WHERE e.user_id = ?
    `).all(req.params.id);
    res.json(courses);
  });

  // Materials & Links
  app.post("/api/courses/:id/materials", (req, res) => {
    const { title, file_path, type } = req.body;
    db.prepare("INSERT INTO materials (course_id, title, file_path, type) VALUES (?, ?, ?, ?)").run(req.params.id, title, file_path, type);
    res.status(201).json({ success: true });
  });

  app.post("/api/courses/:id/links", (req, res) => {
    const { title, url } = req.body;
    db.prepare("INSERT INTO links (course_id, title, url) VALUES (?, ?, ?)").run(req.params.id, title, url);
    res.status(201).json({ success: true });
  });

  // Assignments
  app.post("/api/courses/:id/assignments", (req, res) => {
    const { title, description, deadline } = req.body;
    db.prepare("INSERT INTO assignments (course_id, title, description, deadline) VALUES (?, ?, ?, ?)").run(req.params.id, title, description, deadline);
    res.status(201).json({ success: true });
  });

  app.post("/api/assignments/:id/submissions", (req, res) => {
    const { student_id, file_path } = req.body;
    db.prepare("INSERT INTO submissions (assignment_id, student_id, file_path) VALUES (?, ?, ?)").run(req.params.id, student_id, file_path);
    res.status(201).json({ success: true });
  });

  app.get("/api/assignments/:id/submissions", (req, res) => {
    const submissions = db.prepare(`
      SELECT s.*, u.name as student_name 
      FROM submissions s 
      JOIN users u ON s.student_id = u.id 
      WHERE s.assignment_id = ?
    `).all(req.params.id);
    res.json(submissions);
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, "dist")));
    app.get("*", (req, res) => {
      res.sendFile(path.join(__dirname, "dist", "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
