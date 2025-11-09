//import React from 'react';
//import { useState } from 'react-router-dom';
import '../styles/inicio.css';
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
      <div className="container">
        <img src={Ari} alt="Fondo superior" className="imagen1" />

        <div className="centered">
          <div className="lg1C">
            <img src={Logo} alt="Logo" className="lg1" />
          </div>
          <h1 className="tex">EduKid's</h1>
        </div>
    
          <button className="button" onClick={() => navigate('/login')} >
            Acceder
          </button>
       

        <img src={Aba} alt="Fondo inferior" className="imagen2" />
      </div>
    </>
  );
}

export default Inicio

