import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { http, HttpResponse } from 'msw';
import { server } from '../../src/mocks/server';
import { CreateTaskScreen } from '../../src/screens/CreateTaskScreen';

const API_URL = 'https://api.taskmanager.com';

const metrics = {
  frame: { x: 0, y: 0, width: 390, height: 844 },
  insets: { top: 47, left: 0, right: 0, bottom: 34 },
};

// QA: renderizamos la pantalla COMPLETA (con sus hooks, formulario y lista).
// No mockeamos el hook ni el componente: solo la capa HTTP mediante MSW, de
// forma que la interacción entre componentes y estado es real. Esta es la
// diferencia clave frente a un test unitario.
const renderScreen = () =>
  render(
    <SafeAreaProvider initialMetrics={metrics}>
      <CreateTaskScreen />
    </SafeAreaProvider>
  );

describe('CreateTaskScreen - Integración con MSW', () => {
  // Escenario 1: ÉXITO -----------------------------------------------------
  // La API responde 201 con la tarea creada (handler por defecto de MSW).
  // Se valida el flujo completo: formulario -> petición POST -> respuesta ->
  // banner de éxito + la tarea aparece en la lista.
  it('crea la tarea y la muestra en la lista (flujo de éxito)', async () => {
    await renderScreen();

    await fireEvent.changeText(
      screen.getByPlaceholderText('Escribe el título de la tarea'),
      'Estudiar pruebas de integración'
    );
    await fireEvent.press(screen.getByText('Guardar'));

    // La UI se actualiza con la respuesta simulada.
    await waitFor(() => {
      expect(screen.getByText('Tarea creada exitosamente')).toBeTruthy();
    });
    expect(screen.getByText('1 tarea')).toBeTruthy();
    expect(screen.getByText('Estudiar pruebas de integración')).toBeTruthy();
  });

  // Escenario 2: ERROR DE API ----------------------------------------------
  // Se sobreescribe el handler de MSW para que POST /tasks responda 500.
  // El hook debe pasar a estado error y la pantalla mostrarlo sin romperse,
  // y la lista NO debe contener la tarea (la petición nunca tuvo éxito).
  it('muestra error cuando la API falla y no agrega la tarea', async () => {
    server.use(
      http.post(`${API_URL}/tasks`, () => new HttpResponse(null, { status: 500 }))
    );
    await renderScreen();

    await fireEvent.changeText(
      screen.getByPlaceholderText('Escribe el título de la tarea'),
      'Tarea que no se guarda'
    );
    await fireEvent.press(screen.getByText('Guardar'));

    await waitFor(() => {
      expect(screen.getByText('Error al crear la tarea')).toBeTruthy();
    });
    // La tarea fallida no debe aparecer en la lista.
    expect(screen.queryByText('Tarea que no se guarda')).toBeNull();
    expect(screen.queryByText('Tarea creada exitosamente')).toBeNull();
  });

  // Escenario 3: DATOS VACÍOS ----------------------------------------------
  // MSW responde GET /tasks con una lista vacía. La pantalla debe mostrar el
  // estado vacío ("No hay tareas aún") en lugar de romperse.
  it('muestra el estado vacío cuando la API devuelve una lista vacía', async () => {
    server.use(http.get(`${API_URL}/tasks`, () => HttpResponse.json([])));
    await renderScreen();

    await waitFor(() => {
      expect(screen.getByText('No hay tareas aún')).toBeTruthy();
    });
  });

  // Escenario 4 (reforzado): LISTA INICIAL DESDE LA API --------------------
  // MSW responde GET /tasks con datos existentes. Al montar la pantalla esos
  // datos deben renderizarse en la lista, validando la carga inicial real.
  it('carga y muestra la lista inicial devuelta por la API', async () => {
    server.use(
      http.get(`${API_URL}/tasks`, () =>
        HttpResponse.json([
          { id: '1', title: 'Comprar leche', status: 'pending' },
          { id: '2', title: 'Estudiar React Native', status: 'completed' },
        ])
      )
    );
    await renderScreen();

    await waitFor(() => {
      expect(screen.getByText('2 tareas')).toBeTruthy();
    });
    expect(screen.getByText('Comprar leche')).toBeTruthy();
    expect(screen.getByText('Estudiar React Native')).toBeTruthy();
  });
});
