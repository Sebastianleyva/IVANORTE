// Banorte SmartGov - Combinación definitiva: dashboards, pagos, historial y PDF (banorte-styled)

// -----------------------------
// Helpers: cálculos y gráfica
// -----------------------------
function computeMonthlyPayments() {
  const payments = JSON.parse(localStorage.getItem('payments') || '[]');
  const monthlyDataAgua = [0,0,0,0,0,0];
  const monthlyDataEnergia = [0,0,0,0,0,0];
  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();

  payments.forEach(p => {
    const d = new Date(p.date);
    if (isNaN(d)) return;
    const m = d.getMonth();
    const y = d.getFullYear();
    const diff = (currentYear - y) * 12 + (currentMonth - m);
    if (diff >= 0 && diff < 6) {// Banorte SmartGov - Combinación definitiva: dashboards, pagos, historial y PDF (banorte-styled)

// -----------------------------
// Helpers: cálculos y gráfica
// -----------------------------
function computeMonthlyPayments() {
  const payments = JSON.parse(localStorage.getItem('payments') || '[]');
  const monthlyDataAgua = [0,0,0,0,0,0];
  const monthlyDataEnergia = [0,0,0,0,0,0];
  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();

  payments.forEach(p => {
    const d = new Date(p.date);
    if (isNaN(d)) return;
    const m = d.getMonth();
    const y = d.getFullYear();
    const diff = (currentYear - y) * 12 + (currentMonth - m);
    if (diff >= 0 && diff < 6) {
      const idx = 5 - diff; // 0 = más antiguo, 5 = actual
      const amt = parseFloat(p.amount) || 0;
      if (p.service && p.service.toLowerCase().includes('agua')) monthlyDataAgua[idx] += amt;
      if (p.service && p.service.toLowerCase().includes('energia')) monthlyDataEnergia[idx] += amt;
    }
  });

  const monthNames = ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic'];
  const labels = [];
  const now2 = new Date();
  for (let i = 5; i >= 0; i--) {
    const date = new Date(now2.getFullYear(), now2.getMonth() - i, 1);
    labels.push(monthNames[date.getMonth()]);
  }

  return { monthlyDataAgua, monthlyDataEnergia, labels };
}

function buildCitizenChart() {
  const canvas = document.getElementById('chartCitizen');
  if (!canvas || typeof Chart === 'undefined') return;
  const ctx = canvas.getContext('2d');
  const { monthlyDataAgua, monthlyDataEnergia, labels } = computeMonthlyPayments();

  if (window.citizenChart) {
    try { window.citizenChart.destroy(); } catch(e){}
    window.citizenChart = null;
  }

  window.citizenChart = new Chart(ctx, {
    type: 'bar',
    data: {
      labels,
      datasets: [
        { label: 'Agua', data: monthlyDataAgua, backgroundColor: '#EB0029' },
        { label: 'Energía', data: monthlyDataEnergia, backgroundColor: '#323E48' }
      ]
    },
    options: { plugins: { legend: { display: true, position: 'top' } }, scales: { y: { beginAtZero: true, ticks: { callback: v => '$' + v } } } }
  });
}

// -----------------------------
// Monto adeudado / actualización
// -----------------------------
function updateDebtAmounts() {
  // base amounts (could be pulled from server in real app)
  const originalAmounts = {'agua': 450.00, 'energia': 780.50};
  const payments = JSON.parse(localStorage.getItem('payments') || '[]');

  // accumulate paid amounts by normalized service key
  const paidByService = { 'agua': 0, 'energia': 0 };
  payments.forEach(payment => {
    if (!payment || !payment.service) return;
    // normalize service name (allow variations like 'Agua', 'agua potable', 'Energía')
    const s = String(payment.service).toLowerCase();
    const amtRaw = String(payment.amount || '0').replace(/[^0-9.-]+/g, '');
    const amt = parseFloat(amtRaw) || 0;
    if (s.includes('agua')) paidByService['agua'] += amt;
    else if (s.includes('ener') || s.includes('luz')) paidByService['energia'] += amt;
    else {
      // if unknown, try exact match
      if (paidByService[s] === undefined) paidByService[s] = 0;
      paidByService[s] += amt;
    }
  });

  const aguaRemaining = originalAmounts['agua'] - (paidByService['agua'] || 0);
  const energiaRemaining = originalAmounts['energia'] - (paidByService['energia'] || 0);

  const aguaEl = document.getElementById('aguaAmount');
  const energiaEl = document.getElementById('energiaAmount');
  const totalEl = document.getElementById('totalAmount');
  if (aguaEl) aguaEl.textContent = aguaRemaining > 0 ? `$${aguaRemaining.toFixed(2)}` : 'Pagado';
  if (energiaEl) energiaEl.textContent = energiaRemaining > 0 ? `$${energiaRemaining.toFixed(2)}` : 'Pagado';
  // compute total as sum of positive remainders so overpayments in one service don't cancel others
  const totalRemaining = Math.max(0, aguaRemaining) + Math.max(0, energiaRemaining);
  if (totalEl) totalEl.textContent = `$${totalRemaining.toFixed(2)}`;

  // optional small debug output to help verify calculations in the UI
  const noteEl = document.getElementById('historyPdfNote');
  if (noteEl) {
    try {
      const paidAg = (paidByService['agua'] || 0).toFixed(2);
      const paidEn = (paidByService['energia'] || 0).toFixed(2);
      noteEl.textContent = `Pagado — Agua: $${paidAg} · Energía: $${paidEn} · Restante: $${totalRemaining.toFixed(2)}`;
    } catch (e) { /* ignore */ }
  }
}

// -----------------------------
// App base (login, users, render helpers)
// -----------------------------
const users = [
  { username: "agua", password: "1234", role: "agua" },
  { username: "energia", password: "1234", role: "energia" },
  { username: "transporte", password: "1234", role: "transporte" },
  { username: "obras", password: "1234", role: "obras" },
  { username: "tesoreria", password: "1234", role: "tesoreria" },
  { username: "transparencia", password: "1234", role: "transparencia" },
  { username: "ciudadano", password: "1234", role: "ciudadano" }
];

const app = document.getElementById('app') || document.body;
function setHTML(html) { app.innerHTML = html; }

// -----------------------------
// Login view
// -----------------------------
function renderLogin() {
  setHTML(`
    <div class="login-wrap">
      <div class="login-card card">
        <div style="text-align:center;margin-bottom:8px">
          <div class="logo" style="margin:0 auto"><img src="Logo.png" alt="logo" style="height:48px;object-fit:contain"></div>
        </div>
        <h2 class="text-center" style="color:var(--banorte-red);margin-bottom:6px">Banorte SmartGov</h2>
        <p class="text-center small" style="margin-top:0">Plataforma financiera integrada</p>
        <form id="loginForm" style="margin-top:18px">
          <div class="form-group"><input id="user" class="input" placeholder="Usuario (ej: agua / ciudadano)" /></div>
          <div class="form-group" style="position:relative"><input id="pass" type="password" class="input" placeholder="Contraseña" /><img id="togglePassword" class="eye-icon" src="eye_visible_hide_hidden_show_icon_145988.png" alt="Mostrar contraseña" title="Mostrar/ocultar contraseña" /></div>
          <button class="btn-primary" type="submit">Iniciar sesión</button>
          <div id="error" class="error" style="display:none"></div>
        </form>
      </div>
    </div>
  `);

  const f = document.getElementById('loginForm');
  if (f) f.addEventListener('submit', (e) => {
    e.preventDefault();
    const u = document.getElementById('user').value.trim();
    const p = document.getElementById('pass').value;
    const found = users.find(x => x.username === u && x.password === p);
    const err = document.getElementById('error');
    if (found) {
      localStorage.setItem('role', found.role);
      if (found.role === 'ciudadano') renderCitizenDashboard();
      else renderDashboard(found.role);
    } else {
      if (err) { err.style.display = 'block'; err.textContent = 'Usuario o contraseña incorrectos'; }
    }
  });

  const toggle = document.getElementById('togglePassword');
  if (toggle) toggle.addEventListener('click', () => {
    const pass = document.getElementById('pass');
    if (!pass) return;
    if (pass.type === 'password') { pass.type = 'text'; toggle.src = 'eye_slash_visible_hide_hidden_show_icon_145987.png'; }
    else { pass.type = 'password'; toggle.src = 'eye_visible_hide_hidden_show_icon_145988.png'; }
  });
}

// -----------------------------
// Citizen dashboard
// -----------------------------
function renderCitizenDashboard() {
  setHTML(`
    <div class="container">
      <div class="header card">
        <div class="brand">
          <div class="logo">B</div>
          <div><div class="h1"><img src="Logo.png" style="height:20px;object-fit:contain"></div><div class="small">Paga tus servicios y consulta tu historial</div></div>
        </div>
        <div><button id="logout" class="logout-btn">Cerrar sesión</button></div>
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
    </div>
  `);

  const logoutBtn = document.getElementById('logout');
  if (logoutBtn) logoutBtn.addEventListener('click', () => { localStorage.removeItem('role'); renderLogin(); });

  document.querySelectorAll('#menuCitizen li').forEach(li => {
    li.addEventListener('click', () => {
      document.querySelectorAll('#menuCitizen li').forEach(x => x.classList.remove('active'));
      li.classList.add('active');
      renderCitizenView(li.getAttribute('data-view'));
    });
  });

  updateDebtAmounts();
  renderCitizenView('account');
}

// -----------------------------
// Citizen views: account / pay / history
// -----------------------------
function renderCitizenView(view) {
  const payments = JSON.parse(localStorage.getItem('payments') || '[]');
  const content = document.getElementById('citizenContent');
  if (!content) return;

  if (view === 'account') {
    content.innerHTML = `
      <h3>Mi cuenta</h3>
      <p class="small">Saldo estimado y servicios vinculados</p>
      <div class="grid-2" style="margin-top:12px">
        <div class="kpi card"><h4>Servicios activos</h4><p>Agua, Luz</p></div>
    <div class="kpi card"><h4>Último pago</h4><p>${payments[0] ? payments[0].service + ' - $' + (Number(payments[0].amount) || 0).toFixed(2) : '-'}</p></div>
      </div>

      <div style="margin-top:14px" class="card">
        <h4>Pagos por mes</h4>
        <canvas id="chartCitizen" height="120"></canvas>
      </div>
    `;
    requestAnimationFrame(() => setTimeout(buildCitizenChart, 20));
    return;
  }

  if (view === 'pay') {
    content.innerHTML = `
      <h3>Pagar servicios</h3>
      <p class="small">Selecciona servicio y método de pago</p>

      <div class="card debt-section" style="margin-top:12px">
        <div class="debt-header"><h4 style="margin:0">Cuánto debes pagar</h4><span class="debt-total">Total: <strong id="totalAmount">$1,230.50</strong></span></div>
        <div class="debt-grid">
          <div class="debt-card" data-service="agua"><div class="debt-icon">💧</div><div class="debt-info"><span class="debt-name">Agua potable</span></div><span class="debt-amount" id="aguaAmount">$450.00</span></div>
          <div class="debt-card" data-service="energia"><div class="debt-icon">⚡</div><div class="debt-info"><span class="debt-name">Energía</span></div><span class="debt-amount" id="energiaAmount">$780.50</span></div>
        </div>
      </div>

      <!-- Flex container: main pay form (left) and PDF history card (right) -->
      <div style="display:flex;gap:12px;margin-top:12px;align-items:flex-start;flex-wrap:nowrap">
        <div class="pay-card" style="flex:1 1 0;min-width:300px">
          <div class="card" style="padding:12px">
            <label class="small">Servicio</label>
            <select id="service" class="input" style="margin-top:6px">
              <option value="Agua">Agua potable</option>
              <option value="Energia">Energía</option>
            </select>

            <div style="margin-top:10px">
              <label class="small">Monto (MXN)</label>
              <input id="amount" class="input" placeholder="500.00" style="margin-top:6px"/>
            </div>

            <div style="margin-top:10px">
              <label class="small">Método de pago</label>
              <select id="method" class="input" style="margin-top:6px">
                <option value="tarjeta">Tarjeta</option>
                <option value="transferencia">Transferencia</option>
              </select>
            </div>

            <div id="cardFields" style="margin-top:10px">
              <label class="small">Número de tarjeta</label>
              <input id="cardNumber" class="input" maxlength="19" placeholder="1234 5678 9012 3456" style="margin-top:6px"/>
              <div style="display:flex;gap:8px;margin-top:8px">
                <div style="flex:1">
                  <label class="small">Expira</label>
                  <input id="exp" class="input" placeholder="MM/AA" maxlength="5"/>
                </div>
                <div style="width:110px">
                  <label class="small">CVV</label>
                  <input id="cvv" class="input" placeholder="123" maxlength="4"/>
                </div>
              </div>
            </div>

            <div style="margin-top:12px">
              <button class="btn-primary" id="payBtn">Pagar ahora</button>
            </div>

            <div id="payMsg" style="margin-top:10px;color:var(--banorte-red);display:none"></div>
          </div>
        </div>

        <!-- Right-side card: Historial PDF (Banorte styling) -->
        <div id="historyPdfCard" class="card" style="flex:1 1 360px;min-width:240px;max-width:100%;padding:14px;box-sizing:border-box">
          <div style="display:flex;align-items:center;gap:10px">
            <div style="width:48px;height:48px;border-radius:6px;background:#EB0029;display:flex;align-items:center;justify-content:center;color:white;font-weight:700;font-size:20px">B</div>
            <div>
              <div style="font-weight:700">Banorte SmartGov</div>
              <div class="small" style="color:#666">Descarga tu historial</div>
            </div>
          </div>

          <p class="small" style="margin-top:12px;color:#333">Genera un PDF con el estilo oficial de Banorte que incluye tus pagos registrados. Ideal para comprobantes y archivo personal.</p>
          <button id="downloadHistoryPdfBtn" class="btn-primary" style="margin-top:8px;width:100%;padding:12px 10px;font-size:15px">Descargar historial (PDF)</button>
          <div id="historyPdfNote" class="small" style="margin-top:8px;color:#666"></div>
          <!-- Container for per-payment receipt button (moved here for better placement) -->
          <div id="receiptContainer" style="margin-top:10px"></div>
        </div>
      </div>
    `;

    const methodEl = document.getElementById('method');
    const cardFields = document.getElementById('cardFields');
    if (methodEl && cardFields) {
      methodEl.value = 'tarjeta';
      methodEl.addEventListener('change', () => {
        cardFields.style.display = methodEl.value === 'tarjeta' ? 'block' : 'none';
      });
    }

    const payBtn = document.getElementById('payBtn');
    const payMsg = document.getElementById('payMsg');
    if (payBtn) {
      payBtn.addEventListener('click', () => {
        const service = document.getElementById('service').value;
  const amountRaw = document.getElementById('amount').value || '0';
  // clean common formatting (commas, currency symbols, spaces) before parsing
  const amountClean = String(amountRaw).replace(/[^0-9.-]+/g, '');
  const amount = parseFloat(amountClean);
        const method = document.getElementById('method').value;

  if (isNaN(amount) || amount <= 0) { payMsg.style.display='block'; payMsg.textContent='Ingresa un monto válido'; return; }

        if (method === 'tarjeta') {
          const card = document.getElementById('cardNumber').value.replace(/\s+/g,'');
          const exp = document.getElementById('exp').value.trim();
          const cvv = document.getElementById('cvv').value.trim();
          if (card.length<13 || card.length>19) { payMsg.style.display='block'; payMsg.textContent='Número de tarjeta inválido'; return; }
          if (!/^\d{2}\/\d{2}$/.test(exp)) { payMsg.style.display='block'; payMsg.textContent='Formato de expiración inválido (MM/AA)'; return; }
          if (cvv.length<3) { payMsg.style.display='block'; payMsg.textContent='CVV inválido'; return; }
        }

        const payments = JSON.parse(localStorage.getItem('payments')||'[]');
        const p = {
          service,
          ref: 'FOLIO-' + Math.floor(Math.random()*90000 + 10000),
          // store amount as Number for reliable math
          amount: parseFloat(amount.toFixed(2)),
          method,
          date: new Date().toISOString()
        };
        payments.unshift(p);
        localStorage.setItem('payments', JSON.stringify(payments));

        payMsg.style.display='block';
        payMsg.textContent='Pago simulado realizado con éxito';

        updateDebtAmounts();
        try { buildCitizenChart(); } catch(e){}

        showReceiptButton(p); // place receipt button inside history card
      });
    }

    // Wire history PDF download button on the right-side card
    const downloadBtn = document.getElementById('downloadHistoryPdfBtn');
    if (downloadBtn) {
      downloadBtn.addEventListener('click', () => {
        try { generateHistoryPdf(); }
        catch (e) { const note = document.getElementById('historyPdfNote'); if(note){note.textContent='Error generando PDF';} }
      });
    }

    updateDebtAmounts();
    return;
  }

  if (view === 'history') {
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
    const payments2 = JSON.parse(localStorage.getItem('payments') || '[]');
      if (payments2.length === 0) {
      tbody.innerHTML = '<tr><td colspan="5" class="small">Sin pagos registrados</td></tr>';
    } else {
      payments2.forEach(p => {
        const d = new Date(p.date);
        const displayDate = isNaN(d) ? p.date : d.toLocaleString();
        const tr = document.createElement('tr');
        const amt = (parseFloat(p.amount) || 0).toFixed(2);
        tr.innerHTML = `<td>${displayDate}</td><td>${p.service}</td><td>${p.ref || '-'}</td><td>$${amt}</td><td>${p.method || '-'}</td>`;
        tbody.appendChild(tr);
      });
    }

    setTimeout(() => {
      const existing = document.getElementById('chartHistCanvas'); if(existing) existing.remove();
      const chartC = document.createElement('canvas'); chartC.id='chartHistCanvas'; chartC.height=100; content.appendChild(chartC);

      const recent = payments2.slice(0,6).reverse();
      const labels = recent.map(p=>{const d=new Date(p.date); return isNaN(d)?p.date:d.toLocaleDateString();});
      const data = recent.map(p=>parseFloat(p.amount));
      const ctx = document.getElementById('chartHistCanvas').getContext('2d');
      if(window.histChart){try{window.histChart.destroy();}catch(e){}window.histChart=null;}
      window.histChart = new Chart(ctx,{type:'line',data:{labels,datasets:[{label:'Últimos pagos',data,borderColor:'#EB0029',tension:0.3}]},options:{plugins:{legend:{display:false}}}});
    },80);

    return;
  }
}

// -----------------------------
// PDF receipt button (placed in history card)
// -----------------------------
function showReceiptButton(payment) {

// -----------------------------
// Helper: load local image as data URL (for embedding into PDFs)
// -----------------------------
function loadImageDataURL(src) {
  return new Promise((resolve, reject) => {
    try {
      const img = new Image();
      img.crossOrigin = 'Anonymous';
      img.onload = () => {
        try {
          const canvas = document.createElement('canvas');
          canvas.width = img.naturalWidth || img.width;
          canvas.height = img.naturalHeight || img.height;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0);
          const data = canvas.toDataURL('image/png');
          resolve(data);
        } catch (err) { reject(err); }
      };
      img.onerror = (e) => reject(e);
      img.src = src;
      // If browser has already cached it and it's complete, try immediate
      if (img.complete && img.naturalWidth) {
        const canvas = document.createElement('canvas');
        canvas.width = img.naturalWidth || img.width;
        canvas.height = img.naturalHeight || img.height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0);
        resolve(canvas.toDataURL('image/png'));
      }
    } catch (err) { reject(err); }
  });
}
  // Prefer placing the receipt button inside the right-side history card for better UX
  let existing = document.getElementById('receiptBtn'); if (existing) existing.remove();
  const container = document.getElementById('receiptContainer');

  const createBtn = () => {
    const b = document.createElement('button');
    b.id = 'receiptBtn';
    b.className = 'btn-primary';
    b.textContent = 'Ver comprobante';
    b.style.marginTop = '8px';
    b.style.width = '100%';
    b.style.padding = '10px';
    b.style.fontSize = '14px';
    return b;
  };

  let btn;
  if (container) {
    btn = createBtn();
    container.appendChild(btn);
  } else {
    const content = document.getElementById('citizenContent'); if (!content) return;
    btn = createBtn();
    content.appendChild(btn);
  }

  btn.addEventListener('click', () => {
    (async () => {
      const { jsPDF } = window.jspdf || {};
      if (!jsPDF) { alert('jsPDF no está disponible'); return; }
      const doc = new jsPDF();

      // try to load and embed logo (Logo.png)
      try {
        const dataUrl = await loadImageDataURL('Logo.png');
        // add small logo at top-left
        doc.addImage(dataUrl, 'PNG', 12, 6, 18, 18);
      } catch (e) {
        // ignore if logo can't be loaded
      }

      // header bar
      doc.setFillColor(235,0,41);
      doc.rect(0,0,210,28,'F');
      doc.setTextColor(255,255,255);
      doc.setFontSize(16);
      doc.text('Comprobante de Pago',105,18,{align:'center'});

      doc.setTextColor(50,62,72);
      doc.setFontSize(12);
      const line = 44;
      doc.text(`Fecha: ${new Date(payment.date).toLocaleString()}`,20,line);
      doc.text(`Servicio: ${payment.service}`,20,line+10);
      doc.text(`Referencia: ${payment.ref}`,20,line+20);
      doc.text(`Monto: $${payment.amount}`,20,line+30);
      doc.text(`Método de pago: ${payment.method}`,20,line+40);

      doc.setDrawColor(235,0,41);
      doc.rect(15,line-5,180,50);

      const now = new Date();
      const stamp = `${now.getFullYear()}${String(now.getMonth()+1).padStart(2,'0')}${String(now.getDate()).padStart(2,'0')}_${String(now.getHours()).padStart(2,'0')}${String(now.getMinutes()).padStart(2,'0')}`;
      const filename = `comprobante_${payment.ref}_${stamp}.pdf`;
      doc.save(filename);

      // show confirmation inside the history card
      const note = document.getElementById('historyPdfNote');
      if (note) note.textContent = `Comprobante generado: ${filename}`;
    })();
  });
}

// -----------------------------
// Generar PDF: Historial completo con estética Banorte
// -----------------------------
function generateHistoryPdf() {
  const payments = JSON.parse(localStorage.getItem('payments') || '[]');

  (async () => {
    const { jsPDF } = window.jspdf || {};
    if (!jsPDF) { alert('jsPDF no está disponible'); return; }
    const doc = new jsPDF();

    // try to embed logo
    try {
      const dataUrl = await loadImageDataURL('Logo.png');
      doc.addImage(dataUrl, 'PNG', 12, 6, 18, 18);
    } catch (e) {}

    // Header: Banorte red bar and small logo block
    doc.setFillColor(235,0,41);
    doc.rect(0,0,210,28,'F');
    doc.setFontSize(14);
    doc.setTextColor(255,255,255);
    doc.text('Banorte SmartGov',40,18);

    doc.setFontSize(12);
    doc.setTextColor(50,62,72);
    doc.text('Historial de pagos',105,40,{align:'center'});

    let y = 50;
    doc.setFontSize(10);

    if (!payments || payments.length === 0) {
      doc.text('No hay pagos registrados.',20,y);
      const now = new Date();
      const stamp = `${now.getFullYear()}${String(now.getMonth()+1).padStart(2,'0')}${String(now.getDate()).padStart(2,'0')}_${String(now.getHours()).padStart(2,'0')}${String(now.getMinutes()).padStart(2,'0')}`;
      const filename = `historial_pagos_${stamp}.pdf`;
      doc.save(filename);
      const noteEl = document.getElementById('historyPdfNote'); if (noteEl) noteEl.textContent = `Historial generado: ${filename}`;
      return;
    }

    // Table header
    doc.setFillColor(245,245,245);
    doc.rect(15,y-6,180,8,'F');
    doc.setTextColor(50,62,72);
    doc.text('Fecha',20,y);
    doc.text('Servicio',70,y);
    doc.text('Referencia',110,y);
    doc.text('Monto',170,y);
    y += 8;

    // Rows
    payments.forEach((p, idx) => {
      if (y > 275) { doc.addPage(); y = 20; }
      const d = new Date(p.date);
      const ds = isNaN(d) ? p.date : d.toLocaleString();
      doc.text(ds,20,y);
      doc.text(p.service || '-',70,y);
      doc.text(p.ref || '-',110,y);
      doc.text('$' + (parseFloat(p.amount) || 0).toFixed(2),170,y);
      y += 8;
    });

    // Total
    const total = payments.reduce((s, p) => s + (parseFloat(p.amount) || 0), 0);
    if (y + 12 > 275) { doc.addPage(); y = 20; }
    doc.setDrawColor(235,0,41);
    doc.setLineWidth(0.5);
    doc.line(15,y,195,y);
    y += 6;
    doc.setFontSize(11);
    doc.text('Total:',150,y);
    doc.text('$' + total.toFixed(2),170,y);

    const now = new Date();
    const stamp = `${now.getFullYear()}${String(now.getMonth()+1).padStart(2,'0')}${String(now.getDate()).padStart(2,'0')}_${String(now.getHours()).padStart(2,'0')}${String(now.getMinutes()).padStart(2,'0')}`;
    const filename = `historial_pagos_${stamp}.pdf`;
    doc.save(filename);
    const noteEl = document.getElementById('historyPdfNote'); if (noteEl) noteEl.textContent = `Historial generado: ${filename}`;
  })();
}

// -----------------------------
// Re-use and simplified admin/dashboard functions from original
// -----------------------------

// --- ADMIN DASHBOARD Y VISTAS DE app2.js ---
function renderDashboard(role){
  setHTML(`
    <div class="container">
      <div class="header card">
          <div class="brand">
          <div class="logo">B</div>
          <div>
            <div class="h1"><img src="Logo.png" style="height:20px;object-fit:contain"></div>
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

  // Inicialización global para dependencias (helpers y gráficas)
  try { updateDebtAmounts(); } catch(e){}
  try { buildCitizenChart(); } catch(e){}

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
    function tryInitChartRole(attempts=0) {
      const canvas = document.getElementById('chartRole');
      if (!canvas) {
        if (attempts < 5) setTimeout(()=>tryInitChartRole(attempts+1), 100);
        return;
      }
      if (typeof Chart === 'undefined') {
        canvas.outerHTML = '<div style="color:red">Error: Chart.js no está disponible</div>';
        return;
      }
      const ctx = canvas.getContext('2d');
      new Chart(ctx, {type:'line', data:{labels:['Ene','Feb','Mar','Abr','May','Jun'], datasets:[{label:'Gasto',data:[50,70,60,80,90,75]}]}, options:{plugins:{legend:{display:false}}}});
    }
    setTimeout(tryInitChartRole, 50);
  } else if(view === 'budget'){
    // Gestión de presupuestos y distribución persistente por dependencia
    let budgets = {};
    let distribs = {};
    try { budgets = JSON.parse(localStorage.getItem('budgets')||'{}'); } catch(e) { budgets = {}; }
    try { distribs = JSON.parse(localStorage.getItem('distribs')||'{}'); } catch(e) { distribs = {}; }
    const currentBudget = budgets[role] || d.budget || '-';
    const defaultDistrib = [45,35,20];
    const currentDistrib = (distribs[role] && Array.isArray(distribs[role]) && distribs[role].length===3) ? distribs[role] : defaultDistrib;
    main.innerHTML = `
      <h3>Gestión de presupuesto - ${capitalize(role)}</h3>
      <p class="small">Asignaciones y transferencias internas</p>
      <div style="margin-top:12px" class="card">
        <strong>Presupuesto asignado:</strong> <span id="budgetValue">${currentBudget}</span><br/>
        <strong>Gasto acumulado:</strong> ${d.spent || '-'}<br/>
        <div style="margin-top:12px;display:flex;gap:8px">
          <button class="btn-primary" id="assignBtn">Asignar/Cambiar presupuesto</button>
          <button class="btn-primary" id="editDistribBtn">Editar distribución</button>
        </div>
      </div>
      <div style="margin-top:12px" class="card">
        <h4>Distribución por área</h4>
        <ul id="distribList" style="margin:0 0 10px 0;padding:0;list-style:none;display:flex;gap:18px">
          <li>Operación: <b>${currentDistrib[0]}%</b></li>
          <li>Inversión: <b>${currentDistrib[1]}%</b></li>
          <li>Mantenimiento: <b>${currentDistrib[2]}%</b></li>
        </ul>
        <canvas id="chartBudget" height="120"></canvas>
      </div>
    `;
    setTimeout(()=>{
      const ctx = document.getElementById('chartBudget').getContext('2d');
      new Chart(ctx, {type:'doughnut', data:{labels:['Operación','Inversión','Mantenimiento'], datasets:[{data:currentDistrib}]}, options:{plugins:{legend:{position:'bottom'}}}});
    },50);
    document.getElementById('assignBtn').addEventListener('click', ()=> {
      let newBudget = prompt('Ingresa el nuevo presupuesto asignado para ' + capitalize(role) + ' (ejemplo: $5,000,000):', currentBudget);
      if(newBudget && newBudget.trim() !== ''){
        budgets[role] = newBudget.trim();
        localStorage.setItem('budgets', JSON.stringify(budgets));
        document.getElementById('budgetValue').textContent = newBudget.trim();
        alert('Presupuesto actualizado para ' + capitalize(role));
      }
    });
    document.getElementById('editDistribBtn').addEventListener('click', ()=> {
      let op = prompt('Porcentaje para Operación:', currentDistrib[0]);
      let inv = prompt('Porcentaje para Inversión:', currentDistrib[1]);
      let mant = prompt('Porcentaje para Mantenimiento:', currentDistrib[2]);
      op = parseInt(op)||0; inv = parseInt(inv)||0; mant = parseInt(mant)||0;
      if(op+inv+mant!==100){ alert('La suma debe ser 100%'); return; }
      distribs[role] = [op,inv,mant];
      localStorage.setItem('distribs', JSON.stringify(distribs));
      renderViewForRole(role,'budget');
    });
  } else if(view === 'payments'){
    main.innerHTML = `
      <h3>Pagos y Recaudación - ${capitalize(role)}</h3>
      <p class="small">Pagos pendientes y realizados</p>
      <div style="margin-top:12px" class="card">
        <table class="table">
          <thead><tr><th>Proveedor</th><th>Monto</th><th>Estado</th><th>Acción</th></tr></thead>
          <tbody>
            <tr><td>Proveedor A</td><td>$120,000</td><td>Pendiente</td><td><button class="btn-primary" onclick="alert('Pago realizado con éxito')">Pagar</button></td></tr>
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
    // Obtener presupuesto y distribución actual
    let budgets = {};
    let distribs = {};
    try { budgets = JSON.parse(localStorage.getItem('budgets')||'{}'); } catch(e) { budgets = {}; }
    try { distribs = JSON.parse(localStorage.getItem('distribs')||'{}'); } catch(e) { distribs = {}; }
    const currentBudget = budgets[role] || d.budget || '-';
    const defaultDistrib = [45,35,20];
    const currentDistrib = (distribs[role] && Array.isArray(distribs[role]) && distribs[role].length===3) ? distribs[role] : defaultDistrib;
    main.innerHTML = `
      <h3>Reportes - ${capitalize(role)}</h3>
      <p class="small">Exportar y ver reportes</p>
      <div style="margin-top:12px" class="card">
        <button class="btn-primary" id="exportBtn">Generar reporte PDF</button>
      </div>
    `;
    document.getElementById('exportBtn').addEventListener('click', async ()=> {
      // Generar PDF profesional con jsPDF, logo grande, header rojo, tabla de distribución
      const { jsPDF } = window.jspdf || {};
      if (!jsPDF) { alert('jsPDF no está disponible'); return; }
      const doc = new jsPDF();
      // Header rojo y logo grande
      doc.setFillColor(235,0,41);
      doc.rect(0,0,210,40,'F');
      try {
        const dataUrl = await loadImageDataURL('Logo.png');
        doc.addImage(dataUrl, 'PNG', 160, 7, 35, 25);
      } catch (e) {}
      doc.setFontSize(22);
      doc.setTextColor(255,255,255);
      doc.text('Reporte Oficial de Dependencia', 16, 20);
      doc.setFontSize(13);
      doc.text('Banorte SmartGov', 16, 32);
      // Cuerpo
      let y = 50;
      doc.setFontSize(12);
      doc.setTextColor(50,62,72);
      doc.text('Dependencia:', 20, y);
      doc.text(capitalize(role), 70, y);
      y += 10;
      doc.text('Presupuesto asignado:', 20, y);
      doc.text(currentBudget, 70, y);
      y += 10;
      doc.text('Gasto acumulado:', 20, y);
      doc.text(d.spent || '-', 70, y);
      y += 10;
      doc.text('Fecha de generación:', 20, y);
      doc.text(new Date().toLocaleString(), 70, y);
      y += 16;
      // Tabla de distribución
      doc.setFontSize(13);
      doc.setFillColor(245,245,245);
      doc.rect(20,y-6,170,10,'F');
      doc.setTextColor(50,62,72);
      doc.text('Área', 30, y);
      doc.text('Porcentaje', 80, y);
      doc.text('Monto estimado', 130, y);
      y += 8;
      const areas = ['Operación','Inversión','Mantenimiento'];
      for(let i=0;i<3;i++){
        doc.text(areas[i], 30, y);
        doc.text(currentDistrib[i]+'%', 80, y);
        // Calcular monto estimado por área si posible
        let monto = '-';
        if(typeof currentBudget === 'string' && currentBudget[0]==='$'){
          let num = parseFloat(currentBudget.replace(/[^0-9.]/g,''));
          if(!isNaN(num)) monto = '$'+(num*currentDistrib[i]/100).toLocaleString('es-MX',{minimumFractionDigits:2});
        }
        doc.text(monto, 130, y);
        y += 8;
      }
      y += 8;
      doc.setFontSize(10);
      doc.setTextColor(150,150,150);
      doc.text('Documento oficial generado por Banorte SmartGov', 105, 285, {align:'center'});
      const filename = `reporte_${role}_${new Date().toISOString().slice(0,10)}.pdf`;
      doc.save(filename);
    });
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

// -----------------------------
// Init: load appropriate view
// -----------------------------
const stored = localStorage.getItem('role');
if (stored === 'ciudadano') renderCitizenDashboard();
else if (stored) renderDashboard(stored);
else renderLogin();

      const idx = 5 - diff; // 0 = más antiguo, 5 = actual
      const amt = parseFloat(p.amount) || 0;
      if (p.service && p.service.toLowerCase().includes('agua')) monthlyDataAgua[idx] += amt;
      if (p.service && p.service.toLowerCase().includes('energia')) monthlyDataEnergia[idx] += amt;
    }
  });

  const monthNames = ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic'];
  const labels = [];
  const now2 = new Date();
  for (let i = 5; i >= 0; i--) {
    const date = new Date(now2.getFullYear(), now2.getMonth() - i, 1);
    labels.push(monthNames[date.getMonth()]);
  }

  return { monthlyDataAgua, monthlyDataEnergia, labels };
}

function buildCitizenChart() {
  const canvas = document.getElementById('chartCitizen');
  if (!canvas || typeof Chart === 'undefined') return;
  const ctx = canvas.getContext('2d');
  const { monthlyDataAgua, monthlyDataEnergia, labels } = computeMonthlyPayments();

  if (window.citizenChart) {
    try { window.citizenChart.destroy(); } catch(e){}
    window.citizenChart = null;
  }

  window.citizenChart = new Chart(ctx, {
    type: 'bar',
    data: {
      labels,
      datasets: [
        { label: 'Agua', data: monthlyDataAgua, backgroundColor: '#EB0029' },
        { label: 'Energía', data: monthlyDataEnergia, backgroundColor: '#323E48' }
      ]
    },
    options: { plugins: { legend: { display: true, position: 'top' } }, scales: { y: { beginAtZero: true, ticks: { callback: v => '$' + v } } } }
  });
}

// -----------------------------
// Monto adeudado / actualización
// -----------------------------
function updateDebtAmounts() {
  // base amounts (could be pulled from server in real app)
  const originalAmounts = {'agua': 450.00, 'energia': 780.50};
  const payments = JSON.parse(localStorage.getItem('payments') || '[]');

  // accumulate paid amounts by normalized service key
  const paidByService = { 'agua': 0, 'energia': 0 };
  payments.forEach(payment => {
    if (!payment || !payment.service) return;
    // normalize service name (allow variations like 'Agua', 'agua potable', 'Energía')
    const s = String(payment.service).toLowerCase();
    const amtRaw = String(payment.amount || '0').replace(/[^0-9.-]+/g, '');
    const amt = parseFloat(amtRaw) || 0;
    if (s.includes('agua')) paidByService['agua'] += amt;
    else if (s.includes('ener') || s.includes('luz')) paidByService['energia'] += amt;
    else {
      // if unknown, try exact match
      if (paidByService[s] === undefined) paidByService[s] = 0;
      paidByService[s] += amt;
    }
  });

  const aguaRemaining = originalAmounts['agua'] - (paidByService['agua'] || 0);
  const energiaRemaining = originalAmounts['energia'] - (paidByService['energia'] || 0);

  const aguaEl = document.getElementById('aguaAmount');
  const energiaEl = document.getElementById('energiaAmount');
  const totalEl = document.getElementById('totalAmount');
  if (aguaEl) aguaEl.textContent = aguaRemaining > 0 ? `$${aguaRemaining.toFixed(2)}` : 'Pagado';
  if (energiaEl) energiaEl.textContent = energiaRemaining > 0 ? `$${energiaRemaining.toFixed(2)}` : 'Pagado';
  // compute total as sum of positive remainders so overpayments in one service don't cancel others
  const totalRemaining = Math.max(0, aguaRemaining) + Math.max(0, energiaRemaining);
  if (totalEl) totalEl.textContent = `$${totalRemaining.toFixed(2)}`;

  // optional small debug output to help verify calculations in the UI
  const noteEl = document.getElementById('historyPdfNote');
  if (noteEl) {
    try {
      const paidAg = (paidByService['agua'] || 0).toFixed(2);
      const paidEn = (paidByService['energia'] || 0).toFixed(2);
      noteEl.textContent = `Pagado — Agua: $${paidAg} · Energía: $${paidEn} · Restante: $${totalRemaining.toFixed(2)}`;
    } catch (e) { /* ignore */ }
  }
}

// -----------------------------
// App base (login, users, render helpers)
// -----------------------------
const users = [
  { username: "agua", password: "1234", role: "agua" },
  { username: "energia", password: "1234", role: "energia" },
  { username: "transporte", password: "1234", role: "transporte" },
  { username: "obras", password: "1234", role: "obras" },
  { username: "tesoreria", password: "1234", role: "tesoreria" },
  { username: "transparencia", password: "1234", role: "transparencia" },
  { username: "ciudadano", password: "1234", role: "ciudadano" }
];

const app = document.getElementById('app') || document.body;
function setHTML(html) { app.innerHTML = html; }

// -----------------------------
// Login view
// -----------------------------
function renderLogin() {
  setHTML(`
    <div class="login-wrap">
      <div class="login-card card">
        <div style="text-align:center;margin-bottom:8px">
          <div class="logo" style="margin:0 auto"><img src="Logo.png" alt="logo" style="height:48px;object-fit:contain"></div>
        </div>
        <h2 class="text-center" style="color:var(--banorte-red);margin-bottom:6px">Banorte SmartGov</h2>
        <p class="text-center small" style="margin-top:0">Plataforma financiera integrada</p>
        <form id="loginForm" style="margin-top:18px">
          <div class="form-group"><input id="user" class="input" placeholder="Usuario (ej: agua / ciudadano)" /></div>
          <div class="form-group" style="position:relative"><input id="pass" type="password" class="input" placeholder="Contraseña" /><img id="togglePassword" class="eye-icon" src="eye_visible_hide_hidden_show_icon_145988.png" alt="Mostrar contraseña" title="Mostrar/ocultar contraseña" /></div>
          <button class="btn-primary" type="submit">Iniciar sesión</button>
          <div id="error" class="error" style="display:none"></div>
        </form>
      </div>
    </div>
  `);

  const f = document.getElementById('loginForm');
  if (f) f.addEventListener('submit', (e) => {
    e.preventDefault();
    const u = document.getElementById('user').value.trim();
    const p = document.getElementById('pass').value;
    const found = users.find(x => x.username === u && x.password === p);
    const err = document.getElementById('error');
    if (found) {
      localStorage.setItem('role', found.role);
      if (found.role === 'ciudadano') renderCitizenDashboard();
      else renderDashboard(found.role);
    } else {
      if (err) { err.style.display = 'block'; err.textContent = 'Usuario o contraseña incorrectos'; }
    }
  });

  const toggle = document.getElementById('togglePassword');
  if (toggle) toggle.addEventListener('click', () => {
    const pass = document.getElementById('pass');
    if (!pass) return;
    if (pass.type === 'password') { pass.type = 'text'; toggle.src = 'eye_slash_visible_hide_hidden_show_icon_145987.png'; }
    else { pass.type = 'password'; toggle.src = 'eye_visible_hide_hidden_show_icon_145988.png'; }
  });
}

// -----------------------------
// Citizen dashboard
// -----------------------------
function renderCitizenDashboard() {
  setHTML(`
    <div class="container">
      <div class="header card">
        <div class="brand">
          <div class="logo">B</div>
          <div><div class="h1"><img src="Logo.png" style="height:20px;object-fit:contain"></div><div class="small">Paga tus servicios y consulta tu historial</div></div>
        </div>
        <div><button id="logout" class="logout-btn">Cerrar sesión</button></div>
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
    </div>
  `);

  const logoutBtn = document.getElementById('logout');
  if (logoutBtn) logoutBtn.addEventListener('click', () => { localStorage.removeItem('role'); renderLogin(); });

  document.querySelectorAll('#menuCitizen li').forEach(li => {
    li.addEventListener('click', () => {
      document.querySelectorAll('#menuCitizen li').forEach(x => x.classList.remove('active'));
      li.classList.add('active');
      renderCitizenView(li.getAttribute('data-view'));
    });
  });

  updateDebtAmounts();
  renderCitizenView('account');
}

// -----------------------------
// Citizen views: account / pay / history
// -----------------------------
function renderCitizenView(view) {
  const payments = JSON.parse(localStorage.getItem('payments') || '[]');
  const content = document.getElementById('citizenContent');
  if (!content) return;

  if (view === 'account') {
    content.innerHTML = `
      <h3>Mi cuenta</h3>
      <p class="small">Saldo estimado y servicios vinculados</p>
      <div class="grid-2" style="margin-top:12px">
        <div class="kpi card"><h4>Servicios activos</h4><p>Agua, Luz</p></div>
    <div class="kpi card"><h4>Último pago</h4><p>${payments[0] ? payments[0].service + ' - $' + (Number(payments[0].amount) || 0).toFixed(2) : '-'}</p></div>
      </div>

      <div style="margin-top:14px" class="card">
        <h4>Pagos por mes</h4>
        <canvas id="chartCitizen" height="120"></canvas>
      </div>
    `;
    requestAnimationFrame(() => setTimeout(buildCitizenChart, 20));
    return;
  }

  if (view === 'pay') {
    content.innerHTML = `
      <h3>Pagar servicios</h3>
      <p class="small">Selecciona servicio y método de pago</p>

      <div class="card debt-section" style="margin-top:12px">
        <div class="debt-header"><h4 style="margin:0">Cuánto debes pagar</h4><span class="debt-total">Total: <strong id="totalAmount">$1,230.50</strong></span></div>
        <div class="debt-grid">
          <div class="debt-card" data-service="agua"><div class="debt-icon">💧</div><div class="debt-info"><span class="debt-name">Agua potable</span></div><span class="debt-amount" id="aguaAmount">$450.00</span></div>
          <div class="debt-card" data-service="energia"><div class="debt-icon">⚡</div><div class="debt-info"><span class="debt-name">Energía</span></div><span class="debt-amount" id="energiaAmount">$780.50</span></div>
        </div>
      </div>

      <!-- Flex container: main pay form (left) and PDF history card (right) -->
      <div style="display:flex;gap:12px;margin-top:12px;align-items:flex-start;flex-wrap:nowrap">
        <div class="pay-card" style="flex:1 1 0;min-width:300px">
          <div class="card" style="padding:12px">
            <label class="small">Servicio</label>
            <select id="service" class="input" style="margin-top:6px">
              <option value="Agua">Agua potable</option>
              <option value="Energia">Energía</option>
            </select>

            <div style="margin-top:10px">
              <label class="small">Monto (MXN)</label>
              <input id="amount" class="input" placeholder="500.00" style="margin-top:6px"/>
            </div>

            <div style="margin-top:10px">
              <label class="small">Método de pago</label>
              <select id="method" class="input" style="margin-top:6px">
                <option value="tarjeta">Tarjeta</option>
                <option value="transferencia">Transferencia</option>
              </select>
            </div>

            <div id="cardFields" style="margin-top:10px">
              <label class="small">Número de tarjeta</label>
              <input id="cardNumber" class="input" maxlength="19" placeholder="1234 5678 9012 3456" style="margin-top:6px"/>
              <div style="display:flex;gap:8px;margin-top:8px">
                <div style="flex:1">
                  <label class="small">Expira</label>
                  <input id="exp" class="input" placeholder="MM/AA" maxlength="5"/>
                </div>
                <div style="width:110px">
                  <label class="small">CVV</label>
                  <input id="cvv" class="input" placeholder="123" maxlength="4"/>
                </div>
              </div>
            </div>

            <div style="margin-top:12px">
              <button class="btn-primary" id="payBtn">Pagar ahora</button>
            </div>

            <div id="payMsg" style="margin-top:10px;color:var(--banorte-red);display:none"></div>
          </div>
        </div>

        <!-- Right-side card: Historial PDF (Banorte styling) -->
        <div id="historyPdfCard" class="card" style="flex:1 1 360px;min-width:240px;max-width:100%;padding:14px;box-sizing:border-box">
          <div style="display:flex;align-items:center;gap:10px">
            <div style="width:48px;height:48px;border-radius:6px;background:#EB0029;display:flex;align-items:center;justify-content:center;color:white;font-weight:700;font-size:20px">B</div>
            <div>
              <div style="font-weight:700">Banorte SmartGov</div>
              <div class="small" style="color:#666">Descarga tu historial</div>
            </div>
          </div>

          <p class="small" style="margin-top:12px;color:#333">Genera un PDF con el estilo oficial de Banorte que incluye tus pagos registrados. Ideal para comprobantes y archivo personal.</p>
          <button id="downloadHistoryPdfBtn" class="btn-primary" style="margin-top:8px;width:100%;padding:12px 10px;font-size:15px">Descargar historial (PDF)</button>
          <div id="historyPdfNote" class="small" style="margin-top:8px;color:#666"></div>
          <!-- Container for per-payment receipt button (moved here for better placement) -->
          <div id="receiptContainer" style="margin-top:10px"></div>
        </div>
      </div>
    `;

    const methodEl = document.getElementById('method');
    const cardFields = document.getElementById('cardFields');
    if (methodEl && cardFields) {
      methodEl.value = 'tarjeta';
      methodEl.addEventListener('change', () => {
        cardFields.style.display = methodEl.value === 'tarjeta' ? 'block' : 'none';
      });
    }

    const payBtn = document.getElementById('payBtn');
    const payMsg = document.getElementById('payMsg');
    if (payBtn) {
      payBtn.addEventListener('click', () => {
        const service = document.getElementById('service').value;
  const amountRaw = document.getElementById('amount').value || '0';
  // clean common formatting (commas, currency symbols, spaces) before parsing
  const amountClean = String(amountRaw).replace(/[^0-9.-]+/g, '');
  const amount = parseFloat(amountClean);
        const method = document.getElementById('method').value;

  if (isNaN(amount) || amount <= 0) { payMsg.style.display='block'; payMsg.textContent='Ingresa un monto válido'; return; }

        if (method === 'tarjeta') {
          const card = document.getElementById('cardNumber').value.replace(/\s+/g,'');
          const exp = document.getElementById('exp').value.trim();
          const cvv = document.getElementById('cvv').value.trim();
          if (card.length<13 || card.length>19) { payMsg.style.display='block'; payMsg.textContent='Número de tarjeta inválido'; return; }
          if (!/^\d{2}\/\d{2}$/.test(exp)) { payMsg.style.display='block'; payMsg.textContent='Formato de expiración inválido (MM/AA)'; return; }
          if (cvv.length<3) { payMsg.style.display='block'; payMsg.textContent='CVV inválido'; return; }
        }

        const payments = JSON.parse(localStorage.getItem('payments')||'[]');
        const p = {
          service,
          ref: 'FOLIO-' + Math.floor(Math.random()*90000 + 10000),
          // store amount as Number for reliable math
          amount: parseFloat(amount.toFixed(2)),
          method,
          date: new Date().toISOString()
        };
        payments.unshift(p);
        localStorage.setItem('payments', JSON.stringify(payments));

        payMsg.style.display='block';
        payMsg.textContent='Pago simulado realizado con éxito';

        updateDebtAmounts();
        try { buildCitizenChart(); } catch(e){}

        showReceiptButton(p); // place receipt button inside history card
      });
    }

    // Wire history PDF download button on the right-side card
    const downloadBtn = document.getElementById('downloadHistoryPdfBtn');
    if (downloadBtn) {
      downloadBtn.addEventListener('click', () => {
        try { generateHistoryPdf(); }
        catch (e) { const note = document.getElementById('historyPdfNote'); if(note){note.textContent='Error generando PDF';} }
      });
    }

    updateDebtAmounts();
    return;
  }

  if (view === 'history') {
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
    const payments2 = JSON.parse(localStorage.getItem('payments') || '[]');
      if (payments2.length === 0) {
      tbody.innerHTML = '<tr><td colspan="5" class="small">Sin pagos registrados</td></tr>';
    } else {
      payments2.forEach(p => {
        const d = new Date(p.date);
        const displayDate = isNaN(d) ? p.date : d.toLocaleString();
        const tr = document.createElement('tr');
        const amt = (parseFloat(p.amount) || 0).toFixed(2);
        tr.innerHTML = `<td>${displayDate}</td><td>${p.service}</td><td>${p.ref || '-'}</td><td>$${amt}</td><td>${p.method || '-'}</td>`;
        tbody.appendChild(tr);
      });
    }

    setTimeout(() => {
      const existing = document.getElementById('chartHistCanvas'); if(existing) existing.remove();
      const chartC = document.createElement('canvas'); chartC.id='chartHistCanvas'; chartC.height=100; content.appendChild(chartC);

      const recent = payments2.slice(0,6).reverse();
      const labels = recent.map(p=>{const d=new Date(p.date); return isNaN(d)?p.date:d.toLocaleDateString();});
      const data = recent.map(p=>parseFloat(p.amount));
      const ctx = document.getElementById('chartHistCanvas').getContext('2d');
      if(window.histChart){try{window.histChart.destroy();}catch(e){}window.histChart=null;}
      window.histChart = new Chart(ctx,{type:'line',data:{labels,datasets:[{label:'Últimos pagos',data,borderColor:'#EB0029',tension:0.3}]},options:{plugins:{legend:{display:false}}}});
    },80);

    return;
  }
}

// -----------------------------
// PDF receipt button (placed in history card)
// -----------------------------
function showReceiptButton(payment) {

// -----------------------------
// Helper: load local image as data URL (for embedding into PDFs)
// -----------------------------
function loadImageDataURL(src) {
  return new Promise((resolve, reject) => {
    try {
      const img = new Image();
      img.crossOrigin = 'Anonymous';
      img.onload = () => {
        try {
          const canvas = document.createElement('canvas');
          canvas.width = img.naturalWidth || img.width;
          canvas.height = img.naturalHeight || img.height;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0);
          const data = canvas.toDataURL('image/png');
          resolve(data);
        } catch (err) { reject(err); }
      };
      img.onerror = (e) => reject(e);
      img.src = src;
      // If browser has already cached it and it's complete, try immediate
      if (img.complete && img.naturalWidth) {
        const canvas = document.createElement('canvas');
        canvas.width = img.naturalWidth || img.width;
        canvas.height = img.naturalHeight || img.height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0);
        resolve(canvas.toDataURL('image/png'));
      }
    } catch (err) { reject(err); }
  });
}
  // Prefer placing the receipt button inside the right-side history card for better UX
  let existing = document.getElementById('receiptBtn'); if (existing) existing.remove();
  const container = document.getElementById('receiptContainer');

  const createBtn = () => {
    const b = document.createElement('button');
    b.id = 'receiptBtn';
    b.className = 'btn-primary';
    b.textContent = 'Ver comprobante';
    b.style.marginTop = '8px';
    b.style.width = '100%';
    b.style.padding = '10px';
    b.style.fontSize = '14px';
    return b;
  };

  let btn;
  if (container) {
    btn = createBtn();
    container.appendChild(btn);
  } else {
    const content = document.getElementById('citizenContent'); if (!content) return;
    btn = createBtn();
    content.appendChild(btn);
  }

  btn.addEventListener('click', () => {
    (async () => {
      const { jsPDF } = window.jspdf || {};
      if (!jsPDF) { alert('jsPDF no está disponible'); return; }
      const doc = new jsPDF();

      // try to load and embed logo (Logo.png)
      try {
        const dataUrl = await loadImageDataURL('Logo.png');
        // add small logo at top-left
        doc.addImage(dataUrl, 'PNG', 12, 6, 18, 18);
      } catch (e) {
        // ignore if logo can't be loaded
      }

      // header bar
      doc.setFillColor(235,0,41);
      doc.rect(0,0,210,28,'F');
      doc.setTextColor(255,255,255);
      doc.setFontSize(16);
      doc.text('Comprobante de Pago',105,18,{align:'center'});

      doc.setTextColor(50,62,72);
      doc.setFontSize(12);
      const line = 44;
      doc.text(`Fecha: ${new Date(payment.date).toLocaleString()}`,20,line);
      doc.text(`Servicio: ${payment.service}`,20,line+10);
      doc.text(`Referencia: ${payment.ref}`,20,line+20);
      doc.text(`Monto: $${payment.amount}`,20,line+30);
      doc.text(`Método de pago: ${payment.method}`,20,line+40);

      doc.setDrawColor(235,0,41);
      doc.rect(15,line-5,180,50);

      const now = new Date();
      const stamp = `${now.getFullYear()}${String(now.getMonth()+1).padStart(2,'0')}${String(now.getDate()).padStart(2,'0')}_${String(now.getHours()).padStart(2,'0')}${String(now.getMinutes()).padStart(2,'0')}`;
      const filename = `comprobante_${payment.ref}_${stamp}.pdf`;
      doc.save(filename);

      // show confirmation inside the history card
      const note = document.getElementById('historyPdfNote');
      if (note) note.textContent = `Comprobante generado: ${filename}`;
    })();
  });
}

// -----------------------------
// Generar PDF: Historial completo con estética Banorte
// -----------------------------
function generateHistoryPdf() {
  const payments = JSON.parse(localStorage.getItem('payments') || '[]');

  (async () => {
    const { jsPDF } = window.jspdf || {};
    if (!jsPDF) { alert('jsPDF no está disponible'); return; }
    const doc = new jsPDF();

    // try to embed logo
    try {
      const dataUrl = await loadImageDataURL('Logo.png');
      doc.addImage(dataUrl, 'PNG', 12, 6, 18, 18);
    } catch (e) {}

    // Header: Banorte red bar and small logo block
    doc.setFillColor(235,0,41);
    doc.rect(0,0,210,28,'F');
    doc.setFontSize(14);
    doc.setTextColor(255,255,255);
    doc.text('Banorte SmartGov',40,18);

    doc.setFontSize(12);
    doc.setTextColor(50,62,72);
    doc.text('Historial de pagos',105,40,{align:'center'});

    let y = 50;
    doc.setFontSize(10);

    if (!payments || payments.length === 0) {
      doc.text('No hay pagos registrados.',20,y);
      const now = new Date();
      const stamp = `${now.getFullYear()}${String(now.getMonth()+1).padStart(2,'0')}${String(now.getDate()).padStart(2,'0')}_${String(now.getHours()).padStart(2,'0')}${String(now.getMinutes()).padStart(2,'0')}`;
      const filename = `historial_pagos_${stamp}.pdf`;
      doc.save(filename);
      const noteEl = document.getElementById('historyPdfNote'); if (noteEl) noteEl.textContent = `Historial generado: ${filename}`;
      return;
    }

    // Table header
    doc.setFillColor(245,245,245);
    doc.rect(15,y-6,180,8,'F');
    doc.setTextColor(50,62,72);
    doc.text('Fecha',20,y);
    doc.text('Servicio',70,y);
    doc.text('Referencia',110,y);
    doc.text('Monto',170,y);
    y += 8;

    // Rows
    payments.forEach((p, idx) => {
      if (y > 275) { doc.addPage(); y = 20; }
      const d = new Date(p.date);
      const ds = isNaN(d) ? p.date : d.toLocaleString();
      doc.text(ds,20,y);
      doc.text(p.service || '-',70,y);
      doc.text(p.ref || '-',110,y);
      doc.text('$' + (parseFloat(p.amount) || 0).toFixed(2),170,y);
      y += 8;
    });

    // Total
    const total = payments.reduce((s, p) => s + (parseFloat(p.amount) || 0), 0);
    if (y + 12 > 275) { doc.addPage(); y = 20; }
    doc.setDrawColor(235,0,41);
    doc.setLineWidth(0.5);
    doc.line(15,y,195,y);
    y += 6;
    doc.setFontSize(11);
    doc.text('Total:',150,y);
    doc.text('$' + total.toFixed(2),170,y);

    const now = new Date();
    const stamp = `${now.getFullYear()}${String(now.getMonth()+1).padStart(2,'0')}${String(now.getDate()).padStart(2,'0')}_${String(now.getHours()).padStart(2,'0')}${String(now.getMinutes()).padStart(2,'0')}`;
    const filename = `historial_pagos_${stamp}.pdf`;
    doc.save(filename);
    const noteEl = document.getElementById('historyPdfNote'); if (noteEl) noteEl.textContent = `Historial generado: ${filename}`;
  })();
}

// -----------------------------
// Re-use and simplified admin/dashboard functions from original
// -----------------------------
function renderDashboard(role){
  setHTML(`
    <div class="container">
      <div class="header card">
          <div class="brand">
          <div class="logo">B</div>
          <div>
            <div class="h1"><img src="Logo.png" style="height:20px;object-fit:contain"></div>
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

function renderViewForRole(role, view){
  const main = document.getElementById('mainContent');
  const data = {};
  if(view === 'overview'){
    main.innerHTML = `<h3>${capitalize(role)} - Resumen</h3><p class="small">Resumen</p>`;
  } else {
    main.innerHTML = `<h3>${capitalize(role)} - ${view}</h3><p class="small">Sección de demo</p>`;
  }
}

function capitalize(s){ if(!s) return ''; return s.charAt(0).toUpperCase()+s.slice(1); }

// -----------------------------
// Init: load appropriate view
// -----------------------------
const stored = localStorage.getItem('role');
if (stored === 'ciudadano') renderCitizenDashboard();
else if (stored) renderDashboard(stored);
else renderLogin();
