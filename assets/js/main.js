document.addEventListener('DOMContentLoaded', async () => {

    // Llenar selector de años
    const selector = document.getElementById('año-selector');
    const añoActual = new Date().getFullYear();
    for (let a = añoActual; a >= 2000; a--) {
        const opt = document.createElement('option');
        opt.value = a;
        opt.textContent = a;
        selector.appendChild(opt);
    }

    // Cargar datos
    const datos = await fetchTodosLosDatos();
    datosGlobales = datos;

    // KPIs
    renderKPIs(datos);

    // Gráficas
    renderGraficas(datos);
});

function renderKPIs(datos) {
    const grid = document.getElementById('kpis-grid');
    if (!grid) return;

    const kpis = [
        {
            label: 'PIB Total',
            valor: formatearValor(ultimoValor(datos.pib), 'usd-b'),
            var: variacion(datos.pib),
            color: '#6366f1',
        },
        {
            label: 'PIB per cápita',
            valor: `$${Math.round(ultimoValor(datos.pibPC) || 0).toLocaleString()}`,
            var: variacion(datos.pibPC),
            color: '#22d3ee',
        },
        {
            label: 'Crecimiento PIB',
            valor: formatearValor(ultimoValor(datos.crecimiento), 'pct'),
            var: null,
            color: '#4ade80',
        },
        {
            label: 'Inflación',
            valor: formatearValor(ultimoValor(datos.inflacion), 'pct'),
            var: variacion(datos.inflacion),
            color: '#fbbf24',
        },
        {
            label: 'Población',
            valor: formatearValor(ultimoValor(datos.poblacion), 'millon'),
            var: variacion(datos.poblacion),
            color: '#a855f7',
        },
        {
            label: 'Turistas/año',
            valor: formatearValor(ultimoValor(datos.turistas), 'millon'),
            var: variacion(datos.turistas),
            color: '#14b8a6',
        },
    ];

    grid.innerHTML = kpis.map((k, i) => {
        const varNum = parseFloat(k.var);
        const varColor = varNum > 0 ? '#4ade80' : varNum < 0 ? '#f43f5e' : '#888';
        const varArrow = varNum > 0 ? '↑' : varNum < 0 ? '↓' : '';

        return `
  <div class="kpi-card rounded-2xl p-5" style="animation-delay:${i * 0.08}s">
    <div class="mb-3">
      <span class="font-mono text-[10px] tracking-widest uppercase text-[rgba(255,255,255,0.4)]">${k.label}</span>
    </div>
    <div class="text-[1.8rem] font-extrabold text-white leading-none tracking-tight mb-2">${k.valor}</div>
    ${k.var !== null ? `
      <div class="font-mono text-[11px]" style="color:${varColor}">
        ${varArrow} ${Math.abs(varNum)}% vs año anterior
      </div>
    ` : ''}
  </div>
`;
    }).join('');
}

function irSeccion(id) {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

let datosGlobales = null;

function cambiarAño(año) {
    if (!datosGlobales) return;
    const añoNum = parseInt(año);

    // Filtrar cada serie hasta ese año
    const datosFiltrados = {};
    for (const key in datosGlobales) {
        if (Array.isArray(datosGlobales[key])) {
            datosFiltrados[key] = datosGlobales[key].filter(d => d.año <= añoNum);
        } else {
            datosFiltrados[key] = datosGlobales[key];
        }
    }

    // Destruir gráficas existentes
    Chart.helpers.each(Chart.instances, chart => chart.destroy());

    // Re-renderizar con datos filtrados
    renderGraficas(datosFiltrados);
    renderKPIs(datosFiltrados);
}