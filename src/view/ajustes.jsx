// components/AjustesPerfil.js
import React, { useState, useEffect } from 'react';
import { getAuth, signOut } from 'firebase/auth';
import { getFirestore, doc, getDoc, setDoc } from 'firebase/firestore';
import appFirebase from '../model/db';
import styles from '../styles/home/home.module.css';

const db = getFirestore(appFirebase);
const auth = getAuth();

const AjustesPerfil = () => {
    const [userData, setUserData] = useState(null);
    const [editField, setEditField] = useState('');
    const [editValue, setEditValue] = useState('');
    const [showEditModal, setShowEditModal] = useState(false);
    const [showConfirmLogout, setShowConfirmLogout] = useState(false);
    const [profileImage, setProfileImage] = useState(null);
    const [alerta, setAlerta] = useState({ mostrar: false, mensaje: '', tipo: '' });

    useEffect(() => {
        loadUserData();
    }, []);

    const mostrarAlerta = (mensaje, tipo = 'success') => {
        setAlerta({ mostrar: true, mensaje, tipo });
        
        setTimeout(() => {
            setAlerta({ mostrar: false, mensaje: '', tipo: '' });
        }, 4000);
    };

    const cerrarAlerta = () => {
        setAlerta({ mostrar: false, mensaje: '', tipo: '' });
    };

    const loadUserData = async () => {
        const user = auth.currentUser;
        if (user) {
            try {
                const userRef = doc(db, "users", user.uid);
                const userDoc = await getDoc(userRef);

                if (userDoc.exists()) {
                    const data = userDoc.data();
                    setUserData(data);
                    setProfileImage(data.profileImage || "https://randomuser.me/api/portraits/women/44.jpg");
                } else {
                    const defaultData = {
                        nombre: user.displayName || "Usuario",
                        email: user.email,
                        id: user.uid.substring(0, 8),
                        nivelEducativo: "Preescolar",
                        enfoquePedagogico: "Montessori",
                        horario: "Lun-Vie 08:00-12:00",
                        profileImage: "https://randomuser.me/api/portraits/women/44.jpg"
                    };
                    await setDoc(userRef, defaultData);
                    setUserData(defaultData);
                    setProfileImage(defaultData.profileImage);
                }
            } catch (error) {
                console.error("Error cargando datos:", error);
                mostrarAlerta('Error cargando los datos del usuario', 'error');
            }
        }
    };

    const handleImageUpload = (event) => {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = async (e) => {
                const base64Image = e.target.result;
                setProfileImage(base64Image);

                try {
                    const user = auth.currentUser;
                    if (user) {
                        const userRef = doc(db, "users", user.uid);
                        await setDoc(userRef, { profileImage: base64Image }, { merge: true });
                        mostrarAlerta('Foto de perfil actualizada correctamente');
                    }
                } catch (error) {
                    console.error("Error actualizando imagen:", error);
                    mostrarAlerta('Error al actualizar la foto de perfil', 'error');
                }
            };
            reader.readAsDataURL(file);
        }
    };

    const triggerFileInput = () => {
        document.getElementById('fileInput').click();
    };

    const openEditModal = (field, value) => {
        setEditField(field);
        setEditValue(value);
        setShowEditModal(true);
    };

    const saveEdit = async () => {
        if (!userData || !editValue.trim()) {
            mostrarAlerta('Por favor, ingresa un valor válido', 'error');
            return;
        }

        try {
            const user = auth.currentUser;
            const userRef = doc(db, "users", user.uid);
            const updates = { [editField]: editValue };

            await setDoc(userRef, updates, { merge: true });
            setUserData({ ...userData, ...updates });
            setShowEditModal(false);
            mostrarAlerta('Información actualizada correctamente');
        } catch (error) {
            console.error("Error actualizando datos:", error);
            mostrarAlerta('No se pudo actualizar la información', 'error');
        }
    };

    const handleLogout = async () => {
        try {
            await signOut(auth);
            window.location.href = '/login';
        } catch (error) {
            console.error("Error cerrando sesión:", error);
            mostrarAlerta('No se pudo cerrar sesión', 'error');
        }
    };

    const confirmLogout = () => {
        setShowConfirmLogout(true);
    };

    const cancelLogout = () => {
        setShowConfirmLogout(false);
    };

    if (!userData) {
        return <div className={styles.loading}>Cargando...</div>;
    }

    return (
        <div className={styles.ajustesContent}>
            {/* Alerta personalizada */}
            {alerta.mostrar && (
                <div className={`${styles.alerta} ${styles[`alerta-${alerta.tipo}`]}`}>
                    <span className={styles.alertaMensaje}>{alerta.mensaje}</span>
                    <button className={styles.alertaCerrar} onClick={cerrarAlerta}>
                        ×
                    </button>
                </div>
            )}

            {/* Input oculto para subir archivos */}
            <input
                id="fileInput"
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                style={{ display: 'none' }}
            />

            {/* Perfil del Docente */}
            <div className={styles.settingGroup}>
                <h3 className={styles.texto1}>Perfil del Docente</h3>
                <div className={styles.profileHeader}>
                    <div className={styles.avatarContainer}>
                        <img 
                            src={profileImage} 
                            alt="Avatar" 
                            className={styles.avatar}
                        />
                        <button 
                            className={styles.changePhotoBtn}
                            onClick={triggerFileInput}
                        >
                            Cambiar foto
                        </button>
                    </div>
                    <div className={styles.profileInfo}>
                        <p><strong className={styles.texto1}>Nombre:</strong> {userData.nombre}</p>
                        <p><strong className={styles.texto1}>ID:</strong> {userData.id}</p>
                        <p><strong className={styles.texto1}>Email:</strong> {userData.email}</p>
                    </div>
                </div>
            </div>

            {/* Configuración Personal */}
            <div className={styles.settingGroup}>
                <h3 className={styles.texto1}>Configuración Personal</h3>
                <div className={styles.configItem}>
                    <span className={styles.texto1}>Nivel educativo: {userData.nivelEducativo}</span>
                    <button 
                        className={styles.editBtn}
                        onClick={() => openEditModal('nivelEducativo', userData.nivelEducativo)}
                    >
                        Editar
                    </button>
                </div>
                <div className={styles.configItem}>
                    <span className={styles.texto1}>Enfoque pedagógico: {userData.enfoquePedagogico}</span>
                    <button 
                        className={styles.editBtn}
                        onClick={() => openEditModal('enfoquePedagogico', userData.enfoquePedagogico)}
                    >
                        Editar
                    </button>
                </div>
                <div className={styles.configItem}>
                    <span className={styles.texto1}>Horario disponible: {userData.horario}</span>
                    <button 
                        className={styles.editBtn}
                        onClick={() => openEditModal('horario', userData.horario)}
                    >
                        Editar
                    </button>
                </div>
            </div>

            {/* Cerrar Sesión */}
            <div className={styles.settingGroup}>
                <button className={styles.logoutButton} onClick={confirmLogout}>
                    Cerrar Sesión
                </button>
            </div>

            {/* Modal de Edición */}
            {showEditModal && (
                <div className={styles.modalOverlay}>
                    <div className={styles.modalContent}>
                        <h3>Editar {editField === 'nivelEducativo' ? 'Nivel Educativo' : 
                                  editField === 'enfoquePedagogico' ? 'Enfoque Pedagógico' : 
                                  'Horario Disponible'}</h3>
                        <textarea
                            value={editValue}
                            onChange={(e) => setEditValue(e.target.value)}
                            className={styles.modalInput}
                            rows={editField === 'horario' ? 3 : 1}
                            placeholder={`Ingrese ${editField === 'nivelEducativo' ? 'el nivel educativo' :
                                        editField === 'enfoquePedagogico' ? 'el enfoque pedagógico' :
                                        'el horario disponible'}`}
                        />
                        <div className={styles.modalButtons}>
                            <button 
                                className={styles.cancelBtn}
                                onClick={() => setShowEditModal(false)}
                            >
                                Cancelar
                            </button>
                            <button 
                                className={styles.saveBtn}
                                onClick={saveEdit}
                            >
                                Guardar
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal de confirmación de cierre de sesión */}
            {showConfirmLogout && (
                <div className={styles.modalOverlay}>
                    <div className={styles.confirmModal}>
                        <div className={styles.confirmHeader}>
                            <h3 className={styles.confirmTitle}>Cerrar Sesión</h3>
                        </div>
                        <div className={styles.confirmBody}>
                            <p>¿Estás seguro de que quieres cerrar sesión?</p>
                        </div>
                        <div className={styles.confirmActions}>
                            <button 
                                className={styles.confirmCancel}
                                onClick={cancelLogout}
                            >
                                Cancelar
                            </button>
                            <button 
                                className={styles.confirmAccept}
                                onClick={handleLogout}
                            >
                                Sí, Cerrar Sesión
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AjustesPerfil;