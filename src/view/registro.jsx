//import { useNavigate } from 'react-router-dom';
import React, { useState, useEffect, useNavigate } from 'react';
//import { useNavigate } from "react-router-dom";
import { getFirestore, collection, getDocs } from 'firebase/firestore';
import appFirebase from '../model/db';

const db = getFirestore(appFirebase);

function Registro() {
    const navigate = useNavigate();
    const [clasesRegistradas, setClasesRegistradas] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const obtenerClases = async () => {
            try {
                const snapshot = await getDocs(collection(db, 'clases'));
                const años = snapshot.docs
                    .map(doc => doc.data())
                    .filter(clase => clase.año) 
                    .map(clase => clase.año);
                setClasesRegistradas(años);
            } catch (error) {
                console.error("Error al obtener clases:", error);
            } finally {
                setLoading(false);
            }
        };

        obtenerClases();
    }, []);

    if (loading) {
        return (
            <div className="registro-loading">
                <div className="loading-spinner">Cargando...</div>
            </div>
        );
    }

    return (
        <div className="registro-container">
            <div className="registro-cuerpo">
                <button 
                    className="registro-button primary"
                    onClick={() => navigate("/registro-alumno")}
                >
                    <span className="button-text">Registrar grupo de clase</span>
                </button>

                <div className="registro-scroll-view">
                    {clasesRegistradas.map((año, index) => (
                        <button 
                            key={index} 
                            className="registro-button secondary"
                            onClick={() => navigate("/lista-alumnos")}
                        >
                            <span className="clase-text">Clase: {año}</span>
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
}
export default Registro;