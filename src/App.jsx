import { useState } from "react";

const COSTO_OPERATIVO = 35;
const IVA = 0.21;

function tarifaKilo(kg) {
  if (kg < 25) return 19;
  if (kg < 50) return 17;
  if (kg < 100) return 15;
  return 12.5;
}

let nextId = 1;
function cajaVacia() {
  return { id: nextId++, largo: "", ancho: "", alto: "", peso: "", cantidad: "" };
}

export default function App() {
  const [precio, setPrecio] = useState("");
  const [cantidad, setCantidad] = useState("");
  const [derechos, setDerechos] = useState("0.35");
  const [cajas, setCajas] = useState([cajaVacia()]);
  const [cupon, setCupon] = useState("");
  const [descuento, setDescuento] = useState(0);
  const [cuponMsg, setCuponMsg] = useState("");
  const [res, setRes] = useState(null);
  const [error, setError] = useState("");

  function setCampo(id, campo, val) {
    setCajas(prev => prev.map(c => c.id === id ? { ...c, [campo]: val } : c));
  }

  function aplicarCupon() {
    const code = cupon.trim().toUpperCase();
    if (code === "FIEL10") {
      setDescuento(0.10);
      setCuponMsg("✅ 10% de descuento aplicado");
    } else {
      setDescuento(0);
      setCuponMsg("❌ Cupón no válido");
    }
  }

  function calcular() {
    setError("");
    const p = parseFloat(precio);
    const q = parseInt(cantidad);

    if (isNaN(p) || p <= 0) { setError("Ingresá un precio por unidad válido."); return; }
    if (isNaN(q) || q <= 0) { setError("Ingresá una cantidad de unidades válida."); return; }

    let totalKg = 0;
    const detalle = [];

    for (let i = 0; i < cajas.length; i++) {
      const c = cajas[i];
      const largo = parseFloat(c.largo);
      const ancho = parseFloat(c.ancho);
      const alto = parseFloat(c.alto);
      const pesoReal = parseFloat(c.peso);
      const cant = parseInt(c.cantidad);

      if (isNaN(largo) || isNaN(ancho) || isNaN(alto) || isNaN(pesoReal) || isNaN(cant)) {
        setError("Completá todos los campos de la Caja " + (i + 1) + ".");
        return;
      }

      const volKg = (largo * ancho * alto) / 5000;
      const usaVol = volKg > pesoReal;
      const kgCaja = usaVol ? volKg : pesoReal;
      const kgTotal = kgCaja * cant;
      totalKg += kgTotal;

      detalle.push({
        num: i + 1, cant,
        volKg: volKg.toFixed(2),
        pesoReal,
        usaVol,
        kgCaja: kgCaja.toFixed(2),
        kgTotal: kgTotal.toFixed(2),
      });
    }

    const tarifa = tarifaKilo(totalKg);
    const tarifaFinal = tarifa * (1 - descuento);
    const flete = totalKg * tarifaFinal;
    const logistica = flete + COSTO_OPERATIVO;

    const costoChina = p * q;
    const der = parseFloat(derechos);
    const mDerechos = costoChina * der;
    const mIva = costoChina * IVA;
    const impuestos = mDerechos + mIva;

    const total = costoChina + logistica + impuestos;
    const porUnidad = total / q;

    setRes({
      detalle,
      totalKg: totalKg.toFixed(2),
      tarifa,
      tarifaFinal: tarifaFinal.toFixed(2),
      descuento,
      flete: flete.toFixed(2),
      logistica: logistica.toFixed(2),
      costoChina: costoChina.toFixed(2),
      mDerechos: mDerechos.toFixed(2),
      mIva: mIva.toFixed(2),
      impuestos: impuestos.toFixed(2),
      total: total.toFixed(2),
      porUnidad: porUnidad.toFixed(2),
      derechosPct: (der * 100).toFixed(0),
      q,
      precioUnit: p.toFixed(2),
    });
  }

  const D = (n) => "USD " + parseFloat(n).toFixed(2);

  return (
    <div style={{ background: "#0f1117", minHeight: "100vh", color: "#e2e8f0", fontFamily: "system-ui, -apple-system, sans-serif", padding: "20px 16px 60px" }}>
      <div style={{ maxWidth: 540, margin: "0 auto" }}>

        {/* HEADER */}
        <div style={{ textAlign: "center", marginBottom: 24 }}>
          <div style={{ width: 44, height: 3, background: "linear-gradient(90deg,#3b82f6,#8b5cf6)", borderRadius: 2, margin: "0 auto 12px" }} />
          <h1 style={{ margin: 0, fontSize: 26, fontWeight: 900, letterSpacing: "0.1em", color: "#f8fafc" }}>
            CALC<span style={{ color: "#3b82f6" }}>IMP</span>
          </h1>
          <p style={{ margin: "5px 0 0", fontSize: 11, color: "#475569", textTransform: "uppercase", letterSpacing: "0.08em" }}>
            Calculadora de Importaciones
          </p>
        </div>

        {/* PRODUCTO */}
        <Tarjeta titulo="📦 Producto">
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            <Campo label="Precio/unidad (USD)">
              <Inp type="number" placeholder="0.00" value={precio} onChange={e => setPrecio(e.target.value)} />
            </Campo>
            <Campo label="Cantidad unidades">
              <Inp type="number" placeholder="0" value={cantidad} onChange={e => setCantidad(e.target.value)} />
            </Campo>
          </div>
        </Tarjeta>

        {/* CAJAS */}
        <Tarjeta titulo="🗃️ Bultos / Cajas">
          {cajas.map((c, i) => (
            <div key={c.id} style={{ background: "rgba(59,130,246,0.05)", border: "1px solid rgba(59,130,246,0.2)", borderRadius: 8, padding: 12, marginBottom: 10 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                <span style={{ fontSize: 12, fontWeight: 700, color: "#3b82f6", letterSpacing: "0.06em" }}>CAJA {i + 1}</span>
                {cajas.length > 1 && (
                  <button onClick={() => setCajas(prev => prev.filter(x => x.id !== c.id))}
                    style={{ background: "none", border: "1px solid rgba(248,113,113,0.4)", borderRadius: 5, color: "#f87171", fontSize: 11, padding: "3px 8px", cursor: "pointer", fontFamily: "inherit" }}>
                    ✕ Quitar
                  </button>
                )}
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8, marginBottom: 8 }}>
                <Campo label="Largo (cm)"><Inp type="number" placeholder="0" value={c.largo} onChange={e => setCampo(c.id, "largo", e.target.value)} /></Campo>
                <Campo label="Ancho (cm)"><Inp type="number" placeholder="0" value={c.ancho} onChange={e => setCampo(c.id, "ancho", e.target.value)} /></Campo>
                <Campo label="Alto (cm)"><Inp type="number" placeholder="0" value={c.alto} onChange={e => setCampo(c.id, "alto", e.target.value)} /></Campo>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                <Campo label="Peso real (kg)"><Inp type="number" placeholder="0.00" value={c.peso} onChange={e => setCampo(c.id, "peso", e.target.value)} /></Campo>
                <Campo label="Cant. cajas"><Inp type="number" placeholder="1" value={c.cantidad} onChange={e => setCampo(c.id, "cantidad", e.target.value)} /></Campo>
              </div>
            </div>
          ))}
          <button onClick={() => setCajas(prev => [...prev, cajaVacia()])}
            style={{ width: "100%", background: "none", border: "1px dashed rgba(59,130,246,0.4)", borderRadius: 8, color: "#3b82f6", fontSize: 13, padding: "10px", cursor: "pointer", fontFamily: "inherit" }}>
            + Agregar otro tipo de caja
          </button>
        </Tarjeta>

        {/* DERECHOS */}
        <Tarjeta titulo="🏛️ Derechos de Importación">
          <Campo label="Porcentaje aplicable">
            <select value={derechos} onChange={e => setDerechos(e.target.value)}
              style={{ width: "100%", background: "#1a2030", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 7, color: "#f1f5f9", fontSize: 14, padding: "9px 12px", fontFamily: "inherit" }}>
              <option value="0.35">35% — General (por defecto)</option>
              <option value="0.18">18% — Productos especiales</option>
            </select>
          </Campo>
          <p style={{ margin: 0, fontSize: 12, color: "#fbbf24", background: "rgba(245,158,11,0.07)", border: "1px solid rgba(245,158,11,0.2)", borderRadius: 6, padding: "8px 10px" }}>
            ℹ️ Se aplica también IVA 21% sobre el valor de la mercadería.
          </p>
        </Tarjeta>

        {/* CUPÓN */}
        <Tarjeta titulo="🎟️ Cupón de Descuento">
          <div style={{ display: "flex", gap: 8 }}>
            <Inp type="text" placeholder="Ingresá tu cupón" value={cupon}
              onChange={e => { setCupon(e.target.value); setCuponMsg(""); }}
              style={{ flex: 1 }} />
            <button onClick={aplicarCupon}
              style={{ background: "linear-gradient(135deg,#3b82f6,#6366f1)", border: "none", borderRadius: 7, color: "#fff", fontSize: 13, fontWeight: 700, padding: "9px 14px", cursor: "pointer", fontFamily: "inherit", whiteSpace: "nowrap" }}>
              Aplicar
            </button>
          </div>
          {cuponMsg && (
            <p style={{ margin: "4px 0 0", fontSize: 12, color: cuponMsg.startsWith("✅") ? "#34d399" : "#f87171" }}>{cuponMsg}</p>
          )}
        </Tarjeta>

        {/* ERROR */}
        {error && (
          <div style={{ background: "rgba(248,113,113,0.1)", border: "1px solid rgba(248,113,113,0.3)", borderRadius: 8, padding: "10px 14px", marginBottom: 12, fontSize: 13, color: "#f87171" }}>
            ⚠️ {error}
          </div>
        )}

        {/* BOTÓN CALCULAR */}
        <button onClick={calcular}
          style={{ width: "100%", background: "linear-gradient(135deg,#3b82f6,#6366f1)", border: "none", borderRadius: 10, color: "#fff", fontSize: 15, fontWeight: 900, padding: "15px", cursor: "pointer", letterSpacing: "0.1em", marginBottom: 24, boxShadow: "0 4px 20px rgba(59,130,246,0.3)", fontFamily: "inherit" }}>
          CALCULAR IMPORTACIÓN
        </button>

        {/* RESULTADOS */}
        {res && (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>

            {/* RESUMEN */}
            <div style={{ background: "linear-gradient(135deg,rgba(59,130,246,0.15),rgba(139,92,246,0.15))", border: "1px solid rgba(99,102,241,0.3)", borderRadius: 12, padding: "18px 16px" }}>
              <p style={{ margin: "0 0 2px", fontSize: 10, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.1em" }}>Costo Total del Pedido</p>
              <p style={{ margin: "0 0 14px", fontSize: 28, fontWeight: 900, color: "#f8fafc" }}>{D(res.total)}</p>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                <div>
                  <p style={{ margin: "0 0 2px", fontSize: 10, color: "#64748b", textTransform: "uppercase" }}>Costo por unidad</p>
                  <p style={{ margin: 0, fontSize: 18, fontWeight: 700, color: "#3b82f6" }}>{D(res.porUnidad)}</p>
                </div>
                <div>
                  <p style={{ margin: "0 0 2px", fontSize: 10, color: "#64748b", textTransform: "uppercase" }}>Unidades totales</p>
                  <p style={{ margin: 0, fontSize: 18, fontWeight: 700, color: "#94a3b8" }}>{res.q}</p>
                </div>
              </div>
            </div>

            {/* CHINA */}
            <Bloque titulo="🇨🇳 Costo en China" color="#f59e0b">
              <Linea label={res.q + " u. × USD " + res.precioUnit} val={D(res.costoChina)} bold />
            </Bloque>

            {/* LOGÍSTICA */}
            <Bloque titulo="🚢 Logística & Operativa" color="#3b82f6">
              <Linea label="Peso total efectivo" val={res.totalKg + " kg"} />
              <Linea label="Tarifa base" val={"USD " + res.tarifa + "/kg"} />
              {res.descuento > 0 && (
                <Linea label={"Descuento cupón (" + (res.descuento * 100) + "%)"} val={"−USD " + (res.tarifa * res.descuento).toFixed(2) + "/kg"} neg />
              )}
              <Linea label="Tarifa final" val={"USD " + res.tarifaFinal + "/kg"} />
              <Linea label={"Flete (" + res.totalKg + " kg × USD " + res.tarifaFinal + ")"} val={D(res.flete)} />
              <Linea label="Gestión operativa (fijo)" val={"USD " + COSTO_OPERATIVO} />
              <Linea label="SUBTOTAL LOGÍSTICA" val={D(res.logistica)} bold />
              <div style={{ background: "rgba(0,0,0,0.25)", borderRadius: 7, padding: "10px 12px", marginTop: 4 }}>
                <p style={{ margin: "0 0 6px", fontSize: 10, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.05em" }}>Detalle por tipo de caja</p>
                {res.detalle.map(d => (
                  <div key={d.num} style={{ fontSize: 12, marginBottom: 6, paddingBottom: 6, borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                    <div style={{ color: "#94a3b8" }}>Caja {d.num} ({d.cant} u.) · Vol: {d.volKg} kg · Real: {d.pesoReal} kg</div>
                    <div style={{ color: d.usaVol ? "#f59e0b" : "#34d399", marginTop: 2 }}>
                      → Usa {d.usaVol ? "peso volumétrico" : "peso real"}: {d.kgCaja} kg/caja = <strong>{d.kgTotal} kg</strong>
                    </div>
                  </div>
                ))}
              </div>
            </Bloque>

            {/* IMPUESTOS */}
            <Bloque titulo="🏛️ Impuestos" color="#8b5cf6">
              <Linea label="Base imponible (mercadería)" val={D(res.costoChina)} />
              <Linea label={"Derechos de importación (" + res.derechosPct + "%)"} val={D(res.mDerechos)} />
              <Linea label="IVA (21%)" val={D(res.mIva)} />
              <Linea label="SUBTOTAL IMPUESTOS" val={D(res.impuestos)} bold />
            </Bloque>

            {/* TOTAL FINAL */}
            <div style={{ background: "rgba(0,0,0,0.35)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 10, padding: 16 }}>
              <Linea label="Costo en China" val={D(res.costoChina)} />
              <Linea label="Logística & Operativa" val={D(res.logistica)} />
              <Linea label="Impuestos" val={D(res.impuestos)} />
              <div style={{ borderTop: "1px solid rgba(255,255,255,0.15)", marginTop: 8, paddingTop: 10, display: "flex", justifyContent: "space-between" }}>
                <span style={{ fontSize: 15, fontWeight: 900, color: "#f8fafc" }}>TOTAL</span>
                <span style={{ fontSize: 15, fontWeight: 900, color: "#f8fafc" }}>{D(res.total)}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", marginTop: 6 }}>
                <span style={{ fontSize: 13, color: "#3b82f6", fontWeight: 700 }}>Por unidad ({res.q} u.)</span>
                <span style={{ fontSize: 13, color: "#3b82f6", fontWeight: 700 }}>{D(res.porUnidad)}</span>
              </div>
            </div>

          </div>
        )}

        <p style={{ textAlign: "center", marginTop: 40, fontSize: 10, color: "#334155", textTransform: "uppercase", letterSpacing: "0.08em" }}>
          Todos los valores en USD
        </p>
      </div>
    </div>
  );
}

function Tarjeta({ titulo, children }) {
  return (
    <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 12, marginBottom: 12, overflow: "hidden" }}>
      <div style={{ padding: "10px 14px", borderBottom: "1px solid rgba(255,255,255,0.06)", background: "rgba(255,255,255,0.02)", fontSize: 12, fontWeight: 700, letterSpacing: "0.07em", textTransform: "uppercase", color: "#94a3b8" }}>
        {titulo}
      </div>
      <div style={{ padding: "14px", display: "flex", flexDirection: "column", gap: 10 }}>
        {children}
      </div>
    </div>
  );
}

function Campo({ label, children }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
      <label style={{ fontSize: 10, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.05em" }}>{label}</label>
      {children}
    </div>
  );
}

function Inp({ style = {}, ...props }) {
  return (
    <input {...props} style={{ background: "#1a2030", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 7, color: "#f1f5f9", fontSize: 14, padding: "9px 11px", fontFamily: "inherit", width: "100%", boxSizing: "border-box", WebkitAppearance: "none", ...style }} />
  );
}

function Bloque({ titulo, color, children }) {
  return (
    <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", borderLeft: "3px solid " + color, borderRadius: 10, padding: "14px", display: "flex", flexDirection: "column", gap: 8 }}>
      <p style={{ margin: "0 0 4px", fontSize: 11, fontWeight: 700, color, textTransform: "uppercase", letterSpacing: "0.07em" }}>{titulo}</p>
      {children}
    </div>
  );
}

function Linea({ label, val, bold, neg }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 13, gap: 8 }}>
      <span style={{ opacity: bold ? 1 : 0.7, fontWeight: bold ? 700 : 400 }}>{label}</span>
      <span style={{ fontWeight: bold ? 700 : 500, color: neg ? "#f87171" : "inherit", whiteSpace: "nowrap" }}>{val}</span>
    </div>
  );
}
