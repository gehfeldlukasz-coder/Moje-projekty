// ============================================================
//  Spacer 3D po jachcie – uproszczony model Seamaster 815
//  (proporcje wg rysunku technicznego, detale wg zdjęć Tatulatora)
//  Układ współrzędnych [m]: x – od rufy (0) do dziobu (8,15),
//  y – w górę (linia wody = 0), z – w prawo (prawa burta = +z)
// ============================================================
(function () {
  const wrap = document.getElementById("s3dWrap");
  if (!wrap) return;
  const fallback = wrap.querySelector(".s3d-fallback");
  const fail = () => { fallback.hidden = false; };
  if (typeof THREE === "undefined") return fail();

  const V3 = THREE.Vector3;
  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));

  // ---------- kształt kadłuba ----------
  const LOA = 8.15;
  const ROOF = 1.62; // dach nadbudówki
  const MX = 4.4; // pozycja masztu
  const MAST_TOP = 12.0;
  const sheer = (x) => 1.05 + 0.2 * Math.pow(clamp(x, 0, LOA) / LOA, 1.3);
  const hb = (x) => {
    if (x <= 3.6) return 1.05 + 0.3 * Math.sin((clamp(x, 0, 3.6) / 3.6) * (Math.PI / 2));
    const t = Math.min(1, (x - 3.6) / (LOA - 3.6));
    return 1.35 * Math.pow(Math.max(0, 1 - t * t), 0.9);
  };
  const canoe = (x) => -0.5 * Math.pow(Math.sin((Math.PI * (x + 0.3)) / 7.9), 0.8);
  const bottom = (x) => (x <= 7.3 ? canoe(x) : canoe(7.3) + (sheer(LOA) - canoe(7.3)) * ((x - 7.3) / (LOA - 7.3)));
  const E = 2 / 2.6; // wykładnik superelipsy przekroju
  const sectionPoint = (x, a, side) => {
    const th = (a * Math.PI) / 2, top = sheer(x), bot = bottom(x);
    return new V3(x, top - (top - bot) * Math.pow(Math.sin(th), E), side * hb(x) * Math.pow(Math.cos(th), E));
  };
  const hullZ = (x, y) => {
    const top = sheer(x), bot = bottom(x);
    if (top - bot < 1e-4) return 0;
    const s = Math.pow(clamp((top - y) / (top - bot), 0, 1), 1 / E);
    return hb(x) * Math.pow(Math.sqrt(Math.max(0, 1 - s * s)), E);
  };
  const cabBase = (x) => 1.0 - (0.28 * (x - 2.25)) / 3.55;
  const cabZ = (x, y) => cabBase(x) - 0.05 * clamp((y - 1.1) / 0.52, 0, 1);

  // ---------- renderer, scena ----------
  const canvas = document.getElementById("s3d");
  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
  } catch (e) {
    return fail();
  }
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  const scene = new THREE.Scene();
  scene.background = new THREE.Color("#9fc2e7");
  scene.fog = new THREE.Fog("#c4d9ee", 70, 260);
  const camera = new THREE.PerspectiveCamera(55, 1, 0.05, 600);

  scene.add(new THREE.HemisphereLight("#eef6ff", "#5a6b55", 0.85));
  const sun = new THREE.DirectionalLight("#fff6e8", 0.75);
  sun.position.set(12, 25, -10);
  scene.add(sun);
  const cabinLight = new THREE.PointLight("#ffd9a8", 0.3, 1.45);
  cabinLight.position.set(3.7, 1.5, 0);
  scene.add(cabinLight);

  // ---------- materiały ----------
  const std = (color, extra = {}) => new THREE.MeshStandardMaterial({ color, roughness: 0.6, metalness: 0, ...extra });
  const M = {
    white: std("#f6f8fa", { roughness: 0.4 }),
    whiteIn: std("#ece4d3", { side: THREE.BackSide }),
    hullOut: new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.35 }),
    teak: std("#7b4a2a"),
    teakDark: std("#5a3218"),
    mahogany: std("#5a2e1a", { roughness: 0.45 }),
    mahoganyIn: std("#62341f", { roughness: 0.45, side: THREE.BackSide }),
    sole: std("#b58a5a"),
    cushion: std("#b39d7a", { roughness: 0.9 }),
    blue: std("#2459ad", { roughness: 0.8, side: THREE.DoubleSide }),
    clear: std("#bcd6e8", { transparent: true, opacity: 0.45, roughness: 0.1, side: THREE.DoubleSide, depthWrite: false }),
    glass: std("#9fc3dc", { transparent: true, opacity: 0.35, roughness: 0.1, side: THREE.DoubleSide, depthWrite: false }),
    frame: new THREE.LineBasicMaterial({ color: "#1d2733" }),
    steel: std("#d3dae0", { metalness: 0.1, roughness: 0.3 }),
    mast: std("#a9b1b8", { metalness: 0.1, roughness: 0.4 }),
    dark: std("#2a333d"),
    black: std("#1b1f24", { roughness: 0.4 }),
    anti: std("#1f2731"),
    stripe: std("#5a2318"),
    sail: std("#fbfaf4", { side: THREE.DoubleSide, roughness: 0.9 }),
    orange: std("#f26a1b"),
    red: std("#dc143c", { side: THREE.DoubleSide }),
    flagWhite: std("#ffffff", { side: THREE.DoubleSide }),
    wire: std("#8d969e", { metalness: 0.1 }),
    deck: new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.6, side: THREE.DoubleSide }),
  };

  // ---------- pomocnicze ----------
  const boat = new THREE.Group();
  scene.add(boat);
  const add = (obj, parent = boat) => (parent.add(obj), obj);
  function box(x0, x1, y0, y1, z0, z1, mat, parent) {
    const m = new THREE.Mesh(new THREE.BoxGeometry(x1 - x0, y1 - y0, z1 - z0), mat);
    m.position.set((x0 + x1) / 2, (y0 + y1) / 2, (z0 + z1) / 2);
    return add(m, parent);
  }
  function rod(a, b, r, mat, parent) {
    const dir = new V3().subVectors(b, a);
    const m = new THREE.Mesh(new THREE.CylinderGeometry(r, r, dir.length(), 10), mat);
    m.position.copy(a).addScaledVector(dir, 0.5);
    m.quaternion.setFromUnitVectors(new V3(0, 1, 0), dir.normalize());
    return add(m, parent);
  }
  function poly(points, r, mat, parent) {
    const path = new THREE.CurvePath();
    for (let i = 0; i < points.length - 1; i++) path.add(new THREE.LineCurve3(points[i], points[i + 1]));
    return add(new THREE.Mesh(new THREE.TubeGeometry(path, Math.max(2, (points.length - 1) * 4), r, 6, false), mat), parent);
  }
  // obraca trójkąty tak, by normalne wskazywały „na zewnątrz”
  function orient(geom, outward) {
    const pos = geom.attributes.position, idx = geom.index;
    const a = new V3(), b = new V3(), c = new V3(), n = new V3(), m = new V3(), u = new V3(), w = new V3();
    for (let t = 0; t < idx.count; t += 3) {
      const i0 = idx.getX(t), i1 = idx.getX(t + 1), i2 = idx.getX(t + 2);
      a.fromBufferAttribute(pos, i0); b.fromBufferAttribute(pos, i1); c.fromBufferAttribute(pos, i2);
      n.crossVectors(u.subVectors(b, a), w.subVectors(c, a));
      m.copy(a).add(b).add(c).divideScalar(3);
      if (n.dot(outward(m)) < 0) { idx.setX(t + 1, i2); idx.setX(t + 2, i1); }
    }
    idx.needsUpdate = true;
    geom.computeVertexNormals();
    return geom;
  }
  const twoSided = (geom, outer, inner, parent) => {
    add(new THREE.Mesh(geom, outer), parent);
    add(new THREE.Mesh(geom, inner), parent);
  };
  // płaski kształt 2D (u,v) przeniesiony do 3D funkcją map(u,v) → Vector3
  function mappedShape(shape, map) {
    const g = new THREE.ShapeGeometry(shape);
    const pos = g.attributes.position;
    for (let i = 0; i < pos.count; i++) {
      const p = map(pos.getX(i), pos.getY(i));
      pos.setXYZ(i, p.x, p.y, p.z);
    }
    return g;
  }
  const shapeOf = (pts) => new THREE.Shape(pts.map(([u, v]) => new THREE.Vector2(u, v)));
  const pathOf = (pts) => new THREE.Path(pts.map(([u, v]) => new THREE.Vector2(u, v)));
  function textPlane(text, w, h, font, color) {
    const c = document.createElement("canvas");
    c.width = 1024;
    c.height = Math.round((1024 * h) / w);
    const g = c.getContext("2d");
    g.fillStyle = color;
    g.font = font.replace("{px}", Math.round(c.height * 0.72));
    g.textAlign = "center";
    g.textBaseline = "middle";
    g.fillText(text, c.width / 2, c.height / 2);
    const tex = new THREE.CanvasTexture(c);
    return new THREE.Mesh(
      new THREE.PlaneGeometry(w, h),
      new THREE.MeshBasicMaterial({ map: tex, transparent: true, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -4 })
    );
  }

  // ---------- tekstura teaku (deski ze spoinami, UV w metrach) ----------
  M.chrome = std("#e6ebef", { metalness: 0.25, roughness: 0.15 });
  M.rope = std("#ecebe4", { roughness: 0.9 });
  const teakTex = (() => {
    const c = document.createElement("canvas");
    c.width = c.height = 256;
    const g = c.getContext("2d");
    let sd = 3;
    const r = () => ((sd = (sd * 16807) % 2147483647) / 2147483647);
    for (let i = 0; i < 4; i++) {
      const d = i % 2 ? 10 : -6;
      g.fillStyle = `rgb(${132 + d},${78 + d},${42 + d})`;
      g.fillRect(0, i * 64, 256, 64);
      for (let k = 0; k < 40; k++) {
        const y = i * 64 + r() * 58;
        g.strokeStyle = `rgba(60,30,10,${0.05 + r() * 0.1})`;
        g.beginPath();
        g.moveTo(0, y);
        g.bezierCurveTo(85, y + r() * 4 - 2, 170, y + r() * 4 - 2, 256, y);
        g.stroke();
      }
      g.fillStyle = "#24160d";
      g.fillRect(0, i * 64 + 59, 256, 5);
    }
    const t = new THREE.CanvasTexture(c);
    t.wrapS = t.wrapT = THREE.RepeatWrapping;
    t.anisotropy = 4;
    return t;
  })();
  M.teakT = new THREE.MeshStandardMaterial({ map: teakTex, roughness: 0.8, side: THREE.DoubleSide });
  const UVS = 1 / 0.24; // 4 deski na 24 cm
  function worldUV(mesh, along = "x") {
    const g = mesh.geometry, p = g.attributes.position, uv = [], v = new V3();
    mesh.updateMatrix();
    for (let i = 0; i < p.count; i++) {
      v.fromBufferAttribute(p, i).applyMatrix4(mesh.matrix);
      uv.push((along === "x" ? v.x : v.z) * UVS, ((along === "x" ? v.z : v.x) + v.y) * UVS);
    }
    g.setAttribute("uv", new THREE.Float32BufferAttribute(uv, 2));
    return mesh;
  }
  const tbox = (x0, x1, y0, y1, z0, z1, along, parent) => worldUV(box(x0, x1, y0, y1, z0, z1, M.teakT, parent), along);
  const disc = (x, y, z, r, mat, th = 0.02, axis = "x") => {
    const m = add(new THREE.Mesh(new THREE.CylinderGeometry(r, r, th, 24), mat));
    if (axis === "x") m.rotation.z = Math.PI / 2;
    if (axis === "z") m.rotation.x = Math.PI / 2;
    m.position.set(x, y, z);
    return m;
  };
  const zs = (s, a, b) => (s > 0 ? [a, b] : [-b, -a]);

  // ---------- kadłub ----------
  {
    const N = 90, K = 18, R = 2 * K + 1;
    const pos = [], col = [], idx = [];
    const cWhite = new THREE.Color("#f7f9fb"), cAnti = new THREE.Color("#1f2731");
    for (let i = 0; i <= N; i++) {
      const x = (LOA * i) / N;
      for (let j = 0; j <= 2 * K; j++) {
        const side = j <= K ? 1 : -1;
        const p = sectionPoint(x, j <= K ? j / K : (2 * K - j) / K, side);
        pos.push(p.x, p.y, p.z);
        const cc = p.y < 0.03 ? cAnti : cWhite;
        col.push(cc.r, cc.g, cc.b);
      }
    }
    for (let i = 0; i < N; i++)
      for (let j = 0; j < 2 * K; j++) {
        const a = i * R + j, b = (i + 1) * R + j, c = (i + 1) * R + j + 1, d = i * R + j + 1;
        idx.push(a, b, c, a, c, d);
      }
    // pawęż
    const ci = pos.length / 3;
    pos.push(0, (sheer(0) + bottom(0)) / 2, 0);
    col.push(cWhite.r, cWhite.g, cWhite.b);
    for (let j = 0; j < 2 * K; j++) idx.push(ci, j, j + 1);
    idx.push(ci, 2 * K, 0);
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
    g.setAttribute("color", new THREE.Float32BufferAttribute(col, 3));
    g.setIndex(idx);
    orient(g, (m) => (m.x < 0.005 ? new V3(-1, 0, 0) : new V3(0, m.y - 0.4, m.z)));
    twoSided(g, M.hullOut, M.whiteIn);
  }

  // pasy na burcie
  for (const side of [1, -1]) {
    for (const [dy, r] of [[0.12, 0.022], [0.19, 0.01]]) {
      const pts = [];
      for (let x = 0.02; x <= 7.9; x += 0.2) {
        const y = sheer(x) - dy;
        pts.push(new V3(x, y, side * (hullZ(x, y) + 0.012)));
      }
      poly(pts, r, M.stripe);
    }
  }

  // nazwa i numer rejestracyjny
  const J = typeof JACHT !== "undefined" ? JACHT : {};
  const NAME = J.nazwa || "Tatulator";
  const REG = J.rejestracja || "";
  for (const side of [1, -1]) {
    const place = (mesh, x, y) => {
      const slope = (hullZ(x + 0.1, y) - hullZ(x - 0.1, y)) / 0.2;
      const a = Math.atan(-slope);
      mesh.position.set(x, y, side * (hullZ(x, y) + 0.02));
      mesh.rotation.y = side > 0 ? a : Math.PI - a;
      add(mesh);
    };
    place(textPlane(NAME, 1.5, 0.34, "italic bold {px}px Georgia, serif", "#1a3570"), 6.45, 0.72);
    if (REG) place(textPlane(REG, 0.95, 0.16, "600 {px}px system-ui, sans-serif", "#222"), 1.0, 0.82);
  }

  // ---------- pokład ----------
  {
    const W = { pos: [], uv: [] }, T = { pos: [], uv: [] };
    const N = 160;
    const pt = (x, z) => {
      const h = Math.max(hb(x), 0.01);
      return [x, sheer(x) + 0.04 * (1 - Math.pow(Math.min(1, Math.abs(z) / h), 2)), z];
    };
    const zone = (x) => (x < 0.35 ? "aft" : x < 2.25 ? "cockpit" : x < 5.8 ? "cabin" : x < 7.45 ? "fore" : "bow");
    // pasy pokładu dla prawej burty [z0, z1, typ]; lewa – lustrzanie
    const bands = (x, zn) => {
      const h = Math.max(hb(x), 0.004), e = Math.min(0.08, h * 0.3);
      let b;
      if (zn === "cockpit") b = [[0.9, h, "w"]];
      else if (zn === "cabin") b = [[cabBase(x), h - e, "t"], [h - e, h, "w"]];
      else if (zn === "fore") {
        const w = Math.min(h - e - 0.02, 0.36 * clamp((7.3 - x) / 1.5, 0, 1)); // biały klin w kształcie V
        b = [[0, w, "w"], [w, h - e, "t"], [h - e, h, "w"]];
      } else b = [[0, h, "w"]];
      return [...b.slice().reverse().map(([a, c, t]) => [-c, -a, t]), ...b];
    };
    for (let i = 0; i < N; i++) {
      const x0 = (LOA * i) / N, x1 = (LOA * (i + 1)) / N, zn = zone((x0 + x1) / 2);
      const b0 = bands(x0, zn), b1 = bands(x1, zn);
      b0.forEach(([a0, c0, t], k) => {
        const [a1, c1] = b1[k];
        const tgt = t === "t" ? T : W;
        for (const [x, z] of [[x0, a0], [x1, a1], [x1, c1], [x0, a0], [x1, c1], [x0, c0]]) {
          tgt.pos.push(...pt(x, z));
          tgt.uv.push(x * UVS, z * UVS);
        }
      });
    }
    for (const [D, mat] of [[W, std("#f2f4f6", { side: THREE.DoubleSide })], [T, M.teakT]]) {
      const g = new THREE.BufferGeometry();
      g.setAttribute("position", new THREE.Float32BufferAttribute(D.pos, 3));
      g.setAttribute("uv", new THREE.Float32BufferAttribute(D.uv, 2));
      g.computeVertexNormals();
      add(new THREE.Mesh(g, mat));
    }
  }
  // luk dziobowy z kratką, wlewy i knagi
  {
    const y0 = sheer(6.2) + 0.03;
    box(5.98, 6.46, y0, y0 + 0.1, -0.27, 0.27, M.white);
    box(6.01, 6.43, y0 + 0.1, y0 + 0.11, -0.24, 0.24, std("#34404b", { roughness: 0.15 }));
    for (let k = 0; k < 6; k++) rod(new V3(6.06 + k * 0.064, y0 + 0.125, -0.22), new V3(6.06 + k * 0.064, y0 + 0.125, 0.22), 0.009, M.chrome);
    for (const z of [-0.22, 0.22]) rod(new V3(6.04, y0 + 0.125, z), new V3(6.4, y0 + 0.125, z), 0.009, M.chrome);
    disc(6.75, sheer(6.75) + 0.045, 0, 0.055, M.chrome, 0.02, "y");
    for (const z of [-0.17, 0.17]) disc(7.05, sheer(7.05) + 0.04, z, 0.04, M.chrome, 0.015, "y");
    for (const z of [-0.2, 0.2]) {
      box(7.32, 7.5, sheer(7.4) + 0.055, sheer(7.4) + 0.075, z - 0.02, z + 0.02, M.chrome);
      box(7.37, 7.45, sheer(7.4) + 0.02, sheer(7.4) + 0.06, z - 0.015, z + 0.015, M.chrome);
    }
  }

  // ---------- kokpit ----------
  const CF = 0.62; // podłoga kokpitu
  tbox(0.35, 2.05, CF - 0.04, CF, -0.9, 0.9); // kratka podłogi
  for (const s of [1, -1]) {
    box(0.35, 2.25, CF - 0.04, sheer(1.3), ...zs(s, 0.9, 0.94), M.white);
    box(0.45, 2.05, CF, 1.0, ...zs(s, 0.52, 0.9), M.white);
    tbox(0.45, 2.05, 1.0, 1.035, ...zs(s, 0.52, 0.9)); // siedziska z listew teakowych
    box(0.4, 2.25, sheer(1.3) - 0.02, sheer(1.3) + 0.17, ...zs(s, 0.94, 0.985), M.mahogany); // mahoniowa zrębnica
    // kabestan samoostrzący
    disc(0.95, sheer(0.95) + 0.22, s * 0.99, 0.09, M.chrome, 0.12, "y");
    disc(0.95, sheer(0.95) + 0.3, s * 0.99, 0.065, M.chrome, 0.05, "y");
    disc(0.95, sheer(0.95) + 0.34, s * 0.99, 0.05, M.black, 0.04, "y");
  }
  box(0.33, 0.37, CF - 0.04, 1.06, -0.94, 0.94, M.white);
  // mostek przed zejściówką: szyna szotu grota, panel silnika Volvo Penta
  box(2.05, 2.25, CF, 0.98, -0.9, 0.9, M.white);
  box(2.02, 2.25, 0.98, 1.03, -0.9, 0.9, M.mahogany);
  box(2.07, 2.2, 1.03, 1.05, -0.8, 0.8, M.chrome);
  box(2.09, 2.18, 1.05, 1.09, -0.06, 0.06, M.dark);
  box(2.035, 2.05, 0.66, 0.95, -0.36, 0.36, M.mahogany);
  for (const [z, r] of [[-0.24, 0.032], [-0.08, 0.055], [0.08, 0.032], [0.22, 0.03]]) {
    disc(2.03, 0.83, z, r + 0.008, M.black, 0.012);
    disc(2.025, 0.83, z, r, M.white, 0.006);
  }
  box(2.02, 2.035, 0.72, 0.75, -0.02, 0.02, M.chrome); // stacyjka

  // ---------- nadbudówka ----------
  const windows = [
    [[2.75, 1.33], [4.05, 1.33], [3.95, 1.5], [2.75, 1.5]],
    [[4.3, 1.34], [4.85, 1.34], [4.75, 1.48], [4.3, 1.48]],
  ];
  for (const side of [1, -1]) {
    const shape = shapeOf([[2.25, sheer(2.25) - 0.02], [5.8, sheer(5.8) - 0.02], [5.0, ROOF], [2.25, ROOF]]);
    windows.forEach((w) => shape.holes.push(pathOf(w)));
    const map = (u, v) => new V3(u, v, side * cabZ(u, v));
    const g = orient(mappedShape(shape, map), () => new V3(0, 0, side));
    twoSided(g, M.white, M.mahoganyIn);
    for (const w of windows) {
      add(new THREE.Mesh(mappedShape(shapeOf(w), map), M.glass));
      const pts = [...w, w[0]].map(([u, v]) => { const p = map(u, v); p.z += side * 0.004; return p; });
      add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts), M.frame));
      const inner = [...w, w[0]].map(([u, v]) => { const p = map(u, v); p.z -= side * 0.012; return p; });
      poly(inner, 0.014, std("#7a2a18"));
    }
  }
  // dach
  {
    const nu = 14, nv = 10, pos = [], idx = [];
    for (let i = 0; i <= nu; i++)
      for (let j = 0; j <= nv; j++) {
        const x = 2.25 + (2.75 * i) / nu, v = -1 + (2 * j) / nv;
        pos.push(x, ROOF + 0.05 * (1 - v * v), v * cabZ(x, ROOF));
      }
    for (let i = 0; i < nu; i++)
      for (let j = 0; j < nv; j++) {
        const a = i * (nv + 1) + j, b = a + nv + 1;
        idx.push(a, b, b + 1, a, b + 1, a + 1);
      }
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
    g.setIndex(idx);
    twoSided(orient(g, () => new V3(0, 1, 0)), M.white, M.mahoganyIn);
  }
  // pochylony przód nadbudówki
  {
    const nu = 6, nv = 10, pos = [], idx = [], yb = sheer(5.8) - 0.02;
    for (let i = 0; i <= nu; i++)
      for (let j = 0; j <= nv; j++) {
        const w = i / nu, v = -1 + (2 * j) / nv;
        const x = 5.0 + 0.8 * w, y = ROOF + (yb - ROOF) * w;
        pos.push(x, y + 0.05 * (1 - v * v) * (1 - w), v * cabZ(x, y));
      }
    for (let i = 0; i < nu; i++)
      for (let j = 0; j < nv; j++) {
        const a = i * (nv + 1) + j, b = a + nv + 1;
        idx.push(a, b, b + 1, a, b + 1, a + 1);
      }
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
    g.setIndex(idx);
    twoSided(orient(g, () => new V3(1, 1, 0)), M.white, M.mahoganyIn);
  }
  // tylna ściana z zejściówką
  {
    const s0 = sheer(2.25) - 0.02, top = [];
    for (let k = 0; k <= 10; k++) { const v = 1 - k / 5; top.push([0.95 * v, ROOF + 0.05 * (1 - v * v)]); }
    const shape = shapeOf([[-0.9, CF - 0.04], [0.9, CF - 0.04], [0.9, s0], [1.0, s0], ...top, [-1.0, s0], [-0.9, s0]]);
    shape.holes.push(pathOf([[-0.3, 1.03], [0.3, 1.03], [0.3, 1.56], [-0.3, 1.56]]));
    const g = orient(mappedShape(shape, (u, v) => new V3(2.25, v, u)), () => new V3(-1, 0, 0));
    twoSided(g, M.white, M.mahoganyIn);
  }
  // mahoniowa rama zejściówki
  for (const z of [-0.33, 0.33]) box(2.22, 2.26, 1.0, 1.6, z - 0.035, z + 0.035, M.mahogany);
  box(2.22, 2.26, 1.56, 1.63, -0.37, 0.37, M.mahogany);
  // przesuwana klapa zejściówki
  box(2.25, 2.85, ROOF + 0.05, ROOF + 0.11, -0.35, 0.35, M.white);
  for (const z of [-0.38, 0.38]) box(2.25, 2.95, ROOF + 0.03, ROOF + 0.12, z - 0.025, z + 0.025, M.mahogany);
  // instrumenty na grodzi: kompas i dwa wyświetlacze (prawa), echosonda i niebieska kieszeń (lewa)
  disc(2.235, 1.42, 0.52, 0.075, M.black, 0.04);
  disc(2.21, 1.42, 0.52, 0.045, std("#b8262b"), 0.01);
  for (const y of [1.25, 1.12]) {
    box(2.225, 2.25, y - 0.055, y + 0.055, 0.47, 0.57, M.black);
    box(2.221, 2.226, y - 0.04, y + 0.04, 0.482, 0.558, std("#cfdcb8"));
  }
  box(2.215, 2.25, 1.38, 1.47, -0.62, -0.47, std("#8d949b"));
  box(2.212, 2.216, 1.39, 1.46, -0.6, -0.52, std("#3a6d8c"));
  box(2.21, 2.25, 1.08, 1.3, -0.8, -0.52, M.blue);
  rod(new V3(2.2, 1.28, -0.56), new V3(2.2, 1.33, -0.47), 0.014, std("#d22"));
  // ploter na wysięgniku pod budą
  rod(new V3(2.3, ROOF + 0.02, -0.55), new V3(2.27, ROOF + 0.12, -0.55), 0.012, M.black);
  box(2.24, 2.27, ROOF + 0.1, ROOF + 0.22, -0.65, -0.45, M.black);
  box(2.236, 2.24, ROOF + 0.11, ROOF + 0.21, -0.64, -0.46, std("#2e5f7a"));

  // teak i poręcze na dachu
  tbox(3.2, 4.25, ROOF + 0.045, ROOF + 0.06, -0.42, 0.42);
  for (const s of [1, -1]) {
    box(2.7, 4.9, ROOF + 0.06, ROOF + 0.1, s * 0.62 - 0.025, s * 0.62 + 0.025, M.teakDark);
  }

  // ---------- wnętrze ----------
  box(2.25, 5.95, 0.1, 0.15, -0.45, 0.45, M.sole);
  for (const s of [1, -1]) {
    const z = (a, b) => (s > 0 ? [a, b] : [-b, -a]);
    box(2.75, 4.75, 0.15, 0.55, ...z(0.45, 0.98), M.cushion);
    box(2.75, 4.75, 0.55, 0.85, ...z(0.98, 1.08), M.cushion);
    box(2.75, 4.75, 0.85, 1.08, ...z(0.98, 1.12), M.mahogany);
    for (const x of [3.1, 3.75, 4.4]) box(x - 0.26, x + 0.26, 0.89, 1.04, ...z(0.972, 0.98), std("#efebe2")); // szafki z otworami
    box(4.93, 4.97, 0.15, sheer(4.95) - 0.02, ...z(0.42, 0.98), M.mahogany);
    box(4.93, 4.97, sheer(4.95) - 0.02, ROOF, ...z(0.42, cabBase(4.95) - 0.04), M.mahogany);
  }
  box(3.1, 4.3, 0.78, 0.82, -0.36, 0.36, M.mahogany);
  box(3.65, 3.75, 0.15, 0.78, -0.05, 0.05, M.steel);
  box(2.3, 2.75, 0.15, 0.95, -1.0, -0.45, M.mahogany); // kambuz
  box(2.42, 2.66, 0.95, 0.96, -0.85, -0.58, M.steel);
  box(2.3, 2.75, 0.15, 0.78, 0.45, 1.0, M.mahogany); // stolik nawigacyjny
  box(2.35, 2.55, 0.33, 0.37, -0.28, 0.28, M.mahogany); // stopnie zejściówki
  box(2.27, 2.42, 0.5, 0.54, -0.28, 0.28, M.mahogany);
  box(5.0, 6.4, 0.15, 0.68, -0.72, 0.72, M.cushion); // koja dziobowa (V)
  box(3.3, 3.95, 1.57, 1.6, -0.66, -0.56, std("#e9eef2", { emissive: "#fff6dc", emissiveIntensity: 0.4 })); // lampa
  disc(2.27, 1.3, 0.66, 0.065, std("#c9a24a", { metalness: 0.3 }), 0.03); // zegar
  disc(2.29, 1.3, 0.66, 0.05, M.white, 0.006);
  {
    // gródź komory kotwicznej – zamyka wnętrze od dziobu
    const xb = 6.4, pts = [];
    for (let k = 0; k <= 12; k++) { const p = sectionPoint(xb, (0.8 * k) / 12, 1); pts.push([p.z - 0.01, p.y]); }
    const right = pts.filter(([, y]) => y >= 0.12);
    const shape = shapeOf([...right, ...right.slice().reverse().map(([z, y]) => [-z, y])]);
    add(new THREE.Mesh(mappedShape(shape, (u, v) => new V3(xb, v, u)), std("#5a2e1a", { side: THREE.DoubleSide })));
  }

  // ---------- kil i ster ----------
  {
    const keel = new THREE.ExtrudeGeometry(shapeOf([[3.55, -0.35], [4.8, -0.35], [4.55, -1.37], [3.9, -1.37]]), { depth: 0.18, bevelEnabled: false });
    keel.translate(0, 0, -0.09);
    add(new THREE.Mesh(keel, M.anti));
    const rTop = new THREE.ExtrudeGeometry(shapeOf([[0, 1.0], [-0.12, 1.0], [-0.18, 0], [0, 0]]), { depth: 0.06, bevelEnabled: false });
    const rBot = new THREE.ExtrudeGeometry(shapeOf([[0, 0], [-0.18, 0], [-0.45, -0.95], [-0.05, -0.95]]), { depth: 0.06, bevelEnabled: false });
    rTop.translate(0, 0, -0.03);
    rBot.translate(0, 0, -0.03);
    add(new THREE.Mesh(rTop, M.white));
    add(new THREE.Mesh(rBot, M.anti));
    rod(new V3(-0.06, 1.0, 0), new V3(1.2, 1.12, 0), 0.03, M.teakDark); // rumpel
  }

  // ---------- silnik zaburtowy ----------
  box(-0.1, 0.0, 0.75, 0.95, 0.6, 0.9, M.dark); // wspornik
  box(-0.45, -0.1, 0.85, 1.3, 0.6, 0.9, M.black);
  box(-0.44, -0.11, 1.22, 1.3, 0.61, 0.89, std("#3a4148"));
  box(-0.32, -0.24, -0.4, 0.85, 0.71, 0.79, M.black);
  box(-0.42, -0.14, -0.2, -0.17, 0.68, 0.82, M.black);
  {
    const c = document.createElement("canvas");
    c.width = c.height = 256;
    const g = c.getContext("2d");
    g.translate(128, 128);
    g.strokeStyle = g.fillStyle = "#1a3570";
    g.lineWidth = 3;
    g.beginPath(); g.arc(0, 0, 62, 0, Math.PI * 2); g.stroke();
    for (let k = 0; k < 8; k++) {
      const L = k % 2 ? 58 : 112;
      g.save(); g.rotate((k * Math.PI) / 4);
      g.beginPath(); g.moveTo(0, -L); g.lineTo(13, 0); g.lineTo(0, 0); g.closePath(); g.globalAlpha = 1; g.fill();
      g.beginPath(); g.moveTo(0, -L); g.lineTo(-13, 0); g.lineTo(0, 0); g.closePath(); g.globalAlpha = 0.35; g.fill();
      g.restore();
    }
    const rose = new THREE.Mesh(new THREE.PlaneGeometry(0.42, 0.42), new THREE.MeshBasicMaterial({ map: new THREE.CanvasTexture(c), transparent: true, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -4 }));
    rose.position.set(-0.012, 0.6, -0.42);
    rose.rotation.y = -Math.PI / 2;
    add(rose);
  }

  // ---------- olinowanie ----------
  rod(new V3(MX, ROOF + 0.05, 0), new V3(MX, MAST_TOP, 0), 0.07, M.mast);
  rod(new V3(MX - 0.1, 7, -0.85), new V3(MX - 0.1, 7, 0.85), 0.025, M.dark);
  rod(new V3(MX, MAST_TOP, 0), new V3(MX, MAST_TOP + 0.6, 0), 0.008, M.dark); // antena
  const W = 0.009;
  for (const s of [1, -1]) {
    const chain = new V3(MX - 0.1, sheer(MX) + 0.02, s * (hb(MX) - 0.06));
    rod(new V3(MX, MAST_TOP - 0.3, 0), new V3(MX - 0.1, 7, s * 0.85), W, M.wire);
    rod(new V3(MX - 0.1, 7, s * 0.85), chain, W, M.wire);
    rod(new V3(MX, 7, 0), new V3(MX - 0.6, sheer(MX - 0.6) + 0.02, s * (hb(MX - 0.6) - 0.06)), W, M.wire);
    rod(new V3(MX, 7, 0), new V3(MX + 0.5, sheer(MX + 0.5) + 0.02, s * (hb(MX + 0.5) - 0.06)), W, M.wire);
  }
  const stayA = new V3(8.0, sheer(8.0) + 0.08, 0), stayB = new V3(MX, MAST_TOP - 0.1, 0);
  const onStay = (t) => stayA.clone().lerp(stayB, t);
  rod(stayA, stayB, W, M.wire);
  rod(new V3(MX, MAST_TOP, 0), new V3(0.12, sheer(0.12) + 0.1, 0), W, M.wire); // achtersztag

  // genua zwinięta na rolerze
  const furled = new THREE.Group();
  boat.add(furled);
  rod(onStay(0.04), onStay(0.93), 0.07, M.blue, furled);
  rod(onStay(0.04), onStay(0.1), 0.076, M.flagWhite, furled);

  // żagle (postawione)
  function sailGeom(p0, p1, p2, belly, n = 12) {
    const pos = [], idx = [], id = (i, j) => (i * (2 * n + 3 - i)) / 2 + j;
    for (let i = 0; i <= n; i++)
      for (let j = 0; j <= n - i; j++) {
        const a = i / n, b = j / n, w = 27 * a * b * (1 - a - b);
        const p = p0.clone().addScaledVector(new V3().subVectors(p1, p0), a).addScaledVector(new V3().subVectors(p2, p0), b).addScaledVector(belly, w);
        pos.push(p.x, p.y, p.z);
      }
    for (let i = 0; i < n; i++)
      for (let j = 0; j < n - i; j++) {
        idx.push(id(i, j), id(i + 1, j), id(i, j + 1));
        if (j < n - i - 1) idx.push(id(i + 1, j), id(i + 1, j + 1), id(i, j + 1));
      }
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
    g.setIndex(idx);
    g.computeVertexNormals();
    return g;
  }
  const genoa = add(new THREE.Mesh(sailGeom(onStay(0.03), onStay(0.93), new V3(3.3, 1.75, -1.05), new V3(-0.1, 0, -0.35)), M.sail));

  // bom, lazy bag, grot
  const boomG = new THREE.Group();
  boomG.position.set(MX, 0, 0);
  boat.add(boomG);
  rod(new V3(-0.05, 2.35, 0), new V3(-3.1, 2.35, 0), 0.05, M.dark, boomG);
  const lazy = box(-3.05, -0.1, 2.38, 2.72, -0.13, 0.13, M.blue, boomG);
  const flaked = box(-0.4, -0.08, 2.7, 3.05, -0.1, 0.1, M.sail, boomG);
  const mainsail = add(new THREE.Mesh(sailGeom(new V3(-0.08, 2.42, 0), new V3(-0.08, MAST_TOP - 0.25, 0), new V3(-3.0, 2.45, 0), new V3(0, 0, -0.45)), M.sail), boomG);

  const sheetG = new THREE.Group();
  boat.add(sheetG);
  function rigSheet() {
    sheetG.clear();
    boomG.updateMatrix();
    const top = new V3(-2.1, 2.3, 0).applyMatrix4(boomG.matrix);
    for (const dz of [-0.02, 0.02]) rod(new V3(top.x, top.y, top.z + dz), new V3(2.135, 1.1, dz), 0.007, std("#3b4f9a"), sheetG);
  }

  // buda (sprayhood)
  function hoodPart(u0, u1, mat) {
    const nu = 10, nv = 16, pos = [], idx = [];
    for (let i = 0; i <= nu; i++)
      for (let j = 0; j <= nv; j++) {
        const u = u0 + ((u1 - u0) * i) / nu, th = (Math.PI * j) / nv;
        const h = 0.55 * (1 - THREE.MathUtils.smootherstep(u, 0.4, 1));
        pos.push(2.05 + 0.95 * u, ROOF + h * Math.pow(Math.sin(th), 0.55), 0.92 * Math.sign(Math.cos(th)) * Math.pow(Math.abs(Math.cos(th)), 0.6));
      }
    for (let i = 0; i < nu; i++)
      for (let j = 0; j < nv; j++) {
        const a = i * (nv + 1) + j, b = a + nv + 1;
        idx.push(a, b, b + 1, a, b + 1, a + 1);
      }
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
    g.setIndex(idx);
    g.computeVertexNormals();
    add(new THREE.Mesh(g, mat));
  }
  hoodPart(0, 0.5, M.blue);
  hoodPart(0.5, 1, M.clear);
  for (const s of [1, -1]) box(2.05, 2.25, sheer(2.1), ROOF, s * 0.92 - 0.01, s * 0.92 + 0.01, M.blue);

  // ---------- relingi ----------
  const S = 0.016, H1 = 0.62, H2 = 0.32;
  const deckEdge = (x, s) => new V3(x, sheer(x), s * (hb(x) - 0.07));
  const up = (p, h) => new V3(p.x, p.y + h, p.z);
  for (const s of [1, -1]) {
    const xs = [0.55, 1.9, 3.2, 4.6, 5.9, 7.05];
    xs.forEach((x) => rod(deckEdge(x, s), up(deckEdge(x, s), H1), S, M.steel));
    for (const h of [H1, H2]) poly(xs.map((x) => up(deckEdge(x, s), h)), 0.008, M.rope);
    tbox(0.1, 0.42, sheer(0.3) + H1 - 0.05, sheer(0.3) + H1 - 0.02, ...zs(s, 0.55, hb(0.3) - 0.1)); // siedzisko na koszu
  }
  // pulpit dziobowy
  {
    const a = deckEdge(7.05, 1), b = new V3(7.9, sheer(7.9), 0.14);
    poly([up(a, H1), up(b, H1), new V3(8.12, sheer(8.0) + H1, 0), up(new V3(b.x, b.y, -b.z), H1), up(new V3(a.x, a.y, -a.z), H1)], S, M.steel);
    for (const s of [1, -1]) rod(new V3(b.x, b.y, s * b.z), up(new V3(b.x, b.y, s * b.z), H1), S, M.steel);
    box(8.07, 8.15, sheer(8) + H1 - 0.11, sheer(8) + H1 - 0.03, 0, 0.045, std("#2fa84f", { emissive: "#1c6", emissiveIntensity: 0.3 }));
    box(8.07, 8.15, sheer(8) + H1 - 0.11, sheer(8) + H1 - 0.03, -0.045, 0, std("#d22", { emissive: "#d22", emissiveIntensity: 0.3 }));
    // okucie dziobowe z rolką, kotwica, bęben rolera
    const yb = sheer(8);
    box(7.7, 8.28, yb + 0.01, yb + 0.05, -0.06, 0.06, M.chrome);
    disc(8.24, yb + 0.03, 0, 0.035, M.dark, 0.1, "z");
    rod(new V3(8.22, yb + 0.05, 0), new V3(7.6, yb + 0.06, 0), 0.012, M.chrome);
    rod(new V3(8.24, yb + 0.02, 0), new V3(8.42, yb - 0.3, 0), 0.02, M.chrome);
    const fluke = add(new THREE.Mesh(new THREE.ConeGeometry(0.11, 0.24, 4), M.chrome));
    fluke.position.set(8.43, yb - 0.42, 0);
    fluke.scale.z = 0.45;
    disc(7.98, yb + 0.13, 0, 0.06, M.chrome, 0.12, "y");
  }
  // kosz rufowy
  {
    const a = deckEdge(0.55, 1), b = new V3(0.06, sheer(0.06), hb(0.06) - 0.1);
    poly([up(a, H1), up(b, H1), up(new V3(b.x, b.y, -b.z), H1), up(new V3(a.x, a.y, -a.z), H1)], S, M.steel);
    for (const s of [1, -1]) rod(new V3(b.x, b.y, s * b.z), up(new V3(b.x, b.y, s * b.z), H1), S, M.steel);
  }
  // koło ratunkowe
  const buoy = add(new THREE.Mesh(new THREE.TorusGeometry(0.2, 0.05, 10, 24), M.orange));
  buoy.position.set(0.08, sheer(0.08) + 0.4, 0.7);
  buoy.rotation.y = Math.PI / 2;
  // bandera
  rod(new V3(0.05, sheer(0.05), -0.62), new V3(-0.1, sheer(0.05) + 1.1, -0.62), 0.012, M.steel);
  const flag = new THREE.Group();
  flag.position.set(-0.1, sheer(0.05) + 1.02, -0.62);
  boat.add(flag);
  const fw = new THREE.Mesh(new THREE.PlaneGeometry(0.5, 0.14), M.flagWhite);
  fw.position.set(-0.25, 0.07, 0);
  const fr = new THREE.Mesh(new THREE.PlaneGeometry(0.5, 0.14), M.red);
  fr.position.set(-0.25, -0.07, 0);
  flag.add(fw, fr);

  // odbijacze od strony pomostu
  for (const x of [2.0, 3.6, 5.2]) {
    const f = add(new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.09, 0.42, 14), M.white));
    f.position.set(x, 0.55, hullZ(x, 0.55) + 0.1);
  }

  // ---------- otoczenie: woda, pomost, brzeg ----------
  const water = new THREE.Mesh(
    new THREE.PlaneGeometry(600, 600),
    new THREE.MeshLambertMaterial({ color: "#35607f", transparent: true, opacity: 0.86, depthWrite: false })
  );
  water.rotation.x = -Math.PI / 2;
  scene.add(water);
  const env = new THREE.Group();
  scene.add(env);
  box(-8, 18, 0.3, 0.45, 1.62, 3.0, std("#6e5c4a"), env);
  for (let x = -6; x <= 16; x += 4) {
    const p = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.1, 1.6, 10), std("#4f4236"));
    p.position.set(x, -0.2, 1.68);
    env.add(p);
  }
  const grass = new THREE.Mesh(new THREE.PlaneGeometry(200, 60), std("#6b9450", { roughness: 1 }));
  grass.rotation.x = -Math.PI / 2;
  grass.position.set(5, 0.42, 33);
  env.add(grass);
  const shore = new THREE.Mesh(new THREE.BoxGeometry(400, 3, 6), std("#3e5a37"));
  shore.position.set(0, 1.2, -95);
  env.add(shore);
  let seed = 7;
  const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
  const treeMat = std("#3e6b3a", { roughness: 0.9 });
  for (let i = 0; i < 40; i++) {
    const t = new THREE.Mesh(new THREE.ConeGeometry(2 + rnd() * 2, 7 + rnd() * 6, 8), treeMat);
    t.position.set(-40 + rnd() * 100, 4.5, 14 + rnd() * 40);
    env.add(t);
  }
  for (let i = 0; i < 50; i++) {
    const t = new THREE.Mesh(new THREE.SphereGeometry(3 + rnd() * 3, 8, 6), treeMat);
    t.position.set(-150 + rnd() * 300, 3 + rnd() * 2, -96 - rnd() * 6);
    env.add(t);
  }

  // ---------- sterowanie ----------
  let running = false, last = 0;
  const st = {
    mode: "orbit",
    theta: -1.1, phi: 0.18, r: 15, target: new V3(4, 4.2, 0),
    pos: new V3(1, 0, 0), yaw: 0, pitch: 0, inside: false, eyeY: 2,
    keys: {}, sails: false, visible: false,
  };
  const inCockpit = (x, z) => x > 0.35 && x < 2.25 && Math.abs(z) < 0.9;
  const inCabin = (x, z) => x > 2.25 && x < 5.8 && Math.abs(z) < cabBase(x) + 0.04;
  const groundY = (x, z) => {
    if (st.inside) return 0.15;
    if (inCockpit(x, z)) return CF;
    const h = Math.max(hb(x), 0.01);
    return sheer(x) + 0.04 * (1 - Math.pow(z / h, 2));
  };
  const eyeH = () => (st.inside ? 1.3 : inCockpit(st.pos.x, st.pos.z) ? 1.55 : 1.65);
  function tryMove(nx, nz) {
    const { x, z } = st.pos;
    if (st.inside) {
      if (nx < 2.33) {
        if (Math.abs(nz) < 0.3) { st.inside = false; nx = Math.min(nx, 2.15); }
        else nx = 2.33;
      }
      if (st.inside) { nx = Math.min(nx, 4.85); nz = clamp(nz, -0.4, 0.4); }
    } else {
      nx = clamp(nx, 0.15, 7.7);
      const lim = Math.max(0.05, hb(nx) - 0.2);
      nz = clamp(nz, -lim, lim);
      if (inCabin(nx, nz)) {
        if (inCockpit(x, z) && Math.abs(nz) < 0.3) { st.inside = true; nx = Math.max(nx, 2.4); }
        else return;
      }
    }
    st.pos.x = nx;
    st.pos.z = nz;
  }

  const STOPS = {
    zewnatrz: { t: "Dookoła jachtu", d: "Przeciągnij, aby obracać jacht, kółkiem myszy lub dwoma palcami przybliżasz.", orbit: { theta: -1.1, phi: 0.18, r: 15 }, photo: "zdjecia/wieczorem-przy-kei.jpg" },
    gora: { t: "Z lotu ptaka", d: "Widok z góry – jak na zdjęciu z drona w marinie.", orbit: { theta: -0.9, phi: 1.25, r: 15 }, photo: "zdjecia/marina-z-gory.jpg" },
    kokpit: { t: "Kokpit", d: "Jak na zdjęciu z rejsu: mahoniowa zejściówka, szyna szotu grota, panel silnika Volvo Penta, kompas i wyświetlacze, echosonda z niebieską kieszenią, ploter pod budą. Idź prosto, żeby zejść do mesy.", walk: [0.5, 0, 0.2], yaw: -0.08, pitch: -0.32, photo: "zdjecia/pod-zaglami.jpg" },
    mesa: { t: "Mesa", d: "Mahoniowe wnętrze: stół, koje z oparciami, szafki z otworami, okna w mahoniowych ramach, kambuz i stolik nawigacyjny. Dalej koja dziobowa.", walk: [2.6, 0, 0], yaw: 0, pitch: -0.25, inside: true, photo: "zdjecia/mesa.jpg" },
    dziob: { t: "Dziób", d: "Teak ułożony w V z białym klinem, luk z kratką, knagi, kotwica na rolce, bęben rolera genui i lampa dwukolorowa na pulpicie.", walk: [7.35, 0, -0.24], yaw: Math.PI - 0.22, pitch: -0.55, photo: "zdjecia/pomost-dziob.jpg" },
  };
  const titleEl = document.getElementById("s3dTitle"), textEl = document.getElementById("s3dText");
  const dpad = document.getElementById("dpad");
  const photoEl = document.getElementById("s3dPhoto");
  photoEl.addEventListener("click", () => {
    const lb = document.getElementById("lightbox");
    if (!lb) return;
    document.getElementById("lightboxImg").src = photoEl.src;
    document.getElementById("lightboxCaption").textContent = "Prawdziwe zdjęcie – " + titleEl.textContent;
    lb.hidden = false;
  });
  function goStop(key) {
    const s = STOPS[key];
    document.querySelectorAll("[data-stop]").forEach((b) => b.classList.toggle("active", b.dataset.stop === key));
    titleEl.textContent = s.t;
    textEl.textContent = s.d;
    photoEl.hidden = !s.photo;
    if (s.photo) { photoEl.src = s.photo; photoEl.alt = "Zdjęcie: " + s.t; }
    if (s.orbit) {
      st.mode = "orbit";
      Object.assign(st, s.orbit);
      dpad.hidden = true;
    } else {
      st.mode = "walk";
      st.inside = !!s.inside;
      st.pos.set(...s.walk);
      st.yaw = s.yaw;
      st.pitch = s.pitch;
      st.eyeY = groundY(st.pos.x, st.pos.z) + eyeH();
      dpad.hidden = false;
    }
    wakeUp();
  }
  document.querySelectorAll("[data-stop]").forEach((b) => b.addEventListener("click", () => goStop(b.dataset.stop)));

  const sailsBtn = document.getElementById("s3dSails");
  function setSails(on) {
    st.sails = on;
    furled.visible = !on;
    genoa.visible = on;
    mainsail.visible = on;
    flaked.visible = !on;
    boomG.rotation.y = on ? -0.42 : 0;
    rigSheet();
    sailsBtn.textContent = on ? "⚓ Zrzuć żagle" : "⛵ Postaw żagle";
    wakeUp();
  }
  sailsBtn.addEventListener("click", () => setSails(!st.sails));
  setSails(false);

  // wskaźnik (mysz / dotyk)
  const pointers = new Map();
  let pinch = 0;
  canvas.addEventListener("pointerdown", (e) => {
    canvas.setPointerCapture(e.pointerId);
    pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
  });
  const endPointer = (e) => { pointers.delete(e.pointerId); pinch = 0; };
  canvas.addEventListener("pointerup", endPointer);
  canvas.addEventListener("pointercancel", endPointer);
  canvas.addEventListener("pointermove", (e) => {
    const p = pointers.get(e.pointerId);
    if (!p) return;
    const dx = e.clientX - p.x, dy = e.clientY - p.y;
    p.x = e.clientX;
    p.y = e.clientY;
    if (pointers.size === 2 && st.mode === "orbit") {
      const [a, b] = [...pointers.values()];
      const d = Math.hypot(a.x - b.x, a.y - b.y);
      if (pinch) st.r = clamp(st.r * (pinch / d), 4, 45);
      pinch = d;
    } else if (pointers.size === 1) {
      if (st.mode === "orbit") {
        st.theta += dx * 0.006;
        st.phi = clamp(st.phi + dy * 0.005, 0.03, 1.45);
      } else {
        st.yaw -= dx * 0.004;
        st.pitch = clamp(st.pitch + dy * 0.004, -1.2, 1.2);
      }
    }
    wakeUp();
  });
  canvas.addEventListener("wheel", (e) => {
    if (st.mode !== "orbit") return;
    e.preventDefault();
    st.r = clamp(st.r * Math.exp(e.deltaY * 0.001), 4, 45);
    wakeUp();
  }, { passive: false });

  const KEYMAP = { KeyW: "f", ArrowUp: "f", KeyS: "b", ArrowDown: "b", KeyA: "l", ArrowLeft: "l", KeyD: "r", ArrowRight: "r" };
  window.addEventListener("keydown", (e) => {
    const k = KEYMAP[e.code];
    if (!k || st.mode !== "walk" || !st.visible) return;
    if (e.target.closest && e.target.closest("input, textarea")) return;
    e.preventDefault();
    st.keys[k] = true;
    wakeUp();
  });
  window.addEventListener("keyup", (e) => { const k = KEYMAP[e.code]; if (k) st.keys[k] = false; });
  dpad.querySelectorAll("[data-k]").forEach((b) => {
    const k = b.dataset.k;
    const on = (e) => { e.preventDefault(); st.keys[k] = true; wakeUp(); };
    const off = () => { st.keys[k] = false; };
    b.addEventListener("pointerdown", on);
    b.addEventListener("pointerup", off);
    b.addEventListener("pointerleave", off);
    b.addEventListener("pointercancel", off);
  });

  // ---------- pętla renderowania ----------
  function resize() {
    const w = wrap.clientWidth, h = wrap.clientHeight;
    if (!w || !h) return;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    wakeUp();
  }
  new ResizeObserver(resize).observe(wrap);

  function wakeUp() {
    if (running || !st.visible) return;
    running = true;
    last = performance.now();
    requestAnimationFrame(frame);
  }
  function frame(now) {
    const dt = Math.min(0.05, (now - last) / 1000);
    last = now;
    const t = now / 1000;
    if (st.mode === "orbit") {
      const { theta, phi, r, target } = st;
      camera.position.set(target.x + r * Math.cos(phi) * Math.cos(theta), target.y + r * Math.sin(phi), target.z + r * Math.cos(phi) * Math.sin(theta));
      camera.lookAt(target);
    } else {
      const k = st.keys, f = (k.f ? 1 : 0) - (k.b ? 1 : 0), s = (k.r ? 1 : 0) - (k.l ? 1 : 0);
      if (f || s) {
        const fx = Math.cos(st.yaw), fz = Math.sin(st.yaw), sp = 1.3 * dt;
        tryMove(st.pos.x + (fx * f - fz * s) * sp, st.pos.z + (fz * f + fx * s) * sp);
      }
      const targetEye = groundY(st.pos.x, st.pos.z) + eyeH();
      st.eyeY += (targetEye - st.eyeY) * Math.min(1, dt * 8);
      camera.position.set(st.pos.x, st.eyeY, st.pos.z);
      camera.lookAt(st.pos.x + Math.cos(st.pitch) * Math.cos(st.yaw), st.eyeY + Math.sin(st.pitch), st.pos.z + Math.cos(st.pitch) * Math.sin(st.yaw));
    }
    flag.rotation.y = Math.sin(t * 2.2) * 0.25;
    boat.position.y = Math.sin(t * 0.8) * 0.015;
    renderer.render(scene, camera);
    // animacja trwa, dopóki sekcja jest widoczna (flaga, kołysanie)
    if (st.visible && !document.hidden) requestAnimationFrame(frame);
    else running = false;
  }
  new IntersectionObserver((entries) => {
    st.visible = entries[0].isIntersecting;
    if (st.visible) wakeUp();
  }).observe(wrap);
  document.addEventListener("visibilitychange", wakeUp);

  goStop("zewnatrz");
  resize();
})();
