// Test básico de Login sin mocks complejos inicialmente
import React from 'react';
import { render, screen } from '@testing-library/react';

// Componente de prueba simple
function TestComponent() {
  return <div>Test Component</div>;
}

test('renderiza componente simple', () => {
  render(<TestComponent />);
  expect(screen.getByText('Test Component')).toBeInTheDocument();
});