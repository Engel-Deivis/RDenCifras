// ── CONFIG GLOBAL CHART.JS ────────────────────────────────────
Chart.defaults.color = 'rgba(255,255,255,0.5)';
Chart.defaults.borderColor = 'rgba(255,255,255,0.06)';
Chart.defaults.font.family = 'Inter';
Chart.defaults.font.size = 11;
Chart.defaults.plugins.legend.display = false;

const COLORES = {
    indigo: '#6366f1',
    cyan: '#22d3ee',
    green: '#4ade80',
    amber: '#fbbf24',
    rose: '#f43f5e',
    purple: '#a855f7',
    blue: '#3b82f6',
    teal: '#14b8a6',
};

function crearGrafica(canvasId, tipo, labels, datasets, opciones = {}) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) return null;

    const ctx = canvas.getContext('2d');

    return new Chart(ctx, {
        type: tipo,
        data: { labels, datasets },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            animation: { duration: 800, easing: 'easeInOutQuart' },
            plugins: {
                legend: { display: opciones.legend || false },
                tooltip: {
                    backgroundColor: 'rgba(15,15,20,0.95)',
                    borderColor: 'rgba(255,255,255,0.1)',
                    borderWidth: 1,
                    padding: 12,
                    titleFont: { size: 12, weight: '600' },
                    bodyFont: { size: 11 },
                    callbacks: opciones.tooltipCallback || {},
                },
            },
            scales: tipo === 'doughnut' ? {} : {
                x: {
                    grid: { color: 'rgba(255,255,255,0.04)' },
                    ticks: { color: 'rgba(255,255,255,0.4)', maxTicksLimit: 8 },
                },
                y: {
                    grid: { color: 'rgba(255,255,255,0.04)' },
                    ticks: { color: 'rgba(255,255,255,0.4)' },
                    ...(opciones.yConfig || {}),
                },
            },
            ...(opciones.extra || {}),
        },
    });
}

function gradiente(ctx, color1, color2) {
    const g = ctx.createLinearGradient(0, 0, 0, 300);
    g.addColorStop(0, color1);
    g.addColorStop(1, color2);
    return g;
}

// ── RENDER TODAS LAS GRÁFICAS ─────────────────────────────────
function renderGraficas(datos) {
    const años = datos.pib.map(d => d.año);

    // PIB
    crearGrafica('chart-pib', 'line',
        datos.pib.map(d => d.año),
        [{
            data: datos.pib.map(d => (d.valor / 1e9).toFixed(2)),
            borderColor: COLORES.indigo,
            backgroundColor: 'rgba(99,102,241,0.1)',
            borderWidth: 2,
            fill: true,
            tension: 0.4,
            pointRadius: 3,
            pointHoverRadius: 6,
        }],
        { tooltipCallback: { label: ctx => `$${ctx.parsed.y}B USD` } }
    );

    // Crecimiento PIB
    crearGrafica('chart-crecimiento', 'bar',
        datos.crecimiento.map(d => d.año),
        [{
            data: datos.crecimiento.map(d => d.valor?.toFixed(2)),
            backgroundColor: datos.crecimiento.map(d =>
                d.valor >= 0 ? 'rgba(74,222,128,0.7)' : 'rgba(244,63,94,0.7)'
            ),
            borderRadius: 4,
        }],
        { tooltipCallback: { label: ctx => `${ctx.parsed.y}%` } }
    );

    // Inflación
    crearGrafica('chart-inflacion', 'line',
        datos.inflacion.map(d => d.año),
        [{
            data: datos.inflacion.map(d => d.valor?.toFixed(2)),
            borderColor: COLORES.amber,
            backgroundColor: 'rgba(251,191,36,0.08)',
            borderWidth: 2,
            fill: true,
            tension: 0.4,
            pointRadius: 3,
        }],
        { tooltipCallback: { label: ctx => `${ctx.parsed.y}%` } }
    );

    // IED
    crearGrafica('chart-ied', 'bar',
        datos.ied.map(d => d.año),
        [{
            data: datos.ied.map(d => (d.valor / 1e6).toFixed(0)),
            backgroundColor: 'rgba(168,85,247,0.7)',
            borderRadius: 4,
        }],
        { tooltipCallback: { label: ctx => `$${ctx.parsed.y}M USD` } }
    );

    // Población
    crearGrafica('chart-poblacion', 'line',
        datos.poblacion.map(d => d.año),
        [{
            data: datos.poblacion.map(d => (d.valor / 1e6).toFixed(2)),
            borderColor: COLORES.cyan,
            backgroundColor: 'rgba(34,211,238,0.08)',
            borderWidth: 2,
            fill: true,
            tension: 0.4,
            pointRadius: 2,
        }],
        { tooltipCallback: { label: ctx => `${ctx.parsed.y}M habitantes` } }
    );

    // Urbano vs Rural (doughnut)
    const urbanaActual = ultimoValor(datos.urbana) || 83;
    crearGrafica('chart-urbano', 'doughnut',
        ['Urbana', 'Rural'],
        [{
            data: [urbanaActual.toFixed(1), (100 - urbanaActual).toFixed(1)],
            backgroundColor: [COLORES.indigo, COLORES.cyan],
            borderWidth: 0,
            hoverOffset: 8,
        }],
        { legend: true }
    );

    // Turistas
    crearGrafica('chart-turistas', 'bar',
        datos.turistas.map(d => d.año),
        [{
            data: datos.turistas.map(d => (d.valor / 1e6).toFixed(2)),
            backgroundColor: 'rgba(34,211,238,0.7)',
            borderRadius: 4,
        }],
        { tooltipCallback: { label: ctx => `${ctx.parsed.y}M turistas` } }
    );

    // Ingresos turismo
    crearGrafica('chart-ingresos-turismo', 'line',
        datos['turismo$'].map(d => d.año),
        [{
            data: datos['turismo$'].map(d => (d.valor / 1e9).toFixed(2)),
            borderColor: COLORES.teal,
            backgroundColor: 'rgba(20,184,166,0.08)',
            borderWidth: 2,
            fill: true,
            tension: 0.4,
            pointRadius: 3,
        }],
        { tooltipCallback: { label: ctx => `$${ctx.parsed.y}B USD` } }
    );

    // Esperanza de vida
    crearGrafica('chart-vida', 'line',
        datos.esperanza.map(d => d.año),
        [{
            data: datos.esperanza.map(d => d.valor?.toFixed(1)),
            borderColor: COLORES.green,
            backgroundColor: 'rgba(74,222,128,0.08)',
            borderWidth: 2,
            fill: true,
            tension: 0.4,
            pointRadius: 2,
        }],
        { tooltipCallback: { label: ctx => `${ctx.parsed.y} años` } }
    );

    // Desempleo
    crearGrafica('chart-desempleo', 'line',
        datos.desempleo.map(d => d.año),
        [{
            data: datos.desempleo.map(d => d.valor?.toFixed(1)),
            borderColor: COLORES.rose,
            backgroundColor: 'rgba(244,63,94,0.08)',
            borderWidth: 2,
            fill: true,
            tension: 0.4,
            pointRadius: 3,
        }],
        { tooltipCallback: { label: ctx => `${ctx.parsed.y}%` } }
    );

    // Educación
    crearGrafica('chart-educacion', 'bar',
        datos.educacion.map(d => d.año),
        [{
            data: datos.educacion.map(d => d.valor?.toFixed(2)),
            backgroundColor: 'rgba(168,85,247,0.7)',
            borderRadius: 4,
        }],
        { tooltipCallback: { label: ctx => `${ctx.parsed.y}% del PIB` } }
    );

    // Comercio exterior
    crearGrafica('chart-comercio', 'line',
        datos.exportaciones.map(d => d.año),
        [
            {
                label: 'Exportaciones',
                data: datos.exportaciones.map(d => d.valor?.toFixed(1)),
                borderColor: COLORES.green,
                backgroundColor: 'rgba(74,222,128,0.06)',
                borderWidth: 2,
                fill: true,
                tension: 0.4,
                pointRadius: 2,
            },
            {
                label: 'Importaciones',
                data: datos.importaciones.map(d => d.valor?.toFixed(1)),
                borderColor: COLORES.rose,
                backgroundColor: 'rgba(244,63,94,0.06)',
                borderWidth: 2,
                fill: true,
                tension: 0.4,
                pointRadius: 2,
            },
        ],
        {
            legend: true,
            tooltipCallback: { label: ctx => `${ctx.dataset.label}: ${ctx.parsed.y}% PIB` }
        }
    );

    // Remesas
    crearGrafica('chart-remesas', 'bar',
        datos.remesas.map(d => d.año),
        [{
            data: datos.remesas.map(d => (d.valor / 1e9).toFixed(2)),
            backgroundColor: 'rgba(251,191,36,0.7)',
            borderRadius: 4,
        }],
        { tooltipCallback: { label: ctx => `$${ctx.parsed.y}B USD` } }
    );

    // Comparativa Caribe
    crearGrafica('chart-caribe', 'bar',
        datos.caribe.map(d => d.nombre),
        [{
            data: datos.caribe.map(d => (d.valor || 0).toFixed(0)),
            backgroundColor: datos.caribe.map(d =>
                d.code === 'DO' ? COLORES.indigo : 'rgba(255,255,255,0.15)'
            ),
            borderRadius: 6,
        }],
        {
            extra: { indexAxis: 'y' },
            tooltipCallback: { label: ctx => `$${parseInt(ctx.parsed.x).toLocaleString()} USD per cápita` }
        }
    );
}