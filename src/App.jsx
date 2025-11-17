import { BrowserRouter, Route, Router, Routes } from 'react-router-dom'
//import './App.css'
import Login from "./view/login/login";
import Inicio from './view/inicio';
import Home from './view/home';
import CrearClase from './view/clase/crearclase';
import IA from './view/IA/ia';
import Clase  from './view/clase/clase';
import Admin from './view/admin/admin';
import ManejoDeNavegacion from './view/manejoDeNavegacion';
//import Registro from '../registro';


function App() {
  //const [count, setCount] = useState(0)

  return (
    <Routes>
      <Route path="/" element={<Inicio />} />
      <Route path="/login" element={<Login />} />
      <Route path="/home" element={<Home />} />
      <Route path="/crear-clase" element={<CrearClase />} />
      <Route path="/ia" element={<IA />} />
      <Route path="/clase/:id" element={<Clase />} />
      <Route path="/admin" element={<Admin />} />
      {/*<Route path="/manejo-de-navegacion" element={<ManejoDeNavegacion />} />*/}
      <Route path="/" element={<ManejoDeNavegacion />} />
    </Routes>
  );
}

export default App

{/*
  import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
      <div>
        <a href="https://vite.dev" target="_blank">
          <img src={viteLogo} className="logo" alt="Vite logo" />
        </a>
        <a href="https://react.dev" target="_blank">
          <img src={reactLogo} className="logo react" alt="React logo" />
        </a>
      </div>
      <h1>Vite + React</h1>
      <div className="card">
        <button onClick={() => setCount((count) => count + 1)}>
          count is {count}
        </button>
        <p>
          Edit <code>src/App.jsx</code> and save to test HMR
        </p>
      </div>
      <p className="read-the-docs">
        Click on the Vite and React logos to learn more
      </p>
    </>
  )
}

export default App
*/}
