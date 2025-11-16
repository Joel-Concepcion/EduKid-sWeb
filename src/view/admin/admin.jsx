import styles from '../../styles/admin/admin.module.css';
import Grupo from '../../assets/admin/equipo.png';
import Report from '../../assets/admin/reporte.png';
import React, { useState } from 'react';
import '../../styles/admin/modoClaro.css';
import Luna from '../../assets/admin/luna-llena.png';
import Sol from '../../assets/admin/dom.png';
import { collection, getDocs, doc, updateDoc, deleteDoc, getFirestore, setDoc } from 'firebase/firestore';
import { createUserWithEmailAndPassword, getAuth } from 'firebase/auth';
import appFirebase from '../../model/db';

const db = getFirestore(appFirebase);
const auth = getAuth(appFirebase);

function Admin() {
    const [modoOscuro, setModoOscuro] = useState(false);
    const [showModalUsuarios, setShowModalUsuarios] = useState(false);
    const [showModalReportes, setShowModalReportes] = useState(false);
    const [tipoUsuario, setTipoUsuario] = useState(''); // 'docentes' o 'alumnos'
    const [usuarios, setUsuarios] = useState([]);
    const [filtro, setFiltro] = useState('');
    const [editandoUsuario, setEditandoUsuario] = useState(null);
    const [cargando, setCargando] = useState(false);
    const [showConfirmacionEliminar, setShowConfirmacionEliminar] = useState(false);
    const [usuarioAEliminar, setUsuarioAEliminar] = useState(null);
    
    // Estados para modales de mensajes
    const [showModalMensaje, setShowModalMensaje] = useState(false);
    const [mensajeModal, setMensajeModal] = useState({ titulo: '', mensaje: '', tipo: '' });
    
    // Estados para agregar alumnos
    const [showModalAgregarAlumno, setShowModalAgregarAlumno] = useState(false);
    const [nuevoAlumno, setNuevoAlumno] = useState({
        nombres_apellidos: '',
        codigo_alumno: '',
        nombre_colegio: ''
    });

    const toggleTema = () => setModoOscuro(!modoOscuro);

    // Función para mostrar mensajes personalizados
    const mostrarMensaje = (titulo, mensaje, tipo = 'info') => {
        setMensajeModal({ titulo, mensaje, tipo });
        setShowModalMensaje(true);
    };

    // Función para cerrar modal de mensaje
    const cerrarModalMensaje = () => {
        setShowModalMensaje(false);
    };

    // Obtener fecha actual
    const obtenerFechaActual = () => {
        return new Date().toISOString().split('T')[0];
    };

    // Obtener año actual
    const obtenerAñoActual = () => {
        return new Date().getFullYear();
    };

    // Cargar usuarios según el tipo seleccionado
    const cargarUsuarios = async (tipo) => {
        setCargando(true);
        try {
            let coleccion = '';
            if (tipo === 'docentes') {
                coleccion = 'docente';
            } else if (tipo === 'alumnos') {
                coleccion = 'alumnos';
            }

            const querySnapshot = await getDocs(collection(db, coleccion));
            const usuariosData = querySnapshot.docs.map(doc => {
                const data = doc.data();
                return {
                    id: doc.id, // Este es el ID del documento en Firestore
                    ...data,
                    // Para alumnos, aseguramos que tenemos el UID
                    uid: data.uid || doc.id // Si no hay UID en los datos, usamos el ID del documento
                };
            });

            console.log(`Usuarios cargados (${tipo}):`, usuariosData);
            setUsuarios(usuariosData);
            setTipoUsuario(tipo);
            setShowModalUsuarios(false);
        } catch (error) {
            console.error('Error cargando usuarios:', error);
            mostrarMensaje('Error', 'Error al cargar los usuarios', 'error');
        } finally {
            setCargando(false);
        }
    };

    // Editar usuario
    const editarUsuario = (usuario) => {
        setEditandoUsuario({...usuario});
    };

    // Guardar cambios del usuario - CORREGIDA PARA ALUMNOS
    const guardarCambios = async () => {
        if (!editandoUsuario) return;

        try {
            const coleccion = tipoUsuario === 'docentes' ? 'docente' : 'alumnos';
            
            // Para alumnos, necesitamos usar el UID como ID del documento
            let documentoId = editandoUsuario.id;
            
            // Si es alumno y tenemos un UID, usamos el UID como ID del documento
            if (tipoUsuario === 'alumnos' && editandoUsuario.uid) {
                documentoId = editandoUsuario.uid;
                console.log('Usando UID como ID del documento para actualizar:', documentoId);
            }

            const usuarioRef = doc(db, coleccion, documentoId);

            // Preparar datos para actualizar según el tipo de usuario
            let datosActualizar = {};
            
            if (tipoUsuario === 'docentes') {
                datosActualizar = {
                    apellidos: editandoUsuario.apellidos,
                    correoElectronico: editandoUsuario.correoElectronico,
                    rolId: editandoUsuario.rolId,
                    nombres: editandoUsuario.nombres
                };
            } else if (tipoUsuario === 'alumnos') {
                datosActualizar = {
                    codigo_alumno: editandoUsuario.codigo_alumno,
                    nombres_apellidos: editandoUsuario.nombres_apellidos
                };
            }

            await updateDoc(usuarioRef, datosActualizar);
            mostrarMensaje('Éxito', 'Usuario actualizado correctamente', 'success');
            setEditandoUsuario(null);
            cargarUsuarios(tipoUsuario); // Recargar la lista
        } catch (error) {
            console.error('Error actualizando usuario:', error);
            
            // Mensaje más específico según el tipo de error
            let mensajeError = 'Error al actualizar el usuario';
            if (error.code === 'permission-denied') {
                mensajeError = 'No tienes permisos para actualizar usuarios';
            } else if (error.code === 'not-found') {
                mensajeError = 'El usuario no fue encontrado';
            } else if (error.code === 'invalid-argument') {
                mensajeError = 'ID de documento inválido';
            }
            
            mostrarMensaje('Error', `${mensajeError}: ${error.message}`, 'error');
        }
    };

    // Mostrar confirmación de eliminación
    const confirmarEliminarUsuario = (usuarioId) => {
        setUsuarioAEliminar(usuarioId);
        setShowConfirmacionEliminar(true);
    };

    // Eliminar usuario después de confirmación - CORREGIDA PARA ALUMNOS
    const eliminarUsuario = async () => {
        if (!usuarioAEliminar) return;

        try {
            const coleccion = tipoUsuario === 'docentes' ? 'docente' : 'alumnos';
            
            // Buscar el usuario completo para obtener más información
            const usuario = usuarios.find(u => u.id === usuarioAEliminar);
            
            if (!usuario) {
                mostrarMensaje('Error', 'No se encontró el usuario', 'error');
                return;
            }

            console.log('Eliminando usuario:', usuario);

            // Para alumnos, necesitamos usar el UID como ID del documento
            let documentoId = usuarioAEliminar;
            
            // Si es alumno y tenemos un UID, usamos el UID como ID del documento
            if (tipoUsuario === 'alumnos' && usuario.uid) {
                documentoId = usuario.uid;
                console.log('Usando UID como ID del documento:', documentoId);
            }

            // Eliminar documento de Firestore
            await deleteDoc(doc(db, coleccion, documentoId));

            mostrarMensaje('Éxito', 'Usuario eliminado correctamente', 'success');
            setShowConfirmacionEliminar(false);
            setUsuarioAEliminar(null);
            cargarUsuarios(tipoUsuario); // Recargar la lista
            
        } catch (error) {
            console.error('Error eliminando usuario:', error);
            
            // Mensaje más específico según el tipo de error
            let mensajeError = 'Error al eliminar el usuario';
            if (error.code === 'permission-denied') {
                mensajeError = 'No tienes permisos para eliminar usuarios';
            } else if (error.code === 'not-found') {
                mensajeError = 'El usuario no fue encontrado';
            } else if (error.code === 'invalid-argument') {
                mensajeError = 'ID de documento inválido';
            }
            
            mostrarMensaje('Error', `${mensajeError}: ${error.message}`, 'error');
            setShowConfirmacionEliminar(false);
            setUsuarioAEliminar(null);
        }
    };

    // Cancelar eliminación
    const cancelarEliminacion = () => {
        setShowConfirmacionEliminar(false);
        setUsuarioAEliminar(null);
    };

    // Agregar nuevo alumno
    const agregarAlumno = () => {
        const { nombres_apellidos, codigo_alumno, nombre_colegio } = nuevoAlumno;
        
        if (!nombre_colegio.trim() || !nombres_apellidos.trim() || !codigo_alumno.trim()) {
            mostrarMensaje('Campos incompletos', 'Por favor, completá todos los campos.', 'warning');
            return;
        }

        // Verificar si ya existe un alumno con ese código
        const existe = usuarios.some(al => al.codigo_alumno === codigo_alumno);
        if (existe) {
            mostrarMensaje('Código duplicado', 'Ya existe un alumno con ese código.', 'warning');
            return;
        }

        const alumnoData = {
            nombres_apellidos: nombres_apellidos.trim(),
            codigo_alumno: codigo_alumno.trim(),
            nombre_colegio: nombre_colegio.trim(),
            fecha_registro: obtenerFechaActual(),
            rolId: '3',
            correo: `${codigo_alumno.trim()}@edukid.com`,
            año_registro: obtenerAñoActual(),
            avatar: 'Ellipse 3.png',
            clases: [],
            progreso: {}
        };

        guardarAlumnoEnFirebase(alumnoData);
    };

    // Guardar alumno en Firebase
    const guardarAlumnoEnFirebase = async (alumnoData) => {
        setCargando(true);
        try {
            const { codigo_alumno } = alumnoData;
            const correo = `${codigo_alumno}@edukid.com`;
            const contraseña = codigo_alumno;

            // Crear usuario en Authentication
            let uid = null;
            try {
                const credenciales = await createUserWithEmailAndPassword(auth, correo, contraseña);
                uid = credenciales.user.uid;
            } catch (error) {
                if (error.code === 'auth/email-already-in-use') {
                    mostrarMensaje('Error', `El alumno ${codigo_alumno} ya tiene cuenta.`, 'error');
                    setCargando(false);
                    return;
                } else {
                    console.warn(`Error al crear cuenta:`, error.message);
                    mostrarMensaje('Error', 'Error al crear la cuenta del alumno', 'error');
                    setCargando(false);
                    return;
                }
            }

            // Crear documento en Firestore usando el UID como ID del documento
            if (uid) {
                const alumnoDoc = doc(db, 'alumnos', uid);
                await setDoc(alumnoDoc, {
                    ...alumnoData,
                    uid, // Guardamos el UID en los datos también
                    id: uid, // Usamos el UID como ID para consistencia
                    fecha_creacion: new Date().toISOString()
                });

                mostrarMensaje('Éxito', 'Alumno agregado correctamente', 'success');
                setShowModalAgregarAlumno(false);
                setNuevoAlumno({
                    nombres_apellidos: '',
                    codigo_alumno: '',
                    nombre_colegio: ''
                });
                cargarUsuarios('alumnos'); // Recargar la lista
            }
        } catch (error) {
            console.error('Error al guardar alumno:', error);
            mostrarMensaje('Error', 'Hubo un problema al guardar el alumno', 'error');
        } finally {
            setCargando(false);
        }
    };

    // Descargar reporte
    const descargarReporte = async () => {
        try {
            setCargando(true);

            // Obtener todos los alumnos con su progreso
            const alumnosSnapshot = await getDocs(collection(db, 'alumnos'));
            const alumnosData = alumnosSnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));

            // Crear contenido del reporte
            let reporteContent = 'REPORTE DE PROGRESO DE ALUMNOS\n\n';
            reporteContent += 'Fecha: ' + new Date().toLocaleDateString() + '\n';
            reporteContent += 'Total de alumnos: ' + alumnosData.length + '\n\n';

            alumnosData.forEach((alumno, index) => {
                reporteContent += `ALUMNO ${index + 1}:\n`;
                reporteContent += `Nombre: ${alumno.nombres_apellidos || 'N/A'}\n`;
                reporteContent += `Código: ${alumno.codigo_alumno || 'N/A'}\n`;
                reporteContent += `Colegio: ${alumno.nombre_colegio || 'N/A'}\n`;

                // Progreso
                if (alumno.progreso) {
                    reporteContent += `Progreso:\n`;
                    Object.keys(alumno.progreso).forEach(categoria => {
                        Object.keys(alumno.progreso[categoria]).forEach(juego => {
                            const datosJuego = alumno.progreso[categoria][juego];
                            reporteContent += `  - ${categoria} - ${juego}: ${datosJuego.puntos || 0} puntos\n`;
                        });
                    });
                } else {
                    reporteContent += `Progreso: Sin datos\n`;
                }
                reporteContent += '\n' + '='.repeat(50) + '\n\n';
            });

            // Crear y descargar archivo
            const blob = new Blob([reporteContent], { type: 'text/plain' });
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `reporte-detallado-${new Date().toISOString().split('T')[0]}.doc`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);

            setShowModalReportes(false);
            mostrarMensaje('Éxito', 'Reporte descargado correctamente', 'success');

        } catch (error) {
            console.error('Error generando reporte:', error);
            mostrarMensaje('Error', 'Error al generar el reporte', 'error');
        } finally {
            setCargando(false);
        }
    };

    // Filtrar usuarios
    const usuariosFiltrados = usuarios.filter(usuario => {
        if (tipoUsuario === 'docentes') {
            return (
                usuario.nombres?.toLowerCase().includes(filtro.toLowerCase()) ||
                usuario.apellidos?.toLowerCase().includes(filtro.toLowerCase()) ||
                usuario.correoElectronico?.toLowerCase().includes(filtro.toLowerCase()) ||
                usuario.nombreColegio?.toLowerCase().includes(filtro.toLowerCase())
            );
        } else if (tipoUsuario === 'alumnos') {
            return (
                usuario.nombres_apellidos?.toLowerCase().includes(filtro.toLowerCase()) ||
                usuario.codigo_alumno?.toLowerCase().includes(filtro.toLowerCase()) ||
                usuario.nombre_colegio?.toLowerCase().includes(filtro.toLowerCase())
            );
        }
        return false;
    });

    // Renderizar formulario de edición según el tipo de usuario
    const renderFormularioEdicion = () => {
        if (tipoUsuario === 'docentes') {
            return (
                <div className={styles.editForm}>
                    <input
                        type="text"
                        placeholder="Nombres"
                        value={editandoUsuario.nombres || ''}
                        onChange={(e) => setEditandoUsuario({
                            ...editandoUsuario,
                            nombres: e.target.value
                        })}
                        className={styles.editInput}
                    />
                    <input
                        type="text"
                        placeholder="Apellidos"
                        value={editandoUsuario.apellidos || ''}
                        onChange={(e) => setEditandoUsuario({
                            ...editandoUsuario,
                            apellidos: e.target.value
                        })}
                        className={styles.editInput}
                    />
                    <input
                        type="email"
                        placeholder="Correo Electrónico"
                        value={editandoUsuario.correoElectronico || ''}
                        onChange={(e) => setEditandoUsuario({
                            ...editandoUsuario,
                            correoElectronico: e.target.value
                        })}
                        className={styles.editInput}
                    />
                    <input
                        type="text"
                        placeholder="Rol ID"
                        value={editandoUsuario.rolId || ''}
                        onChange={(e) => setEditandoUsuario({
                            ...editandoUsuario,
                            rolId: e.target.value
                        })}
                        className={styles.editInput}
                    />
                    <div className={styles.editButtons}>
                        <button
                            onClick={guardarCambios}
                            className={styles.saveButton}
                        >
                            Guardar
                        </button>
                        <button
                            onClick={() => setEditandoUsuario(null)}
                            className={styles.cancelButton}
                        >
                            Cancelar
                        </button>
                    </div>
                </div>
            );
        } else if (tipoUsuario === 'alumnos') {
            return (
                <div className={styles.editForm}>
                    <input
                        type="text"
                        placeholder="Nombres y Apellidos"
                        value={editandoUsuario.nombres_apellidos || ''}
                        onChange={(e) => setEditandoUsuario({
                            ...editandoUsuario,
                            nombres_apellidos: e.target.value
                        })}
                        className={styles.editInput}
                    />
                    <input
                        type="text"
                        placeholder="Código de Alumno"
                        value={editandoUsuario.codigo_alumno || ''}
                        onChange={(e) => setEditandoUsuario({
                            ...editandoUsuario,
                            codigo_alumno: e.target.value
                        })}
                        className={styles.editInput}
                    />
                    <div className={styles.editButtons}>
                        <button
                            onClick={guardarCambios}
                            className={styles.saveButton}
                        >
                            Guardar
                        </button>
                        <button
                            onClick={() => setEditandoUsuario(null)}
                            className={styles.cancelButton}
                        >
                            Cancelar
                        </button>
                    </div>
                </div>
            );
        }
    };

    return (
        <div className={`${styles.adminContainer} ${modoOscuro ? 'modo-oscuro' : 'modo-claro'}`}>
            {/* Botón tema */}
            <button onClick={toggleTema} className="boton-tema">
                {modoOscuro ?
                    <img src={Luna} alt="Luna" style={{ width: 30, height: 30 }} /> :
                    <img src={Sol} alt="Sol" style={{ width: 30, height: 30 }} />
                }
            </button>

            {/* Botón Usuarios */}
            <button
                className={styles.button}
                onClick={() => setShowModalUsuarios(true)}
            >
                <span className={styles.text1}>Usuarios</span>
                <img src={Grupo} alt="Grupo" className={styles.imageGrupo} />
            </button>

            {/* Botón Reportes */}
            <button
                className={styles.button1}
                onClick={() => setShowModalReportes(true)}
            >
                <span className={styles.text2}>Reportes</span>
                <img src={Report} alt="Report" className={styles.imageGrupo1} />
            </button>

            {/* Modal de Selección de Usuarios */}
            {showModalUsuarios && (
                <div className={styles.modalOverlay}>
                    <div className={styles.modal}>
                        <h2 className={styles.txten}>Seleccionar Tipo de Usuarios</h2>
                        <div className={styles.modalButtons}>
                            <button
                                onClick={() => cargarUsuarios('docentes')}
                                className={styles.modalButton}
                            >
                                Ver Docentes
                            </button>
                            <button
                                onClick={() => cargarUsuarios('alumnos')}
                                className={styles.modalButton}
                            >
                                Ver Alumnos
                            </button>
                            <button
                                onClick={() => setShowModalUsuarios(false)}
                                className={styles.modalButtonCancel}
                            >
                                Cancelar
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal de Lista de Usuarios */}
            {tipoUsuario && (
                <div className={styles.modalOverlay}>
                    <div className={styles.modalGrande}>
                        <div className={styles.modalHeader}>
                            <h2>
                                {tipoUsuario === 'docentes' ? 'Lista de Docentes' : 'Lista de Alumnos'}
                                ({usuariosFiltrados.length})
                            </h2>
                            {tipoUsuario === 'alumnos' && (
                                <button
                                    onClick={() => setShowModalAgregarAlumno(true)}
                                    className={styles.agregarButton}
                                >
                                    + Agregar Alumno
                                </button>
                            )}
                            <button
                                onClick={() => setTipoUsuario('')}
                                className={styles.closeButton}
                            >
                                ❌
                            </button>
                        </div>

                        {/* Barra de búsqueda */}
                        <div className={styles.searchContainer}>
                            <input
                                type="text"
                                placeholder={`Buscar ${tipoUsuario}...`}
                                value={filtro}
                                onChange={(e) => setFiltro(e.target.value)}
                                className={styles.searchInput}
                            />
                        </div>

                        {cargando ? (
                            <div className={styles.loading}>Cargando...</div>
                        ) : (
                            <div className={styles.listaContainer}>
                                {usuariosFiltrados.length === 0 ? (
                                    <div className={styles.noResults}>
                                        No se encontraron {tipoUsuario}
                                    </div>
                                ) : (
                                    usuariosFiltrados.map((usuario) => (
                                        <div key={usuario.id} className={styles.usuarioCard}>
                                            {editandoUsuario?.id === usuario.id ? (
                                                // Formulario de edición específico por tipo
                                                renderFormularioEdicion()
                                            ) : (
                                                // Vista normal
                                                <>
                                                    <div className={styles.usuarioInfo}>
                                                        <h3>
                                                            {tipoUsuario === 'docentes' 
                                                                ? `${usuario.nombres || ''} ${usuario.apellidos || ''}`
                                                                : usuario.nombres_apellidos
                                                            }
                                                        </h3>
                                                        <p>Email: {usuario.correo || usuario.correoElectronico}</p>
                                                        <p>Colegio: {usuario.nombre_colegio || usuario.nombreColegio}</p>
                                                        {usuario.codigo_alumno && <p>Código: {usuario.codigo_alumno}</p>}
                                                        {usuario.rolId && <p>Rol ID: {usuario.rolId}</p>}
                                                        {/* Información de depuración - puedes quitarla después */}
                                                        <p style={{fontSize: '10px', color: '#666'}}>
                                                            Firestore ID: {usuario.id} | UID: {usuario.uid || 'N/A'}
                                                        </p>
                                                    </div>
                                                    <div className={styles.usuarioActions}>
                                                        <button
                                                            onClick={() => editarUsuario(usuario)}
                                                            className={styles.editButton}
                                                        >
                                                            Editar
                                                        </button>
                                                        <button
                                                            onClick={() => confirmarEliminarUsuario(usuario.id)}
                                                            className={styles.deleteButton}
                                                        >
                                                            Eliminar
                                                        </button>
                                                    </div>
                                                </>
                                            )}
                                        </div>
                                    ))
                                )}
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Modal de Agregar Alumno */}
            {showModalAgregarAlumno && (
                <div className={styles.modalOverlay}>
                    <div className={styles.modal}>
                        <h2 className={styles.txten12}>Agregar Nuevo Alumno</h2>
                        <div className={styles.formGroup}>
                            <input
                                type="text"
                                placeholder="Nombres y Apellidos"
                                value={nuevoAlumno.nombres_apellidos}
                                onChange={(e) => setNuevoAlumno({
                                    ...nuevoAlumno,
                                    nombres_apellidos: e.target.value
                                })}
                                className={styles.editInput}
                            />
                            <input
                                type="text"
                                placeholder="Código de Alumno"
                                value={nuevoAlumno.codigo_alumno}
                                onChange={(e) => setNuevoAlumno({
                                    ...nuevoAlumno,
                                    codigo_alumno: e.target.value
                                })}
                                className={styles.editInput}
                            />
                            <input
                                type="text"
                                placeholder="Nombre del Colegio"
                                value={nuevoAlumno.nombre_colegio}
                                onChange={(e) => setNuevoAlumno({
                                    ...nuevoAlumno,
                                    nombre_colegio: e.target.value
                                })}
                                className={styles.editInput}
                            />
                        </div>
                        <div className={styles.modalButtons}>
                            <button
                                onClick={agregarAlumno}
                                className={styles.modalButton}
                                disabled={cargando}
                            >
                                {cargando ? 'Guardando...' : 'Guardar'}
                            </button>
                            <button
                                onClick={() => {
                                    setShowModalAgregarAlumno(false);
                                    setNuevoAlumno({
                                        nombres_apellidos: '',
                                        codigo_alumno: '',
                                        nombre_colegio: ''
                                    });
                                }}
                                className={styles.modalButtonCancel}
                                disabled={cargando}
                            >
                                Cancelar
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal de Confirmación de Eliminación */}
            {showConfirmacionEliminar && (
                <div className={styles.modalOverlay}>
                    <div className={styles.modalConfirmacion}>
                        <div className={styles.confirmacionHeader}>
                            <h3>Confirmar Eliminación</h3>
                        </div>
                        <div className={styles.confirmacionBody}>
                            <p className={styles.txten12} >¿Estás seguro de que deseas eliminar este usuario?</p>
                            <p className={styles.confirmacionAdvertencia}>
                                Esta acción no se puede deshacer.
                            </p>
                        </div>
                        <div className={styles.confirmacionButtons}>
                            <button
                                onClick={eliminarUsuario}
                                className={styles.confirmacionButtonEliminar}
                            >
                                Sí, Eliminar
                            </button>
                            <button
                                onClick={cancelarEliminacion}
                                className={styles.confirmacionButtonCancelar}
                            >
                                Cancelar
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal de Mensajes Personalizados */}
            {showModalMensaje && (
                <div className={styles.modalOverlay}>
                    <div className={`${styles.modalMensaje} ${styles.txten12} ${styles[mensajeModal.tipo]}`}>
                        <div className={styles.mensajeHeader}>
                            <h3>{mensajeModal.titulo}</h3>
                        </div>
                        <div className={styles.mensajeBody}>
                            <p>{mensajeModal.mensaje}</p>
                        </div>
                        <div className={styles.mensajeButtons}>
                            <button
                                onClick={cerrarModalMensaje}
                                className={styles.mensajeButtonAceptar}
                            >
                                Aceptar
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal de Reportes */}
            {showModalReportes && (
                <div className={styles.modalOverlay}>
                    <div className={styles.modal}>
                        <h2 className={styles.txten12}>Descargar Reporte</h2>
                        <p className={styles.txten12}>¿Estás seguro de que deseas descargar el reporte de progreso de todos los alumnos?</p>
                        <div className={styles.modalButtons}>
                            <button
                                onClick={descargarReporte}
                                className={styles.modalButton}
                                disabled={cargando}
                            >
                                {cargando ? 'Generando...' : 'Sí, Descargar'}
                            </button>
                            <button
                                onClick={() => setShowModalReportes(false)}
                                className={styles.modalButtonCancel}
                                disabled={cargando}
                            >
                                Cancelar
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default Admin;