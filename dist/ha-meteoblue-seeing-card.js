/* Meteoblue Astronomy Seeing Card v0.2.1
 * Home Assistant custom Lovelace card for the Meteoblue Astronomy Seeing v0.1.x integration.
 * No external dependencies, no additional web requests and no HA Scrape integration.
 * Forecast source: the three forecast sensors from custom_components/meteoblue_seeing.
 */
(() => {
  'use strict';
  const VERSION = '0.2.1';
  const SOURCE = 'meteoblue Astronomy Seeing';
  const MODES = {
    seeing: {
      title: 'Seeing Index', hint: 'Wyższy indeks oznacza lepsze warunki (1–5).', unit: '',
      min: 1, max: 5, decimals: 0,
      series: [
        { key: 'seeing_1', name: 'Seeing Index 1', color: '#7bc8ff' },
        { key: 'seeing_2', name: 'Seeing Index 2', color: '#ffc56f' },
      ],
    },
    clouds: {
      title: 'Zachmurzenie', hint: 'Niższe wartości są korzystniejsze. Pokazano trzy warstwy, bez sumowania.', unit: '%',
      min: 0, max: 100, decimals: 0,
      series: [
        { key: 'cloud_low', name: 'Niskie', color: '#62d5e7' },
        { key: 'cloud_mid', name: 'Średnie', color: '#edaf71' },
        { key: 'cloud_high', name: 'Wysokie', color: '#ba95f6' },
      ],
    },
    arcsec: {
      title: 'Seeing (arcsec)', hint: 'Niższa wartość w sekundach łuku oznacza lepszy seeing.', unit: '″',
      min: null, max: null, decimals: 2,
      series: [{ key: 'seeing_arcsec', name: 'Seeing', color: '#fbbf74' }],
    },
    jet: {
      title: 'Jet Stream', hint: 'Prędkość wiatru w górnych warstwach atmosfery; m/s.', unit: 'm/s',
      min: 0, max: null, decimals: 1,
      series: [{ key: 'jetstream', name: 'Jet Stream', color: '#8bdbb0' }],
    },
    layers: {
      title: 'Warstwy turbulencji', hint: 'Wysokość dolnej i górnej granicy problematycznej warstwy (km).', unit: 'km',
      min: 0, max: null, decimals: 1,
      series: [
        { key: 'badlayer_bottom', name: 'Dolna', color: '#fda4af' },
        { key: 'badlayer_top', name: 'Górna', color: '#93c5fd' },
      ],
    },
    temperature: {
      title: 'Temperatura przy gruncie', hint: 'Prognozowana temperatura powietrza przy gruncie.', unit: '°C',
      min: null, max: null, decimals: 1,
      series: [{ key: 'temperature', name: 'Temperatura', color: '#ffba73' }],
    },
    humidity: {
      title: 'Wilgotność przy gruncie', hint: 'Prognozowana wilgotność względna powietrza.', unit: '%',
      min: 0, max: 100, decimals: 0,
      series: [{ key: 'humidity', name: 'Wilgotność', color: '#74c7ff' }],
    },
  };
  const LABELS = [
    ['seeing', 'Seeing'], ['clouds', 'Chmury'], ['arcsec', 'Arcsec'],
    ['jet', 'Jet Stream'], ['layers', 'Warstwy'],
    ['temperature', 'Temp.'], ['humidity', 'Wilg.'],
  ];
  const css = `
    :host{display:block;width:100%;min-width:0;box-sizing:border-box;--mb-text:var(--primary-text-color,#e7edf5);--mb-muted:var(--secondary-text-color,#9ba7b4);--mb-divider:var(--divider-color,#323e50)}
    ha-card{display:block;width:100%;min-width:0;box-sizing:border-box;container-type:inline-size;overflow:hidden;color:var(--mb-text);background:var(--ha-card-background,var(--card-background-color,#202630));border-radius:var(--ha-card-border-radius,16px)}
    .wrap{width:100%;min-width:0;padding:18px 20px 16px;box-sizing:border-box}
    .heading{display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:8px;margin-bottom:4px}
    h2{font-weight:680;letter-spacing:-.3px;font-size:20px;margin:0;line-height:1.25}
    .subtitle{font-size:12px;color:var(--mb-muted);margin:4px 0 13px}
    .source{font-size:11px;white-space:nowrap;color:var(--mb-muted)}
    .status{font-size:12px;color:var(--mb-muted);padding:6px 0 12px}
    .summary{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:9px;margin:13px 0 16px}
    .chip{border:1px solid var(--mb-divider);border-radius:10px;padding:10px 9px;min-width:0;background:rgba(130,147,175,.055)}
    .chip .ch-label{font-size:11px;color:var(--mb-muted);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
    .chip .ch-value{font-size:21px;font-weight:700;margin-top:3px;font-variant-numeric:tabular-nums;white-space:nowrap}
    .chip .ch-unit{font-size:12px;font-weight:450;color:var(--mb-muted)}
    .toolbar{display:flex;gap:7px;flex-wrap:wrap;justify-content:space-between;align-items:center;margin:0 0 14px}
    .metric-buttons,.day-buttons{display:flex;flex-wrap:wrap;gap:5px}
    button{cursor:pointer;background:transparent;color:var(--mb-muted);border:1px solid var(--mb-divider);font:inherit;padding:6px 9px;border-radius:8px;font-size:12px;transition:background .15s ease}
    button:hover{background:rgba(130,147,175,.14);color:var(--mb-text)}
    button[aria-pressed=true]{background:var(--primary-color,#408bff);border-color:var(--primary-color,#408bff);color:#fff;font-weight:650}
    button:focus-visible{outline:2px solid var(--primary-color,#408bff);outline-offset:2px}
    .chart-head{display:flex;gap:10px;flex-wrap:wrap;justify-content:space-between;align-items:center;margin:5px 0 3px}
    .metric-title{font-size:14px;font-weight:650}
    .legend{display:flex;align-items:center;gap:13px;flex-wrap:wrap}
    .legend-item{font-size:11px;color:var(--mb-muted);display:flex;align-items:center;gap:5px}
    .legend-line{width:17px;height:3px;border-radius:3px;display:inline-block}
    .legend-night{width:13px;height:11px;border-radius:2px;background:#53739c;opacity:.55;display:inline-block}
    .graph-scroll{overflow-x:auto;overflow-y:hidden;scrollbar-width:thin;scrollbar-color:#7a8699 transparent;max-width:100%;margin-top:3px;touch-action:pan-x pan-y}
    svg{display:block;overflow:visible;font-family:inherit;max-width:none;user-select:none}
    .gridline{stroke:var(--mb-divider);stroke-width:1;stroke-dasharray:2 5}
    .axis{fill:var(--mb-muted);font-size:11px;font-variant-numeric:tabular-nums}
    .dayname{fill:var(--mb-text);font-size:11px;font-weight:650}
    .dayline{stroke:var(--mb-muted);stroke-opacity:.42;stroke-dasharray:3 4}
    .graph-series{fill:none;stroke-width:2.65;stroke-linecap:round;stroke-linejoin:round;vector-effect:non-scaling-stroke}
    .highlight-line{stroke:var(--mb-text);stroke-width:1;stroke-dasharray:3 3;opacity:.62;pointer-events:none}
    .hit{fill:transparent;cursor:crosshair}
    .details{margin-top:8px;display:flex;gap:10px;align-items:center;justify-content:space-between;flex-wrap:wrap;padding:10px 11px;border:1px solid var(--mb-divider);border-radius:10px;background:rgba(140,154,175,.055)}
    .detail-time{font-size:12px;font-weight:670;min-width:143px}
    .detail-stats{display:flex;flex-wrap:wrap;gap:8px 16px;font-size:12px;color:var(--mb-muted)}
    .detail-stats b{font-weight:700;color:var(--mb-text)}
    .hint{margin-top:9px;font-size:11px;color:var(--mb-muted);line-height:1.4}
    .error{font-size:13px;line-height:1.65;padding:15px 2px}.error code{font-size:12px;background:rgba(128,128,128,.15);padding:1px 3px;border-radius:3px}
    @container (max-width:700px){.wrap{padding:14px 12px}.summary{grid-template-columns:repeat(2,minmax(0,1fr));gap:7px}.toolbar{gap:10px}.metric-buttons{gap:4px}button{padding:6px 7px}.details{display:block}.detail-stats{margin-top:7px}.source{display:none}}
  `;

  function escapeHtml(s) {
    return String(s ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  }
  function safeNumber(n) {
    return typeof n === 'number' && Number.isFinite(n) ? n : null;
  }
  function num(n, dp = 0) {
    return safeNumber(n) === null ? '—' : n.toLocaleString('pl-PL',{minimumFractionDigits:dp, maximumFractionDigits:dp});
  }
  function safeZone(z) {
    try { new Intl.DateTimeFormat('pl-PL',{timeZone:z}).format(); return z; }
    catch { return 'Europe/Warsaw'; }
  }
  function timeText(date, tz, includeDate = false) {
    const d = new Date(date);
    if (!Number.isFinite(d.valueOf())) return '—';
    return new Intl.DateTimeFormat('pl-PL',{
      timeZone:tz, ...(includeDate ? {weekday:'short',day:'2-digit',month:'2-digit'} : {}),
      hour:'2-digit',minute:'2-digit',hourCycle:'h23'
    }).format(d);
  }
  function getDateKey(x) { return typeof x.time === 'string' ? x.time.substring(0,10) : ''; }
  function isoToday(tz) {
    return new Intl.DateTimeFormat('en-CA',{timeZone:tz,year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date());
  }
  function dayLabel(date, tz) {
    const d = new Date(`${date}T12:00:00+01:00`);
    return new Intl.DateTimeFormat('pl-PL',{weekday:'short',day:'2-digit',month:'2-digit',timeZone:tz}).format(d);
  }
  function pathFor(points) {
    let started = false;
    const chunks = [];
    for (const p of points) {
      if (!p) {started=false;continue;}
      chunks.push(`${started ? 'L' : 'M'}${p[0].toFixed(1)},${p[1].toFixed(1)}`);
      started=true;
    }
    return chunks.join(' ');
  }
  function niceBound(n, above) {
    if (!Number.isFinite(n)) return above ? 3 : 0;
    const mag = Math.pow(10, Math.floor(Math.log10(Math.max(Math.abs(n),0.01))));
    const step = mag/2;
    return (above ? Math.ceil(n/step) : Math.floor(n/step))*step;
  }

  class MeteoblueSeeingCard extends HTMLElement {
    constructor() {
      super();
      this.attachShadow({mode:'open'});
      this._config = {};
      this._mode = 'seeing';
      this._day = 'all';
      this._signature = '';
      this._selectedTime = null;
      this._state = null;
      this._lastRenderWidth = 0;
      this._resizeObserver = null;
      this._resizeFrame = null;
    }
    connectedCallback() {
      // HA can change a section from 1 to 2/3/full columns without touching card config.
      // Recalculate SVG geometry whenever the *card* width changes.
      if (typeof ResizeObserver === 'undefined' || this._resizeObserver) return;
      this._resizeObserver = new ResizeObserver(entries => {
        const width = entries[0]?.contentRect?.width || this.clientWidth;
        if (!width || Math.abs(width - this._lastRenderWidth) < 3) return;
        if (this._resizeFrame !== null) cancelAnimationFrame(this._resizeFrame);
        this._resizeFrame = requestAnimationFrame(() => {
          this._resizeFrame = null;
          if (!this.isConnected || !this._hass) return;
          this._render();
        });
      });
      this._resizeObserver.observe(this);
    }
    disconnectedCallback() {
      this._resizeObserver?.disconnect();
      this._resizeObserver = null;
      if (this._resizeFrame !== null) cancelAnimationFrame(this._resizeFrame);
      this._resizeFrame = null;
    }
    setConfig(config) {
      if (config && config.forecast_entities && !Array.isArray(config.forecast_entities)) {
        throw new Error('forecast_entities musi być listą identyfikatorów sensorów.');
      }
      if (config && config.graph && !MODES[config.graph]) {
        throw new Error('Nieznany wykres: ' + config.graph);
      }
      this._config = {name:'Meteoblue • Astronomy Seeing', hours:72, ...config};
      this._mode = this._config.graph || 'seeing';
      this._signature = '';
      if (this._hass) this._render();
    }
    set hass(hass) {
      this._hass = hass;
      if (!this._config) return;
      const found = this._forecastStates();
      const sig = `${this._mode}|${this._day}|${found.map(e=>`${e.entity_id}:${e.last_updated}`).join('|')}`;
      if (sig !== this._signature) {
        this._signature = sig;
        this._render(found);
      }
    }
    getCardSize() { return 7; }
    // The key fix: 'full' spans the *entire section*, even if the section
    // itself uses column_span=2 or column_span=3. Height follows the content.
    getGridOptions() { return {columns:'full',min_columns:3}; }
    static getStubConfig() { return {type:'custom:meteoblue-seeing-card'}; }
    _forecastStates() {
      if (!this._hass) return [];
      const states = this._hass.states;
      if (Array.isArray(this._config.forecast_entities) && this._config.forecast_entities.length) {
        return this._config.forecast_entities.map(e=>states[e]).filter(Boolean);
      }
      const all = Object.values(states).filter(e => e.entity_id.startsWith('sensor.')
        && e.attributes && Array.isArray(e.attributes.forecast)
        && e.attributes.source === SOURCE && typeof e.attributes.date === 'string');
      // The default config auto-discovers one instance. With several integrations,
      // provide forecast_entities to avoid mixing locations.
      return all.sort((a,b)=>a.attributes.date.localeCompare(b.attributes.date)).slice(0,3);
    }
    _forecast(states) {
      const rows=[];
      const seen=new Set();
      let timezone='Europe/Warsaw';
      const dates=[];
      for (const sensor of states) {
        const attrs=sensor.attributes || {};
        if (attrs.timezone) timezone=safeZone(attrs.timezone);
        if (attrs.date) dates.push(attrs.date);
        for (const r of attrs.forecast || []) {
          if (!r || typeof r.time !== 'string' || !Number.isFinite(new Date(r.time).valueOf()) || seen.has(r.time)) continue;
          seen.add(r.time);
          rows.push({...r});
        }
      }
      rows.sort((a,b)=>new Date(a.time)-new Date(b.time));
      return {rows:rows.slice(0,Math.max(1,Math.min(120,Number(this._config.hours)||72))),timezone,dates:[...new Set(dates)].sort()};
    }
    _visibleRows(all) {
      return this._day === 'all' ? all.rows : all.rows.filter(r=>getDateKey(r)===this._day);
    }
    _render(forecastStates = null) {
      if (!this._hass) return;
      this._lastRenderWidth = this.getBoundingClientRect().width || this.clientWidth || 0;
      const scrollBefore = this.shadowRoot.querySelector('.graph-scroll')?.scrollLeft || 0;
      const sources = forecastStates || this._forecastStates();
      if (!sources.length) {
        this.shadowRoot.innerHTML = `<style>${css}</style><ha-card><div class="wrap"><h2>${escapeHtml(this._config.name)}</h2><div class="error">Nie znaleziono sensorów prognozy Meteoblue.<br>Sprawdź, czy integracja działa i czy sensory <code>Prognoza dzisiaj</code>, <code>Prognoza jutro</code> i <code>Prognoza pojutrze</code> mają atrybut <code>forecast</code>. Można też podać ich identyfikatory w opcji <code>forecast_entities</code>.</div></div></ha-card>`;
        return;
      }
      const all = this._forecast(sources);
      if (!all.rows.length) {
        this.shadowRoot.innerHTML = `<style>${css}</style><ha-card><div class="wrap"><h2>${escapeHtml(this._config.name)}</h2><div class="error">Sensory są widoczne, ale nie zawierają aktualnych godzin prognozy.</div></div></ha-card>`;
        return;
      }
      // Preserve selected tab only if date is still in future data.
      if (this._day !== 'all' && !all.rows.some(r=>getDateKey(r)===this._day)) this._day='all';
      const rows = this._visibleRows(all);
      const tz=all.timezone;
      const current = all.rows[0];
      const mode = MODES[this._mode];
      const days = [...new Set(all.rows.map(getDateKey))];
      const nightCount=all.rows.filter(r=>r.night).length;
      const cloudText = [current.cloud_low,current.cloud_mid,current.cloud_high].map(v=>num(v)).join(' / ');
      const value = (n,d=0) => num(n,d);
      this.shadowRoot.innerHTML = `<style>${css}</style>
        <ha-card><div class="wrap">
          <div class="heading"><h2>${escapeHtml(this._config.name)}</h2><span class="source">Źródło: meteoblue · ${VERSION}</span></div>
          <div class="subtitle">Prognoza godzinowa · ${all.rows.length} h · ${nightCount} h nocy · strefa ${escapeHtml(tz)}</div>
          <div class="summary">
            <div class="chip"><div class="ch-label">Seeing Index 1 / 2</div><div class="ch-value">${value(current.seeing_1)} <span class="ch-unit">/</span> ${value(current.seeing_2)}</div></div>
            <div class="chip"><div class="ch-label">Seeing (arcsec)</div><div class="ch-value">${value(current.seeing_arcsec,2)} <span class="ch-unit">″</span></div></div>
            <div class="chip"><div class="ch-label">Chmury N / Ś / W</div><div class="ch-value" style="font-size:16px;margin-top:7px">${cloudText}<span class="ch-unit"> %</span></div></div>
            <div class="chip"><div class="ch-label">Jet Stream</div><div class="ch-value">${value(current.jetstream,1)} <span class="ch-unit">m/s</span></div></div>
          </div>
          <div class="toolbar">
            <div class="metric-buttons" role="group" aria-label="Parametr wykresu">
              ${LABELS.map(([k,l])=>`<button type="button" data-metric="${k}" aria-pressed="${this._mode===k}">${l}</button>`).join('')}
            </div>
            <div class="day-buttons" role="group" aria-label="Zakres godzin">
              <button type="button" data-day="all" aria-pressed="${this._day==='all'}">Całość</button>
              ${days.map((d,i)=>`<button type="button" data-day="${d}" aria-pressed="${this._day===d}">${i===0?'Dzisiaj':i===1?'Jutro':i===2?'Pojutrze':dayLabel(d,tz)}</button>`).join('')}
            </div>
          </div>
          <div class="chart-head"><div class="metric-title">${escapeHtml(mode.title)}</div>
            <div class="legend">${mode.series.map(s=>`<span class="legend-item"><span class="legend-line" style="background:${s.color}"></span>${escapeHtml(s.name)}</span>`).join('')}
            <span class="legend-item"><span class="legend-night"></span>Noc</span></div></div>
          <div class="graph-scroll">${this._chartSvg(rows, mode,tz)}</div>
          <div class="details"><div class="detail-time" id="detail-time"></div><div class="detail-stats" id="detail-stats"></div></div>
          <div class="hint">${escapeHtml(mode.hint)} · Zaznacz godzinę na wykresie, aby zobaczyć szczegóły. Wykres pokazuje prognozę, nie pomiary.</div>
        </div></ha-card>`;
      this._state = {rows,tz};
      for (const btn of this.shadowRoot.querySelectorAll('button[data-metric]')) {
        btn.addEventListener('click',()=>{
          this._mode=btn.dataset.metric; this._signature=''; this._render();
        });
      }
      for (const btn of this.shadowRoot.querySelectorAll('button[data-day]')) {
        btn.addEventListener('click',()=>{
          this._day=btn.dataset.day; this._selectedTime=null; this._signature=''; this._render();
        });
      }
      const svg=this.shadowRoot.querySelector('svg[data-chart]');
      if (svg) {
        const pointToHour = (ev) => {
          const rect=ev.target.closest('[data-point-index]');
          if (!rect) return;
          const idx=Number(rect.dataset.pointIndex);
          this._showDetails(idx);
        };
        svg.addEventListener('pointermove',pointToHour);
        svg.addEventListener('pointerdown',pointToHour);
        svg.addEventListener('focusin',pointToHour);
      }
      const priorIndex=rows.findIndex(r=>r.time===this._selectedTime);
      this._showDetails(priorIndex>=0?priorIndex:0);
      const sc=this.shadowRoot.querySelector('.graph-scroll');
      if (sc) sc.scrollLeft=scrollBefore;
    }
    _chartSvg(rows, mode, tz) {
      const left=47, right=14, top=32, bottom=42, chartH=206;
      // Fill the card when possible; only scroll horizontally when hourly
      // labels genuinely need more space. This is recalculated on each resize.
      const cardWidth = this._lastRenderWidth || this.clientWidth || 0;
      const horizontalPadding = cardWidth <= 700 ? 24 : 40;
      const chartViewportWidth = Math.max(0, cardWidth - horizontalPadding);
      const plotW=Math.max(540, rows.length*29, chartViewportWidth-left-right);
      const step=plotW/rows.length;
      const width=left+plotW+right, height=top+chartH+bottom;
      const vals=rows.flatMap(r=>mode.series.map(s=>safeNumber(r[s.key]))).filter(v=>v!==null);
      let ymin=mode.min !== null?mode.min:(vals.length?Math.min(...vals):0);
      let ymax=mode.max !== null?mode.max:(vals.length?Math.max(...vals):3);
      if (mode.min===null) ymin=niceBound(ymin-(ymax-ymin)*.1,false);
      if (mode.max===null) ymax=niceBound(ymax+(ymax-ymin)*.1+.01,true);
      if (ymax-ymin<.01) {ymin-=.5;ymax+=.5;}
      const x=i=>left+step*(i+.5);
      const y=v=>top+chartH-(v-ymin)/(ymax-ymin)*chartH;
      const pieces=[];
      pieces.push(`<svg data-chart="1" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg" aria-label="Wykres ${escapeHtml(mode.title)}">`);
      // Day/night stripes and boundaries based on original meteorological forecast.
      rows.forEach((r,i)=>{
        pieces.push(`<rect x="${(left+step*i).toFixed(2)}" y="${top}" width="${(step+.2).toFixed(2)}" height="${chartH}" fill="${r.night?'#54759a':'#d9ac54'}" opacity="${r.night?.14:.045}"/>`);
      });
      for (let tick=0;tick<=4;tick++) {
        const val=ymin+(ymax-ymin)*tick/4, yy=y(val);
        const digits=mode.decimals>=2?2:mode.decimals;
        pieces.push(`<line class="gridline" x1="${left}" x2="${left+plotW}" y1="${yy}" y2="${yy}"/>`);
        pieces.push(`<text class="axis" x="${left-9}" y="${yy+4}" text-anchor="end">${escapeHtml(num(val,digits))}</text>`);
      }
      rows.forEach((r,i)=>{
        const hour=new Date(r.time);
        if (i===0 || getDateKey(r)!==getDateKey(rows[i-1])) {
          const xx=left+step*i;
          if(i) pieces.push(`<line class="dayline" x1="${xx.toFixed(2)}" x2="${xx.toFixed(2)}" y1="${top}" y2="${top+chartH}"/>`);
          pieces.push(`<text class="dayname" x="${(xx+8).toFixed(2)}" y="19">${escapeHtml(dayLabel(getDateKey(r),tz))}</text>`);
        }
        const hourText=timeText(hour,tz).slice(0,2);
        if (Number(hourText)%3===0) pieces.push(`<text class="axis" x="${x(i).toFixed(2)}" y="${top+chartH+22}" text-anchor="middle">${hourText}:00</text>`);
      });
      for (const series of mode.series) {
        const pts=rows.map((r,i)=>safeNumber(r[series.key])===null?null:[x(i),y(r[series.key])]);
        pieces.push(`<path class="graph-series" d="${pathFor(pts)}" stroke="${series.color}"/>`);
      }
      pieces.push(`<line id="mb-highlight" class="highlight-line" x1="0" x2="0" y1="${top}" y2="${top+chartH}"/>`);
      rows.forEach((r,i)=>pieces.push(`<rect class="hit" data-point-index="${i}" x="${(left+step*i).toFixed(2)}" y="${top}" width="${(step+.3).toFixed(2)}" height="${chartH}" role="button" tabindex="0" aria-label="${escapeHtml(timeText(r.time,tz,true))}"/>`));
      pieces.push('</svg>');
      return pieces.join('');
    }
    _showDetails(i) {
      if (!this._state || !this._state.rows[i]) return;
      const {rows,tz}=this._state;
      const r=rows[i];
      this._selectedTime=r.time;
      const d=this.shadowRoot.querySelector('#detail-time');
      const s=this.shadowRoot.querySelector('#detail-stats');
      if (!d||!s) return;
      d.textContent=`${r.night?'🌙':'☀️'} ${timeText(r.time,tz,true)}`;
      const detail = [
        ['Index 1/2', `${num(r.seeing_1)} / ${num(r.seeing_2)}`],
        ['Arcsec', `${num(r.seeing_arcsec,2)}″`],
        ['Chmury N/Ś/W', `${num(r.cloud_low)} / ${num(r.cloud_mid)} / ${num(r.cloud_high)}%`],
        ['Jet', `${num(r.jetstream,1)} m/s`],
        ['Temp.', `${num(r.temperature,1)}°C`],
        ['Wilg.', `${num(r.humidity)}%`],
      ];
      s.innerHTML=detail.map(([k,v])=>`<span>${escapeHtml(k)}: <b>${escapeHtml(v)}</b></span>`).join('');
      const index=rows.indexOf(r);
      const svg=this.shadowRoot.querySelector('svg[data-chart]');
      const line=this.shadowRoot.querySelector('#mb-highlight');
      if (svg && line) {
        const cardWidth = this._lastRenderWidth || this.clientWidth || 0;
        const horizontalPadding = cardWidth <= 700 ? 24 : 40;
        const plotW = Math.max(540,rows.length*29,Math.max(0,cardWidth-horizontalPadding)-47-14);
        const x=47+plotW/rows.length*(index+.5);
        line.setAttribute('x1',String(x));line.setAttribute('x2',String(x));
      }
    }
  }
  if (!customElements.get('meteoblue-seeing-card')) {
    customElements.define('meteoblue-seeing-card', MeteoblueSeeingCard);
  }
  window.customCards=window.customCards||[];
  if (!window.customCards.some(x=>x.type==='meteoblue-seeing-card')) {
    window.customCards.push({
      type:'meteoblue-seeing-card',
      name:'Meteoblue Astronomy Seeing',
      description:'Wykresy 3-dniowej prognozy seeingu i zachmurzenia dla integracji Meteoblue Astronomy Seeing',
    });
  }
  console.info(`[Meteoblue Astronomy Seeing Card] ${VERSION}`);
})();
