import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from "react-router-dom";
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

//import Registro from './registro.jsx';

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



    const location = useLocation();
    const [activeCard, setActiveCard] = useState(null);

    const activities = [
        {
            id: 'math',
            name: 'Hogar',
            icon: home,
            path: ''
        },
        {
            id: 'inicio',
            name: 'Registro',
            icon: regis,
            path: '/lista-actividades/matematicas'
        },
        {
            id: 'math',
            name: 'Matemáticas',
            icon: mateIcon,
            path: '/lista-actividades/matematicas'
        },
        {
            id: 'literature',
            name: 'Literatura',
            icon: liteIcon,
            path: '/lista-actividades/literatura'
        },
        {
            id: 'figures',
            name: 'Figuras',
            icon: figuIcon,
            path: '/lista-actividades/figuras'
        },
        {
            id: 'sounds',
            name: 'Sonidos',
            icon: sonidoIcon,
            path: '/lista-actividades/sonidos'
        },
        {
            id: 'quizzes',
            name: 'Mini-quizzes',
            icon: quizzIcon,
            path: '/lista-actividades/quizzes'
        },
        {
            id: 'math',
            name: 'Ajustes',
            icon: ajus,
            path: '/lista-actividades/matematicas'
        }

    ];


    // Verificar si una actividad está activa
    const isActive = (activityPath) => {
        return location.pathname.startsWith(activityPath) || activeCard === activityPath;
    };

    const handleCardClick = (activity) => {
        setActiveCard(activity.path);
        navigate(activity.path);

        // Opcional: quitar el estado activo después de 2 segundos
        setTimeout(() => {
            setActiveCard(null);
        }, 2000);
    };

    const handleMouseEnter = (activityId) => {
        // Efecto adicional al pasar el mouse
        const card = document.querySelector(`.activity-card.${activityId}-card`);
        if (card) {
            card.style.transform = 'translateY(-5px)';
        }
    };

    const handleMouseLeave = (activityId) => {
        const card = document.querySelector(`.activity-card.${activityId}-card`);
        if (card && !isActive(activities.find(a => a.id === activityId)?.path)) {
            card.style.transform = 'translateY(0)';
        }
    };


    ////////////////////////////////////////
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
                    <h1 className={styles.greeting}>Hola, Profesor/a</h1>
                    <button
                        onClick={() => navigate('/crear-clase')}
                        className={styles.createClassBtn}
                    >
                        Crear clase
                    </button>
                </div>

                {/* Sección de actividades disponibles */}
                <nav className={styles.activitiesSection}>

                    <div className={styles.activitiesGrid}>
                        {activities.map((activity) => (
                            <div
                                key={activity.id}
                                className={`${styles.activityCard} ${activity.id}-card ${isActive(activity.path) ? styles.active : ''}`}
                                onClick={() => handleCardClick(activity)}
                                onMouseEnter={() => handleMouseEnter(activity.id)}
                                onMouseLeave={() => handleMouseLeave(activity.id)}
                            >
                                <div className={styles.cardContent}>
                                    <img
                                        src={activity.icon}
                                        alt={activity.name}
                                        className={styles.activityIcon}
                                    />
                                    <span className={styles.activityText}>{activity.name}</span>
                                </div>
                                <div className={styles.activeIndicator}></div>
                            </div>
                        ))}
                    </div>
                </nav>
                {/* Sección de clases */}
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
    );
}
export default Home
