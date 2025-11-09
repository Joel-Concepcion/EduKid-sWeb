import Ari from '../../assets/fondo/ari.png';
import Aba from '../../assets/fondo/aba.png';
import '../../styles/login/login.css';
import Niño from '../../assets/log/nino.png';
import Docen from '../../assets/log/docente.png';
import Hierba from '../../assets/log/hierba.png';
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom'; // Agregar useNavigate
import '@fontsource/kavoon';

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
    const navigate = useNavigate(); // Agregar navigate
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

    //funciones 
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

    //registro del docente - CORREGIDO
    const registroDocente = async () => {
        if (registrando) return;
        setRegistrando(true);

        if (!nombreColegio || !nombres || !apellidos || !correoElectronico || !contraseña || !confirmarContraseña) {
            alert("Campos incompletos: Por favor, completá todos los campos.");
            setRegistrando(false);
            return;
        }

        if (contraseña.length < 6) {
            alert("Contraseña débil: Debe tener al menos 6 caracteres.");
            setRegistrando(false);
            return;
        }

        if (contraseña !== confirmarContraseña) {
            alert("Las contraseñas no coinciden");
            setRegistrando(false);
            return;
        }

        try {
            console.log("Iniciando registro...");
            
            //Registrar en Firebase Auth
            const userCredential = await createUserWithEmailAndPassword(auth, correoElectronico, contraseña);
            const usuario = userCredential.user;
            
            console.log("Usuario Auth creado:", usuario.uid);

            const id = await obtenerNuevoIdDocente();
            console.log("ID obtenido:", id);

            // Guardar datos adicionales en Firestore
            await setDoc(doc(db, "docente", usuario.uid), {
                docenteId: 'DOC-' + id,
                rolId: '2',
                nombreColegio,
                nombres,
                apellidos,
                correoElectronico,
                contraseña, // NO guardes la contraseña en Firestore - ya está en Auth
                creadoEn: serverTimestamp()
            });

            console.log("Datos guardados en Firestore");
            alert("Registro exitoso: Docente registrado correctamente.");
            
            // Limpiar formulario
            setNombreColegio('');
            setNombres('');
            setApellidos('');
            setCorreoElectronico('');
            setContraseña('');
            setConfirmarContraseña('');
            
            navigate("/Home"); // Usar navigate en lugar de navigation.navigate
        } catch (error) {
            console.error("Error completo al registrar:", error);
            let mensajeError = "No se pudo registrar. Intentalo de nuevo.";
            
            if (error.code === 'auth/email-already-in-use') {
                mensajeError = "El correo electrónico ya está en uso.";
            } else if (error.code === 'auth/invalid-email') {
                mensajeError = "El correo electrónico no es válido.";
            }
            
            alert("Error: " + mensajeError);
        } finally {
            setRegistrando(false);
        }
    };

    const validarLogin = async () => {
        if (!loginCorreo || !loginContraseña) {
            alert("Campos vacíos: Ingresá tu correo y contraseña.");
            return;
        }

        try {
            const userCredential = await signInWithEmailAndPassword(auth, loginCorreo, loginContraseña);
            const usuario = userCredential.user;

            console.log("Login exitoso:", usuario.uid);
            alert("Bienvenido: Inicio de sesión exitoso.");
            navigate("/Home");
        } catch (error) {
            console.error("Error en login:", error);
            let mensajeError = "Credenciales incorrectas o usuario no registrado.";
            
            if (error.code === 'auth/user-not-found') {
                mensajeError = "Usuario no encontrado.";
            } else if (error.code === 'auth/wrong-password') {
                mensajeError = "Contraseña incorrecta.";
            }
            
            alert("Error: " + mensajeError);
        }
    };

    //login alumno
    const validarAlumno = async () => {
        if (!loginNombreColegio || !loginCodigoEstu) {
            alert("Campos vacíos: Ingresá el nombre del colegio y código del estudiante.");
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
                alert("Credenciales incorrectas: Verificá el nombre del colegio y su código.");
            } else {
                alert("Bienvenido: Inicia a interactuar de manera educativa");
                navigate("/inicioAlumno");
            }
        } catch (error) {
            console.error("Error en login alumno:", error);
            alert("Error: No se pudo acceder al perfil del estudiante");
        }
    };

    return (
        <>
            <div className="Container12">
                <img src={Ari} alt="Fondo superior" className="imagen1" />
                {mostrarRegistro && !mostrarLogin && (
                    <div className='contenLogin' style={{ height: rol === 'Docente' ? '900px' : rol === 'Alumno' ? '495px' : '400px' }}>
                        <text className='texto'> Registro </text>
                        <select
                            className="select"
                            value={rol}
                            onChange={(e) => setRol(e.target.value)}
                        >
                            <option value="" className='optionV'>Escoje tu rol</option>
                            <option value="Docente" className='optionV'>Docente</option>
                            <option value="Alumno" className='optionV'>Alumno</option>
                        </select>

                        {rol === 'Alumno' && (
                            <div className="logEstu">
                                <label className="tex5">Nombre del colegio</label>
                                <input
                                    type="text"
                                    className="texImpul"
                                    value={loginNombreColegio}
                                    onChange={(e) => setLoginNombreColegio(e.target.value)} // Corregido
                                />

                                <label className="tex5">Código del alumno</label>
                                <input
                                    type="text"
                                    className="texImpul"
                                    value={loginCodigoEstu}
                                    onChange={(e) => setLoginCodigoEstu(e.target.value)} // Corregido
                                />

                                <button className="booton" onClick={validarAlumno}>
                                    <span className="tex2 fon1">Acceder</span>
                                </button>
                            </div>
                        )}

                        {rol === 'Docente' && (
                            <div className="logEstu">
                                <label className="tex5">Nombre del colegio</label>
                                <input
                                    type="text"
                                    className="texImpul"
                                    value={nombreColegio}
                                    onChange={(e) => setNombreColegio(e.target.value)}
                                />

                                <label className="tex5">Nombres</label>
                                <input
                                    type="text"
                                    className="texImpul"
                                    value={nombres}
                                    onChange={(e) => setNombres(e.target.value)}
                                />

                                <label className="tex5">Apellido</label>
                                <input
                                    type="text"
                                    className="texImpul"
                                    value={apellidos}
                                    onChange={(e) => setApellidos(e.target.value)}
                                />

                                <label className="tex5">Correo electrónico</label>
                                <input
                                    type="email"
                                    className="texImpul"
                                    value={correoElectronico}
                                    onChange={(e) => setCorreoElectronico(e.target.value)}
                                />

                                <label className="tex5">Contraseña</label>
                                <input
                                    type="password"
                                    className="texImpul"
                                    value={contraseña}
                                    onChange={(e) => setContraseña(e.target.value)}
                                />

                                <label className="tex5">Confirmar Contraseña</label>
                                <input
                                    type="password"
                                    className="texImpul"
                                    value={confirmarContraseña}
                                    onChange={(e) => setConfirmarContraseña(e.target.value)}
                                />

                                <button 
                                    className="booton" 
                                    onClick={registroDocente}
                                    disabled={registrando}
                                >
                                    <span className="tex2 fon1">
                                        {registrando ? 'Registrando...' : 'Registrar'}
                                    </span>
                                </button>
                            </div>
                        )}

                        {/*Imagenes de login*/}
                        {rol === "" && (
                            <img src={Niño} alt="imagen de alumno" className='alumno' />
                        )}
                        {rol === 'Alumno' && (
                            <img src={Niño} alt="imagen de alumno" className='alumno' />
                        )}

                        {rol === 'Docente' && (
                            <img src={Docen} alt="imagen de docente" className='docente' />
                        )}

                        <img src={Hierba} alt="imagend de hierba" className='hier1' />
                        <img src={Hierba} alt="imagend de hierba" className='hier' />

                        {/*opcion login*/}
                        <p className="tex3">
                            Iniciar sesión:
                            <Link
                                to="#"
                                className="bootonLog"
                                onClick={() => {
                                    setMostrarLogin(true);
                                    setMostrarRegistro(false);
                                }}
                            >
                                <span className="tex4 fon2">Login</span>
                            </Link>
                        </p>
                    </div>
                )}

                {mostrarLogin && !mostrarRegistro && (
                    <div className='login'>
                        <text className='texto'> Login </text>

                        <label className="tex51">Correo electronico</label>
                        <input
                            type="email"
                            className="texImpul1"
                            value={loginCorreo}
                            onChange={(e) => setLoginCorreo(e.target.value)} // Corregido
                        />

                        <label className="tex51">Contraseña</label>
                        <input
                            type="password"
                            className="texImpul1"
                            value={loginContraseña}
                            onChange={(e) => setLoginContraseña(e.target.value)} // Corregido
                        />

                        <button className="booton" onClick={validarLogin}>
                            <span className="tex2 fon1">Iniciar Sesión</span> {/* Cambiado el texto */}
                        </button>

                        {/*opcion registro*/}
                        <p className="tex3">
                            Registrarse:
                            <Link
                                to="#"
                                className="bootonLog"
                                onClick={() => {
                                    setMostrarLogin(false);
                                    setMostrarRegistro(true);
                                }}
                            >
                                <span className="tex4 fon2">Registro</span>
                            </Link>
                        </p>
                    </div>
                )}

                <img src={Aba} alt="Fondo inferior" className="imagen2" />
            </div>
        </>
    );
}

export default Login;