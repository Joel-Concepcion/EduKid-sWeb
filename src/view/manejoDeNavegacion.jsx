import React, { useState, useEffect } from 'react';
import { useNavigate } from "react-router-dom";
import { getAuth } from "firebase/auth";
import { getFirestore, collection, getDocs, query, where } from "firebase/firestore";
import appFirebase from "../model/db";

// Importar las imágenes directamente
import banner18 from '../assets/bannerClase/Rectangle 18.png';
import banner19 from '../assets/bannerClase/Rectangle 19.png';
import banner20 from '../assets/bannerClase/Rectangle 20.png';
import banner21 from '../assets/bannerClase/Rectangle 21.png';
import banner22 from '../assets/bannerClase/Rectangle 22.png';

// Importar otras imágenes
import professorImg from '../assets/bannerClase/img profesor.png';
import mateIcon from '../assets/icon/mate.png';
import liteIcon from '../assets/icon/lite.png';
import figuIcon from '../assets/icon/figu.png';
import sonidoIcon from '../assets/icon/sonido.png';
import quizzIcon from '../assets/icon/quizz.png';
import ajus from '../assets/icon/ajus.png';
import home from '../assets/icon/home.png';
import regis from '../assets/icon/regis.png';
import iaIcon from '../../src/assets/IA (2).png';

import styles from'../styles/home/home.module.css';

const db = getFirestore(appFirebase);
const auth = getAuth();

const bannerMap = {
    'Rectangle18.png': banner18,
    'Rectangle19.png': banner19,
    'Rectangle20.png': banner20,
    'Rectangle21.png': banner21,
    'Rectangle22.png': banner22,
};

function Home() {
    const navigate = useNavigate();
    const [clases, setClases] = useState([]);
    const [seccionActiva, setSeccionActiva] = useState('home');
    const [subseccionActiva, setSubseccionActiva] = useState('clases'); // Para manejar subsecciones en Home

    // Definición de todas las actividades/secciones
    const activities = [
        {
            id: 'home',
            name: 'Hogar',
            icon: home,
            tipo: 'navegacion'
        },
        {
            id: 'registro',
            name: 'Registro',
            icon: regis,
            tipo: 'navegacion'
        },
        {
            id: 'math',
            name: 'Matemáticas',
            icon: mateIcon,
            tipo: 'actividad'
        },
        {
            id: 'literature',
            name: 'Literatura',
            icon: liteIcon,
            tipo: 'actividad'
        },
        {
            id: 'figures',
            name: 'Figuras',
            icon: figuIcon,
            tipo: 'actividad'
        },
        {
            id: 'sounds',
            name: 'Sonidos',
            icon: sonidoIcon,
            tipo: 'actividad'
        },
        {
            id: 'quizzes',
            name: 'Mini-quizzes',
            icon: quizzIcon,
            tipo: 'actividad'
        },
        {
            id: 'ajustes',
            name: 'Ajustes',
            icon: ajus,
            tipo: 'navegacion'
        }
    ];

    const handleCardClick = (activity) => {
        if (activity.tipo === 'navegacion') {
            // Navegación entre secciones principales
            setSeccionActiva(activity.id);
            setSubseccionActiva('clases'); // Resetear subsección al cambiar sección principal
        } else {
            // Actividades académicas - se muestran dentro de Home
            setSeccionActiva('home');
            setSubseccionActiva(activity.id);
        }
    };

    // Obtener clases del docente
    useEffect(() => {
        const obtenerClases = async () => {
            try {
                const usuario = auth.currentUser;
                if (!usuario) {
                    console.log("No hay usuario autenticado");
                    return;
                }

                const clasesRef = collection(db, "clases");
                const consulta = query(clasesRef, where("docenteId", "==", usuario.uid));
                const resultado = await getDocs(consulta);

                const clasesUsuario = resultado.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                }));

                console.log("Clases obtenidas:", clasesUsuario);
                setClases(clasesUsuario);
            } catch (error) {
                console.error("Error al obtener clases:", error);
            }
        };

        obtenerClases();
    }, []);

    // Renderizar contenido de actividades académicas
    const renderActividadAcademica = () => {
        switch (subseccionActiva) {
            case 'math':
                return (
                    <div className={styles.actividadContent}>
                        <h2>Matemáticas</h2>
                        <div className={styles.actividadGrid}>
                            <div className={styles.actividadItem}>Sumas y Restas</div>
                            <div className={styles.actividadItem}>Multiplicación</div>
                            <div className={styles.actividadItem}>División</div>
                            <div className={styles.actividadItem}>Geometría</div>
                        </div>
                    </div>
                );
            case 'literature':
                return (
                    <div className={styles.actividadContent}>
                        <h2>Literatura</h2>
                        <div className={styles.actividadGrid}>
                            <div className={styles.actividadItem}>Lectura Básica</div>
                            <div className={styles.actividadItem}>Comprensión Lectora</div>
                            <div className={styles.actividadItem}>Vocabulario</div>
                            <div className={styles.actividadItem}>Ortografía</div>
                        </div>
                    </div>
                );
            case 'figures':
                return (
                    <div className={styles.actividadContent}>
                        <h2>Figuras Geométricas</h2>
                        <div className={styles.actividadGrid}>
                            <div className={styles.actividadItem}>Círculos</div>
                            <div className={styles.actividadItem}>Cuadrados</div>
                            <div className={styles.actividadItem}>Triángulos</div>
                            <div className={styles.actividadItem}>Figuras 3D</div>
                        </div>
                    </div>
                );
            case 'sounds':
                return (
                    <div className={styles.actividadContent}>
                        <h2>Sonidos y Fonética</h2>
                        <div className={styles.actividadGrid}>
                            <div className={styles.actividadItem}>Vocales</div>
                            <div className={styles.actividadItem}>Consonantes</div>
                            <div className={styles.actividadItem}>Sílabas</div>
                            <div className={styles.actividadItem}>Palabras Completas</div>
                        </div>
                    </div>
                );
            case 'quizzes':
                return (
                    <div className={styles.actividadContent}>
                        <h2>Mini-quizzes</h2>
                        <div className={styles.actividadGrid}>
                            <div className={styles.actividadItem}>Quiz de Matemáticas</div>
                            <div className={styles.actividadItem}>Quiz de Español</div>
                            <div className={styles.actividadItem}>Quiz de Ciencias</div>
                            <div className={styles.actividadItem}>Quiz General</div>
                        </div>
                    </div>
                );
            case 'clases':
            default:
                return (
                    <div className={styles.clasesSection}>
                        <h2 className={styles.sectionTitle}>Clases:</h2>
                        <div className={styles.classesScroll}>
                            {clases.length > 0 ? (
                                clases.map((clase) => (
                                    <div key={clase.id} className={styles.classCard}>
                                        <div
                                            className={styles.classBannerContainer}
                                            onClick={() => navigate(`/clase/${clase.id}`, { state: { clase } })}
                                        >
                                            <img
                                                src={bannerMap[clase.banner]}
                                                alt={`Banner ${clase.nombreClase}`}
                                                className={styles.classBanner}
                                            />
                                            <h3 className={styles.className}>Clase: {clase.nombreClase}</h3>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <p className={styles.noClasses}>No hay clases creadas</p>
                            )}
                        </div>
                    </div>
                );
        }
    };

    // Renderizar sección según la navegación activa
    const renderSeccion = () => {
        switch (seccionActiva) {
            case 'home':
                return (
                    <div className={styles.container1}>
                        <div className={styles.containerS}>
                            {/* Header con saludo y botón crear clase */}
                            <div className={styles.headerSection}>
                                <img
                                    src={professorImg}
                                    alt="Profesor"
                                    className={styles.professorImage}
                                />
                                <h1 className={styles.greeting}>
                                    {subseccionActiva === 'clases' ? 'Hola, Profesor/a' : 
                                     activities.find(a => a.id === subseccionActiva)?.name}
                                </h1>
                                <button
                                    onClick={() => navigate('/crear-clase')}
                                    className={styles.createClassBtn}
                                >
                                    Crear clase
                                </button>
                            </div>

                            {/* BARRA DE NAVEGACIÓN VERTICAL CON TODAS LAS ACTIVIDADES */}
                            <nav className={styles.activitiesSection}>
                                <h2 className={styles.sectionTitle}>Navegación</h2>
                                <div className={styles.activitiesGrid}>
                                    {activities.map((activity) => (
                                        <div
                                            key={activity.id}
                                            className={`${styles.activityCard} ${activity.id}-card ${
                                                (activity.tipo === 'navegacion' && seccionActiva === activity.id) ||
                                                (activity.tipo === 'actividad' && subseccionActiva === activity.id)
                                                    ? styles.navActive : ''
                                            }`}
                                            onClick={() => handleCardClick(activity)}
                                        >
                                            <div className={styles.cardContent}>
                                                <img
                                                    src={activity.icon}
                                                    alt={activity.name}
                                                    className={styles.activityIcon}
                                                />
                                                <span className={styles.activityText}>{activity.name}</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </nav>

                            {/* CONTENIDO PRINCIPAL - LADO DERECHO */}
                            <div className={styles.mainContent}>
                                {renderActividadAcademica()}

                                {/* Botón IA */}
                                <button
                                    className={styles.aiButton}
                                    onClick={() => navigate("/ia")}
                                >
                                    <img
                                        src={iaIcon}
                                        alt="IA"
                                        className={styles.aiIcon}
                                    />
                                </button>
                            </div>
                        </div>
                    </div>
                );

            case 'registro':
                return (
                    <div className={styles.container1}>
                        <div className={styles.containerS}>
                            {/* Header */}
                            <div className={styles.headerSection}>
                                <img
                                    src={professorImg}
                                    alt="Profesor"
                                    className={styles.professorImage}
                                />
                                <h1 className={styles.greeting}>Registro de Estudiantes</h1>
                                <button
                                    onClick={() => navigate('/crear-clase')}
                                    className={styles.createClassBtn}
                                >
                                    Crear clase
                                </button>
                            </div>

                            {/* BARRA DE NAVEGACIÓN VERTICAL */}
                            <nav className={styles.activitiesSection}>
                                <h2 className={styles.sectionTitle}>Navegación</h2>
                                <div className={styles.activitiesGrid}>
                                    {activities.map((activity) => (
                                        <div
                                            key={activity.id}
                                            className={`${styles.activityCard} ${activity.id}-card ${
                                                activity.tipo === 'navegacion' && seccionActiva === activity.id ? styles.navActive : ''
                                            }`}
                                            onClick={() => handleCardClick(activity)}
                                        >
                                            <div className={styles.cardContent}>
                                                <img
                                                    src={activity.icon}
                                                    alt={activity.name}
                                                    className={styles.activityIcon}
                                                />
                                                <span className={styles.activityText}>{activity.name}</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </nav>

                            {/* CONTENIDO DE REGISTRO - LADO DERECHO */}
                            <div className={styles.mainContent}>
                                <div className={styles.registroContent}>
                                    <div className={styles.formContainer}>
                                        <h2 className={styles.sectionTitle}>Formulario de Registro</h2>
                                        <form className={styles.registroForm}>
                                            <div className={styles.formGroup}>
                                                <label>Nombre Completo:</label>
                                                <input type="text" placeholder="Ingresa el nombre completo" />
                                            </div>
                                            <div className={styles.formGroup}>
                                                <label>Email:</label>
                                                <input type="email" placeholder="Ingresa el email" />
                                            </div>
                                            <div className={styles.formGroup}>
                                                <label>Teléfono:</label>
                                                <input type="tel" placeholder="Ingresa el teléfono" />
                                            </div>
                                            <div className={styles.formGroup}>
                                                <label>Curso/Grado:</label>
                                                <select>
                                                    <option value="">Selecciona un curso</option>
                                                    <option value="preescolar">Preescolar</option>
                                                    <option value="primero">Primer Grado</option>
                                                    <option value="segundo">Segundo Grado</option>
                                                </select>
                                            </div>
                                            <button type="submit" className={styles.submitButton}>
                                                Registrar Estudiante
                                            </button>
                                        </form>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                );

            case 'ajustes':
                return (
                    <div className={styles.container1}>
                        <div className={styles.containerS}>
                            {/* Header */}
                            <div className={styles.headerSection}>
                                <img
                                    src={professorImg}
                                    alt="Profesor"
                                    className={styles.professorImage}
                                />
                                <h1 className={styles.greeting}>Ajustes y Configuración</h1>
                                <button
                                    onClick={() => navigate('/crear-clase')}
                                    className={styles.createClassBtn}
                                >
                                    Crear clase
                                </button>
                            </div>

                            {/* BARRA DE NAVEGACIÓN VERTICAL */}
                            <nav className={styles.activitiesSection}>
                                <h2 className={styles.sectionTitle}>Navegación</h2>
                                <div className={styles.activitiesGrid}>
                                    {activities.map((activity) => (
                                        <div
                                            key={activity.id}
                                            className={`${styles.activityCard} ${activity.id}-card ${
                                                activity.tipo === 'navegacion' && seccionActiva === activity.id ? styles.navActive : ''
                                            }`}
                                            onClick={() => handleCardClick(activity)}
                                        >
                                            <div className={styles.cardContent}>
                                                <img
                                                    src={activity.icon}
                                                    alt={activity.name}
                                                    className={styles.activityIcon}
                                                />
                                                <span className={styles.activityText}>{activity.name}</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </nav>

                            {/* CONTENIDO DE AJUSTES - LADO DERECHO */}
                            <div className={styles.mainContent}>
                                <div className={styles.ajustesContent}>
                                    <div className={styles.settingGroup}>
                                        <h3 className={styles.sectionTitle}>Notificaciones</h3>
                                        <label className={styles.switch}>
                                            <input type="checkbox" defaultChecked />
                                            <span className={styles.slider}></span>
                                            Notificaciones push
                                        </label>
                                    </div>
                                    <div className={styles.settingGroup}>
                                        <h3 className={styles.sectionTitle}>Apariencia</h3>
                                        <label>Tema:</label>
                                        <select>
                                            <option value="claro">Claro</option>
                                            <option value="oscuro">Oscuro</option>
                                            <option value="auto">Automático</option>
                                        </select>
                                    </div>
                                    <div className={styles.settingGroup}>
                                        <h3 className={styles.sectionTitle}>Idioma</h3>
                                        <select>
                                            <option value="es">Español</option>
                                            <option value="en">English</option>
                                        </select>
                                    </div>
                                    <button className={styles.saveButton}>
                                        Guardar Configuración
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                );

            default:
                return (
                    <div className={styles.container1}>
                        <div className={styles.containerS}>
                            <h1>Sección no encontrada</h1>
                        </div>
                    </div>
                );
        }
    };

    return renderSeccion();
}

export default Home;