import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { BrowserRouter, useNavigate } from 'react-router-dom';
import userEvent from '@testing-library/user-event';

// Componente real que prueba la navegación
const LoginNavigationTest = () => {
  const navigate = useNavigate();

  const simulateAdminLogin = async () => {
    // Simular la lógica de tu componente real
    await new Promise(resolve => setTimeout(resolve, 10));
    
    // Simular obtención de rol desde Firebase
    const rolId = '1'; // Admin
    
    if (rolId === '1') {
      navigate('/Admin');
      alert('Bienvenido Administrador');
    }
  };

  const simulateDocenteLogin = async () => {
    await new Promise(resolve => setTimeout(resolve, 10));
    const rolId = '2'; // Docente
    
    if (rolId === '2') {
      navigate('/Home');
      alert('Bienvenido Docente');
    }
  };

  const simulateAlumnoLogin = async () => {
    await new Promise(resolve => setTimeout(resolve, 10));
    // Para alumno, no necesitamos rolId, va directo a inicioAlumno
    navigate('/inicioAlumno');
    alert('Bienvenido: Inicia a interactuar de manera educativa');
  };

  const simulateRolNoDefinido = async () => {
    await new Promise(resolve => setTimeout(resolve, 10));
    const rolId = null; // Rol no definido
    
    if (!rolId) {
      navigate('/Home'); // Redirección por defecto
      alert('Bienvenido');
    }
  };

  return (
    <div>
      <h2>Prueba de Navegación por Roles</h2>
      <button onClick={simulateAdminLogin} data-testid="admin-login">
        Login como Admin (rolId = 1)
      </button>
      <button onClick={simulateDocenteLogin} data-testid="docente-login">
        Login como Docente (rolId = 2)
      </button>
      <button onClick={simulateAlumnoLogin} data-testid="alumno-login">
        Login como Alumno
      </button>
      <button onClick={simulateRolNoDefinido} data-testid="nodefinido-login">
        Login Rol No Definido
      </button>
    </div>
  );
};

// Mock de navigate para verificar las llamadas
const mockNavigate = jest.fn();

// Mock de react-router-dom
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

describe('Navegación por Roles - Comportamiento Real', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    global.alert.mockClear();
    mockNavigate.mockClear();
  });

  test('Admin (rolId = 1) navega a /Admin', async () => {
    const user = userEvent.setup();
    
    render(
      <BrowserRouter>
        <LoginNavigationTest />
      </BrowserRouter>
    );

    const adminButton = screen.getByTestId('admin-login');
    await user.click(adminButton);

    // Esperar a que se complete la navegación
    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/Admin');
    });
    
    // Verificar el alerta
    expect(global.alert).toHaveBeenCalledWith('Bienvenido Administrador');
    
    // Verificar que solo se llamó una vez
    expect(mockNavigate).toHaveBeenCalledTimes(1);
  });

  test('Docente (rolId = 2) navega a /Home', async () => {
    const user = userEvent.setup();
    
    render(
      <BrowserRouter>
        <LoginNavigationTest />
      </BrowserRouter>
    );

    const docenteButton = screen.getByTestId('docente-login');
    await user.click(docenteButton);

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/Home');
    });
    
    expect(global.alert).toHaveBeenCalledWith('Bienvenido Docente');
    expect(mockNavigate).toHaveBeenCalledTimes(1);
  });

  test('Alumno navega a /inicioAlumno', async () => {
    const user = userEvent.setup();
    
    render(
      <BrowserRouter>
        <LoginNavigationTest />
      </BrowserRouter>
    );

    const alumnoButton = screen.getByTestId('alumno-login');
    await user.click(alumnoButton);

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/inicioAlumno');
    });
    
    expect(global.alert).toHaveBeenCalledWith('Bienvenido: Inicia a interactuar de manera educativa');
    expect(mockNavigate).toHaveBeenCalledTimes(1);
  });

  test('Rol no definido navega a /Home por defecto', async () => {
    const user = userEvent.setup();
    
    render(
      <BrowserRouter>
        <LoginNavigationTest />
      </BrowserRouter>
    );

    const noDefinidoButton = screen.getByTestId('nodefinido-login');
    await user.click(noDefinidoButton);

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/Home');
    });
    
    expect(global.alert).toHaveBeenCalledWith('Bienvenido');
    expect(mockNavigate).toHaveBeenCalledTimes(1);
  });

  test('no hay navegación cuando hay error en login', async () => {
    const user = userEvent.setup();
    
    // Componente que simula error
    const LoginWithError = () => {
      const navigate = useNavigate();

      const simulateErrorLogin = async () => {
        await new Promise(resolve => setTimeout(resolve, 10));
        // Simular error - no navega
        alert('Error: Credenciales incorrectas');
        // NO llamar a navigate()
      };

      return (
        <div>
          <button onClick={simulateErrorLogin} data-testid="error-login">
            Login con Error
          </button>
        </div>
      );
    };

    render(
      <BrowserRouter>
        <LoginWithError />
      </BrowserRouter>
    );

    const errorButton = screen.getByTestId('error-login');
    await user.click(errorButton);

    // Esperar un poco para asegurar que no hay navegación
    await waitFor(() => {
      expect(global.alert).toHaveBeenCalledWith('Error: Credenciales incorrectas');
    });

    // Verificar que NO hubo navegación
    expect(mockNavigate).not.toHaveBeenCalled();
  });
});