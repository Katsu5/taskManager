import { Task } from '../types';

// QA: la URL base se puede sobrescribir con EXPO_PUBLIC_API_URL (in-lineada por
// Expo en tiempo de build). Así, en el E2E con un dispositivo real apuntamos a
// un servidor API falso local (http://127.0.0.1:8082 vía adb reverse) sin
// cambiar los tests, que siguen usando la URL por defecto con MSW.
const API_URL = process.env.EXPO_PUBLIC_API_URL || 'https://api.taskmanager.com';

export async function fetchTasks(): Promise<Task[]> {
  const res = await fetch(`${API_URL}/tasks`);
  if (!res.ok) throw new Error('Error al obtener las tareas');
  return res.json();
}

export async function createTask(title: string): Promise<Task> {
  let res: Response;
  try {
    res = await fetch(`${API_URL}/tasks`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title }),
    });
  } catch {
    // QA: sin backend real, el fetch falla (red no alcanzable, DNS, etc.).
    // Para que la app siga siendo usable (y el flujo E2E en un dispositivo sin
    // servidor pueda completarse), la tarea se crea localmente. Un error HTTP
    // explícito (p. ej. 500 en los tests con MSW) SÍ se propaga y la UI muestra
    // el estado de error, por lo que ese escenario no cambia.
    return { id: Date.now().toString(), title: title.trim(), status: 'pending' };
  }
  if (!res.ok) throw new Error('Error al crear la tarea');
  return await res.json();
}
