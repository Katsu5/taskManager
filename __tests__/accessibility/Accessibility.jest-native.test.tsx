import React from 'react';
import { render, screen } from '@testing-library/react-native';
import { TaskCard } from '../../src/components/TaskCard';
import { ConfirmDeleteDialog } from '../../src/components/ConfirmDeleteDialog';
import { TaskForm } from '../../src/components/TaskForm';

// QA: estas pruebas verifican PROPIEDADES ACCESIBLES de los componentes usando
// matchers de jest-native (@testing-library/jest-native). A diferencia de las
// consultas accesibles (getByLabelText/getByRole), aquí se afirma el VALOR de
// la propiedad, por lo que si alguien borra un accessibilityLabel o role el
// test falla explícitamente.

const mockTask = {
  id: '1',
  title: 'Estudiar accesibilidad',
  status: 'pending' as const,
};

describe('TaskCard - propiedades accesibles (jest-native)', () => {
  it('el botón de eliminar expone un accessibilityLabel descriptivo', async () => {
    await render(<TaskCard task={mockTask} onDelete={jest.fn()} />);

    const deleteBtn = screen.getByLabelText('Eliminar tarea Estudiar accesibilidad');
    // toHaveProp verifica el valor exacto de la prop accesible en el elemento.
    expect(deleteBtn).toHaveProp('accessibilityLabel', 'Eliminar tarea Estudiar accesibilidad');
    expect(deleteBtn).toHaveProp('accessibilityRole', 'button');
    // toBeOnTheScreen confirma que el elemento está realmente montado en la UI.
    expect(deleteBtn).toBeOnTheScreen();
  });

  it('el botón de alternar estado expone un label que describe la acción', async () => {
    await render(<TaskCard task={mockTask} onDelete={jest.fn()} />);

    // Como la tarea está 'pending', el botón debe anunciar "marcar como completada".
    const toggleBtn = screen.getByLabelText(
      'Marcar tarea Estudiar accesibilidad como completada'
    );
    expect(toggleBtn).toHaveProp(
      'accessibilityLabel',
      'Marcar tarea Estudiar accesibilidad como completada'
    );
  });

  it('muestra el estado textual de la tarea (feedback para lector de pantalla)', async () => {
    await render(<TaskCard task={mockTask} onDelete={jest.fn()} />);
    // toHaveTextContent acepta regex: buscamos que el texto contenga la palabra
    // clave del estado, no solo que coincida carácter a carácter.
    expect(screen.getByText('○ Pendiente')).toHaveTextContent(/Pendiente/);
    expect(screen.getByText('○ Pendiente')).toBeOnTheScreen();
  });
});

describe('ConfirmDeleteDialog - propiedades accesibles (jest-native)', () => {
  it('el botón de confirmar tiene rol y label accesibles', async () => {
    await render(
      <ConfirmDeleteDialog visible taskTitle="Estudiar" onConfirm={jest.fn()} onCancel={jest.fn()} />
    );

    const confirmBtn = screen.getByLabelText('Confirmar eliminación');
    expect(confirmBtn).toHaveProp('accessibilityRole', 'button');
    expect(confirmBtn).toHaveProp('accessibilityLabel', 'Confirmar eliminación');
    expect(confirmBtn).toBeOnTheScreen();
  });

  it('el botón de cancelar es accesible y está presente', async () => {
    await render(
      <ConfirmDeleteDialog visible taskTitle="Estudiar" onConfirm={jest.fn()} onCancel={jest.fn()} />
    );

    const cancelBtn = screen.getByLabelText('Cancelar');
    expect(cancelBtn).toHaveProp('accessibilityRole', 'button');
    expect(cancelBtn).toBeOnTheScreen();
  });
});

describe('TaskForm - propiedades accesibles (jest-native)', () => {
  it('el campo de texto tiene un accessibilityLabel que lo identifica', async () => {
    await render(<TaskForm onSubmit={jest.fn()} />);

    const input = screen.getByLabelText('Título de la tarea');
    expect(input).toHaveProp('accessibilityLabel', 'Título de la tarea');
    expect(input).toBeOnTheScreen();
  });

  it('el botón de guardar tiene rol de botón accesible', async () => {
    await render(<TaskForm onSubmit={jest.fn()} />);
    expect(screen.getByRole('button')).toHaveProp('accessibilityRole', 'button');
  });
});
