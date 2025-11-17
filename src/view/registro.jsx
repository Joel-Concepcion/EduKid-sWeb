// components/Registro.js
import React, { useState, useEffect } from 'react';
import { useNavigate } from "react-router-dom";
import { getFirestore, collection, getDocs } from 'firebase/firestore';
import appFirebase from '../model/db';
import styles from '../styles/home/home.module.css';

const db = getFirestore(appFirebase);

const Registro = () => {
    const navigate = useNavigate();
    const [clasesRegistradas, setClasesRegistradas] = useState([]);

    useEffect(() => {
        const obtenerClases = async () => {
            const snapshot = await getDocs(collection(db, 'clases'));
            const años = snapshot.docs
                .map(doc => doc.data())
                .filter(clase => clase.año) 
                .map(clase => clase.año);
            setClasesRegistradas(años);
        };

        obtenerClases();
    }, []);

    return (
        <div className={styles.registroContainer}>
            <div className={styles.registroContent}>
                
                {/* Botón Registrar grupo de clase */}
                <button 
                    className={styles.registroButton}
                    onClick={() => navigate("/registro-alumno")}
                >
                    <span className={styles.buttonText}>Registrar grupo de clase</span>
                </button>

                {/* Lista de clases */}
                <div className={styles.scrollContainer}>
                    {clasesRegistradas.map((año, index) => (
                        <button 
                            key={index} 
                            className={styles.claseButton}
                            onClick={() => navigate("/lista-alumnos")}
                        >
                            <span className={styles.claseText}>Clase: {año}</span>
                        </button>
                    ))}
                </div>

            </div>
        </div>
    );
};

export default Registro;