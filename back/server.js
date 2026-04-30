const express = require('express');
const cors = require('cors');
const admin = require('firebase-admin');
const serviceAccount = require('./firebase.json');

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
}

const db = admin.firestore();
const app = express();

app.use(cors());
app.use(express.json());

// --- CURSOS ---

app.get('/api/courses', async (req, res) => {
  try {
    const snapshot = await db.collection('courses').get();
    const courses = [];
    snapshot.forEach(doc => {
      courses.push({ id: doc.id, ...doc.data() });
    });
    res.json(courses);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al obtener cursos' });
  }
});

app.post('/api/courses', async (req, res) => {
  try {
    const data = req.body;
    if (!data.status) data.status = 'Activo';
    data.createdAt = admin.firestore.FieldValue.serverTimestamp();
    
    // Auto-generate ID if not provided
    let docRef;
    if (data.id) {
      docRef = db.collection('courses').doc(data.id);
    } else {
      docRef = db.collection('courses').doc();
      data.id = docRef.id;
    }
    
    await docRef.set(data);
    res.json(data);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al crear curso' });
  }
});

app.put('/api/courses/:id', async (req, res) => {
  try {
    const id = req.params.id;
    const data = req.body;
    await db.collection('courses').doc(id).update(data);
    res.json({ message: 'Curso actualizado' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al actualizar curso' });
  }
});

app.delete('/api/courses/:id', async (req, res) => {
  try {
    const id = req.params.id;
    await db.collection('courses').doc(id).delete();
    res.json({ message: 'Curso eliminado' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al eliminar curso' });
  }
});


// --- ESTUDIANTES ---

app.get('/api/students', async (req, res) => {
  try {
    const { courseId } = req.query;
    if (!courseId) return res.status(400).json({ error: 'Falta courseId' });
    
    const snapshot = await db.collection('students').where('courseId', '==', courseId).get();
    
    const students = [];
    snapshot.forEach(doc => {
      students.push({ ...doc.data() });
    });
    
    res.json(students);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al obtener estudiantes' });
  }
});

app.post('/api/students', async (req, res) => {
  try {
    const student = req.body;
    if (!student.courseId) return res.status(400).json({ error: 'Falta courseId' });
    if (!student.status) student.status = 'Activo';
    
    await db.collection('students').doc(student.id).set(student);
    res.json(student);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al crear estudiante' });
  }
});

app.put('/api/students/:id', async (req, res) => {
  try {
    const id = req.params.id;
    const data = req.body;
    await db.collection('students').doc(id).update(data);
    res.json({ message: 'Estudiante actualizado' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al actualizar estudiante' });
  }
});

app.delete('/api/students/:id', async (req, res) => {
  try {
    const id = req.params.id;
    await db.collection('students').doc(id).delete();
    res.json({ message: 'Estudiante eliminado' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al eliminar estudiante' });
  }
});

// --- ASISTENCIA ---

app.get('/api/attendance', async (req, res) => {
  try {
    const { date, courseId } = req.query;
    if (!date || !courseId) return res.status(400).json({ error: 'Falta la fecha o courseId' });

    const snapshot = await db.collection('attendance')
      .where('date', '==', date)
      .where('courseId', '==', courseId)
      .get();

    const attendance = {};
    snapshot.forEach(doc => {
      const data = doc.data();
      attendance[data.studentId] = data.status;
    });

    res.json(attendance);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al obtener asistencia' });
  }
});

app.post('/api/attendance', async (req, res) => {
  try {
    const { date, records, courseId } = req.body;
    if (!date || !records || !courseId) return res.status(400).json({ error: 'Faltan datos' });

    const batch = db.batch();

    const oldSnapshot = await db.collection('attendance')
      .where('date', '==', date)
      .where('courseId', '==', courseId)
      .get();
    
    oldSnapshot.forEach(doc => {
      batch.delete(doc.ref);
    });

    Object.entries(records).forEach(([studentId, status]) => {
      const docRef = db.collection('attendance').doc();
      batch.set(docRef, {
        studentId,
        date,
        status,
        courseId,
        createdAt: admin.firestore.FieldValue.serverTimestamp()
      });
    });

    await batch.commit();
    res.json({ message: 'Asistencia guardada exitosamente' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al guardar asistencia' });
  }
});

// --- AUTHENTICATION ---

app.post('/api/auth/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) return res.status(400).json({ error: 'Faltan datos' });

    // Check if user already exists
    const userSnap = await db.collection('users').where('email', '==', email).get();
    if (!userSnap.empty) {
      return res.status(400).json({ error: 'El correo ya está registrado' });
    }

    const newUser = {
      name,
      email,
      password, // En producción debería estar encriptada (ej. con bcrypt)
      role: 'Instructor',
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    };

    const docRef = db.collection('users').doc();
    newUser.id = docRef.id;
    await docRef.set(newUser);
    
    res.json({ id: newUser.id, name: newUser.name, email: newUser.email, role: newUser.role });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al registrar usuario' });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'Faltan credenciales' });

    const userSnap = await db.collection('users')
      .where('email', '==', email)
      .where('password', '==', password)
      .get();

    if (userSnap.empty) {
      return res.status(401).json({ error: 'Credenciales incorrectas' });
    }

    const userData = userSnap.docs[0].data();
    res.json({ id: userData.id, name: userData.name, email: userData.email, role: userData.role });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al iniciar sesión' });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Backend corriendo en http://localhost:${PORT}`);
});
