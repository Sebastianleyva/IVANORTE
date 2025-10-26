Banorte SmartGov — Prototype (Static SPA)
Prototipo estático de un panel financiero municipal y flujo de pagos ciudadanos. Es una SPA ligera para prototipado UI/UX — sin backend ni procesamiento real de pagos. No es seguro para producción.

Resumen
Interfaz para roles de dependencia (agua, energía, transporte, obras, tesorería, transparencia).
Vista de ciudadano para pagar servicios y ver historial (simulado).
Gráficas con Chart.js, almacenamiento simulado en localStorage.
Login de prueba con control para mostrar/ocultar contraseña (icono de ojo).
Archivos importantes
index.html — entrada principal.
app.js — lógica de la aplicación (vistas, login, pagos, charts).
styles.css — estilos del UI.
eye_visible_hide_hidden_show_icon_145988.png — icono ojo abierto (login).
eye_slash_visible_hide_hidden_show_icon_145987.png — icono ojo cerrado (login).
Logo.png — logo.
Usuarios de prueba
Puedes iniciar sesión con cualquiera de estos usuarios (datos incluidos en app.js):

Usuario: ciudadano — Contraseña: 1234 (entra en la vista ciudadano)
Otros usuarios de departamento: agua, energia, transporte, obras, tesoreria, transparencia — Contraseña: 1234
