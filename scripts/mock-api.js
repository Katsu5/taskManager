// QA: servidor API falso para el flujo E2E en un dispositivo real.
// Sustituye al backend inexistente: la app apunta a http://127.0.0.1:8082
// (vía EXPO_PUBLIC_API_URL + `adb reverse tcp:8082 tcp:8082`) y este servidor
// responde GET/POST /tasks como lo haría la API real.
//
// Uso:
//   node scripts/mock-api.js
//   adb reverse tcp:8082 tcp:8082
//   (reiniciar Metro con EXPO_PUBLIC_API_URL=http://127.0.0.1:8082)
const http = require('http');

const PORT = 8082;
let tasks = [];

const server = http.createServer((req, res) => {
  const send = (status, body) => {
    res.writeHead(status, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(body));
  };

  if (req.method === 'GET' && req.url === '/tasks') {
    return send(200, tasks);
  }

  if (req.method === 'POST' && req.url === '/tasks') {
    let body = '';
    req.on('data', (chunk) => (body += chunk));
    req.on('end', () => {
      try {
        const { title } = JSON.parse(body || '{}');
        const task = { id: String(tasks.length + 1), title, status: 'pending' };
        tasks.push(task);
        return send(201, task);
      } catch {
        return send(400, { error: 'JSON inválido' });
      }
    });
    return;
  }

  send(404, { error: 'Not found' });
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`Mock API escuchando en http://0.0.0.0:${PORT}`);
});
