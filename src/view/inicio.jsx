//import React from 'react';
//import { useState } from 'react-router-dom';
import styles  from '../styles/inicio.module.css';
import '@fontsource/kavoon';
import Ari from '../assets/fondo/ari.png';
import Aba from '../assets/fondo/aba.png';
import Logo from '../assets/logo/Logo.png';
import { useNavigate } from 'react-router-dom';



function Inicio() {
  //const [count, setCount] = useState(0)
  const navigate = useNavigate();

  return (
    <>
      <div className={styles.container}>
        <img src={Ari} alt="Fondo superior" className={styles.imagen1} />

        <div className={styles.centered}>
          <div className={styles.lg1C}>
            <img src={Logo} alt="Logo" className={styles.lg1} />
          </div>
          <h1 className={styles.tex}>EduKid's</h1>
        </div>

          <button className={styles.button} onClick={() => navigate('/login')} >
            Acceder
          </button>
       

        <img src={Aba} alt="Fondo inferior" className={styles.imagen2} />
      </div>
    </>
  );
}

export default Inicio

