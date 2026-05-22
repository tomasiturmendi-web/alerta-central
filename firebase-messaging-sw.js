// firebase-messaging-sw.js
importScripts('https://www.gstatic.com/firebasejs/8.10.1/firebase-app.js');
importScripts('https://www.gstatic.com/firebasejs/8.10.1/firebase-messaging.js');

const firebaseConfig = {
  apiKey: "AIzaSyB7z5w4fgNw1QTV-Cx37j-m8r8I94J1Vuk",
  authDomain: "alertacentral-9ba4f.firebaseapp.com",
  projectId: "alertacentral-9ba4f",
  storageBucket: "alertacentral-9ba4f.firebasestorage.app",
  messagingSenderId: "770130153303",
  appId: "1:770130153303:web:ade358f215f5a7c46f3812"
};

firebase.initializeApp(firebaseConfig);
const messaging = firebase.messaging();

// Captura la señal con el celular bloqueado o navegador cerrado
messaging.onBackgroundMessage((payload) => {
  console.log('Alerta recibida en segundo plano: ', payload);

  // Intentamos leer de 'notification' (Consola) o de 'data' (API/Botón de control)
  const titulo = payload.notification?.title || payload.data?.title || "EMERGENCIA DE PLANTA";
  const cuerpo = payload.notification?.body || payload.data?.body || "¡EVACUACIÓN INMEDIATA!";
  
  const latPlanta = payload.data?.lat ? parseFloat(payload.data.lat) : null;
  const lonPlanta = payload.data?.lon ? parseFloat(payload.data.lon) : null;

  const opcionesNotificacion = {
    body: cuerpo,
    icon: "https://cdn-icons-png.flaticon.com/512/595/595067.png", 
    vibrate: [500, 300, 500, 300, 500, 300, 1000], // Patrón de vibración prolongado
    tag: 'alerta-evacuacion',
    renotify: true,
    requireInteraction: true, // No desaparece hasta que el usuario la descarte o toque
    data: {
      url: "/", // Volver al inicio para pintar la pantalla de rojo
      latPlanta: latPlanta,
      lonPlanta: lonPlanta
    }
  };

  return self.registration.showNotification(titulo, opcionesNotificacion);
});

// NUEVO: Este evento detecta cuando el operario toca la notificación flotante
self.addEventListener('notificationclick', (event) => {
  event.notification.close(); // Elimina el banner de la pantalla

  // Buscamos si la web ya estaba abierta en alguna pestaña del celular
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windowClients) => {
      // Si la pestaña ya existía, la trae al frente (focus)
      for (let i = 0; i < windowClients.length; i++) {
        let client = windowClients[i];
        if (client.url.includes(event.notification.data.url) && 'focus' in client) {
          return client.focus();
        }
      }
      // Si el navegador estaba cerrado por completo, abre una pestaña nueva con tu App
      if (clients.openWindow) {
        return clients.openWindow(event.notification.data.url);
      }
    })
  );
});
