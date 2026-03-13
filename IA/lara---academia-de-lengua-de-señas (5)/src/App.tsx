/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  BookOpen, 
  Users, 
  FileText, 
  Link as LinkIcon, 
  Plus, 
  LogOut, 
  LogIn, 
  UserPlus, 
  ChevronRight, 
  Calendar,
  Download,
  ExternalLink,
  CheckCircle,
  GraduationCap,
  LayoutDashboard,
  File,
  Play,
  Image as ImageIcon,
  Upload,
  Search,
  Bell,
  Clock,
  HandMetal
} from 'lucide-react';
import { Container, Navbar, Nav, Button, Form, Card, Row, Col, Badge, ListGroup, Alert, Modal } from 'react-bootstrap';

// --- Types ---

type Role = 'admin' | 'teacher' | 'student';

interface User {
  id: number;
  name: string;
  email: string;
  role: Role;
}

interface Course {
  id: number;
  title: string;
  description: string;
  teacher_id: number;
  teacher_name?: string;
  start_date: string;
  end_date: string;
  image_url?: string;
}

// --- Main App ---

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [view, setView] = useState<'landing' | 'login' | 'register' | 'dashboard' | 'course-detail' | 'teacher-course-admin'>('landing');
  const [courses, setCourses] = useState<Course[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<any>(null);
  const [myCourses, setMyCourses] = useState<Course[]>([]);
  const [teacherCourses, setTeacherCourses] = useState<Course[]>([]);
  const [loadingCourses, setLoadingCourses] = useState(true);
  const [showPreview, setShowPreview] = useState(false);
  const [previewCourse, setPreviewCourse] = useState<Course | null>(null);
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  
  // Forms
  const [authForm, setAuthForm] = useState({ name: '', email: '', password: '', role: 'student' as Role });
  const [courseForm, setCourseForm] = useState({ title: '', description: '', start_date: '', end_date: '' });
  const [materialForm, setMaterialForm] = useState({ title: '', type: 'PDF' as any });
  const [assignmentForm, setAssignmentForm] = useState({ title: '', description: '', deadline: '' });

  useEffect(() => {
    const savedUser = localStorage.getItem('academy_user');
    if (savedUser) {
      const parsed = JSON.parse(savedUser);
      setUser(parsed);
      setView('dashboard');
    }
    fetchCourses();
  }, []);

  useEffect(() => {
    if (user) {
      if (user.role === 'student') {
        fetchMyCourses();
      } else if (user.role === 'teacher') {
        fetchTeacherCourses();
      }
    }
  }, [user]);

  const fetchTeacherCourses = async () => {
    if (!user) return;
    const res = await window.fetch(`/api/teachers/${user.id}/courses`);
    const data = await res.json();
    setTeacherCourses(data);
  };

  const fetchCourses = async () => {
    try {
      setLoadingCourses(true);
      const res = await window.fetch('/api/courses');
      if (res.ok) {
        const data = await res.json();
        setCourses(data);
      }
    } catch (error) {
      console.error("Error fetching courses:", error);
    } finally {
      setLoadingCourses(false);
    }
  };

  const fetchMyCourses = async () => {
    if (!user) return;
    const res = await window.fetch(`/api/users/${user.id}/courses`);
    const data = await res.json();
    setMyCourses(data);
  };

  const handleFile = async (file: File) => {
    if (!selectedCourse || !user) return;
    
    // For this demo, we'll pick the first assignment of the course
    // In a real app, you'd have a selection or a specific context
    const assignment = selectedCourse.assignments?.[0];
    if (!assignment) {
      alert("No hay tareas activas para este curso");
      return;
    }

    setUploading(true);
    try {
      // Simulate file upload to an API
      // In a real app, you'd use FormData and a multipart/form-data request
      const res = await window.fetch(`/api/assignments/${assignment.id}/submissions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          student_id: user.id,
          file_path: `/uploads/${file.name}` // Mock path
        })
      });

      if (res.ok) {
        alert(`¡Archivo "${file.name}" subido con éxito!`);
        // Refresh course detail to show updated status if needed
        viewCourseDetail(selectedCourse.id);
      } else {
        alert("Error al subir el archivo");
      }
    } catch (error) {
      console.error("Upload error:", error);
      alert("Error de conexión al subir el archivo");
    } finally {
      setUploading(false);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const onButtonClick = () => {
    fileInputRef.current?.click();
  };

  const handleAddMaterial = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCourse) return;
    const res = await window.fetch(`/api/courses/${selectedCourse.id}/materials`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...materialForm, file_path: `/materials/${materialForm.title.toLowerCase().replace(/ /g, '_')}.pdf` })
    });
    if (res.ok) {
      alert("Material añadido con éxito");
      setMaterialForm({ title: '', type: 'PDF' });
      viewTeacherCourseAdmin(selectedCourse.id);
    }
  };

  const handleAddAssignment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCourse) return;
    const res = await window.fetch(`/api/courses/${selectedCourse.id}/assignments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(assignmentForm)
    });
    if (res.ok) {
      alert("Tarea añadida con éxito");
      setAssignmentForm({ title: '', description: '', deadline: '' });
      viewTeacherCourseAdmin(selectedCourse.id);
    }
  };

  const viewTeacherCourseAdmin = async (courseId: number) => {
    const res = await window.fetch(`/api/courses/${courseId}`);
    const data = await res.json();
    
    // Fetch submissions for each assignment
    const assignmentsWithSubmissions = await Promise.all(data.assignments.map(async (a: any) => {
      const subRes = await window.fetch(`/api/assignments/${a.id}/submissions`);
      const subData = await subRes.json();
      return { ...a, submissions: subData };
    }));

    setSelectedCourse({ ...data, assignments: assignmentsWithSubmissions });
    setView('teacher-course-admin');
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await window.fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: authForm.email, password: authForm.password })
    });
    if (res.ok) {
      const data = await res.json();
      setUser(data);
      localStorage.setItem('academy_user', JSON.stringify(data));
      setView('dashboard');
    } else {
      alert("Credenciales incorrectas");
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await window.fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(authForm)
    });
    if (res.ok) {
      alert("Registro exitoso, ahora puedes iniciar sesión");
      setView('login');
    }
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('academy_user');
    setView('landing');
  };

  const handleEnroll = async (courseId: number) => {
    if (!user) return setView('login');
    const res = await window.fetch('/api/enrollments', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user_id: user.id, course_id: courseId })
    });
    if (res.ok) {
      alert("Matriculado con éxito");
      fetchMyCourses();
    } else {
      alert("Ya estás matriculado en este curso");
    }
  };

  const handleShowPreview = (course: Course) => {
    setPreviewCourse(course);
    setShowPreview(true);
  };

  const viewCourseDetail = async (courseId: number) => {
    const url = user ? `/api/courses/${courseId}?user_id=${user.id}` : `/api/courses/${courseId}`;
    const res = await window.fetch(url);
    const data = await res.json();
    setSelectedCourse(data);
    setView('course-detail');
  };

  return (
    <div className="min-vh-100 d-flex flex-column">
      {/* Navigation */}
      <Navbar bg="white" expand="lg" className="border-bottom sticky-top">
        <Container>
          <Navbar.Brand 
            className="d-flex align-items-center gap-2 fw-bold" 
            style={{ cursor: 'pointer', color: '#00d68f' }}
            onClick={() => setView(user ? 'dashboard' : 'landing')}
          >
            <div className="p-2 rounded-3 d-flex align-items-center justify-content-center" style={{ backgroundColor: '#00d68f' }}>
              <HandMetal className="text-white" size={24} />
            </div>
            <span style={{ letterSpacing: '-0.02em', fontSize: '1.5rem' }}>LARA</span>
          </Navbar.Brand>
          <Navbar.Toggle aria-controls="basic-navbar-nav" />
          <Navbar.Collapse id="basic-navbar-nav">
            <Nav className="mx-auto align-items-center gap-3">
              {!user && view === 'landing' && (
                <>
                  <Nav.Link onClick={() => document.getElementById('about-section')?.scrollIntoView({ behavior: 'smooth' })} className="text-dark fw-medium">Nosotros</Nav.Link>
                  <Nav.Link onClick={() => document.getElementById('courses-section')?.scrollIntoView({ behavior: 'smooth' })} className="text-dark fw-medium">Cursos</Nav.Link>
                  <Nav.Link onClick={() => document.getElementById('community-section')?.scrollIntoView({ behavior: 'smooth' })} className="text-dark fw-medium">Comunidad</Nav.Link>
                  <Nav.Link onClick={() => document.getElementById('contact-section')?.scrollIntoView({ behavior: 'smooth' })} className="text-dark fw-medium">Contacto</Nav.Link>
                </>
              )}
            </Nav>
            <Nav className="ms-auto align-items-center gap-3">
              {user ? (
                <>
                  <Badge bg="light" text="dark" className="p-2 border rounded-pill d-none d-lg-block">
                    <span className="text-success me-1">●</span> {user.role}: {user.name}
                  </Badge>
                  <Button variant="outline-secondary" size="sm" onClick={handleLogout} className="d-flex align-items-center gap-2">
                    <LogOut size={16} /> Cerrar Sesión
                  </Button>
                </>
              ) : (
                <>
                  <Button variant="link" className="text-decoration-none text-dark" onClick={() => setView('login')}>Iniciar Sesión</Button>
                  <Button variant="primary" onClick={() => setView('register')}>Registrarse</Button>
                </>
              )}
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>

      <main className="flex-grow-1 py-5">
        <Container>
          <AnimatePresence mode="wait">
            {/* Course Preview Modal */}
            <Modal show={showPreview} onHide={() => setShowPreview(false)} centered size="lg" className="border-0">
              {previewCourse && (
                <>
                  <Modal.Header closeButton className="border-0 pb-0">
                    <Modal.Title className="fw-bold h3">{previewCourse.title}</Modal.Title>
                  </Modal.Header>
                  <Modal.Body className="p-4">
                    <Row className="g-4">
                      <Col lg={6}>
                        <img 
                          src={previewCourse.image_url || `https://picsum.photos/seed/${previewCourse.id}/800/600`} 
                          alt={previewCourse.title} 
                          className="img-fluid rounded-4 shadow-sm"
                          referrerPolicy="no-referrer"
                        />
                      </Col>
                      <Col lg={6}>
                        <div className="mb-4">
                          <h5 className="fw-bold text-primary mb-3">Sobre este curso</h5>
                          <p className="text-muted lead" style={{ fontSize: '1rem' }}>{previewCourse.description}</p>
                        </div>
                        <div className="d-grid gap-3">
                          <div className="d-flex align-items-center gap-3 p-3 bg-light rounded-3">
                            <Users size={20} className="text-primary" />
                            <div>
                              <p className="mb-0 small fw-bold">Docente</p>
                              <p className="mb-0 small text-muted">{previewCourse.teacher_name || 'Experto en LSE'}</p>
                            </div>
                          </div>
                          <div className="d-flex align-items-center gap-3 p-3 bg-light rounded-3">
                            <Calendar size={20} className="text-primary" />
                            <div>
                              <p className="mb-0 small fw-bold">Fecha de Inicio</p>
                              <p className="mb-0 small text-muted">{previewCourse.start_date}</p>
                            </div>
                          </div>
                        </div>
                      </Col>
                    </Row>
                  </Modal.Body>
                  <Modal.Footer className="border-0 p-4">
                    <Button variant="light" className="fw-bold px-4" onClick={() => setShowPreview(false)}>Cerrar</Button>
                    <Button variant="primary" className="fw-bold px-4" onClick={() => { setShowPreview(false); setView('register'); }}>Matricularme ahora</Button>
                  </Modal.Footer>
                </>
              )}
            </Modal>

            {view === 'landing' && (
              <motion.div 
                key="landing"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="text-center py-5"
              >
                <Row className="justify-content-center mb-5">
                  <Col lg={8}>
                    <h1 className="display-3 fw-bold mb-4" style={{ letterSpacing: '-0.02em' }}>
                      Rompe las barreras con <span style={{ color: '#00d68f' }}>Lara</span>
                    </h1>
                    <p className="lead text-muted mb-5">
                      Aprende de forma interactiva con expertos. Cursos diseñados para todos los niveles, desde principiantes hasta avanzados.
                    </p>
                    <div className="d-flex justify-content-center gap-3">
                      <Button variant="primary" size="lg" className="px-5 py-3" onClick={() => setView('register')}>Comenzar Ahora</Button>
                      <Button 
                        variant="outline-primary" 
                        size="lg" 
                        className="px-5 py-3"
                        onClick={() => document.getElementById('courses-section')?.scrollIntoView({ behavior: 'smooth' })}
                      >
                        Ver Cursos
                      </Button>
                    </div>
                  </Col>
                </Row>

                <Row className="g-4 mt-5">
                  {[
                    { icon: BookOpen, title: "Cursos Estructurados", desc: "Material organizado paso a paso para un aprendizaje efectivo." },
                    { icon: Users, title: "Comunidad Activa", desc: "Interactúa con otros estudiantes y docentes especializados." },
                    { icon: CheckCircle, title: "Certificación", desc: "Obtén un certificado al completar satisfactoriamente tus cursos." }
                  ].map((feature, i) => (
                    <Col md={4} key={i}>
                      <Card className="h-100 p-4 border-0 shadow-sm">
                        <Card.Body>
                          <div className="mb-4" style={{ color: '#00d68f' }}>
                            <feature.icon size={48} />
                          </div>
                          <Card.Title className="fw-bold h4 mb-3">{feature.title}</Card.Title>
                          <Card.Text className="text-muted">{feature.desc}</Card.Text>
                        </Card.Body>
                      </Card>
                    </Col>
                  ))}
                </Row>

                <div id="courses-section" className="py-5 mt-5">
                  <h2 className="display-5 fw-bold mb-5">Nuestros Cursos</h2>
                  <Row className="g-4">
                        {loadingCourses ? (
                          <Col xs={12}>
                            <p className="text-muted">Cargando cursos...</p>
                          </Col>
                        ) : courses.length > 0 ? (
                          courses.map(course => (
                            <Col md={4} key={course.id}>
                              <Card className="h-100 border-0 shadow-sm overflow-hidden">
                                <div className="position-relative" style={{ height: '200px' }}>
                                  <img 
                                    src={course.image_url || `https://picsum.photos/seed/${course.id}/600/400`} 
                                    alt={course.title} 
                                    className="w-100 h-100 object-fit-cover"
                                    referrerPolicy="no-referrer"
                                  />
                                  <div className="position-absolute top-0 end-0 p-2">
                                    <Badge bg="primary" className="shadow-sm">Nuevo</Badge>
                                  </div>
                                </div>
                                <Card.Body className="d-flex flex-column">
                                  <Card.Title className="fw-bold">{course.title}</Card.Title>
                                  <Card.Text className="text-muted small line-clamp-2">{course.description}</Card.Text>
                                  <div className="mt-auto">
                                    <Button variant="primary" className="w-100 fw-bold" onClick={() => handleShowPreview(course)}>Saber más</Button>
                                  </div>
                                </Card.Body>
                              </Card>
                            </Col>
                          ))
                        ) : (
                      <Col xs={12}>
                        <p className="text-muted">No hay cursos disponibles en este momento.</p>
                      </Col>
                    )}
                  </Row>
                </div>

                <div id="about-section" className="py-5 mt-5">
                  <Row className="align-items-center g-5">
                    <Col lg={6}>
                      <img src="https://picsum.photos/seed/lara-about/800/600" alt="Sobre Lara" className="img-fluid rounded-4 shadow" referrerPolicy="no-referrer" />
                    </Col>
                    <Col lg={6} className="text-start">
                      <h2 className="display-5 fw-bold mb-4">Sobre Lara</h2>
                      <p className="lead text-muted mb-4">
                        Lara nació con la misión de democratizar el acceso al aprendizaje de la Lengua de Señas. Creemos que la comunicación es un derecho fundamental y trabajamos para derribar las barreras que separan a las personas.
                      </p>
                      <p className="text-muted mb-4">
                        Nuestro equipo está compuesto por expertos nativos y pedagogos especializados que han diseñado una metodología única, interactiva y accesible para todos.
                      </p>
                      <Button variant="outline-primary" onClick={() => setView('register')}>Conoce a nuestro equipo</Button>
                    </Col>
                  </Row>
                </div>

                <div id="community-section" className="py-5 mt-5 bg-light rounded-5 px-4">
                  <h2 className="display-5 fw-bold mb-5">Nuestra Comunidad</h2>
                  <Row className="g-4">
                    <Col md={4}>
                      <div className="text-center">
                        <h3 className="display-4 fw-bold text-primary mb-2">5k+</h3>
                        <p className="text-muted">Estudiantes Activos</p>
                      </div>
                    </Col>
                    <Col md={4}>
                      <div className="text-center">
                        <h3 className="display-4 fw-bold text-primary mb-2">50+</h3>
                        <p className="text-muted">Docentes Expertos</p>
                      </div>
                    </Col>
                    <Col md={4}>
                      <div className="text-center">
                        <h3 className="display-4 fw-bold text-primary mb-2">100%</h3>
                        <p className="text-muted">Pasión por la Inclusión</p>
                      </div>
                    </Col>
                  </Row>
                  <div className="mt-5 text-center">
                    <p className="lead text-muted mb-4">Únete a miles de personas que ya están cambiando el mundo a través de las señas.</p>
                    <Button variant="primary" size="lg" onClick={() => setView('register')}>Unirse a la Comunidad</Button>
                  </div>
                </div>

                <div id="contact-section" className="py-5 mt-5">
                  <Row className="justify-content-center">
                    <Col lg={6}>
                      <h2 className="display-5 fw-bold mb-4">Contacto</h2>
                      <p className="text-muted mb-5">¿Tienes alguna duda o sugerencia? Estamos aquí para escucharte.</p>
                      <Form className="text-start">
                        <Row className="g-3">
                          <Col md={6}>
                            <Form.Group className="mb-3">
                              <Form.Label className="small fw-bold">Nombre</Form.Label>
                              <Form.Control placeholder="Tu nombre" />
                            </Form.Group>
                          </Col>
                          <Col md={6}>
                            <Form.Group className="mb-3">
                              <Form.Label className="small fw-bold">Email</Form.Label>
                              <Form.Control type="email" placeholder="tu@email.com" />
                            </Form.Group>
                          </Col>
                        </Row>
                        <Form.Group className="mb-4">
                          <Form.Label className="small fw-bold">Mensaje</Form.Label>
                          <Form.Control as="textarea" rows={4} placeholder="¿En qué podemos ayudarte?" />
                        </Form.Group>
                        <Button variant="primary" className="w-100 py-3 fw-bold">Enviar Mensaje</Button>
                      </Form>
                    </Col>
                  </Row>
                </div>
              </motion.div>
            )}

            {(view === 'login' || view === 'register') && (
              <motion.div 
                key="auth"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="d-flex justify-content-center py-5"
              >
                <Card style={{ width: '100%', maxWidth: '400px' }} className="p-4 shadow">
                  <Card.Body>
                    <div className="text-center mb-4">
                      <h2 className="fw-bold">{view === 'login' ? 'Bienvenido de nuevo' : 'Crea tu cuenta'}</h2>
                      <p className="text-muted small">{view === 'login' ? 'Ingresa tus credenciales para continuar' : 'Únete a nuestra academia hoy'}</p>
                    </div>
                    <Form onSubmit={view === 'login' ? handleLogin : handleRegister}>
                      {view === 'register' && (
                        <>
                          <Form.Group className="mb-3">
                            <Form.Label className="small fw-bold">Nombre Completo</Form.Label>
                            <Form.Control 
                              placeholder="Juan Pérez" 
                              required 
                              value={authForm.name}
                              onChange={(e: any) => setAuthForm({...authForm, name: e.target.value})}
                            />
                          </Form.Group>
                          <Form.Group className="mb-3">
                            <Form.Label className="small fw-bold">Rol</Form.Label>
                            <Form.Select 
                              value={authForm.role}
                              onChange={(e: any) => setAuthForm({...authForm, role: e.target.value as Role})}
                            >
                              <option value="student">Estudiante</option>
                              <option value="teacher">Docente</option>
                              <option value="admin">Administrador</option>
                            </Form.Select>
                          </Form.Group>
                        </>
                      )}
                      <Form.Group className="mb-3">
                        <Form.Label className="small fw-bold">Correo Electrónico</Form.Label>
                        <Form.Control 
                          type="email" 
                          placeholder="tu@email.com" 
                          required 
                          value={authForm.email}
                          onChange={(e: any) => setAuthForm({...authForm, email: e.target.value})}
                        />
                      </Form.Group>
                      <Form.Group className="mb-4">
                        <Form.Label className="small fw-bold">Contraseña</Form.Label>
                        <Form.Control 
                          type="password" 
                          placeholder="••••••••" 
                          required 
                          value={authForm.password}
                          onChange={(e: any) => setAuthForm({...authForm, password: e.target.value})}
                        />
                      </Form.Group>
                      <Button variant="primary" type="submit" className="w-100 py-2 fw-bold">
                        {view === 'login' ? 'Entrar' : 'Registrarse'}
                      </Button>
                    </Form>
                    <div className="text-center mt-4">
                      <Button variant="link" size="sm" className="text-decoration-none" onClick={() => setView(view === 'login' ? 'register' : 'login')}>
                        {view === 'login' ? '¿No tienes cuenta? Regístrate' : '¿Ya tienes cuenta? Inicia sesión'}
                      </Button>
                    </div>
                  </Card.Body>
                </Card>
              </motion.div>
            )}

            {view === 'dashboard' && (
              <motion.div 
                key="dashboard"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-5 gap-3">
                  <div>
                    <h2 className="fw-bold d-flex align-items-center gap-2">
                      <LayoutDashboard style={{ color: '#00d68f' }} /> Panel de Control
                    </h2>
                    <p className="text-muted mb-0">Gestiona tus cursos y actividades</p>
                  </div>
                  {(user?.role === 'admin' || user?.role === 'teacher') && (
                    <Button variant="primary" className="d-flex align-items-center gap-2">
                      <Plus size={18} /> Nuevo Curso
                    </Button>
                  )}
                </div>

                <Row className="g-4">
                  <Col lg={8}>
                    <section className="mb-5">
                      <h3 className="fw-bold h5 mb-4">
                        {user?.role === 'teacher' ? 'Mis Cursos Asignados' : 'Mis Cursos Matriculados'}
                      </h3>
                      <Row className="g-3">
                        {(user?.role === 'teacher' ? teacherCourses : myCourses).length > 0 ? (user?.role === 'teacher' ? teacherCourses : myCourses).map(course => (
                          <Col sm={6} key={course.id}>
                            <Card 
                              className="h-100 border-0 shadow-sm cursor-pointer hover-card" 
                              onClick={() => user?.role === 'teacher' ? viewTeacherCourseAdmin(course.id) : viewCourseDetail(course.id)}
                            >
                              <div className="bg-light d-flex align-items-center justify-content-center py-5 rounded-top">
                                <BookOpen size={40} className="text-primary opacity-50" />
                              </div>
                              <Card.Body>
                                <Card.Title className="fw-bold">{course.title}</Card.Title>
                                <Card.Text className="text-muted small text-truncate-2">{course.description}</Card.Text>
                                <div className="d-flex justify-content-between align-items-center mt-3 small text-muted">
                                  <span><Calendar size={12} className="me-1" /> {course.start_date}</span>
                                  <ChevronRight size={16} />
                                </div>
                              </Card.Body>
                            </Card>
                          </Col>
                        )) : (
                          <Col xs={12}>
                            <Alert variant="light" className="text-center py-5 border-2 border-dashed">
                              <p className="text-muted mb-0">
                                {user?.role === 'teacher' ? 'Aún no tienes cursos asignados.' : 'Aún no estás matriculado en ningún curso.'}
                              </p>
                            </Alert>
                          </Col>
                        )}
                      </Row>
                    </section>

                    {user?.role === 'student' && (
                      <section>
                        <h3 className="fw-bold h5 mb-4">Catálogo de Cursos</h3>
                        <Row className="g-3">
                          {courses.filter(c => !myCourses.find(mc => mc.id === c.id)).map(course => (
                            <Col sm={6} key={course.id}>
                              <Card className="h-100 border-0 shadow-sm">
                                <Card.Body className="d-flex flex-column">
                                  <Card.Title className="fw-bold">{course.title}</Card.Title>
                                  <Card.Text className="text-muted small">{course.description}</Card.Text>
                                  <p className="small fw-bold text-primary mt-auto">Docente: {course.teacher_name}</p>
                                  <Button variant="outline-primary" className="w-100 mt-3" onClick={() => handleEnroll(course.id)}>Matricularme</Button>
                                </Card.Body>
                              </Card>
                            </Col>
                          ))}
                        </Row>
                      </section>
                    )}
                  </Col>

                  <Col lg={4}>
                    <Card className="text-white border-0 shadow-sm mb-4" style={{ backgroundColor: '#00d68f' }}>
                      <Card.Body className="p-4">
                        <h3 className="h5 fw-bold mb-3">Próximas Tareas</h3>
                        <p className="small opacity-75 mb-4">No tienes tareas pendientes para esta semana.</p>
                        <Button variant="light" className="w-100 fw-bold" style={{ color: '#00d68f' }}>Ver Calendario</Button>
                      </Card.Body>
                    </Card>
                    
                    <Card className="border-0 shadow-sm">
                      <Card.Body className="p-4">
                        <h3 className="h5 fw-bold mb-4">Anuncios</h3>
                        <ListGroup variant="flush">
                          {[1, 2].map(i => (
                            <ListGroup.Item key={i} className="px-0 border-0 mb-3">
                              <div className="border-start border-4 border-primary ps-3">
                                <p className="fw-bold mb-0 small">Nueva clase en vivo</p>
                                <p className="text-muted x-small mb-0">Mañana a las 10:00 AM</p>
                              </div>
                            </ListGroup.Item>
                          ))}
                        </ListGroup>
                      </Card.Body>
                    </Card>
                  </Col>
                </Row>
              </motion.div>
            )}

            {view === 'teacher-course-admin' && selectedCourse && (
              <motion.div 
                key="teacher-course-admin"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
              >
                <div className="mb-4">
                  <nav className="small text-muted mb-2 d-flex align-items-center gap-2">
                    <span className="cursor-pointer hover-text-primary" onClick={() => setView('dashboard')}>Inicio</span>
                    <ChevronRight size={12} />
                    <span>Administrar Curso</span>
                  </nav>
                  <h1 className="fw-bold display-5 mb-2">{selectedCourse.title}</h1>
                  <p className="text-muted lead">Gestiona materiales, tareas y revisa entregas de tus estudiantes.</p>
                </div>

                <Row className="g-4">
                  <Col lg={8}>
                    {/* Gestionar Materiales */}
                    <section className="mb-5">
                      <div className="d-flex justify-content-between align-items-center mb-4">
                        <h2 className="h4 fw-bold d-flex align-items-center gap-2 mb-0">
                          <BookOpen size={24} /> Materiales del Curso
                        </h2>
                      </div>
                      
                      <Card className="border-0 shadow-sm mb-4">
                        <Card.Body className="p-4">
                          <h5 className="fw-bold mb-3">Añadir Nuevo Material</h5>
                          <Form onSubmit={handleAddMaterial}>
                            <Row className="g-3">
                              <Col md={6}>
                                <Form.Group>
                                  <Form.Label className="small fw-bold">Título del Material</Form.Label>
                                  <Form.Control 
                                    placeholder="Ej: Guía de Vocabulario" 
                                    required
                                    value={materialForm.title}
                                    onChange={(e: any) => setMaterialForm({...materialForm, title: e.target.value})}
                                  />
                                </Form.Group>
                              </Col>
                              <Col md={4}>
                                <Form.Group>
                                  <Form.Label className="small fw-bold">Tipo</Form.Label>
                                  <Form.Select
                                    value={materialForm.type}
                                    onChange={(e: any) => setMaterialForm({...materialForm, type: e.target.value})}
                                  >
                                    <option value="PDF">PDF</option>
                                    <option value="Video">Video</option>
                                    <option value="Imagen">Imagen</option>
                                    <option value="Documento">Documento</option>
                                  </Form.Select>
                                </Form.Group>
                              </Col>
                              <Col md={2} className="d-flex align-items-end">
                                <Button variant="primary" type="submit" className="w-100">Añadir</Button>
                              </Col>
                            </Row>
                          </Form>
                        </Card.Body>
                      </Card>

                      <div className="d-grid gap-3">
                        {selectedCourse.materials?.map((m: any) => (
                          <Card key={m.id} className="border-0 shadow-sm">
                            <Card.Body className="p-3">
                              <div className="d-flex align-items-center justify-content-between">
                                <div className="d-flex align-items-center gap-3">
                                  <div className={`p-3 rounded-3 ${
                                    m.type === 'PDF' ? 'bg-danger-subtle text-danger' : 
                                    m.type === 'Video' ? 'bg-primary-subtle text-primary' : 
                                    m.type === 'Imagen' ? 'bg-success-subtle text-success' : 'bg-info-subtle text-info'
                                  }`}>
                                    {m.type === 'PDF' && <FileText size={24} />}
                                    {m.type === 'Video' && <Play size={24} />}
                                    {m.type === 'Imagen' && <ImageIcon size={24} />}
                                    {m.type === 'Documento' && <File size={24} />}
                                  </div>
                                  <div>
                                    <h6 className="fw-bold mb-1">{m.title}</h6>
                                    <p className="x-small text-muted mb-0">{m.type} • Publicado</p>
                                  </div>
                                </div>
                                <Button variant="outline-danger" size="sm">Eliminar</Button>
                              </div>
                            </Card.Body>
                          </Card>
                        ))}
                      </div>
                    </section>

                    {/* Gestionar Tareas */}
                    <section className="mb-5">
                      <h2 className="h4 fw-bold d-flex align-items-center gap-2 mb-4">
                        <Upload size={24} /> Tareas y Asignaciones
                      </h2>
                      
                      <Card className="border-0 shadow-sm mb-4">
                        <Card.Body className="p-4">
                          <h5 className="fw-bold mb-3">Crear Nueva Tarea</h5>
                          <Form onSubmit={handleAddAssignment}>
                            <Row className="g-3">
                              <Col md={12}>
                                <Form.Group className="mb-3">
                                  <Form.Label className="small fw-bold">Título de la Tarea</Form.Label>
                                  <Form.Control 
                                    placeholder="Ej: Video de Presentación" 
                                    required
                                    value={assignmentForm.title}
                                    onChange={(e: any) => setAssignmentForm({...assignmentForm, title: e.target.value})}
                                  />
                                </Form.Group>
                              </Col>
                              <Col md={12}>
                                <Form.Group className="mb-3">
                                  <Form.Label className="small fw-bold">Descripción</Form.Label>
                                  <Form.Control 
                                    as="textarea" 
                                    rows={2}
                                    placeholder="Instrucciones para los estudiantes..."
                                    value={assignmentForm.description}
                                    onChange={(e: any) => setAssignmentForm({...assignmentForm, description: e.target.value})}
                                  />
                                </Form.Group>
                              </Col>
                              <Col md={6}>
                                <Form.Group className="mb-3">
                                  <Form.Label className="small fw-bold">Fecha Límite</Form.Label>
                                  <Form.Control 
                                    type="date"
                                    required
                                    value={assignmentForm.deadline}
                                    onChange={(e: any) => setAssignmentForm({...assignmentForm, deadline: e.target.value})}
                                  />
                                </Form.Group>
                              </Col>
                              <Col md={6} className="d-flex align-items-end mb-3">
                                <Button variant="primary" type="submit" className="w-100">Crear Tarea</Button>
                              </Col>
                            </Row>
                          </Form>
                        </Card.Body>
                      </Card>

                      <div className="d-grid gap-4">
                        {selectedCourse.assignments?.map((a: any) => (
                          <Card key={a.id} className="border-0 shadow-sm">
                            <Card.Header className="bg-white border-bottom p-4">
                              <div className="d-flex justify-content-between align-items-center">
                                <h5 className="fw-bold mb-0">{a.title}</h5>
                                <Badge bg="primary-subtle" className="text-primary">
                                  {a.submissions?.length || 0} Entregas
                                </Badge>
                              </div>
                            </Card.Header>
                            <Card.Body className="p-4">
                              <p className="text-muted small mb-4">{a.description}</p>
                              <h6 className="fw-bold mb-3 small text-uppercase tracking-wider opacity-75">Entregas de Estudiantes</h6>
                              <ListGroup variant="flush">
                                {a.submissions?.length > 0 ? a.submissions.map((s: any) => (
                                  <ListGroup.Item key={s.id} className="px-0 py-3 d-flex justify-content-between align-items-center">
                                    <div className="d-flex align-items-center gap-3">
                                      <div className="bg-light p-2 rounded-circle">
                                        <Users size={20} className="text-muted" />
                                      </div>
                                      <div>
                                        <p className="fw-bold mb-0 small">{s.student_name}</p>
                                        <p className="x-small text-muted mb-0">Entregado el {new Date(s.submitted_at).toLocaleString()}</p>
                                      </div>
                                    </div>
                                    <Button variant="light" size="sm" className="border d-flex align-items-center gap-2">
                                      <Download size={14} /> Revisar
                                    </Button>
                                  </ListGroup.Item>
                                )) : (
                                  <p className="text-muted small mb-0">Aún no hay entregas para esta tarea.</p>
                                )}
                              </ListGroup>
                            </Card.Body>
                          </Card>
                        ))}
                      </div>
                    </section>
                  </Col>

                  <Col lg={4}>
                    <Card className="border-0 shadow-sm p-4 mb-4">
                      <Card.Body className="p-0">
                        <h5 className="fw-bold mb-4">Resumen del Curso</h5>
                        <div className="d-grid gap-3">
                          <div className="p-3 bg-light rounded-3">
                            <p className="text-muted x-small text-uppercase mb-1">Estudiantes</p>
                            <h4 className="fw-bold mb-0">--</h4>
                          </div>
                          <div className="p-3 bg-light rounded-3">
                            <p className="text-muted x-small text-uppercase mb-1">Materiales</p>
                            <h4 className="fw-bold mb-0">{selectedCourse.materials?.length || 0}</h4>
                          </div>
                          <div className="p-3 bg-light rounded-3">
                            <p className="text-muted x-small text-uppercase mb-1">Tareas</p>
                            <h4 className="fw-bold mb-0">{selectedCourse.assignments?.length || 0}</h4>
                          </div>
                        </div>
                      </Card.Body>
                    </Card>
                  </Col>
                </Row>
              </motion.div>
            )}

            {view === 'course-detail' && selectedCourse && (
              <motion.div 
                key="course-detail"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
              >
                {/* Breadcrumb & Header */}
                <div className="mb-4">
                  <nav className="small text-muted mb-2 d-flex align-items-center gap-2">
                    <span className="cursor-pointer hover-text-primary" onClick={() => setView('dashboard')}>Inicio</span>
                    <ChevronRight size={12} />
                    <span>Materiales y Tareas</span>
                  </nav>
                  <h1 className="fw-bold display-5 mb-2">Materiales y Tareas</h1>
                  <p className="text-muted lead">Accede a tus recursos de estudio y gestiona tus entregas de forma eficiente.</p>
                </div>

                <Row className="g-4">
                  <Col lg={8}>
                    {/* Materiales de Estudio */}
                    <section className="mb-5">
                      <div className="d-flex justify-content-between align-items-center mb-4">
                        <h2 className="h4 fw-bold d-flex align-items-center gap-2 mb-0">
                          <BookOpen size={24} /> Materiales de Estudio
                        </h2>
                        <Button variant="link" className="text-decoration-none p-0 fw-bold small text-dark">Ver todo</Button>
                      </div>
                      
                      <div className="d-grid gap-3">
                        {selectedCourse.materials?.length > 0 ? selectedCourse.materials.map((m: any) => (
                          <Card key={m.id} className="border-0 shadow-sm overflow-hidden">
                            <Card.Body className="p-3">
                              <div className="d-flex align-items-center justify-content-between">
                                <div className="d-flex align-items-center gap-3">
                                  <div className={`p-3 rounded-3 ${
                                    m.type === 'PDF' ? 'bg-danger-subtle text-danger' : 
                                    m.type === 'Video' ? 'bg-primary-subtle text-primary' : 
                                    m.type === 'Imagen' ? 'bg-success-subtle text-success' : 'bg-info-subtle text-info'
                                  }`}>
                                    {m.type === 'PDF' && <FileText size={24} />}
                                    {m.type === 'Video' && <Play size={24} />}
                                    {m.type === 'Imagen' && <ImageIcon size={24} />}
                                    {m.type === 'Documento' && <File size={24} />}
                                  </div>
                                  <div>
                                    <h6 className="fw-bold mb-1">{m.title}</h6>
                                    <p className="x-small text-muted mb-0">
                                      {m.type} • 2.4 MB • Actualizado hace 2 días
                                    </p>
                                  </div>
                                </div>
                                <div className="d-flex gap-2">
                                  {m.type === 'Video' && (
                                    <Button variant="light" size="sm" className="rounded-3 border">
                                      <Play size={16} />
                                    </Button>
                                  )}
                                  <Button variant="light" size="sm" className="rounded-3 border d-flex align-items-center gap-2 px-3">
                                    <Download size={16} /> <span className="d-none d-md-inline small fw-bold">Descargar</span>
                                  </Button>
                                </div>
                              </div>
                            </Card.Body>
                          </Card>
                        )) : (
                          <div className="text-center py-4 bg-white rounded-3 border-2 border-dashed">
                            <p className="text-muted mb-0">No hay materiales disponibles aún.</p>
                          </div>
                        )}
                      </div>
                    </section>

                    {/* Subir Tareas */}
                    <section className="mb-5">
                      <h2 className="h4 fw-bold d-flex align-items-center gap-2 mb-4">
                        <Upload size={24} /> Subir Tareas
                      </h2>
                      <input
                        ref={fileInputRef}
                        type="file"
                        className="d-none"
                        onChange={handleChange}
                        accept=".pdf,.docx,.zip"
                      />
                      <Card 
                        className={`border-2 border-dashed py-5 text-center cursor-pointer transition-all ${
                          dragActive ? 'border-primary bg-primary-subtle' : 'border-muted bg-light'
                        } ${uploading ? 'opacity-50' : 'hover-bg-white'}`}
                        onDragEnter={handleDrag}
                        onDragLeave={handleDrag}
                        onDragOver={handleDrag}
                        onDrop={handleDrop}
                        onClick={onButtonClick}
                      >
                        <Card.Body>
                          <div className="mb-3 text-dark opacity-75">
                            {uploading ? (
                              <div className="spinner-border text-primary" role="status">
                                <span className="visually-hidden">Cargando...</span>
                              </div>
                            ) : (
                              <Upload size={48} />
                            )}
                          </div>
                          <h5 className="fw-bold mb-2">
                            {uploading ? 'Subiendo archivo...' : 'Arrastra y suelta tu archivo aquí'}
                          </h5>
                          <p className="text-muted small mb-0">
                            O selecciona un archivo desde tu computadora.<br/>
                            Tamaño máximo permitido: 50MB (PDF, DOCX, ZIP)
                          </p>
                        </Card.Body>
                      </Card>
                    </section>
                  </Col>

                  <Col lg={4}>
                    {/* Estado de Entregas */}
                    <Card className="border-0 shadow-sm p-4 mb-4">
                      <Card.Body className="p-0">
                        <h5 className="fw-bold d-flex align-items-center gap-2 mb-4">
                          <CheckCircle size={20} /> Estado de tus entregas
                        </h5>
                        
                        <div className="d-grid gap-4 position-relative">
                          {/* Timeline line */}
                          <div className="position-absolute start-0 top-0 bottom-0 ms-2 border-start border-2" style={{ left: '1px' }}></div>
                          
                          {selectedCourse.assignments?.map((a: any, idx: number) => (
                            <div key={a.id} className="d-flex gap-3 position-relative z-1">
                              <div className={`rounded-circle mt-1 ${a.submission ? 'bg-success' : 'bg-warning'}`} style={{ width: '12px', height: '12px', minWidth: '12px' }}></div>
                              <div className="flex-grow-1">
                                <div className="d-flex justify-content-between align-items-start mb-1">
                                  <h6 className="fw-bold mb-0 small">{a.title}</h6>
                                  <Badge bg={a.submission ? 'success-subtle' : 'warning-subtle'} className={`text-${a.submission ? 'success' : 'warning'} fw-bold x-small`}>
                                    {a.submission ? 'ENTREGADO' : 'PENDIENTE'}
                                  </Badge>
                                </div>
                                <p className="x-small text-muted mb-0">
                                  {a.submission ? `Enviado el ${new Date(a.submission.submitted_at).toLocaleDateString()}` : `Fecha límite: ${a.deadline}`}
                                </p>
                              </div>
                            </div>
                          ))}

                          {!selectedCourse.assignments?.length && (
                            <p className="text-muted small">No hay tareas programadas.</p>
                          )}
                        </div>

                        <Button variant="outline-dark" className="w-100 mt-5 py-2 small fw-bold">
                          Ver Calendario Académico
                        </Button>
                      </Card.Body>
                    </Card>

                    {/* Docente Info */}
                    <Card className="border-0 shadow-sm p-4">
                      <Card.Body className="p-0">
                        <h5 className="fw-bold mb-4">Tu Docente</h5>
                        <div className="d-flex align-items-center gap-3">
                          <div className="bg-primary-subtle text-primary rounded-circle d-flex align-items-center justify-content-center fw-bold" style={{ width: '48px', height: '48px' }}>
                            {selectedCourse.teacher_name?.charAt(0)}
                          </div>
                          <div>
                            <p className="fw-bold mb-0">{selectedCourse.teacher_name || 'Docente Asignado'}</p>
                            <p className="x-small text-muted mb-0">Especialista en LSE</p>
                          </div>
                        </div>
                        <Button variant="outline-primary" className="w-100 mt-4 small fw-bold">Enviar Mensaje</Button>
                      </Card.Body>
                    </Card>
                  </Col>
                </Row>
              </motion.div>
            )}
          </AnimatePresence>
        </Container>
      </main>

      <footer className="bg-white border-top py-5 mt-5">
        <Container className="text-center">
          <div className="d-flex align-items-center justify-content-center gap-2 mb-3">
            <HandMetal style={{ color: '#00d68f' }} size={24} />
            <span className="h5 fw-bold mb-0">LARA</span>
          </div>
          <p className="text-muted small mb-0">© 2024 Lara - Academia de Lengua de Señas. Todos los derechos reservados.</p>
        </Container>
      </footer>

      <style>{`
        .rotate-180 { transform: rotate(180deg); }
        .text-truncate-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
        .x-small { font-size: 0.75rem; }
        .hover-card:hover {
          transform: translateY(-5px);
          transition: transform 0.2s ease-in-out;
        }
        .hover-bg-light:hover {
          background-color: #f8f9fa;
        }
        .bg-danger-subtle { background-color: #fee2e2 !important; }
        .bg-primary-subtle { background-color: #e0e7ff !important; }
        .bg-success-subtle { background-color: #dcfce7 !important; }
        .bg-info-subtle { background-color: #e0f2fe !important; }
        .bg-warning-subtle { background-color: #fef3c7 !important; }
        .bg-secondary-subtle { background-color: #f3f4f6 !important; }
        .text-success { color: #16a34a !important; }
        .text-warning { color: #d97706 !important; }
        .text-secondary { color: #4b5563 !important; }
        .cursor-pointer { cursor: pointer; }
        .hover-text-primary:hover { color: #00d68f !important; }
        .border-dashed { border-style: dashed !important; }
      `}</style>
    </div>
  );
}
