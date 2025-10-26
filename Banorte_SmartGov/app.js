// Banorte SmartGov - Full Static SPA with Charts and Citizen Payments

// -- Simulated users including 'ciudadano'
const users = [
  { username: "agua", password: "1234", role: "agua" },
  { username: "energia", password: "1234", role: "energia" },
  { username: "transporte", password: "1234", role: "transporte" },
  { username: "obras", password: "1234", role: "obras" },
  { username: "tesoreria", password: "1234", role: "tesoreria" },
  { username: "transparencia", password: "1234", role: "transparencia" },
  { username: "ciudadano", password: "1234", role: "ciudadano" }
];

const app = document.getElementById('app');


function setHTML(html){ app.innerHTML = html; }

// --- Login
function renderLogin(){
  setHTML(`
    <div class="login-wrap">
      <div class="login-card card">
        <div style="text-align:center;margin-bottom:8px">
          <div class="logo" style="margin:0 auto"><img src="logo.png" ></div>
        </div>
        <h2 class="text-center" style="color:var(--banorte-red);margin-bottom:6px">Banorte SmartGov</h2>
        <p class="text-center small" style="margin-top:0">Plataforma financiera integrada</p>
        <form id="loginForm" style="margin-top:18px">
          <div class="form-group">
            <input id="user" class="input" placeholder="Usuario (ej: agua / ciudadano)" />
          </div>
          <div class="form-group" style="position:relative">
            <input id="pass" type="password" class="input" placeholder="Contraseña" />
            <img id="togglePassword" class="eye-icon" src="eye_visible_hide_hidden_show_icon_145988.png" alt="Mostrar contraseña" title="Mostrar/ocultar contraseña" />
          </div>
          <button class="btn-primary" type="submit">Iniciar sesión</button>
          <div id="error" class="error" style="display:none"></div>
          <p class="small text-center" style="margin-top:12px">prueba de log in</p>
        </form>
      </div>
    </div>
  `);

  document.getElementById('loginForm').addEventListener('submit', (e)=>{
    e.preventDefault();
    const u = document.getElementById('user').value.trim();
    const p = document.getElementById('pass').value;
    const found = users.find(x=> x.username === u && x.password === p);
    const err = document.getElementById('error');
    if(found){
      localStorage.setItem('role', found.role);
      if(found.role === 'ciudadano') renderCitizenDashboard();
      else renderDashboard(found.role);
    } else {
      err.style.display = 'block'; err.textContent = 'Usuario o contraseña incorrectos';
    }
  });

  // toggle show/hide password using image assets
  const toggle = document.getElementById('togglePassword');
  if(toggle){
    toggle.addEventListener('click', ()=>{
      const passInput = document.getElementById('pass');
      if(!passInput) return;
      const openSrc = 'eye_visible_hide_hidden_show_icon_145988.png';
      const closedSrc = 'eye_slash_visible_hide_hidden_show_icon_145987.png';
      if(passInput.type === 'password'){
        passInput.type = 'text';
        toggle.src = closedSrc;
        toggle.alt = 'Ocultar contraseña';
      } else {
        passInput.type = 'password';
        toggle.src = openSrc;
        toggle.alt = 'Mostrar contraseña';
      }
    });
    // make image focusable and keyboard-accessible
    toggle.tabIndex = 0;
    toggle.addEventListener('keydown', (e)=>{ if(e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggle.click(); } });
  }
}

// --- Main dashboard for roles
function renderDashboard(role){
  setHTML(`
    <div class="container">
      <div class="header card">
        <div class="brand">
          <div class="logo">B</div>
          <div>
            <div class="h1">Banorte SmartGov</div>
            <div class="small">Módulo: ${role.toUpperCase()}</div>
          </div>
        </div>
        <div>
          <button id="goCitizen" class="logout-btn-citi" title="Entrar como ciudadano">Modo ciudadano</button>
          <button id="logout" class="logout-btn">Cerrar sesión</button>
        </div>
      </div>

      <div class="layout">
        <aside class="sidebar card">
          <ul class="menu" id="menuList">
            <li class="active" data-view="overview">Resumen</li>
            <li data-view="budget">Presupuesto</li>
            <li data-view="payments">Pagos</li>
            <li data-view="projects">Proyectos</li>
            <li data-view="reports">Reportes</li>
            <li data-view="transparency">Transparencia</li>
          </ul>
        </aside>

        <main class="content">
          <div id="mainContent" class="card"></div>
        </main>
      </div>
      <div class="footer">Prototipo Banorte SmartGov - Derechos reservados a los desarrolladores</div>
    </div>
  `);

  document.getElementById('logout').addEventListener('click', ()=>{ localStorage.removeItem('role'); renderLogin(); });
  document.getElementById('goCitizen').addEventListener('click', ()=> renderCitizenDashboard());

  document.querySelectorAll('#menuList li').forEach(li=>{
    li.addEventListener('click', ()=>{
      document.querySelectorAll('#menuList li').forEach(x=>x.classList.remove('active'));
      li.classList.add('active');
      const view = li.getAttribute('data-view');
      renderViewForRole(role, view);
    });
  });

  renderViewForRole(role, 'overview');
}

// --- Citizen dashboard
// We'll store simulated citizen payments in localStorage under 'payments'
function renderCitizenDashboard(){
  const payments = JSON.parse(localStorage.getItem('payments')||'[]');
  setHTML(`
    <div class="container">
      <div class="header card">
        <div class="brand">
          <div class="logo">B</div>
          <div>
            <div class="h1">Banorte SmartGov - Ciudadano</div>
            <div class="small">Paga tus servicios y consulta tu historial</div>
          </div>
        </div>
        <div>
          <button id="backAdmin" class="logout-btn">Volver</button>
          <button id="logout" class="logout-btn">Cerrar sesión</button>
        </div>
      </div>

      <div class="layout">
        <aside class="sidebar card">
          <ul class="menu" id="menuCitizen">
            <li class="active" data-view="account">Mi cuenta</li>
            <li data-view="pay">Pagar servicios</li>
            <li data-view="history">Historial de pagos</li>
          </ul>
        </aside>
        <main class="content">
          <div id="citizenContent" class="card"></div>
        </main>
      </div>

      <div class="footer">Prototipo Banorte SmartGov - Pagos simulados</div>
    </div>
  `);

  document.getElementById('logout').addEventListener('click', ()=>{ localStorage.removeItem('role'); renderLogin(); });
  document.getElementById('backAdmin').addEventListener('click', ()=>{
    const role = localStorage.getItem('role') || 'ciudadano';
    if(role && role !== 'ciudadano') renderDashboard(role); else renderLogin();
  });

  document.querySelectorAll('#menuCitizen li').forEach(li=>{
    li.addEventListener('click', ()=>{
      document.querySelectorAll('#menuCitizen li').forEach(x=>x.classList.remove('active'));
      li.classList.add('active');
      const view = li.getAttribute('data-view');
      renderCitizenView(view);
    });
  });

  renderCitizenView('account');
}

function renderCitizenView(view){
  const payments = JSON.parse(localStorage.getItem('payments')||'[]');
  const balance = (Math.random()*500).toFixed(2);
  const content = document.getElementById('citizenContent');
  if(view === 'account'){
    content.innerHTML = `
      <h3>Mi cuenta</h3>
      <p class="small">Saldo estimado y servicios vinculados</p>
      <div class="grid-3" style="margin-top:12px">
        <div class="kpi card"><h4>Saldo estimado</h4><p>$${balance}</p></div>
        <div class="kpi card"><h4>Servicios activos</h4><p>Agua, Luz</p></div>
        <div class="kpi card"><h4>Último pago</h4><p>${payments[0]?payments[0].service:'-'} - ${payments[0]?payments[0].amount:'-'}</p></div>
      </div>
      <div style="margin-top:14px" class="card">
        <h4>Pagos por mes</h4>
        <canvas id="chartCitizen" height="120"></canvas>
      </div>
    `;
    // draw chart
    setTimeout(()=>{
      const ctx = document.getElementById('chartCitizen').getContext('2d');
      new Chart(ctx, {
        type: 'bar',
        data: {
          labels: ['Ene','Feb','Mar','Abr','May','Jun'],
          datasets: [{label:'Pagos (MXN)', data: [120,200,150,170,90,130]}]
        },
        options: {plugins:{legend:{display:false}}}
      });
    },50);
  } else if(view === 'pay'){
    content.innerHTML = `
      <h3>Pagar servicios</h3>
      <p class="small">Selecciona servicio y método de pago</p>
      <div class="pay-card" style="margin-top:12px">
        <div class="pay-form">
          <div class="card" style="padding:12px">
            <label class="small">Servicio</label>
            <select id="service" class="input" style="margin-top:6px">
              <option value="Agua">Agua potable</option>
              <option value="Predial">Predial</option>
              <option value="Energia">Energía</option>
            </select>
            <div style="margin-top:10px">
              <label class="small">Referencia (folio)</label>
              <input id="ref" class="input" placeholder="0000-0000-0000" style="margin-top:6px"/>
            </div>
            <div style="margin-top:10px">
              <label class="small">Monto (MXN)</label>
              <input id="amount" class="input" placeholder="500.00" style="margin-top:6px"/>
            </div>
            <div style="margin-top:10px">
              <label class="small">Método de pago</label>
              <div class="pay-methods" id="methods">
                <div class="pay-method active" data-method="card">Tarjeta</div>
                <div class="pay-method" data-method="qr">QR</div>
              </div>
            </div>

            <div id="cardFields" style="margin-top:10px">
              <label class="small">Número de tarjeta</label>
              <input id="card" class="input" placeholder="4111 1111 1111 1111" style="margin-top:6px"/>
              <div style="display:flex;gap:8px;margin-top:8px">
                <input id="exp" class="input" placeholder="MM/AA" style="flex:1"/>
                <input id="cvv" class="input" placeholder="CVV" style="width:110px"/>
              </div>
            </div>

            <div id="qrBox" style="display:none;margin-top:10px">
              <div class="qr-box">QR (simulado)</div>
            </div>

            <div style="margin-top:12px">
              <button class="btn-primary" id="payBtn">Pagar ahora</button>
            </div>
            <div id="payMsg" style="margin-top:10px;color:var(--banorte-red);display:none"></div>
          </div>
        </div>

        <aside class="pay-summary card">
          <h4>Resumen</h4>
          <div style="margin-top:10px">
            <div class="small">Servicio: <span id="sumService">Agua</span></div>
            <div class="small" style="margin-top:6px">Referencia: <span id="sumRef">-</span></div>
            <div class="small" style="margin-top:6px">Monto: <strong id="sumAmount">-</strong></div>
            <div style="margin-top:12px"><button id="downloadReceipt" class="btn-primary" style="width:100%;display:none">Descargar comprobante</button></div>
          </div>
        </aside>
      </div>
    `;

    // handlers
    document.querySelectorAll('.pay-method').forEach(el=>{
      el.addEventListener('click', ()=>{
        document.querySelectorAll('.pay-method').forEach(x=>x.classList.remove('active'));
        el.classList.add('active');
        const m = el.getAttribute('data-method');
        document.getElementById('cardFields').style.display = m === 'card' ? 'block' : 'none';
        document.getElementById('qrBox').style.display = m === 'qr' ? 'block' : 'none';
      });
    });

    const updateSummary = ()=>{
      document.getElementById('sumService').textContent = document.getElementById('service').value;
      document.getElementById('sumRef').textContent = document.getElementById('ref').value || '-';
      document.getElementById('sumAmount').textContent = document.getElementById('amount').value || '-';
    };
    ['service','ref','amount'].forEach(id=>document.getElementById(id).addEventListener('input', updateSummary));

    document.getElementById('payBtn').addEventListener('click', ()=>{
      const service = document.getElementById('service').value;
      const ref = document.getElementById('ref').value || ('FOLIO-'+Math.floor(Math.random()*90000+10000));
      const amount = document.getElementById('amount').value || '0.00';
      const method = document.querySelector('.pay-method.active').getAttribute('data-method');
      // simulate validation
      if(parseFloat(amount) <= 0 || isNaN(parseFloat(amount))){
        const pm = document.getElementById('payMsg'); pm.style.display='block'; pm.textContent='Ingresa un monto válido'; return;
      }
      // store payment
      const payments = JSON.parse(localStorage.getItem('payments')||'[]');
      const p = {service, ref, amount, method, date: new Date().toLocaleString()};
      payments.unshift(p);
      localStorage.setItem('payments', JSON.stringify(payments));
      document.getElementById('payMsg').style.display='block'; document.getElementById('payMsg').textContent='Pago simulado realizado con éxito';
      document.getElementById('downloadReceipt').style.display='block';
      // show receipt on click
      document.getElementById('downloadReceipt').addEventListener('click', ()=>{
        const receipt = 'Comprobante\nServicio: '+service+'\nReferencia: '+ref+'\nMonto: $'+amount+'\nMétodo: '+method+'\nFecha: '+p.date;
        const blob = new Blob([receipt], {type:'text/plain'});
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a'); a.href = url; a.download = 'comprobante_'+ref+'.txt'; a.click();
        URL.revokeObjectURL(url);
      });
    });
  } else if(view === 'history'){
    const payments = JSON.parse(localStorage.getItem('payments')||'[]');
    content.innerHTML = `
      <h3>Historial de pagos</h3>
      <p class="small">Tus pagos realizados</p>
      <div style="margin-top:12px" class="card">
        <table class="table">
          <thead><tr><th>Fecha</th><th>Servicio</th><th>Referencia</th><th>Monto</th><th>Método</th></tr></thead>
          <tbody id="historyBody"></tbody>
        </table>
      </div>
    `;
    const tbody = document.getElementById('historyBody');
    const payments2 = JSON.parse(localStorage.getItem('payments')||'[]');
    if(payments2.length===0) tbody.innerHTML='<tr><td colspan="5" class="small">Sin pagos registrados</td></tr>';
    else payments2.forEach(p=>{
      const tr = document.createElement('tr');
      tr.innerHTML = '<td>'+p.date+'</td><td>'+p.service+'</td><td>'+p.ref+'</td><td>$'+p.amount+'</td><td>'+p.method+'</td>';
      tbody.appendChild(tr);
    });
    // small chart of last 6 payments
    setTimeout(()=>{
      const chartC = document.createElement('canvas'); chartC.id='chartHist'; chartC.height=100;
      content.appendChild(chartC);
      const payments3 = JSON.parse(localStorage.getItem('payments')||'[]');
      const labels = payments3.slice(0,6).map(p=>p.date.split(',')[0] || p.date);
      const data = payments3.slice(0,6).map(p=>parseFloat(p.amount));
      const ctx = document.getElementById('chartHist').getContext('2d');
      new Chart(ctx, {type:'line', data:{labels, datasets:[{label:'Últimos pagos', data}]}, options:{plugins:{legend:{display:false}}}});
    },50);
  }
}

// --- renderViewForRole with tables and charts
function renderViewForRole(role, view){
  const main = document.getElementById('mainContent');

  // sample data per role
  const data = {
    agua: {budget:'$5,000,000', spent:'$1,200,000', projects:12, consumption:'1,250 m3/day', leaks: 3},
    energia: {budget:'$8,000,000', spent:'$3,100,000', projects:7, consumption:'82% capacity', renewables: 2},
    transporte: {budget:'$9,000,000', spent:'$950,000', projects:5, fleet:'126 unidades', routesOptimized:'83%'},
    obras: {budget:'$12,000,000', spent:'$8,100,000', projects:23, finished:8},
    tesoreria: {budget:'$50,000,000', income:'$2,300,000', spent:'$17,500,000', accounts:6},
    transparencia: {total:'$86,100,000', audits:5, traceability:'100%'}
  };
  const d = data[role] || {};

  if(view === 'overview'){
    main.innerHTML = `
      <div class="header" style="padding:0">
        <div style="flex:1">
          <h3 style="margin:0">${capitalize(role)} - Resumen</h3>
          <p style="margin:6px 0 0;color:var(--gray-medium)">Información resumen por dependencia</p>
        </div>
      </div>

      <div class="grid-3" style="margin-top:12px">
        <div class="kpi card"><h4>Presupuesto</h4><p>${d.budget || d.total || '-'}</p></div>
        <div class="kpi card"><h4>Gasto</h4><p>${d.spent || d.income || '-'}</p></div>
        <div class="kpi card"><h4>Proyectos / Auditorías</h4><p>${d.projects ?? d.audits ?? '-'}</p></div>
      </div>

      <div style="margin-top:14px" class="card">
        <h4>Gráfica de desempeño</h4>
        <canvas id="chartRole" height="120"></canvas>
      </div>

      <div style="margin-top:14px" class="card">
        <h4>Tabla de movimientos recientes</h4>
        <table class="table">
          <thead><tr><th>Fecha</th><th>Concepto</th><th>Monto</th><th>Estado</th></tr></thead>
          <tbody>
            <tr><td>2025-09-01</td><td>Compra de materiales</td><td>$120,000</td><td>Completado</td></tr>
            <tr><td>2025-09-12</td><td>Pago de contratistas</td><td>$450,000</td><td>Pendiente</td></tr>
            <tr><td>2025-10-05</td><td>Transferencia interdependencia</td><td>$200,000</td><td>Completado</td></tr>
          </tbody>
        </table>
      </div>
    `;
    setTimeout(()=>{
      const ctx = document.getElementById('chartRole').getContext('2d');
      new Chart(ctx, {type:'line', data:{labels:['Ene','Feb','Mar','Abr','May','Jun'], datasets:[{label:'Gasto',data:[50,70,60,80,90,75]}]}, options:{plugins:{legend:{display:false}}}});
    },50);
  } else if(view === 'budget'){
    main.innerHTML = `
      <h3>Gestión de presupuesto - ${capitalize(role)}</h3>
      <p class="small">Asignaciones y transferencias internas</p>
      <div style="margin-top:12px" class="card">
        <strong>Presupuesto asignado:</strong> ${d.budget || '-'}<br/>
        <strong>Gasto acumulado:</strong> ${d.spent || '-'}<br/>
        <div style="margin-top:12px"><button class="btn-primary" id="assignBtn">Asignar presupuesto</button></div>
      </div>
      <div style="margin-top:12px" class="card">
        <h4>Distribución por área</h4>
        <canvas id="chartBudget" height="120"></canvas>
      </div>
    `;
    setTimeout(()=>{
      const ctx = document.getElementById('chartBudget').getContext('2d');
      new Chart(ctx, {type:'doughnut', data:{labels:['Operación','Inversión','Mantenimiento'], datasets:[{data:[45,35,20]}]}, options:{plugins:{legend:{position:'bottom'}}}});
    },50);
    document.getElementById('assignBtn').addEventListener('click', ()=> alert('Asignar presupuesto (simulado)'));
  } else if(view === 'payments'){
    main.innerHTML = `
      <h3>Pagos y Recaudación - ${capitalize(role)}</h3>
      <p class="small">Pagos pendientes y realizados</p>
      <div style="margin-top:12px" class="card">
        <table class="table">
          <thead><tr><th>Proveedor</th><th>Monto</th><th>Estado</th><th>Acción</th></tr></thead>
          <tbody>
            <tr><td>Proveedor A</td><td>$120,000</td><td>Pendiente</td><td><button class="btn-primary" onclick="alert('Pago simulado')">Pagar</button></td></tr>
            <tr><td>Proveedor B</td><td>$80,000</td><td>Completado</td><td>—</td></tr>
          </tbody>
        </table>
      </div>
    `;
  } else if(view === 'projects'){
    main.innerHTML = `
      <h3>Proyectos - ${capitalize(role)}</h3>
      <p class="small">Lista de proyectos activos</p>
      <div style="margin-top:12px" class="card">
        <table class="table">
          <thead><tr><th>Proyecto</th><th>Estado</th><th>Avance</th></tr></thead>
          <tbody>
            <tr><td>Proyecto 1</td><td>En ejecución</td><td>60%</td></tr>
            <tr><td>Proyecto 2</td><td>Planificación</td><td>10%</td></tr>
            <tr><td>Proyecto 3</td><td>Entrega parcial</td><td>85%</td></tr>
          </tbody>
        </table>
      </div>
    `;
  } else if(view === 'reports'){
    main.innerHTML = `
      <h3>Reportes - ${capitalize(role)}</h3>
      <p class="small">Exportar y ver reportes</p>
      <div style="margin-top:12px" class="card">
        <button class="btn-primary" id="exportBtn">Generar reporte PDF (simulado)</button>
      </div>
    `;
    document.getElementById('exportBtn').addEventListener('click', ()=> alert('Generando PDF (simulado)'));
  } else if(view === 'transparency'){
    main.innerHTML = `
      <h3>Transparencia - ${capitalize(role)}</h3>
      <p class="small">Datos públicos y trazabilidad</p>
      <div style="margin-top:12px" class="card">
        <h4>Gasto por dependencia</h4>
        <table class="table">
          <thead><tr><th>Dependencia</th><th>Monto</th></tr></thead>
          <tbody>
            <tr><td>Agua</td><td>$5,000,000</td></tr>
            <tr><td>Energía</td><td>$8,000,000</td></tr>
            <tr><td>Obras</td><td>$12,000,000</td></tr>
          </tbody>
        </table>
      </div>
    `;
  }
}

function capitalize(s){ if(!s) return ''; return s.charAt(0).toUpperCase()+s.slice(1); }

// on load
const stored = localStorage.getItem('role');
if(stored === 'ciudadano') renderCitizenDashboard();
else if(stored) renderDashboard(stored);
else renderLogin();

//actualmente a este sistema en conjunto le hace falta una base de datos real y seguridad robusta para un entorno de producción.
//la base de datos de este sistema tendría que almacenar usuarios, roles, pagos, presupuestos y proyectos de manera segura. 