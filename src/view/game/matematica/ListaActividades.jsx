// components/ListaActividades.js
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAuth } from 'firebase/auth';
import {
  getFirestore,
  collection,
  query,
  where,
  getDocs,
  updateDoc,
  doc,
} from 'firebase/firestore';
import appFirebase from '../../../model/db';
import styles from '../../../styles/home/home.module.css';
import actividadImage from '../../../assets/bannerActi/Rectangle 26.png';

const db = getFirestore(appFirebase);
const auth = getAuth();

function ListaActividades() {
  const navigate = useNavigate();
  const [mostrarBotones, setMostrarBotones] = useState(false);
  const [mostrarClases, setMostrarClases] = useState(false);
  const [actividadSeleccionada] = useState('Juego de Sumas');
  const [clases, setClases] = useState([]);
  const [alerta, setAlerta] = useState({ mostrar: false, mensaje: '', tipo: '' });

  useEffect(() => {
    const cargarClases = async () => {
      try {
        const usuario = auth.currentUser;
        if (!usuario) {
          console.warn('Usuario no autenticado');
          return;
        }

        const clasesRef = collection(db, 'clases');
        const consulta = query(clasesRef, where('docenteId', '==', usuario.uid));
        const resultado = await getDocs(consulta);

        const clasesBD = resultado.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          actividades: doc.data().actividades || [],
        }));

        setClases(clasesBD);
      } catch (error) {
        console.error('Error al cargar clases:', error);
        mostrarAlerta('Error al cargar las clases', 'error');
      }
    };

    cargarClases();
  }, []);

  const mostrarAlerta = (mensaje, tipo = 'success') => {
    setAlerta({ mostrar: true, mensaje, tipo });
    
    // Auto-ocultar después de 4 segundos
    setTimeout(() => {
      setAlerta({ mostrar: false, mensaje: '', tipo: '' });
    }, 4000);
  };

  const cerrarAlerta = () => {
    setAlerta({ mostrar: false, mensaje: '', tipo: '' });
  };

  const handleImagenPress = () => {
    setMostrarBotones(!mostrarBotones);
    setMostrarClases(false);
  };

  const handleAgregarActividad = () => {
    setMostrarClases(true);
  };

  const handleSeleccionClase = async (claseId) => {
    try {
      const clase = clases.find(c => c.id === claseId);
      if (!clase) {
        mostrarAlerta('No se encontró la clase seleccionada', 'error');
        return;
      }

      const nuevasActividades = [...clase.actividades, actividadSeleccionada];

      await updateDoc(doc(db, 'clases', claseId), {
        actividades: nuevasActividades,
      });

      setClases(prev =>
        prev.map(c =>
          c.id === claseId ? { ...c, actividades: nuevasActividades } : c
        )
      );

      mostrarAlerta(`✅ Actividad asignada a: ${clase.nombreClase || clase.nombre}`);
      setMostrarClases(false);

    } catch (error) {
      console.error('Error al asignar actividad:', error);
      mostrarAlerta('❌ Error al asignar la actividad', 'error');
    }
  };

  return (
    <div className={styles.actividadContainer}>
      {/* Alerta personalizada */}
      {alerta.mostrar && (
        <div className={`${styles.alerta} ${styles[`alerta-${alerta.tipo}`]}`}>
          <span className={styles.alertaMensaje}>{alerta.mensaje}</span>
          <button className={styles.alertaCerrar} onClick={cerrarAlerta}>
            ×
          </button>
        </div>
      )}

      <button 
        className={styles.imagenButton} 
        onClick={handleImagenPress}
      >
        <img 
          src={actividadImage} 
          alt="Actividad Matemáticas" 
          className={styles.actividadImage}
        />
      </button>

      {mostrarBotones && (
        <div className={styles.botonesContainer}>
          <button className={styles.boton} onClick={handleAgregarActividad}>
            <span className={styles.botonText}>Agregar actividad</span>
          </button>
          <button
            className={styles.boton}
            onClick={() => navigate(`/${actividadSeleccionada.toLowerCase().replace(/\s+/g, '-')}`)}
          >
            <span className={styles.botonText}>Probar actividad</span>
          </button>
        </div>
      )}

      {/* Modal de selección de clases */}
      {mostrarClases && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContent}>
            <button
              className={styles.closeButton}
              onClick={() => setMostrarClases(false)}
            >
              <span className={styles.closeButtonText}>❌</span>
            </button>
            <h3 className={styles.modalTitulo}>Seleccionar Clase</h3>
            <div className={styles.clasesList}>
              {clases.length > 0 ? (
                clases.map((item) => (
                  <button
                    key={item.id}
                    className={styles.claseItem}
                    onClick={() => handleSeleccionClase(item.id)}
                  >
                    <span>{item.nombreClase || item.nombre}</span>
                  </button>
                ))
              ) : (
                <p className={styles.sinClases}>No hay clases disponibles</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ListaActividades;