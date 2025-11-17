import Ari from '../../assets/fondo/ari.png';
import Aba from '../../assets/fondo/aba.png';
import Niño from '../../assets/log/nino.png';
import Docen from '../../assets/log/docente.png';
import Hierba from '../../assets/log/hierba.png';
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import '@fontsource/kavoon';
import styles from'../../styles/login/login.module.css';

//firebase
import AppFirebase from '../../model/db';
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword } from "firebase/auth";
import {
    getFirestore,
    doc,
    getDoc,
    setDoc,
    updateDoc,
    collection,
    query,
    where,
    getDocs,
    serverTimestamp
} from "firebase/firestore";

const db = getFirestore(AppFirebase);
const auth = getAuth(AppFirebase);

function Login() {
    const navigate = useNavigate();
    const [rol, setRol] = useState("");
    const [mostrarRegistro, setMostrarRegistro] = useState(true);
    const [mostrarLogin, setMostrarLogin] = useState(false);

    //datos a registrar 
    const [nombreColegio, setNombreColegio] = useState('');
    const [nombres, setNombres] = useState('');
    const [apellidos, setApellidos] = useState('');
    const [correoElectronico, setCorreoElectronico] = useState('');
    const [contraseña, setContraseña] = useState('');
    const [confirmarContraseña, setConfirmarContraseña] = useState('');
    const [registrando, setRegistrando] = useState(false);

    //login
    const [loginCorreo, setLoginCorreo] = useState('');
    const [loginContraseña, setLoginContraseña] = useState('');

    //login alumno
    const [loginNombreColegio, setLoginNombreColegio] = useState('');
    const [loginCodigoEstu, setLoginCodigoEstu] = useState('');

    // Estado para alertas personalizadas
    const [alerta, setAlerta] = useState({ mostrar: false, mensaje: '', tipo: '' });

    // Función para mostrar alertas personalizadas
    const mostrarAlerta = (mensaje, tipo = 'success') => {
        setAlerta({ mostrar: true, mensaje, tipo });
        
        setTimeout(() => {
            setAlerta({ mostrar: false, mensaje: '', tipo: '' });
        }, 4000);
    };

    const cerrarAlerta = () => {
        setAlerta({ mostrar: false, mensaje: '', tipo: '' });
    };

    const obtenerNuevoIdDocente = async () => {
        try {
            const contadorRef = doc(db, "contadores", "docente");
            const snapshot = await getDoc(contadorRef);

            let nuevoId = 1;

            if (snapshot.exists()) {
                const data = snapshot.data();
                nuevoId = data.ultimoId + 1;
                await updateDoc(contadorRef, { ultimoId: nuevoId });
            } else {
                await setDoc(contadorRef, { ultimoId: nuevoId });
            }

            return nuevoId;
        } catch (error) {
            console.error("Error al obtener ID:", error);
            throw error;
        }
    };

    // Función para obtener el rol del usuario desde Firestore
    const obtenerRolUsuario = async (userId) => {
        try {
            // Primero busca en la colección 'docente'
            const docenteRef = doc(db, "docente", userId);
            const docenteSnap = await getDoc(docenteRef);
            
            if (docenteSnap.exists()) {
                const data = docenteSnap.data();
                console.log("Rol encontrado en docente:", data.rolId);
                return data.rolId; // Retorna '1' o '2'
            }

            // Si no está en 'docente', busca en 'users' o 'usuarios'
            const userRef = doc(db, "users", userId);
            const userSnap = await getDoc(userRef);
            
            if (userSnap.exists()) {
                const data = userSnap.data();
                console.log("Rol encontrado en users:", data.rolId || data.role);
                return data.rolId || data.role;
            }

            // Si no encuentra rol, retorna null
            console.log("No se encontró rol para el usuario:", userId);
            return null;
            
        } catch (error) {
            console.error("Error obteniendo rol:", error);
            return null;
        }
    };

    //registro del docente
    const registroDocente = async () => {
        if (registrando) return;
        setRegistrando(true);

        if (!nombreColegio || !nombres || !apellidos || !correoElectronico || !contraseña || !confirmarContraseña) {
            mostrarAlerta("Campos incompletos: Por favor, completá todos los campos.", "error");
            setRegistrando(false);
            return;
        }

        if (contraseña.length < 6) {
            mostrarAlerta("Contraseña débil: Debe tener al menos 6 caracteres.", "error");
            setRegistrando(false);
            return;
        }

        if (contraseña !== confirmarContraseña) {
            mostrarAlerta("Las contraseñas no coinciden", "error");
            setRegistrando(false);
            return;
        }

        try {
            console.log("Iniciando registro...");
            
            // Registrar en Firebase Auth
            const userCredential = await createUserWithEmailAndPassword(auth, correoElectronico, contraseña);
            const usuario = userCredential.user;
            
            console.log("Usuario Auth creado:", usuario.uid);

            const id = await obtenerNuevoIdDocente();
            console.log("ID obtenido:", id);

            // Guardar datos adicionales en Firestore - rolId por defecto es '2' (docente normal)
            await setDoc(doc(db, "docente", usuario.uid), {
                docenteId: 'DOC-' + id,
                rolId: '2', // Por defecto, nuevo docente tiene rolId '2'
                nombreColegio,
                nombres,
                apellidos,
                correoElectronico,
                // NO guardes la contraseña en Firestore - ya está en Auth
                creadoEn: serverTimestamp()
            });

            console.log("Datos guardados en Firestore");
            mostrarAlerta("Registro exitoso: Docente registrado correctamente.");
            
            // Limpiar formulario
            setNombreColegio('');
            setNombres('');
            setApellidos('');
            setCorreoElectronico('');
            setContraseña('');
            setConfirmarContraseña('');
            
            // Redirigir a home (rolId '2' por defecto)
            navigate("/Home");
        } catch (error) {
            console.error("Error completo al registrar:", error);
            let mensajeError = "No se pudo registrar. Intentalo de nuevo.";
            
            if (error.code === 'auth/email-already-in-use') {
                mensajeError = "El correo electrónico ya está en uso.";
            } else if (error.code === 'auth/invalid-email') {
                mensajeError = "El correo electrónico no es válido.";
            }
            
            mostrarAlerta("Error: " + mensajeError, "error");
        } finally {
            setRegistrando(false);
        }
    };

    const validarLogin = async () => {
        if (!loginCorreo || !loginContraseña) {
            mostrarAlerta("Campos vacíos: Ingresá tu correo y contraseña.", "error");
            return;
        }

        try {
            const userCredential = await signInWithEmailAndPassword(auth, loginCorreo, loginContraseña);
            const usuario = userCredential.user;

            console.log("Login exitoso:", usuario.uid);
            
            // Obtener el rol del usuario desde Firestore
            const rolId = await obtenerRolUsuario(usuario.uid);
            console.log("Rol obtenido:", rolId);

            // Redirigir según el rol
            if (rolId === '1') {
                console.log("Redirigiendo a /admin - Rol: Administrador");
                mostrarAlerta("Bienvenido Administrador");
                navigate("/Admin");
            } else if (rolId === '2') {
                console.log("Redirigiendo a /Home - Rol: Docente");
                mostrarAlerta("Bienvenido Docente");
                navigate("/Home");
            } else {
                console.log("Rol no definido, redirigiendo a /Home por defecto");
                mostrarAlerta("Bienvenido");
                navigate("/Home");
            }

        } catch (error) {
            console.error("Error en login:", error);
            let mensajeError = "Credenciales incorrectas o usuario no registrado.";
            
            if (error.code === 'auth/user-not-found') {
                mensajeError = "Usuario no encontrado.";
            } else if (error.code === 'auth/wrong-password') {
                mensajeError = "Contraseña incorrecta.";
            }
            
            mostrarAlerta("Error: " + mensajeError, "error");
        }
    };

    //login alumno
    const validarAlumno = async () => {
        if (!loginNombreColegio || !loginCodigoEstu) {
            mostrarAlerta("Campos vacíos: Ingresá el nombre del colegio y código del estudiante.", "error");
            return;
        }

        try {
            const consulta = query(
                collection(db, "alumnos"),
                where("nombre_colegio", "==", loginNombreColegio),
                where("codigo_alumno", "==", loginCodigoEstu)
            );

            const resultado = await getDocs(consulta);

            if (resultado.empty) {
                mostrarAlerta("Credenciales incorrectas: Verificá el nombre del colegio y su código.", "error");
            } else {
                mostrarAlerta("Bienvenido: Inicia a interactuar de manera educativa");
                navigate("/inicioAlumno");
            }
        } catch (error) {
            console.error("Error en login alumno:", error);
            mostrarAlerta("Error: No se pudo acceder al perfil del estudiante", "error");
        }
    };

    return (
        <>
            <div className={styles.Container12}>
                {/* Alerta personalizada */}
                {alerta.mostrar && (
                    <div className={`${styles.alerta} ${styles[`alerta-${alerta.tipo}`]}`}>
                        <span className={styles.alertaMensaje}>{alerta.mensaje}</span>
                        <button className={styles.alertaCerrar} onClick={cerrarAlerta}>
                            ×
                        </button>
                    </div>
                )}

                <img src={Ari} alt="Fondo superior" className={styles.imagen1} />
                {mostrarRegistro && !mostrarLogin && (
                    <div className={styles.contenLogin} style={{ height: rol === 'Docente' ? '900px' : rol === 'Alumno' ? '495px' : '400px' }}>
                        <text className={styles.texto}> Registro </text>
                        <select
                            className={styles.select}
                            value={rol}
                            onChange={(e) => setRol(e.target.value)}
                        >
                            <option value="" className={styles.optionV}>Rol</option>
                            <option value="Docente" className={styles.optionV}>Docente</option>
                            <option value="Alumno" className={styles.optionV}>Alumno</option>
                        </select>

                        {rol === 'Alumno' && (
                            <div className={styles.logEstu}>
                                <label className={styles.tex5}>Nombre del colegio</label>
                                <input
                                    type="text"
                                    className={styles.texImpul}
                                    value={loginNombreColegio}
                                    onChange={(e) => setLoginNombreColegio(e.target.value)}
                                />

                                <label className={styles.tex5}>Código del alumno</label>
                                <input
                                    type="text"
                                    className={styles.texImpul}
                                    value={loginCodigoEstu}
                                    onChange={(e) => setLoginCodigoEstu(e.target.value)}
                                />

                                <button className={styles.booton} onClick={validarAlumno}>
                                    <span className={styles.tex2}>Acceder</span>
                                </button>
                            </div>
                        )}

                        {rol === 'Docente' && (
                            <div className={styles.logEstu}>
                                <label className={styles.tex5}>Nombre del colegio</label>
                                <input
                                    type="text"
                                    className={styles.texImpul}
                                    value={nombreColegio}
                                    onChange={(e) => setNombreColegio(e.target.value)}
                                />

                                <label className={styles.tex5}>Nombres</label>
                                <input
                                    type="text"
                                    className={styles.texImpul}
                                    value={nombres}
                                    onChange={(e) => setNombres(e.target.value)}
                                />

                                <label className={styles.tex5}>Apellido</label>
                                <input
                                    type="text"
                                    className={styles.texImpul}
                                    value={apellidos}
                                    onChange={(e) => setApellidos(e.target.value)}
                                />

                                <label className={styles.tex5}>Correo electrónico</label>
                                <input
                                    type="email"
                                    className={styles.texImpul}
                                    value={correoElectronico}
                                    onChange={(e) => setCorreoElectronico(e.target.value)}
                                />

                                <label className={styles.tex5}>Contraseña</label>
                                <input
                                    type="password"
                                    className={styles.texImpul}
                                    value={contraseña}
                                    onChange={(e) => setContraseña(e.target.value)}
                                />

                                <label className={styles.tex5}>Confirmar Contraseña</label>
                                <input
                                    type="password"
                                    className={styles.texImpul}
                                    value={confirmarContraseña}
                                    onChange={(e) => setConfirmarContraseña(e.target.value)}
                                />

                                <button 
                                    className={styles.booton} 
                                    onClick={registroDocente}
                                    disabled={registrando}
                                >
                                    <span className={styles.tex2}>
                                        {registrando ? 'Registrando...' : 'Registrar'}
                                    </span>
                                </button>
                            </div>
                        )}

                        {/*Imagenes de login*/}
                        {rol === "" && (
                            <img src={Niño} alt="imagen de alumno" className={styles.alumno} />
                        )}
                        {rol === 'Alumno' && (
                            <img src={Niño} alt="imagen de alumno" className={styles.alumno} />
                        )}

                        {rol === 'Docente' && (
                            <img src={Docen} alt="imagen de docente" className={styles.docente} />
                        )}

                        <img src={Hierba} alt="imagend de hierba" className={styles.hier1} />
                        <img src={Hierba} alt="imagend de hierba" className={styles.hier} />

                        {/*opcion login*/}
                        <p className={styles.tex3}>
                            Iniciar sesión:
                            <Link
                                to="#"
                                className={styles.bootonLog}
                                onClick={() => {
                                    setMostrarLogin(true);
                                    setMostrarRegistro(false);
                                }}
                            >
                                <span className={styles.tex4}>Login</span>
                            </Link>
                        </p>
                    </div>
                )}

                {mostrarLogin && !mostrarRegistro && (
                    <div className={styles.login}>
                        <text className={styles.texto}> Login </text>

                        <label className={styles.tex51}>Correo electronico</label>
                        <input
                            type="email"
                            className={styles.texImpul1}
                            value={loginCorreo}
                            onChange={(e) => setLoginCorreo(e.target.value)}
                        />

                        <label className={styles.tex51}>Contraseña</label>
                        <input
                            type="password"
                            className={styles.texImpul1}
                            value={loginContraseña}
                            onChange={(e) => setLoginContraseña(e.target.value)}
                        />

                        <button className={styles.booton} onClick={validarLogin}>
                            <span className={styles.tex2}>Iniciar Sesión</span>
                        </button>

                        {/*opcion registro*/}
                        <p className={styles.tex3}>
                            Registrarse:
                            <Link
                                to="#"
                                className={styles.bootonLog}
                                onClick={() => {
                                    setMostrarLogin(false);
                                    setMostrarRegistro(true);
                                }}
                            >
                                <span className={styles.tex4}>Registro</span>
                            </Link>
                        </p>
                    </div>
                )}

                <img src={Aba} alt="Fondo inferior" className={styles.imagen2} />
            </div>
        </>
    );
}

export default Login;