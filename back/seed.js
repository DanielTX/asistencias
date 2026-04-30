const admin = require('firebase-admin');
const serviceAccount = require('./firebase.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

const students = [
  { id: "1537058", fullName: "AGÜERO BOTIQUIN PATRICK ANDERSSON" },
  { id: "1515010", fullName: "BERNEDO MEDINA ALONZO WILSON" },
  { id: "1540453", fullName: "CERDAN CAMPOS PAMELA JOHANA" },
  { id: "1522190", fullName: "CHIRINOS JAUREGUI FRANCO DANIEL" },
  { id: "1515572", fullName: "GABINO REYES JOEL SEBASTIAN" },
  { id: "1515178", fullName: "GAYOSO AGUILAR CHRISTIAN ANDRE" },
  { id: "1503461", fullName: "GOMEZ OLGUIN JUSTIN STEVEN" },
  { id: "1541043", fullName: "GOZME PEREZ PIERO MIGUEL ALEJANDRO" },
  { id: "1525215", fullName: "HENRIQUEZ GUTIERREZ MARCELO ESTEBAN" },
  { id: "1541283", fullName: "HONORIO MACHUCA GIOVANNI RODRIGO" },
  { id: "1510999", fullName: "HONORIO MORALES HENRRY RICARDO" },
  { id: "1503937", fullName: "HUAMAN DELGADO DENNIS DANIEL" },
  { id: "1533256", fullName: "IPANAQUE MITAC ALEX DANIEL" },
  { id: "1481782", fullName: "LUNA CONDOR MILAHIL ELMER" },
  { id: "1516430", fullName: "MANRIQUE MATEO ROY FERNANDO" },
  { id: "1504841", fullName: "PEÑA ANGELES ANGEL RAYMUNDO" },
  { id: "1531625", fullName: "ROSALES OBREGÓN CLAUDIA SOFIA" },
  { id: "1374977", fullName: "SANCHEZ PISCOYA ANDERSON DIETMAR" },
  { id: "1489369", fullName: "TINEO CASTILLO RODRIGO MATIAS" },
  { id: "1548395", fullName: "VEGA VALVERDE JHON ANDERSON" }
];

const courseInfo = {
  campus: "IND - ETI",
  program: "APRENDIZAJE DUAL",
  career: "DESARROLLO DE SOFTWARE",
  semester: "66",
  instructorId: "1008119",
  instructorName: "CARLOS MAYNA AGUILAR",
  period: "202520",
  courseCode: "202520-PD3D-647-TAL-NRC_38538"
};

async function seedDatabase() {
  try {
    console.log('Iniciando carga de datos en Firestore...');
    
    // 1. Guardar Curso
    const courseRef = db.collection('courses').doc(courseInfo.courseCode);
    await courseRef.set(courseInfo);
    console.log('✅ Curso guardado exitosamente.');

    // 2. Guardar Estudiantes
    const batch = db.batch();
    students.forEach((student) => {
      // Separar nombres y apellidos primitivamente
      const parts = student.fullName.split(' ');
      const lastName = parts.slice(0, 2).join(' '); // Asume 2 apellidos
      const firstName = parts.slice(2).join(' '); // El resto es nombres

      const studentRef = db.collection('students').doc(student.id);
      batch.set(studentRef, {
        id: student.id,
        firstName,
        lastName,
        fullName: student.fullName,
        courseId: courseInfo.courseCode
      });
    });
    
    await batch.commit();
    console.log(`✅ ${students.length} estudiantes guardados exitosamente.`);
    
    console.log('¡Base de datos inicializada!');
    process.exit(0);
  } catch (error) {
    console.error('Error al poblar la base de datos:', error);
    process.exit(1);
  }
}

seedDatabase();
