import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { getFirestore, collection, addDoc, doc, getDoc, updateDoc, query, where, getDocs } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import appFirebase from "../../model/db";
import '../../styles/clase/crearClase.css';

// Importar imágenes (ajusta las rutas según tu estructura)
import Banner1 from '../../assets/bannerClase/Rectangle 18.png';
import Banner2 from '../../assets/bannerClase/Rectangle 19.png';
import Banner3 from '../../assets/bannerClase/Rectangle 20.png';
import Banner4 from '../../assets/bannerClase/Rectangle 21.png';
import Banner5 from '../../assets/bannerClase/Rectangle 22.png';

const db = getFirestore(appFirebase);
const auth = getAuth();

/*const imagenesClase = [
    '../../assets/bannerClase/Rectangle18.png',
    '../../assets/bannerClase/Rectangle19.png',
    '../../assets/bannerClase/Rectangle20.png',
    '../../assets/bannerClase/Rectangle21.png',
    '../../assets/bannerClase/Rectangle22.png',
];*/

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
        if (!nombreClase || !aula) {
            alert("Por favor completa todos los campos");
            return;
        }

        const usuarioActual = auth.currentUser;
        if (!usuarioActual) {
            alert("No hay usuario autenticado");
            navigate("/login");
            return;
        }

        const bannerSeleccionado = bannerNombres[Math.floor(Math.random() * bannerNombres.length)];

        try {
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

            alert(`Clase creada con éxito. Código de clase: ${codigoClase}`);
            navigate(-1); // Equivalente a navigation.goBack()
        } catch (error) {
            console.error("Error al crear la clase:", error);
            alert("Hubo un error al crear la clase");
        }
    };
    return (
       <div className="container">
            <div className="text nombreClaseText">
                Nombre de la clase
            </div>
            <input
                className="inputNombreClase"
                type="text"
                value={nombreClase}
                onChange={(e) => setNombreClase(e.target.value)}
                placeholder="Ingresa el nombre de la clase"
            />
            <div className="text aulaText">
                Aula
            </div>
            <input
                className="inputNombreAula"
                type="text"
                value={aula}
                onChange={(e) => setAula(e.target.value)}
                placeholder="Ingresa el aula"
            />
            <button className="btCrear" onClick={crearClaseEnFirestore}>
                <div className="buttonText">
                    Crear
                </div>
            </button>
        </div>

    );


}

export default CrearClase;