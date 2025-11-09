import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import '../../styles/clase/clase.css';

// Simular carga de fuentes (en web se manejan via CSS)
const cargarFuentes = () => {
  return new Promise((resolve) => {
    setTimeout(resolve, 100);
  });
};

function Clase() {
  const navigate = useNavigate();
  const location = useLocation();
  const { clase } = location.state || {};

  const [fuentesCargadas, setFuentesCargadas] = useState(false);

  useEffect(() => {
    cargarFuentes().then(() => setFuentesCargadas(true));
  }, []);

  if (!fuentesCargadas || !clase) {
    return (
      <div className="contenedorCarga">
        <div className="spinnerCarga"></div>
        <p>Cargando...</p>
      </div>
    );
  }

  const manejarClickActividad = (actividad) => {
    // Navegar a la actividad específica
    navigate(`/actividad/${actividad}`, { state: { actividad } });
  };

  const manejarVolver = () => {
    navigate(-1); // Volver a la página anterior
  };

  return (
    <div className="contenedor">
      {/* Botón de volver */}
      <button className="botonVolver" onClick={manejarVolver}>
        ← Volver
      </button>

      {/* Encabezado con imagen y nombre del docente */}
      <div className="encabezado">
        <img 
          className="imagenDocente" 
          src="/assets/maestra.jpg" 
          alt="Docente" 
        />
        <div className="textoDocente fuente">
          Profe: {clase.docenteNombre || clase.docenteId || 'Sin nombre'}
        </div>
      </div>

      {/* Código único de la clase */}
      <div className="codigoClase fuente">
        Código: {clase.codigoClase || clase.id}
      </div>

      {/* Actividades asignadas */}
      <div className="tituloActividades fuente">
        Actividades asignadas:
      </div>
      
      <div className="contenedorScrollActividades">
        {clase.actividades && clase.actividades.length > 0 ? (
          clase.actividades.map((actividad, index) => (
            <div
              key={index}
              className="tarjetaActividad"
              onClick={() => manejarClickActividad(actividad)}
            >
              <img
                className="imagenActividad"
                src="/assets/bannerActi/Rectangle-26.png"
                alt={`Actividad ${actividad}`}
              />
              <div className="textoActividad">{actividad}</div>
            </div>
          ))
        ) : (
          <div className="sinActividades fuente">
            No hay actividades asignadas aún.
          </div>
        )}
      </div>
    </div>
  );
}

export default Clase;