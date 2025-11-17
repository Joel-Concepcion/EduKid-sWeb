import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { getFirestore, collection, addDoc, doc, getDoc, updateDoc, query, where, getDocs } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import appFirebase from "../../model/db";
import styles from '../../styles/clase/crearClase.module.css';

const db = getFirestore(appFirebase);
const auth = getAuth();

const bannerNombres = [
    'Rectangle18.png',
    'Rectangle19.png',
    'Rectangle20.png',
    'Rectangle21.png',
    'Rectangle22.png',
];

function CrearClase() {
    const navigate = useNavigate();
    const [nombreClase, setNombreClase] = useState("");
    const [aula, setAula] = useState("");
    const [creando, setCreando] = useState(false);
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

    // Generador de código tipo Classroom
    const generarCodigoClase = () => {
        const caracteres = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        let codigo = '';
        for (let i = 0; i < 6; i++) {
            const indice = Math.floor(Math.random() * caracteres.length);
            codigo += caracteres[indice];
        }
        return codigo;
    };

    // Verifica si el código ya existe
    const existeCodigoClase = async (codigo) => {
        const clasesRef = collection(db, "clases");
        const consulta = query(clasesRef, where("codigoClase", "==", codigo));
        const resultado = await getDocs(consulta);
        return !resultado.empty;
    };

    const crearClaseEnFirestore = async () => {
        if (creando) return;
        
        if (!nombreClase || !aula) {
            mostrarAlerta("Por favor completa todos los campos", "error");
            return;
        }

        const usuarioActual = auth.currentUser;
        if (!usuarioActual) {
            mostrarAlerta("No hay usuario autenticado", "error");
            navigate("/login");
            return;
        }

        const bannerSeleccionado = bannerNombres[Math.floor(Math.random() * bannerNombres.length)];

        try {
            setCreando(true);

            // Obtener contador
            const contadorRef = doc(db, "metadata", "contadorClases");
            const contadorSnap = await getDoc(contadorRef);

            let nuevoId = 1;
            if (contadorSnap.exists()) {
                const data = contadorSnap.data();
                nuevoId = data.ultimoId + 1;
            }

            // Generar código único
            let codigoClase;
            do {
                codigoClase = generarCodigoClase();
            } while (await existeCodigoClase(codigoClase));

            // Registrar clase
            await addDoc(collection(db, "clases"), {
                idClase: nuevoId,
                codigoClase,
                nombreClase,
                aula,
                banner: bannerSeleccionado,
                creadoEn: new Date(),
                docenteId: usuarioActual.uid,
                docenteNombre: usuarioActual.displayName || "Sin nombre"
            });

            // Actualizar contador
            await updateDoc(contadorRef, {
                ultimoId: nuevoId
            });

            mostrarAlerta(`Clase creada con éxito. Código de clase: ${codigoClase}`);
            
            // Limpiar formulario
            setNombreClase("");
            setAula("");
            
            // Redirigir después de un breve delay
            setTimeout(() => {
                navigate(-1);
            }, 2000);
            
        } catch (error) {
            console.error("Error al crear la clase:", error);
            mostrarAlerta("Hubo un error al crear la clase", "error");
        } finally {
            setCreando(false);
        }
    };

    return (
        <div className={styles.container}>
            {/* Alerta personalizada */}
            {alerta.mostrar && (
                <div className={`${styles.alerta} ${styles[`alerta-${alerta.tipo}`]}`}>
                    <span className={styles.alertaMensaje}>{alerta.mensaje}</span>
                    <button className={styles.alertaCerrar} onClick={cerrarAlerta}>
                        ×
                    </button>
                </div>
            )}

            <input
                className={styles.inputNombreClase}
                type="text"
                value={nombreClase}
                onChange={(e) => setNombreClase(e.target.value)}
                placeholder="Ingresa el nombre de la clase"
            />
           
            <div className={`${styles.text} ${styles.aulaText}`}>
                Aula
            </div>
            <input
                className={styles.inputNombreAula}
                type="text"
                value={aula}
                onChange={(e) => setAula(e.target.value)}
                placeholder="Ingresa el aula"
            />

            <button 
                className={styles.btCrear} 
                onClick={crearClaseEnFirestore}
                disabled={creando}
            >
                <div className={styles.buttonText}>
                    {creando ? 'Creando...' : 'Crear'}
                </div>
            </button>
        </div>
    );
}

export default CrearClase;