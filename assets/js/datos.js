const WB = 'https://api.worldbank.org/v2/country/DO/indicator';
const WB_PARAMS = '?format=json&per_page=30&mrv=25';

// ── INDICADORES ───────────────────────────────────────────────
const INDICADORES = {
    pib: 'NY.GDP.MKTP.CD',
    crecimiento: 'NY.GDP.MKTP.KD.ZG',
    pibPerCapita: 'NY.GDP.PCAP.CD',
    inflacion: 'FP.CPI.TOTL.ZG',
    poblacion: 'SP.POP.TOTL',
    urbana: 'SP.URB.TOTL.IN.ZS',
    turistas: 'ST.INT.ARVL',
    turismo$: 'ST.INT.RCPT.CD',
    esperanza: 'SP.DYN.LE00.IN',
    desempleo: 'SL.UEM.TOTL.ZS',
    educacion: 'SE.XPD.TOTL.GD.ZS',
    exportaciones: 'NE.EXP.GNFS.ZS',
    importaciones: 'NE.IMP.GNFS.ZS',
    remesas: 'BX.TRF.PWKR.CD.DT',
    ied: 'BX.KLT.DINV.CD.WD',
};

// ── FETCH UN INDICADOR ────────────────────────────────────────
async function fetchIndicador(codigo) {
    try {
        const res = await fetch(`${WB}/${codigo}${WB_PARAMS}`);
        const data = await res.json();
        if (!data[1]) return [];

        return data[1]
            .filter(d => d.value !== null)
            .map(d => ({ año: parseInt(d.date), valor: d.value }))
            .sort((a, b) => a.año - b.año);
    } catch {
        return [];
    }
}

// ── FETCH COMPARATIVA CARIBE ──────────────────────────────────
async function fetchCaribe() {
    const paises = [
        { code: 'DO', nombre: 'Rep. Dominicana' },
        { code: 'CU', nombre: 'Cuba' },
        { code: 'HT', nombre: 'Haití' },
        { code: 'JM', nombre: 'Jamaica' },
        { code: 'TT', nombre: 'Trinidad y Tobago' },
        { code: 'PR', nombre: 'Puerto Rico' },
        { code: 'PA', nombre: 'Panamá' },
    ];

    const resultados = await Promise.allSettled(
        paises.map(p =>
            fetch(`https://api.worldbank.org/v2/country/${p.code}/indicator/NY.GDP.PCAP.CD?format=json&mrv=1`)
                .then(r => r.json())
                .then(data => ({
                    nombre: p.nombre,
                    valor: data[1]?.[0]?.value || 0,
                    code: p.code,
                }))
        )
    );

    return resultados
        .filter(r => r.status === 'fulfilled')
        .map(r => r.value)
        .sort((a, b) => b.valor - a.valor);
}

// ── FETCH TODOS LOS DATOS ─────────────────────────────────────
async function fetchCaribe() {
    const paises = [
        { code: 'DO', nombre: 'Rep. Dominicana' },
        { code: 'CU', nombre: 'Cuba' },
        { code: 'HT', nombre: 'Haití' },
        { code: 'JM', nombre: 'Jamaica' },
        { code: 'TT', nombre: 'Trinidad y Tobago' },
        { code: 'PA', nombre: 'Panamá' },
        { code: 'CR', nombre: 'Costa Rica' },
    ];

    const resultados = await Promise.allSettled(
        paises.map(p =>
            fetch(`https://api.worldbank.org/v2/country/${p.code}/indicator/NY.GDP.PCAP.CD?format=json&mrv=5`)
                .then(r => r.json())
                .then(data => {
                    // Buscar el primer valor no nulo en los últimos 5 años
                    const items = data[1] || [];
                    const item = items.find(i => i.value !== null);
                    return {
                        nombre: p.nombre,
                        valor: item?.value || 0,
                        code: p.code,
                    };
                })
        )
    );

    return resultados
        .filter(r => r.status === 'fulfilled' && r.value.valor > 0)
        .map(r => r.value)
        .sort((a, b) => b.valor - a.valor);
}

// ── HELPERS ───────────────────────────────────────────────────
function formatearValor(valor, tipo) {
    if (!valor && valor !== 0) return 'N/D';
    switch (tipo) {
        case 'usd-b': return `$${(valor / 1e9).toFixed(1)}B`;
        case 'usd-m': return `$${(valor / 1e6).toFixed(0)}M`;
        case 'pct': return `${valor.toFixed(1)}%`;
        case 'millon': return `${(valor / 1e6).toFixed(2)}M`;
        case 'años': return `${valor.toFixed(1)} años`;
        default: return valor.toLocaleString();
    }
}

function ultimoValor(serie) {
    if (!serie.length) return null;
    return serie[serie.length - 1].valor;
}

function variacion(serie) {
    if (serie.length < 2) return null;
    const actual = serie[serie.length - 1].valor;
    const anterior = serie[serie.length - 2].valor;
    return ((actual - anterior) / anterior * 100).toFixed(1);
}