/**
 * @license
 * Copyright 2019 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const Tt = globalThis, Gt = Tt.ShadowRoot && (Tt.ShadyCSS === void 0 || Tt.ShadyCSS.nativeShadow) && "adoptedStyleSheets" in Document.prototype && "replace" in CSSStyleSheet.prototype, Yt = Symbol(), re = /* @__PURE__ */ new WeakMap();
let $e = class {
  constructor(t, s, i) {
    if (this._$cssResult$ = !0, i !== Yt) throw Error("CSSResult is not constructable. Use `unsafeCSS` or `css` instead.");
    this.cssText = t, this.t = s;
  }
  get styleSheet() {
    let t = this.o;
    const s = this.t;
    if (Gt && t === void 0) {
      const i = s !== void 0 && s.length === 1;
      i && (t = re.get(s)), t === void 0 && ((this.o = t = new CSSStyleSheet()).replaceSync(this.cssText), i && re.set(s, t));
    }
    return t;
  }
  toString() {
    return this.cssText;
  }
};
const Ie = (e) => new $e(typeof e == "string" ? e : e + "", void 0, Yt), g = (e, ...t) => {
  const s = e.length === 1 ? e[0] : t.reduce((i, o, r) => i + ((n) => {
    if (n._$cssResult$ === !0) return n.cssText;
    if (typeof n == "number") return n;
    throw Error("Value passed to 'css' function must be a 'css' function result: " + n + ". Use 'unsafeCSS' to pass non-literal values, but take care to ensure page security.");
  })(o) + e[r + 1], e[0]);
  return new $e(s, e, Yt);
}, Te = (e, t) => {
  if (Gt) e.adoptedStyleSheets = t.map((s) => s instanceof CSSStyleSheet ? s : s.styleSheet);
  else for (const s of t) {
    const i = document.createElement("style"), o = Tt.litNonce;
    o !== void 0 && i.setAttribute("nonce", o), i.textContent = s.cssText, e.appendChild(i);
  }
}, ne = Gt ? (e) => e : (e) => e instanceof CSSStyleSheet ? ((t) => {
  let s = "";
  for (const i of t.cssRules) s += i.cssText;
  return Ie(s);
})(e) : e;
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const { is: Ne, defineProperty: Me, getOwnPropertyDescriptor: Le, getOwnPropertyNames: Re, getOwnPropertySymbols: Be, getPrototypeOf: Ue } = Object, Rt = globalThis, de = Rt.trustedTypes, Fe = de ? de.emptyScript : "", He = Rt.reactiveElementPolyfillSupport, $t = (e, t) => e, Nt = { toAttribute(e, t) {
  switch (t) {
    case Boolean:
      e = e ? Fe : null;
      break;
    case Object:
    case Array:
      e = e == null ? e : JSON.stringify(e);
  }
  return e;
}, fromAttribute(e, t) {
  let s = e;
  switch (t) {
    case Boolean:
      s = e !== null;
      break;
    case Number:
      s = e === null ? null : Number(e);
      break;
    case Object:
    case Array:
      try {
        s = JSON.parse(e);
      } catch {
        s = null;
      }
  }
  return s;
} }, Qt = (e, t) => !Ne(e, t), ce = { attribute: !0, type: String, converter: Nt, reflect: !1, useDefault: !1, hasChanged: Qt };
Symbol.metadata ??= Symbol("metadata"), Rt.litPropertyMetadata ??= /* @__PURE__ */ new WeakMap();
let ct = class extends HTMLElement {
  static addInitializer(t) {
    this._$Ei(), (this.l ??= []).push(t);
  }
  static get observedAttributes() {
    return this.finalize(), this._$Eh && [...this._$Eh.keys()];
  }
  static createProperty(t, s = ce) {
    if (s.state && (s.attribute = !1), this._$Ei(), this.prototype.hasOwnProperty(t) && ((s = Object.create(s)).wrapped = !0), this.elementProperties.set(t, s), !s.noAccessor) {
      const i = Symbol(), o = this.getPropertyDescriptor(t, i, s);
      o !== void 0 && Me(this.prototype, t, o);
    }
  }
  static getPropertyDescriptor(t, s, i) {
    const { get: o, set: r } = Le(this.prototype, t) ?? { get() {
      return this[s];
    }, set(n) {
      this[s] = n;
    } };
    return { get: o, set(n) {
      const h = o?.call(this);
      r?.call(this, n), this.requestUpdate(t, h, i);
    }, configurable: !0, enumerable: !0 };
  }
  static getPropertyOptions(t) {
    return this.elementProperties.get(t) ?? ce;
  }
  static _$Ei() {
    if (this.hasOwnProperty($t("elementProperties"))) return;
    const t = Ue(this);
    t.finalize(), t.l !== void 0 && (this.l = [...t.l]), this.elementProperties = new Map(t.elementProperties);
  }
  static finalize() {
    if (this.hasOwnProperty($t("finalized"))) return;
    if (this.finalized = !0, this._$Ei(), this.hasOwnProperty($t("properties"))) {
      const s = this.properties, i = [...Re(s), ...Be(s)];
      for (const o of i) this.createProperty(o, s[o]);
    }
    const t = this[Symbol.metadata];
    if (t !== null) {
      const s = litPropertyMetadata.get(t);
      if (s !== void 0) for (const [i, o] of s) this.elementProperties.set(i, o);
    }
    this._$Eh = /* @__PURE__ */ new Map();
    for (const [s, i] of this.elementProperties) {
      const o = this._$Eu(s, i);
      o !== void 0 && this._$Eh.set(o, s);
    }
    this.elementStyles = this.finalizeStyles(this.styles);
  }
  static finalizeStyles(t) {
    const s = [];
    if (Array.isArray(t)) {
      const i = new Set(t.flat(1 / 0).reverse());
      for (const o of i) s.unshift(ne(o));
    } else t !== void 0 && s.push(ne(t));
    return s;
  }
  static _$Eu(t, s) {
    const i = s.attribute;
    return i === !1 ? void 0 : typeof i == "string" ? i : typeof t == "string" ? t.toLowerCase() : void 0;
  }
  constructor() {
    super(), this._$Ep = void 0, this.isUpdatePending = !1, this.hasUpdated = !1, this._$Em = null, this._$Ev();
  }
  _$Ev() {
    this._$ES = new Promise((t) => this.enableUpdating = t), this._$AL = /* @__PURE__ */ new Map(), this._$E_(), this.requestUpdate(), this.constructor.l?.forEach((t) => t(this));
  }
  addController(t) {
    (this._$EO ??= /* @__PURE__ */ new Set()).add(t), this.renderRoot !== void 0 && this.isConnected && t.hostConnected?.();
  }
  removeController(t) {
    this._$EO?.delete(t);
  }
  _$E_() {
    const t = /* @__PURE__ */ new Map(), s = this.constructor.elementProperties;
    for (const i of s.keys()) this.hasOwnProperty(i) && (t.set(i, this[i]), delete this[i]);
    t.size > 0 && (this._$Ep = t);
  }
  createRenderRoot() {
    const t = this.shadowRoot ?? this.attachShadow(this.constructor.shadowRootOptions);
    return Te(t, this.constructor.elementStyles), t;
  }
  connectedCallback() {
    this.renderRoot ??= this.createRenderRoot(), this.enableUpdating(!0), this._$EO?.forEach((t) => t.hostConnected?.());
  }
  enableUpdating(t) {
  }
  disconnectedCallback() {
    this._$EO?.forEach((t) => t.hostDisconnected?.());
  }
  attributeChangedCallback(t, s, i) {
    this._$AK(t, i);
  }
  _$ET(t, s) {
    const i = this.constructor.elementProperties.get(t), o = this.constructor._$Eu(t, i);
    if (o !== void 0 && i.reflect === !0) {
      const r = (i.converter?.toAttribute !== void 0 ? i.converter : Nt).toAttribute(s, i.type);
      this._$Em = t, r == null ? this.removeAttribute(o) : this.setAttribute(o, r), this._$Em = null;
    }
  }
  _$AK(t, s) {
    const i = this.constructor, o = i._$Eh.get(t);
    if (o !== void 0 && this._$Em !== o) {
      const r = i.getPropertyOptions(o), n = typeof r.converter == "function" ? { fromAttribute: r.converter } : r.converter?.fromAttribute !== void 0 ? r.converter : Nt;
      this._$Em = o;
      const h = n.fromAttribute(s, r.type);
      this[o] = h ?? this._$Ej?.get(o) ?? h, this._$Em = null;
    }
  }
  requestUpdate(t, s, i, o = !1, r) {
    if (t !== void 0) {
      const n = this.constructor;
      if (o === !1 && (r = this[t]), i ??= n.getPropertyOptions(t), !((i.hasChanged ?? Qt)(r, s) || i.useDefault && i.reflect && r === this._$Ej?.get(t) && !this.hasAttribute(n._$Eu(t, i)))) return;
      this.C(t, s, i);
    }
    this.isUpdatePending === !1 && (this._$ES = this._$EP());
  }
  C(t, s, { useDefault: i, reflect: o, wrapped: r }, n) {
    i && !(this._$Ej ??= /* @__PURE__ */ new Map()).has(t) && (this._$Ej.set(t, n ?? s ?? this[t]), r !== !0 || n !== void 0) || (this._$AL.has(t) || (this.hasUpdated || i || (s = void 0), this._$AL.set(t, s)), o === !0 && this._$Em !== t && (this._$Eq ??= /* @__PURE__ */ new Set()).add(t));
  }
  async _$EP() {
    this.isUpdatePending = !0;
    try {
      await this._$ES;
    } catch (s) {
      Promise.reject(s);
    }
    const t = this.scheduleUpdate();
    return t != null && await t, !this.isUpdatePending;
  }
  scheduleUpdate() {
    return this.performUpdate();
  }
  performUpdate() {
    if (!this.isUpdatePending) return;
    if (!this.hasUpdated) {
      if (this.renderRoot ??= this.createRenderRoot(), this._$Ep) {
        for (const [o, r] of this._$Ep) this[o] = r;
        this._$Ep = void 0;
      }
      const i = this.constructor.elementProperties;
      if (i.size > 0) for (const [o, r] of i) {
        const { wrapped: n } = r, h = this[o];
        n !== !0 || this._$AL.has(o) || h === void 0 || this.C(o, void 0, r, h);
      }
    }
    let t = !1;
    const s = this._$AL;
    try {
      t = this.shouldUpdate(s), t ? (this.willUpdate(s), this._$EO?.forEach((i) => i.hostUpdate?.()), this.update(s)) : this._$EM();
    } catch (i) {
      throw t = !1, this._$EM(), i;
    }
    t && this._$AE(s);
  }
  willUpdate(t) {
  }
  _$AE(t) {
    this._$EO?.forEach((s) => s.hostUpdated?.()), this.hasUpdated || (this.hasUpdated = !0, this.firstUpdated(t)), this.updated(t);
  }
  _$EM() {
    this._$AL = /* @__PURE__ */ new Map(), this.isUpdatePending = !1;
  }
  get updateComplete() {
    return this.getUpdateComplete();
  }
  getUpdateComplete() {
    return this._$ES;
  }
  shouldUpdate(t) {
    return !0;
  }
  update(t) {
    this._$Eq &&= this._$Eq.forEach((s) => this._$ET(s, this[s])), this._$EM();
  }
  updated(t) {
  }
  firstUpdated(t) {
  }
};
ct.elementStyles = [], ct.shadowRootOptions = { mode: "open" }, ct[$t("elementProperties")] = /* @__PURE__ */ new Map(), ct[$t("finalized")] = /* @__PURE__ */ new Map(), He?.({ ReactiveElement: ct }), (Rt.reactiveElementVersions ??= []).push("2.1.2");
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const Kt = globalThis, pe = (e) => e, Mt = Kt.trustedTypes, le = Mt ? Mt.createPolicy("lit-html", { createHTML: (e) => e }) : void 0, we = "$lit$", Y = `lit$${Math.random().toFixed(9).slice(2)}$`, _e = "?" + Y, Ve = `<${_e}>`, it = document, _t = () => it.createComment(""), zt = (e) => e === null || typeof e != "object" && typeof e != "function", Zt = Array.isArray, We = (e) => Zt(e) || typeof e?.[Symbol.iterator] == "function", Vt = `[ 	
\f\r]`, xt = /<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g, he = /-->/g, ue = />/g, et = RegExp(`>|${Vt}(?:([^\\s"'>=/]+)(${Vt}*=${Vt}*(?:[^ 	
\f\r"'\`<>=]|("|')|))|$)`, "g"), me = /'/g, fe = /"/g, ze = /^(?:script|style|textarea|title)$/i, Ge = (e) => (t, ...s) => ({ _$litType$: e, strings: t, values: s }), d = Ge(1), ht = Symbol.for("lit-noChange"), u = Symbol.for("lit-nothing"), ve = /* @__PURE__ */ new WeakMap(), st = it.createTreeWalker(it, 129);
function ke(e, t) {
  if (!Zt(e) || !e.hasOwnProperty("raw")) throw Error("invalid template strings array");
  return le !== void 0 ? le.createHTML(t) : t;
}
const Ye = (e, t) => {
  const s = e.length - 1, i = [];
  let o, r = t === 2 ? "<svg>" : t === 3 ? "<math>" : "", n = xt;
  for (let h = 0; h < s; h++) {
    const l = e[h];
    let x, w, f = -1, A = 0;
    for (; A < l.length && (n.lastIndex = A, w = n.exec(l), w !== null); ) A = n.lastIndex, n === xt ? w[1] === "!--" ? n = he : w[1] !== void 0 ? n = ue : w[2] !== void 0 ? (ze.test(w[2]) && (o = RegExp("</" + w[2], "g")), n = et) : w[3] !== void 0 && (n = et) : n === et ? w[0] === ">" ? (n = o ?? xt, f = -1) : w[1] === void 0 ? f = -2 : (f = n.lastIndex - w[2].length, x = w[1], n = w[3] === void 0 ? et : w[3] === '"' ? fe : me) : n === fe || n === me ? n = et : n === he || n === ue ? n = xt : (n = et, o = void 0);
    const L = n === et && e[h + 1].startsWith("/>") ? " " : "";
    r += n === xt ? l + Ve : f >= 0 ? (i.push(x), l.slice(0, f) + we + l.slice(f) + Y + L) : l + Y + (f === -2 ? h : L);
  }
  return [ke(e, r + (e[s] || "<?>") + (t === 2 ? "</svg>" : t === 3 ? "</math>" : "")), i];
};
class kt {
  constructor({ strings: t, _$litType$: s }, i) {
    let o;
    this.parts = [];
    let r = 0, n = 0;
    const h = t.length - 1, l = this.parts, [x, w] = Ye(t, s);
    if (this.el = kt.createElement(x, i), st.currentNode = this.el.content, s === 2 || s === 3) {
      const f = this.el.content.firstChild;
      f.replaceWith(...f.childNodes);
    }
    for (; (o = st.nextNode()) !== null && l.length < h; ) {
      if (o.nodeType === 1) {
        if (o.hasAttributes()) for (const f of o.getAttributeNames()) if (f.endsWith(we)) {
          const A = w[n++], L = o.getAttribute(f).split(Y), bt = /([.?@])?(.*)/.exec(A);
          l.push({ type: 1, index: r, name: bt[2], strings: L, ctor: bt[1] === "." ? Ke : bt[1] === "?" ? Ze : bt[1] === "@" ? Je : Bt }), o.removeAttribute(f);
        } else f.startsWith(Y) && (l.push({ type: 6, index: r }), o.removeAttribute(f));
        if (ze.test(o.tagName)) {
          const f = o.textContent.split(Y), A = f.length - 1;
          if (A > 0) {
            o.textContent = Mt ? Mt.emptyScript : "";
            for (let L = 0; L < A; L++) o.append(f[L], _t()), st.nextNode(), l.push({ type: 2, index: ++r });
            o.append(f[A], _t());
          }
        }
      } else if (o.nodeType === 8) if (o.data === _e) l.push({ type: 2, index: r });
      else {
        let f = -1;
        for (; (f = o.data.indexOf(Y, f + 1)) !== -1; ) l.push({ type: 7, index: r }), f += Y.length - 1;
      }
      r++;
    }
  }
  static createElement(t, s) {
    const i = it.createElement("template");
    return i.innerHTML = t, i;
  }
}
function ut(e, t, s = e, i) {
  if (t === ht) return t;
  let o = i !== void 0 ? s._$Co?.[i] : s._$Cl;
  const r = zt(t) ? void 0 : t._$litDirective$;
  return o?.constructor !== r && (o?._$AO?.(!1), r === void 0 ? o = void 0 : (o = new r(e), o._$AT(e, s, i)), i !== void 0 ? (s._$Co ??= [])[i] = o : s._$Cl = o), o !== void 0 && (t = ut(e, o._$AS(e, t.values), o, i)), t;
}
class Qe {
  constructor(t, s) {
    this._$AV = [], this._$AN = void 0, this._$AD = t, this._$AM = s;
  }
  get parentNode() {
    return this._$AM.parentNode;
  }
  get _$AU() {
    return this._$AM._$AU;
  }
  u(t) {
    const { el: { content: s }, parts: i } = this._$AD, o = (t?.creationScope ?? it).importNode(s, !0);
    st.currentNode = o;
    let r = st.nextNode(), n = 0, h = 0, l = i[0];
    for (; l !== void 0; ) {
      if (n === l.index) {
        let x;
        l.type === 2 ? x = new Ot(r, r.nextSibling, this, t) : l.type === 1 ? x = new l.ctor(r, l.name, l.strings, this, t) : l.type === 6 && (x = new Xe(r, this, t)), this._$AV.push(x), l = i[++h];
      }
      n !== l?.index && (r = st.nextNode(), n++);
    }
    return st.currentNode = it, o;
  }
  p(t) {
    let s = 0;
    for (const i of this._$AV) i !== void 0 && (i.strings !== void 0 ? (i._$AI(t, i, s), s += i.strings.length - 2) : i._$AI(t[s])), s++;
  }
}
class Ot {
  get _$AU() {
    return this._$AM?._$AU ?? this._$Cv;
  }
  constructor(t, s, i, o) {
    this.type = 2, this._$AH = u, this._$AN = void 0, this._$AA = t, this._$AB = s, this._$AM = i, this.options = o, this._$Cv = o?.isConnected ?? !0;
  }
  get parentNode() {
    let t = this._$AA.parentNode;
    const s = this._$AM;
    return s !== void 0 && t?.nodeType === 11 && (t = s.parentNode), t;
  }
  get startNode() {
    return this._$AA;
  }
  get endNode() {
    return this._$AB;
  }
  _$AI(t, s = this) {
    t = ut(this, t, s), zt(t) ? t === u || t == null || t === "" ? (this._$AH !== u && this._$AR(), this._$AH = u) : t !== this._$AH && t !== ht && this._(t) : t._$litType$ !== void 0 ? this.$(t) : t.nodeType !== void 0 ? this.T(t) : We(t) ? this.k(t) : this._(t);
  }
  O(t) {
    return this._$AA.parentNode.insertBefore(t, this._$AB);
  }
  T(t) {
    this._$AH !== t && (this._$AR(), this._$AH = this.O(t));
  }
  _(t) {
    this._$AH !== u && zt(this._$AH) ? this._$AA.nextSibling.data = t : this.T(it.createTextNode(t)), this._$AH = t;
  }
  $(t) {
    const { values: s, _$litType$: i } = t, o = typeof i == "number" ? this._$AC(t) : (i.el === void 0 && (i.el = kt.createElement(ke(i.h, i.h[0]), this.options)), i);
    if (this._$AH?._$AD === o) this._$AH.p(s);
    else {
      const r = new Qe(o, this), n = r.u(this.options);
      r.p(s), this.T(n), this._$AH = r;
    }
  }
  _$AC(t) {
    let s = ve.get(t.strings);
    return s === void 0 && ve.set(t.strings, s = new kt(t)), s;
  }
  k(t) {
    Zt(this._$AH) || (this._$AH = [], this._$AR());
    const s = this._$AH;
    let i, o = 0;
    for (const r of t) o === s.length ? s.push(i = new Ot(this.O(_t()), this.O(_t()), this, this.options)) : i = s[o], i._$AI(r), o++;
    o < s.length && (this._$AR(i && i._$AB.nextSibling, o), s.length = o);
  }
  _$AR(t = this._$AA.nextSibling, s) {
    for (this._$AP?.(!1, !0, s); t !== this._$AB; ) {
      const i = pe(t).nextSibling;
      pe(t).remove(), t = i;
    }
  }
  setConnected(t) {
    this._$AM === void 0 && (this._$Cv = t, this._$AP?.(t));
  }
}
class Bt {
  get tagName() {
    return this.element.tagName;
  }
  get _$AU() {
    return this._$AM._$AU;
  }
  constructor(t, s, i, o, r) {
    this.type = 1, this._$AH = u, this._$AN = void 0, this.element = t, this.name = s, this._$AM = o, this.options = r, i.length > 2 || i[0] !== "" || i[1] !== "" ? (this._$AH = Array(i.length - 1).fill(new String()), this.strings = i) : this._$AH = u;
  }
  _$AI(t, s = this, i, o) {
    const r = this.strings;
    let n = !1;
    if (r === void 0) t = ut(this, t, s, 0), n = !zt(t) || t !== this._$AH && t !== ht, n && (this._$AH = t);
    else {
      const h = t;
      let l, x;
      for (t = r[0], l = 0; l < r.length - 1; l++) x = ut(this, h[i + l], s, l), x === ht && (x = this._$AH[l]), n ||= !zt(x) || x !== this._$AH[l], x === u ? t = u : t !== u && (t += (x ?? "") + r[l + 1]), this._$AH[l] = x;
    }
    n && !o && this.j(t);
  }
  j(t) {
    t === u ? this.element.removeAttribute(this.name) : this.element.setAttribute(this.name, t ?? "");
  }
}
class Ke extends Bt {
  constructor() {
    super(...arguments), this.type = 3;
  }
  j(t) {
    this.element[this.name] = t === u ? void 0 : t;
  }
}
class Ze extends Bt {
  constructor() {
    super(...arguments), this.type = 4;
  }
  j(t) {
    this.element.toggleAttribute(this.name, !!t && t !== u);
  }
}
class Je extends Bt {
  constructor(t, s, i, o, r) {
    super(t, s, i, o, r), this.type = 5;
  }
  _$AI(t, s = this) {
    if ((t = ut(this, t, s, 0) ?? u) === ht) return;
    const i = this._$AH, o = t === u && i !== u || t.capture !== i.capture || t.once !== i.once || t.passive !== i.passive, r = t !== u && (i === u || o);
    o && this.element.removeEventListener(this.name, this, i), r && this.element.addEventListener(this.name, this, t), this._$AH = t;
  }
  handleEvent(t) {
    typeof this._$AH == "function" ? this._$AH.call(this.options?.host ?? this.element, t) : this._$AH.handleEvent(t);
  }
}
class Xe {
  constructor(t, s, i) {
    this.element = t, this.type = 6, this._$AN = void 0, this._$AM = s, this.options = i;
  }
  get _$AU() {
    return this._$AM._$AU;
  }
  _$AI(t) {
    ut(this, t);
  }
}
const ts = Kt.litHtmlPolyfillSupport;
ts?.(kt, Ot), (Kt.litHtmlVersions ??= []).push("3.3.3");
const es = (e, t, s) => {
  const i = s?.renderBefore ?? t;
  let o = i._$litPart$;
  if (o === void 0) {
    const r = s?.renderBefore ?? null;
    i._$litPart$ = o = new Ot(t.insertBefore(_t(), r), r, void 0, s ?? {});
  }
  return o._$AI(e), o;
};
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const Jt = globalThis;
class m extends ct {
  constructor() {
    super(...arguments), this.renderOptions = { host: this }, this._$Do = void 0;
  }
  createRenderRoot() {
    const t = super.createRenderRoot();
    return this.renderOptions.renderBefore ??= t.firstChild, t;
  }
  update(t) {
    const s = this.render();
    this.hasUpdated || (this.renderOptions.isConnected = this.isConnected), super.update(t), this._$Do = es(s, this.renderRoot, this.renderOptions);
  }
  connectedCallback() {
    super.connectedCallback(), this._$Do?.setConnected(!0);
  }
  disconnectedCallback() {
    super.disconnectedCallback(), this._$Do?.setConnected(!1);
  }
  render() {
    return ht;
  }
}
m._$litElement$ = !0, m.finalized = !0, Jt.litElementHydrateSupport?.({ LitElement: m });
const ss = Jt.litElementPolyfillSupport;
ss?.({ LitElement: m });
(Jt.litElementVersions ??= []).push("4.2.2");
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const b = (e) => (t, s) => {
  s !== void 0 ? s.addInitializer(() => {
    customElements.define(e, t);
  }) : customElements.define(e, t);
};
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const is = { attribute: !0, type: String, converter: Nt, reflect: !1, hasChanged: Qt }, os = (e = is, t, s) => {
  const { kind: i, metadata: o } = s;
  let r = globalThis.litPropertyMetadata.get(o);
  if (r === void 0 && globalThis.litPropertyMetadata.set(o, r = /* @__PURE__ */ new Map()), i === "setter" && ((e = Object.create(e)).wrapped = !0), r.set(s.name, e), i === "accessor") {
    const { name: n } = s;
    return { set(h) {
      const l = t.get.call(this);
      t.set.call(this, h), this.requestUpdate(n, l, e, !0, h);
    }, init(h) {
      return h !== void 0 && this.C(n, void 0, e, h), h;
    } };
  }
  if (i === "setter") {
    const { name: n } = s;
    return function(h) {
      const l = this[n];
      t.call(this, h), this.requestUpdate(n, l, e, !0, h);
    };
  }
  throw Error("Unsupported decorator location: " + i);
};
function p(e) {
  return (t, s) => typeof s == "object" ? os(e, t, s) : ((i, o, r) => {
    const n = o.hasOwnProperty(r);
    return o.constructor.createProperty(r, i), n ? Object.getOwnPropertyDescriptor(o, r) : void 0;
  })(e, t, s);
}
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
function c(e) {
  return p({ ...e, state: !0, attribute: !1 });
}
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const as = (e, t, s) => (s.configurable = !0, s.enumerable = !0, Reflect.decorate && typeof t != "object" && Object.defineProperty(e, t, s), s);
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
function Ut(e, t) {
  return (s, i, o) => {
    const r = (n) => n.renderRoot?.querySelector(e) ?? null;
    return as(s, i, { get() {
      return r(this);
    } });
  };
}
class rs {
  constructor(t) {
    this.hass = t;
  }
  setHass(t) {
    this.hass = t;
  }
  ws(t, s = {}) {
    return this.hass.callWS({ type: t, ...s });
  }
  subscribe(t) {
    return this.hass.connection.subscribeMessage((s) => t(s.collection), { type: "spizarnia/subscribe" });
  }
  // Reads
  overview() {
    return this.ws("spizarnia/overview");
  }
  listRooms() {
    return this.ws("spizarnia/rooms/list");
  }
  listShelves(t) {
    return this.ws("spizarnia/shelves/list", {
      room_id: t
    });
  }
  listProducts(t = {}) {
    return this.ws(
      "spizarnia/products/list",
      t
    );
  }
  listItems(t = {}) {
    return this.ws("spizarnia/items/list", t);
  }
  listHistory(t = {}) {
    return this.ws(
      "spizarnia/history/list",
      t
    );
  }
  search(t) {
    return this.ws(
      "spizarnia/search",
      { query: t }
    );
  }
  getSettings() {
    return this.ws("spizarnia/settings/get");
  }
  // Rooms
  createRoom(t, s) {
    return this.ws("spizarnia/rooms/create", { name: t, icon: s });
  }
  updateRoom(t, s) {
    return this.ws("spizarnia/rooms/update", {
      room_id: t,
      ...s
    });
  }
  deleteRoom(t, s = !1) {
    return this.ws(
      "spizarnia/rooms/delete",
      { room_id: t, dry_run: s }
    );
  }
  reorderRooms(t) {
    return this.ws("spizarnia/rooms/reorder", { room_ids: t });
  }
  // Shelves
  createShelf(t, s, i) {
    return this.ws("spizarnia/shelves/create", {
      room_id: t,
      name: s,
      notes: i
    });
  }
  updateShelf(t, s) {
    return this.ws("spizarnia/shelves/update", {
      shelf_id: t,
      ...s
    });
  }
  deleteShelf(t, s = !1) {
    return this.ws("spizarnia/shelves/delete", {
      shelf_id: t,
      dry_run: s
    });
  }
  reorderShelves(t) {
    return this.ws("spizarnia/shelves/reorder", { shelf_ids: t });
  }
  // Products
  createProduct(t) {
    return this.ws(
      "spizarnia/products/create",
      t
    );
  }
  updateProduct(t, s) {
    return this.ws(
      "spizarnia/products/update",
      { product_id: t, ...s }
    );
  }
  deleteProduct(t) {
    return this.ws("spizarnia/products/delete", { product_id: t });
  }
  // Items
  addItem(t) {
    return this.ws("spizarnia/items/add", t);
  }
  updateItem(t, s) {
    return this.ws("spizarnia/items/update", {
      item_id: t,
      ...s
    });
  }
  consume(t, s) {
    return this.ws("spizarnia/items/consume", {
      item_id: t,
      quantity: s
    });
  }
  consumeFefo(t, s) {
    return this.ws(
      "spizarnia/items/consume_fefo",
      { product_id: t, quantity: s }
    );
  }
  moveItem(t, s) {
    return this.ws("spizarnia/items/move", {
      item_id: t,
      shelf_id: s
    });
  }
  setOpened(t, s) {
    return this.ws("spizarnia/items/set_opened", {
      item_id: t,
      opened: s
    });
  }
  deleteItem(t, s) {
    return this.ws("spizarnia/items/delete", { item_id: t, reason: s });
  }
  // Settings / export / barcode
  updateSettings(t) {
    return this.ws("spizarnia/settings/update", t);
  }
  exportData() {
    return this.ws("spizarnia/export");
  }
  barcodeLookup(t) {
    return this.ws("spizarnia/barcode/lookup", { code: t });
  }
}
class ns {
  constructor(t) {
    this.listeners = /* @__PURE__ */ new Set(), this.loading = !0, this.changeSignal = 0, this.api = new rs(t);
  }
  setHass(t) {
    this.api.setHass(t);
  }
  subscribe(t) {
    return this.listeners.add(t), () => this.listeners.delete(t);
  }
  emit() {
    for (const t of this.listeners) t();
  }
  async connect() {
    try {
      this.unsubWs = await this.api.subscribe(
        (t) => this.onServerChange(t)
      ), await this.refreshOverview(), this.settings = (await this.api.getSettings()).settings, this.loading = !1, this.emit();
    } catch (t) {
      this.loading = !1, this.error = String(t), this.emit();
    }
  }
  disconnect() {
    this.unsubWs?.();
  }
  onServerChange(t) {
    (t === "items" || t === "shelves" || t === "rooms" || t === "history") && this.refreshOverview(), t === "settings" && this.refreshSettings(), this.changeSignal++, this.emit();
  }
  async refreshOverview() {
    this.overview = await this.api.overview(), this.rooms = this.overview.rooms, this.emit();
  }
  async refreshSettings() {
    this.settings = (await this.api.getSettings()).settings, this.emit();
  }
}
const ds = {
  "app.title": "Spiżarnia",
  "nav.dashboard": "Przegląd",
  "nav.rooms": "Pomieszczenia",
  "nav.add": "Dodaj",
  "nav.search": "Szukaj",
  "nav.more": "Więcej",
  "nav.catalog": "Katalog",
  "nav.history": "Historia",
  "nav.settings": "Ustawienia",
  "common.back": "Wstecz",
  "common.close": "Zamknij",
  "common.cancel": "Anuluj",
  "common.save": "Zapisz",
  "common.add": "Dodaj",
  "common.delete": "Usuń",
  "common.edit": "Edytuj",
  "common.more": "Więcej ▾",
  "common.less": "Mniej ▴",
  "common.undo": "Cofnij",
  "common.confirm": "Potwierdź",
  "common.all": "Wszystkie",
  "common.loading": "Ładowanie…",
  "common.retry": "Spróbuj ponownie",
  "common.error": "Coś poszło nie tak",
  "status.expired": "Przeterminowane",
  "status.expiring_soon": "Kończy się termin",
  "status.ok": "OK",
  "status.no_date": "Bezterminowe",
  "status.days_ago": "−{n} dni",
  "status.days_left": "{n} dni",
  "dashboard.expired": "przeterminowane",
  "dashboard.expiring": "kończy się termin (≤ {days} dni)",
  "dashboard.low_stock": "niskie stany",
  "dashboard.all_fresh": "Wszystko świeże",
  "dashboard.all_fresh_sub": "Nic się nie kończy ani nie przeterminowało",
  "dashboard.quick_scan": "Skanuj",
  "dashboard.quick_add": "Dodaj",
  "dashboard.quick_consume": "Wydaj",
  "dashboard.rooms": "Pomieszczenia",
  "dashboard.new_room": "+ Nowe pomieszczenie",
  "dashboard.activity": "Ostatnia aktywność",
  "dashboard.all_history": "Cała historia →",
  "dashboard.room_meta": "{items} · {shelves}",
  "room.shelves": "Półki",
  "room.add_shelf": "Dodaj półkę",
  "room.add_here": "➕ Dodaj tutaj",
  "room.empty_title": "Dodaj pierwszą półkę",
  "room.empty_sub": "Podziel pomieszczenie na półki, żeby porządkować zapasy",
  "room.rename": "Zmień nazwę",
  "room.delete": "Usuń pomieszczenie",
  "room.shelf_name_placeholder": "Nazwa półki",
  "room.shelf_top": "Górna",
  "room.shelf_mid": "Środkowa",
  "room.shelf_bottom": "Dolna",
  "room.shelf_rack": "Regał A",
  "shelf.sort": "Sortuj",
  "shelf.sort_date": "Data ważności",
  "shelf.sort_name": "Nazwa",
  "shelf.sort_qty": "Ilość",
  "shelf.sort_added": "Dodano",
  "shelf.group": "Grupuj partie",
  "shelf.empty_title": "Postaw tu pierwszy produkt",
  "shelf.empty_sub": "Zeskanuj kod lub wybierz z katalogu",
  "shelf.scan": "Skanuj",
  "shelf.from_catalog": "Z katalogu",
  "shelf.group_info": "{qty} · {batches}",
  "shelf.opened": "🥄 otwarte",
  "sheet.location": "Lokalizacja",
  "sheet.quantity": "Ilość",
  "sheet.best_before": "Data ważności",
  "sheet.production": "Data produkcji",
  "sheet.added": "Dodano",
  "sheet.note": "Notatka",
  "sheet.dispense_qty": "Wydaj ilość",
  "sheet.dispense": "Wydaj {qty}",
  "sheet.open": "Otwórz",
  "sheet.close_pkg": "Zamknij",
  "sheet.move": "Przenieś",
  "sheet.batches_fefo": "Partie — FEFO, najstarsza pierwsza",
  "sheet.oldest": "najstarsza ✓",
  "sheet.opened_tag": "otwarta ✓",
  "sheet.anti_waste": "Masz starszą partię ({date}) — na pewno ta?",
  "add.title": "Dodaj partię",
  "add.change_product": "Zmień produkt",
  "add.quantity": "Ilość",
  "add.best_before": "Data ważności",
  "add.shelf": "Półka",
  "add.production": "Data produkcji",
  "add.note": "Notatka",
  "add.note_placeholder": "Dodaj notatkę…",
  "add.suggested": "sugerowane",
  "add.submit": "Dodaj",
  "add.submit_next": "Dodaj i skanuj następny",
  "add.sheet_pick": "Wybierz produkt z katalogu",
  "add.opened": "Otwarte",
  "date.none": "Brak",
  "date.3m": "+3 mies.",
  "date.6m": "+6 mies.",
  "date.1y": "+1 rok",
  "date.2y": "+2 lata",
  "date.eoy": "Koniec roku",
  "date.pick": "📅 wybierz",
  "date.no_date": "Bez terminu",
  "scan.hint": "Skieruj aparat na kod kreskowy EAN",
  "scan.session_added": "Dodano w sesji: {n}",
  "scan.manual": "Wpisz kod ręcznie",
  "scan.serial_on": "Tryb seryjny: włączony",
  "scan.serial_off": "Tryb seryjny: wyłączony",
  "scan.no_camera": "Brak dostępu do kamery",
  "scan.no_https": "Skaner wymaga połączenia HTTPS",
  "scan.no_camera_sub": "Zezwól na dostęp do kamery lub wpisz kod ręcznie poniżej.",
  "scan.no_https_sub": "Otwórz panel przez HTTPS (np. Nabu Casa) albo wpisz kod ręcznie.",
  "scan.lookup": "Sprawdzanie kodu…",
  "off.found": "Znaleziono w Open Food Facts — sprawdź dane i dodaj.",
  "off.suggested_category": "Sugerowana kategoria",
  "off.continue": "Dodaj do katalogu i kontynuuj",
  "off.error": "Nie udało się sprawdzić kodu w Open Food Facts. Dodaj produkt ręcznie lub spróbuj później.",
  "off.unknown": "Nie znamy tego kodu",
  "off.create": "Stwórz produkt z tym kodem",
  "catalog.search": "Szukaj w katalogu…",
  "catalog.new_product": "➕ Nowy produkt",
  "catalog.sort_name": "Nazwa",
  "catalog.sort_recent": "Ostatnio używane",
  "catalog.stock": "{qty} w {places}",
  "catalog.no_stock": "Brak w spiżarni",
  "catalog.empty": "Brak produktów w katalogu",
  "product.props": "Właściwości",
  "product.category": "Kategoria",
  "product.default_unit": "Domyślna jednostka",
  "product.shelf_life": "Typowy termin (dni)",
  "product.min_stock": "Próg niskiego stanu",
  "product.barcodes": "Kody kreskowe",
  "product.add_barcode": "➕ Dodaj skanem",
  "product.stock": "Stany",
  "product.add_batch": "➕ Dodaj partię",
  "product.cannot_delete": "Nie można usunąć — produkt ma {batches} w spiżarni.",
  "product.emoji": "Emoji",
  "product.name": "Nazwa",
  "product.notes": "Notatki",
  "search.placeholder": "Szukaj w spiżarni…",
  "search.in_pantry": "Produkty w spiżarni",
  "search.catalog": "Katalog",
  "search.actions": "Akcje",
  "search.create": "Utwórz produkt „{query}”",
  "search.add_batch": "Dodaj partię",
  "search.recent": "Ostatnie wyszukiwania",
  "search.empty": "Nic nie znaleziono",
  "search.hint": "Wpisz min. 2 znaki",
  "history.title": "Historia",
  "history.all": "Wszystko",
  "history.added": "➕ Dodano",
  "history.consumed": "➖ Wydano",
  "history.trashed": "🗑️ Wyrzucono",
  "history.today": "Dziś",
  "history.yesterday": "Wczoraj",
  "history.empty": "Brak historii",
  "history.add": "Dodano {qty} {product}",
  "history.consume": "Wydano {qty} {product}",
  "history.adjust": "Skorygowano {product}",
  "history.move": "Przeniesiono {product}",
  "history.open": "Otwarto {product}",
  "history.delete": "Usunięto {product}",
  "history.by": "przez {name}",
  "settings.alerts": "Alerty",
  "settings.threshold": "„Kończy się termin”, gdy zostało ≤ {days} dni",
  "settings.threshold_effect": "Obecnie {batches} łapie się w próg.",
  "settings.off": "Open Food Facts",
  "settings.off_desc": "Pobieraj dane produktów",
  "settings.off_locale": "region: {locale}",
  "settings.rooms": "Pomieszczenia i półki",
  "settings.data": "Dane",
  "settings.records": "{n} rekordów · kopia zapasowa razem z Home Assistant",
  "settings.export": "Eksport JSON",
  "settings.about": "O integracji",
  "settings.version": "Wersja {version}",
  "settings.license": "Licencja MIT",
  "settings.github": "GitHub →",
  "onboarding.welcome": "Witaj w Spiżarni",
  "onboarding.step1_title": "Nazwij swoje miejsca",
  "onboarding.step1_sub": "Wybierz pomieszczenia, w których trzymasz zapasy",
  "onboarding.step2_title": "Jak liczyć „kończy się termin”?",
  "onboarding.step2_sub": "Ile dni przed datą ważności ostrzegać",
  "onboarding.step3_title": "Dodaj pierwszy produkt",
  "onboarding.step3_sub": "Zeskanuj kod albo wybierz z katalogu",
  "onboarding.next": "Dalej",
  "onboarding.skip": "Pomiń",
  "onboarding.finish": "Zaczynamy",
  "add_menu.title": "Dodaj",
  "add_menu.scan": "Skanuj kod",
  "add_menu.catalog": "Z katalogu",
  "add_menu.new": "Nowy produkt",
  "add_menu.consume_scan": "Wydaj skanem",
  "confirm.delete_room": "Usunąć pomieszczenie „{name}”?",
  "confirm.delete_room_body": "Stracisz {shelves} i {items}. Tej operacji nie można cofnąć.",
  "confirm.delete_shelf": "Usunąć półkę „{name}”?",
  "confirm.delete_shelf_body": "Stracisz {items}. Tej operacji nie można cofnąć.",
  "confirm.shelves": "{n} półek",
  "confirm.items": "{n} partii",
  "toast.added": "Dodano: {product} ×{qty} → {location}",
  "toast.consumed": "Wydano: {product} ×{qty}",
  "toast.deleted": "Usunięto: {product}",
  "toast.moved": "Przeniesiono: {product}",
  "toast.error": "Błąd: {message}",
  "unit.szt": "szt",
  "unit.słoik": "słoik",
  "unit.butelka": "butelka",
  "unit.puszka": "puszka",
  "unit.opak": "opak",
  "unit.kg": "kg",
  "unit.g": "g",
  "unit.l": "l",
  "unit.ml": "ml",
  "cat.preserves_sweet": "Przetwory słodkie",
  "cat.preserves_savory": "Przetwory wytrawne",
  "cat.compotes_juices": "Kompoty i soki",
  "cat.honey_syrups": "Miody i syropy",
  "cat.canned": "Konserwy",
  "cat.dry_goods": "Sypkie",
  "cat.spices": "Przyprawy",
  "cat.oils_fats": "Oleje i tłuszcze",
  "cat.drinks": "Napoje",
  "cat.sweets_snacks": "Słodycze",
  "cat.frozen": "Mrożonki",
  "cat.household": "Gospodarcze",
  "cat.other": "Inne"
}, Xt = {
  "app.title": "Spiżarnia",
  "nav.dashboard": "Overview",
  "nav.rooms": "Rooms",
  "nav.add": "Add",
  "nav.search": "Search",
  "nav.more": "More",
  "nav.catalog": "Catalog",
  "nav.history": "History",
  "nav.settings": "Settings",
  "common.back": "Back",
  "common.close": "Close",
  "common.cancel": "Cancel",
  "common.save": "Save",
  "common.add": "Add",
  "common.delete": "Delete",
  "common.edit": "Edit",
  "common.more": "More ▾",
  "common.less": "Less ▴",
  "common.undo": "Undo",
  "common.confirm": "Confirm",
  "common.all": "All",
  "common.loading": "Loading…",
  "common.retry": "Try again",
  "common.error": "Something went wrong",
  "status.expired": "Expired",
  "status.expiring_soon": "Expiring soon",
  "status.ok": "OK",
  "status.no_date": "No expiry",
  "status.days_ago": "−{n} days",
  "status.days_left": "{n} days",
  "dashboard.expired": "expired",
  "dashboard.expiring": "expiring soon (≤ {days} days)",
  "dashboard.low_stock": "low stock",
  "dashboard.all_fresh": "All fresh",
  "dashboard.all_fresh_sub": "Nothing is expiring or expired",
  "dashboard.quick_scan": "Scan",
  "dashboard.quick_add": "Add",
  "dashboard.quick_consume": "Use",
  "dashboard.rooms": "Rooms",
  "dashboard.new_room": "+ New room",
  "dashboard.activity": "Recent activity",
  "dashboard.all_history": "All history →",
  "dashboard.room_meta": "{items} · {shelves}",
  "room.shelves": "Shelves",
  "room.add_shelf": "Add shelf",
  "room.add_here": "➕ Add here",
  "room.empty_title": "Add your first shelf",
  "room.empty_sub": "Split the room into shelves to organize your stock",
  "room.rename": "Rename",
  "room.delete": "Delete room",
  "room.shelf_name_placeholder": "Shelf name",
  "room.shelf_top": "Top",
  "room.shelf_mid": "Middle",
  "room.shelf_bottom": "Bottom",
  "room.shelf_rack": "Rack A",
  "shelf.sort": "Sort",
  "shelf.sort_date": "Best before",
  "shelf.sort_name": "Name",
  "shelf.sort_qty": "Quantity",
  "shelf.sort_added": "Added",
  "shelf.group": "Group batches",
  "shelf.empty_title": "Place your first product here",
  "shelf.empty_sub": "Scan a barcode or pick from the catalog",
  "shelf.scan": "Scan",
  "shelf.from_catalog": "From catalog",
  "shelf.group_info": "{qty} · {batches}",
  "shelf.opened": "🥄 opened",
  "sheet.location": "Location",
  "sheet.quantity": "Quantity",
  "sheet.best_before": "Best before",
  "sheet.production": "Production date",
  "sheet.added": "Added",
  "sheet.note": "Note",
  "sheet.dispense_qty": "Dispense quantity",
  "sheet.dispense": "Use {qty}",
  "sheet.open": "Open",
  "sheet.close_pkg": "Close",
  "sheet.move": "Move",
  "sheet.batches_fefo": "Batches — FEFO, oldest first",
  "sheet.oldest": "oldest ✓",
  "sheet.opened_tag": "opened ✓",
  "sheet.anti_waste": "You have an older batch ({date}) — sure about this one?",
  "add.title": "Add batch",
  "add.change_product": "Change product",
  "add.quantity": "Quantity",
  "add.best_before": "Best before",
  "add.shelf": "Shelf",
  "add.production": "Production date",
  "add.note": "Note",
  "add.note_placeholder": "Add a note…",
  "add.suggested": "suggested",
  "add.submit": "Add",
  "add.submit_next": "Add and scan next",
  "add.sheet_pick": "Pick a product from the catalog",
  "add.opened": "Opened",
  "date.none": "None",
  "date.3m": "+3 mo.",
  "date.6m": "+6 mo.",
  "date.1y": "+1 year",
  "date.2y": "+2 years",
  "date.eoy": "End of year",
  "date.pick": "📅 pick",
  "date.no_date": "No expiry",
  "scan.hint": "Point the camera at an EAN barcode",
  "scan.session_added": "Added this session: {n}",
  "scan.manual": "Enter code manually",
  "scan.serial_on": "Serial mode: on",
  "scan.serial_off": "Serial mode: off",
  "scan.no_camera": "No camera access",
  "scan.no_https": "The scanner requires an HTTPS connection",
  "scan.no_camera_sub": "Allow camera access or enter the code manually below.",
  "scan.no_https_sub": "Open the panel over HTTPS (e.g. Nabu Casa) or enter the code manually.",
  "scan.lookup": "Looking up code…",
  "off.found": "Found in Open Food Facts — check the details and add.",
  "off.suggested_category": "Suggested category",
  "off.continue": "Add to catalog and continue",
  "off.error": "Couldn't look up the code in Open Food Facts. Add the product manually or try again later.",
  "off.unknown": "We don't know this code",
  "off.create": "Create a product with this code",
  "catalog.search": "Search the catalog…",
  "catalog.new_product": "➕ New product",
  "catalog.sort_name": "Name",
  "catalog.sort_recent": "Recently used",
  "catalog.stock": "{qty} in {places}",
  "catalog.no_stock": "Not in pantry",
  "catalog.empty": "No products in the catalog",
  "product.props": "Properties",
  "product.category": "Category",
  "product.default_unit": "Default unit",
  "product.shelf_life": "Typical shelf life (days)",
  "product.min_stock": "Low-stock threshold",
  "product.barcodes": "Barcodes",
  "product.add_barcode": "➕ Add by scan",
  "product.stock": "Stock",
  "product.add_batch": "➕ Add batch",
  "product.cannot_delete": "Can't delete — product has {batches} in the pantry.",
  "product.emoji": "Emoji",
  "product.name": "Name",
  "product.notes": "Notes",
  "search.placeholder": "Search the pantry…",
  "search.in_pantry": "Products in the pantry",
  "search.catalog": "Catalog",
  "search.actions": "Actions",
  "search.create": "Create product “{query}”",
  "search.add_batch": "Add batch",
  "search.recent": "Recent searches",
  "search.empty": "Nothing found",
  "search.hint": "Type at least 2 characters",
  "history.title": "History",
  "history.all": "All",
  "history.added": "➕ Added",
  "history.consumed": "➖ Used",
  "history.trashed": "🗑️ Trashed",
  "history.today": "Today",
  "history.yesterday": "Yesterday",
  "history.empty": "No history",
  "history.add": "Added {qty} {product}",
  "history.consume": "Used {qty} {product}",
  "history.adjust": "Adjusted {product}",
  "history.move": "Moved {product}",
  "history.open": "Opened {product}",
  "history.delete": "Deleted {product}",
  "history.by": "by {name}",
  "settings.alerts": "Alerts",
  "settings.threshold": "“Expiring soon” when ≤ {days} days remain",
  "settings.threshold_effect": "Currently {batches} fall within the threshold.",
  "settings.off": "Open Food Facts",
  "settings.off_desc": "Fetch product data",
  "settings.off_locale": "region: {locale}",
  "settings.rooms": "Rooms and shelves",
  "settings.data": "Data",
  "settings.records": "{n} records · backed up with Home Assistant",
  "settings.export": "Export JSON",
  "settings.about": "About",
  "settings.version": "Version {version}",
  "settings.license": "MIT License",
  "settings.github": "GitHub →",
  "onboarding.welcome": "Welcome to Spiżarnia",
  "onboarding.step1_title": "Name your places",
  "onboarding.step1_sub": "Pick the rooms where you keep your stock",
  "onboarding.step2_title": "How should we count “expiring soon”?",
  "onboarding.step2_sub": "How many days before the best-before date to warn",
  "onboarding.step3_title": "Add your first product",
  "onboarding.step3_sub": "Scan a barcode or pick from the catalog",
  "onboarding.next": "Next",
  "onboarding.skip": "Skip",
  "onboarding.finish": "Let's go",
  "add_menu.title": "Add",
  "add_menu.scan": "Scan code",
  "add_menu.catalog": "From catalog",
  "add_menu.new": "New product",
  "add_menu.consume_scan": "Use by scan",
  "confirm.delete_room": "Delete room “{name}”?",
  "confirm.delete_room_body": "You'll lose {shelves} and {items}. This can't be undone.",
  "confirm.delete_shelf": "Delete shelf “{name}”?",
  "confirm.delete_shelf_body": "You'll lose {items}. This can't be undone.",
  "confirm.shelves": "{n} shelves",
  "confirm.items": "{n} batches",
  "toast.added": "Added: {product} ×{qty} → {location}",
  "toast.consumed": "Used: {product} ×{qty}",
  "toast.deleted": "Deleted: {product}",
  "toast.moved": "Moved: {product}",
  "toast.error": "Error: {message}",
  "unit.szt": "pcs",
  "unit.słoik": "jar",
  "unit.butelka": "bottle",
  "unit.puszka": "can",
  "unit.opak": "pack",
  "unit.kg": "kg",
  "unit.g": "g",
  "unit.l": "l",
  "unit.ml": "ml",
  "cat.preserves_sweet": "Sweet preserves",
  "cat.preserves_savory": "Savory preserves",
  "cat.compotes_juices": "Compotes & juices",
  "cat.honey_syrups": "Honey & syrups",
  "cat.canned": "Canned goods",
  "cat.dry_goods": "Dry goods",
  "cat.spices": "Spices",
  "cat.oils_fats": "Oils & fats",
  "cat.drinks": "Drinks",
  "cat.sweets_snacks": "Sweets & snacks",
  "cat.frozen": "Frozen",
  "cat.household": "Household",
  "cat.other": "Other"
}, cs = { pl: ds, en: Xt };
let Se = Xt, St = "en";
function ps(e) {
  St = e === "pl" ? "pl" : "en", Se = cs[St];
}
function vt() {
  return St;
}
function a(e, t) {
  let s = Se[e] ?? Xt[e] ?? e;
  if (t)
    for (const [i, o] of Object.entries(t))
      s = s.replace(new RegExp(`\\{${i}\\}`, "g"), String(o));
  return s;
}
function Pe(e, t) {
  if (St !== "pl")
    return e === 1 ? t[0] : t[1];
  const s = Math.abs(e) % 100, i = s % 10;
  return s === 1 && e === 1 ? t[0] : i >= 2 && i <= 4 && (s < 10 || s >= 20) ? t[1] : t[2];
}
function Q(e) {
  return St === "pl" ? `${e} ${Pe(e, ["partia", "partie", "partii"])}` : `${e} ${e === 1 ? "batch" : "batches"}`;
}
const C = g`
  :host {
    --spz-primary: var(--primary-color, #03a9f4);
    --spz-text: var(--primary-text-color, #e1e1e1);
    --spz-text-2: var(--secondary-text-color, #9b9b9b);
    --spz-card: var(--card-background-color, #1c1c1c);
    --spz-bg: var(--primary-background-color, #111111);
    --spz-bg-2: var(--secondary-background-color, #202124);
    --spz-divider: var(--divider-color, rgba(225, 225, 225, 0.12));
    --spz-error: var(--error-color, #ef5350);
    --spz-warning: var(--warning-color, #ffa726);
    --spz-success: var(--success-color, #66bb6a);
    --spz-info: var(--info-color, #29b6f6);
    --spz-radius: var(--ha-card-border-radius, 12px);
    font-family: var(--paper-font-body1_-_font-family, Roboto, system-ui, sans-serif);
    color: var(--spz-text);
    box-sizing: border-box;
  }
  *,
  *::before,
  *::after {
    box-sizing: border-box;
  }
`, j = g`
  .card {
    background: var(--spz-card);
    border: 1px solid var(--spz-divider);
    border-radius: var(--spz-radius);
    padding: 16px;
  }
  .section-title {
    font-size: 14px;
    font-weight: 600;
    color: var(--spz-text);
    margin-bottom: 12px;
  }
  .section-label {
    font-size: 13px;
    font-weight: 600;
    color: var(--spz-text-2);
    text-transform: uppercase;
    letter-spacing: 0.04em;
    margin-bottom: 10px;
  }
  .btn {
    font-family: inherit;
    cursor: pointer;
    border-radius: 10px;
    font-size: 15px;
    font-weight: 600;
    padding: 14px;
    border: 1px solid var(--spz-divider);
    background: var(--spz-card);
    color: var(--spz-text);
    min-height: 48px;
  }
  .btn:focus-visible {
    outline: 2px solid var(--spz-primary);
    outline-offset: 2px;
  }
  .btn-primary {
    background: var(--spz-primary);
    color: #fff;
    border: none;
  }
  .btn-ghost {
    background: transparent;
    border: 1px solid var(--spz-primary);
    color: var(--spz-primary);
  }
  .btn-block {
    width: 100%;
  }
  .chip {
    font-family: inherit;
    cursor: pointer;
    border-radius: 999px;
    padding: 8px 14px;
    font-size: 13px;
    font-weight: 500;
    white-space: nowrap;
    border: 1px solid var(--spz-divider);
    background: var(--spz-card);
    color: var(--spz-text);
  }
  .chip.active {
    background: color-mix(in srgb, var(--spz-card) 82%, var(--spz-primary) 18%);
    border-color: var(--spz-primary);
    color: var(--spz-primary);
  }
  .row-scroll {
    display: flex;
    gap: 8px;
    overflow-x: auto;
    padding-bottom: 2px;
    scrollbar-width: thin;
  }
  .field-label {
    font-size: 13px;
    color: var(--spz-text-2);
    margin-bottom: 8px;
  }
  input,
  textarea,
  select {
    font-family: inherit;
    font-size: 15px;
    color: var(--spz-text);
    background: var(--spz-card);
    border: 1px solid var(--spz-divider);
    border-radius: 10px;
    padding: 12px 14px;
    width: 100%;
  }
  input:focus,
  textarea:focus,
  select:focus {
    outline: none;
    border-color: var(--spz-primary);
  }
  a {
    color: var(--spz-primary);
    text-decoration: none;
  }
  @media (prefers-reduced-motion: reduce) {
    * {
      animation-duration: 0.001ms !important;
      transition-duration: 0.001ms !important;
    }
  }
`, pt = "/spizarnia";
function ls(e) {
  let t = e.startsWith(pt) ? e.slice(pt.length) : e;
  if (t = t.replace(/^\/+/, "").replace(/\/+$/, ""), !t) return { view: "dashboard" };
  const [s, i] = t.split("/");
  switch (s) {
    case "room":
      return { view: "room", id: i };
    case "shelf":
      return { view: "shelf", id: i };
    case "scan":
      return { view: "scan" };
    case "add":
      return { view: "add" };
    case "catalog":
      return i ? { view: "product", id: i } : { view: "catalog" };
    case "history":
      return { view: "history" };
    case "search":
      return { view: "search" };
    case "settings":
      return { view: "settings" };
    default:
      return { view: "dashboard" };
  }
}
function hs(e, t) {
  switch (e) {
    case "dashboard":
      return pt;
    case "product":
      return `${pt}/catalog/${t}`;
    case "room":
    case "shelf":
      return `${pt}/${e}/${t}`;
    default:
      return `${pt}/${e}`;
  }
}
function z(e, t) {
  const s = hs(e, t);
  history.pushState(null, "", s), window.dispatchEvent(new Event("location-changed"));
}
function us() {
  history.back();
}
const Ce = [
  "preserves_sweet",
  "preserves_savory",
  "compotes_juices",
  "honey_syrups",
  "canned",
  "dry_goods",
  "spices",
  "oils_fats",
  "drinks",
  "sweets_snacks",
  "frozen",
  "household",
  "other"
], lt = {
  preserves_sweet: "🍓",
  preserves_savory: "🥒",
  compotes_juices: "🍑",
  honey_syrups: "🍯",
  canned: "🥫",
  dry_goods: "🌾",
  spices: "🧂",
  oils_fats: "🫒",
  drinks: "🧃",
  sweets_snacks: "🍫",
  frozen: "❄️",
  household: "🧻",
  other: "📦"
}, ge = {
  preserves_sweet: "#e91e63",
  // róż
  preserves_savory: "#4caf50",
  // zieleń
  compotes_juices: "#ff8a65",
  // brzoskwinia
  honey_syrups: "#ffb300",
  // bursztyn
  canned: "#78909c",
  // stal
  dry_goods: "#c9a227",
  // piasek
  spices: "#bf5b3b",
  // terakota
  oils_fats: "#8bc34a",
  // oliwka
  drinks: "#29b6f6",
  // błękit
  sweets_snacks: "#9c27b0",
  // fiolet
  frozen: "#4dd0e1",
  // lód
  household: "#9e9e9e",
  // szarość
  other: "#90a4ae"
  // neutralny
};
function te(e, t = 10) {
  const s = ge[e] ?? ge.other;
  return `color-mix(in srgb, var(--card-background-color, #1c1c1c) ${100 - t}%, ${s} ${t}%)`;
}
function N(e, t) {
  return e || lt[t] || lt.other;
}
function Pt(e, t, s) {
  if (t === "none" || !e) return "∞";
  const i = /* @__PURE__ */ new Date(e + "T00:00:00");
  return isNaN(i.getTime()) ? "—" : t === "year" ? String(i.getFullYear()) : t === "month" ? `${String(i.getMonth() + 1).padStart(2, "0")}.${i.getFullYear()}` : new Intl.DateTimeFormat(s || "pl", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric"
  }).format(i);
}
function ms(e, t, s) {
  return e === "no_date" ? "∞" : e === "expired" ? t !== null ? `${t} dni` : "!" : e === "expiring_soon" && t !== null ? `${t} dni` : s;
}
function je(e, t) {
  const s = new Date(e).getTime(), i = Date.now(), o = Math.round((s - i) / 1e3), r = new Intl.RelativeTimeFormat(t || "pl", { numeric: "auto" }), n = Math.abs(o);
  return n < 60 ? r.format(Math.round(o), "second") : n < 3600 ? r.format(Math.round(o / 60), "minute") : n < 86400 ? r.format(Math.round(o / 3600), "hour") : n < 2592e3 ? r.format(Math.round(o / 86400), "day") : r.format(Math.round(o / 2592e3), "month");
}
function fs(e, t) {
  const s = new Date(e), i = /* @__PURE__ */ new Date(), o = (n, h) => n.getFullYear() === h.getFullYear() && n.getMonth() === h.getMonth() && n.getDate() === h.getDate();
  if (o(s, i)) return "__today__";
  const r = new Date(i);
  return r.setDate(i.getDate() - 1), o(s, r) ? "__yesterday__" : new Intl.DateTimeFormat(t || "pl", {
    day: "numeric",
    month: "long"
  }).format(s);
}
function Wt(e) {
  const t = /* @__PURE__ */ new Date();
  return t.setMonth(t.getMonth() + e), { date: Ee(t), precision: "day" };
}
function be(e) {
  const t = /* @__PURE__ */ new Date();
  return t.setFullYear(t.getFullYear() + e), { date: Ee(t), precision: "year" };
}
function vs() {
  return { date: `${(/* @__PURE__ */ new Date()).getFullYear()}-12-31`, precision: "year" };
}
function Ee(e) {
  const t = e.getFullYear(), s = String(e.getMonth() + 1).padStart(2, "0"), i = String(e.getDate()).padStart(2, "0");
  return `${t}-${s}-${i}`;
}
var gs = Object.defineProperty, bs = Object.getOwnPropertyDescriptor, At = (e, t, s, i) => {
  for (var o = i > 1 ? void 0 : i ? bs(t, s) : t, r = e.length - 1, n; r >= 0; r--)
    (n = e[r]) && (o = (i ? n(t, s, o) : n(o)) || o);
  return i && o && gs(t, s, o), o;
};
let ot = class extends m {
  constructor() {
    super(...arguments), this.status = "ok", this.date = null, this.precision = "day", this.daysLeft = null;
  }
  render() {
    const e = Pt(this.date, this.precision, vt()), t = ms(this.status, this.daysLeft, e);
    return d`<span class=${this.status} title=${e}>${t}</span>`;
  }
};
ot.styles = g`
    span {
      display: inline-flex;
      align-items: center;
      font-size: 12px;
      font-weight: 600;
      padding: 3px 9px;
      border-radius: 999px;
      white-space: nowrap;
      line-height: 1.3;
    }
    .expired {
      color: var(--error-color, #ef5350);
      background: color-mix(in srgb, transparent 88%, var(--error-color, #ef5350) 12%);
    }
    .expiring_soon {
      color: var(--warning-color, #ffa726);
      background: color-mix(in srgb, transparent 88%, var(--warning-color, #ffa726) 12%);
    }
    .ok {
      color: var(--success-color, #66bb6a);
      background: color-mix(in srgb, transparent 88%, var(--success-color, #66bb6a) 12%);
    }
    .no_date {
      color: var(--secondary-text-color, #9b9b9b);
      background: color-mix(in srgb, transparent 90%, var(--secondary-text-color, #9b9b9b) 10%);
    }
  `;
At([
  p()
], ot.prototype, "status", 2);
At([
  p()
], ot.prototype, "date", 2);
At([
  p()
], ot.prototype, "precision", 2);
At([
  p({ type: Number })
], ot.prototype, "daysLeft", 2);
ot = At([
  b("spz-freshness-badge")
], ot);
var ys = Object.defineProperty, xs = Object.getOwnPropertyDescriptor, Oe = (e, t, s, i) => {
  for (var o = i > 1 ? void 0 : i ? xs(t, s) : t, r = e.length - 1, n; r >= 0; r--)
    (n = e[r]) && (o = (i ? n(t, s, o) : n(o)) || o);
  return i && o && ys(t, s, o), o;
};
let Lt = class extends m {
  constructor() {
    super(...arguments), this.queue = [], this.seq = 0;
  }
  show(e, t) {
    const s = ++this.seq;
    this.queue = [...this.queue, { id: s, message: e, undo: t }], setTimeout(() => this.dismiss(s), 5e3);
  }
  dismiss(e) {
    this.queue = this.queue.filter((t) => t.id !== e);
  }
  runUndo(e) {
    e.undo?.(), this.dismiss(e.id);
  }
  render() {
    return d`<div aria-live="polite">
      ${this.queue.map(
      (e) => d`
          <div class="toast">
            <span class="msg">${e.message}</span>
            ${e.undo ? d`<button @click=${() => this.runUndo(e)}>
                  ${a("common.undo")}
                </button>` : ""}
          </div>
        `
    )}
    </div>`;
  }
};
Lt.styles = g`
    :host {
      position: fixed;
      left: 50%;
      bottom: 88px;
      transform: translateX(-50%);
      z-index: 60;
      display: flex;
      flex-direction: column;
      gap: 8px;
      width: min(440px, calc(100vw - 32px));
      pointer-events: none;
    }
    .toast {
      pointer-events: auto;
      display: flex;
      align-items: center;
      gap: 12px;
      background: var(--secondary-background-color, #202124);
      color: var(--primary-text-color, #e1e1e1);
      border: 1px solid var(--divider-color, rgba(225, 225, 225, 0.12));
      border-radius: 12px;
      padding: 12px 14px;
      font-size: 14px;
      box-shadow: 0 8px 24px rgba(0, 0, 0, 0.35);
      animation: toast 0.2s ease;
    }
    .msg {
      flex: 1;
    }
    button {
      border: none;
      background: transparent;
      color: var(--primary-color, #03a9f4);
      font-weight: 700;
      font-size: 14px;
      cursor: pointer;
    }
    @keyframes toast {
      from {
        transform: translateY(24px);
        opacity: 0;
      }
    }
  `;
Oe([
  c()
], Lt.prototype, "queue", 2);
Lt = Oe([
  b("spz-toast")
], Lt);
function wt(e, t) {
  window.dispatchEvent(
    new CustomEvent("spz-toast", { detail: { message: e, undo: t } })
  );
}
var $s = Object.defineProperty, ws = Object.getOwnPropertyDescriptor, ee = (e, t, s, i) => {
  for (var o = i > 1 ? void 0 : i ? ws(t, s) : t, r = e.length - 1, n; r >= 0; r--)
    (n = e[r]) && (o = (i ? n(t, s, o) : n(o)) || o);
  return i && o && $s(t, s, o), o;
};
let Ct = class extends m {
  constructor() {
    super(...arguments), this.open = !1, this.narrow = !0, this.startY = 0, this.dragging = !1;
  }
  close() {
    this.dispatchEvent(new CustomEvent("sheet-close"));
  }
  onDown(e) {
    this.narrow && (this.dragging = !0, this.startY = e.clientY);
  }
  onUp(e) {
    this.dragging && (this.dragging = !1, e.clientY - this.startY > 100 && this.close());
  }
  render() {
    return this.open ? d`
      <div class="scrim" @click=${this.close}></div>
      <div class="sheet ${this.narrow ? "narrow" : "wide"}" role="dialog" aria-modal="true">
        ${this.narrow ? d`<div
              class="handle"
              @pointerdown=${this.onDown}
              @pointerup=${this.onUp}
            ></div>` : ""}
        <slot></slot>
      </div>
    ` : d``;
  }
  connectedCallback() {
    super.connectedCallback(), this._onKey = (e) => {
      e.key === "Escape" && this.open && this.close();
    }, window.addEventListener("keydown", this._onKey);
  }
  disconnectedCallback() {
    super.disconnectedCallback(), window.removeEventListener("keydown", this._onKey);
  }
};
Ct.styles = g`
    .scrim {
      position: fixed;
      inset: 0;
      z-index: 40;
      background: rgba(0, 0, 0, 0.5);
      animation: scrim 0.2s ease;
    }
    .sheet {
      position: fixed;
      z-index: 41;
      background: var(--card-background-color, #1c1c1c);
      color: var(--primary-text-color, #e1e1e1);
      box-shadow: 0 -8px 32px rgba(0, 0, 0, 0.4);
      max-height: 88vh;
      overflow-y: auto;
      padding: 12px 20px 24px;
    }
    .narrow {
      left: 0;
      right: 0;
      bottom: 0;
      border-radius: 20px 20px 0 0;
      animation: up 0.24s ease;
    }
    .wide {
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      width: min(480px, 92vw);
      border-radius: var(--ha-card-border-radius, 12px);
      animation: fade 0.2s ease;
    }
    .handle {
      width: 40px;
      height: 4px;
      border-radius: 2px;
      background: var(--divider-color, rgba(225, 225, 225, 0.12));
      margin: 0 auto 16px;
    }
    @keyframes up {
      from {
        transform: translateY(100%);
      }
    }
    @keyframes fade {
      from {
        opacity: 0;
      }
    }
    @keyframes scrim {
      from {
        opacity: 0;
      }
    }
  `;
ee([
  p({ type: Boolean })
], Ct.prototype, "open", 2);
ee([
  p({ type: Boolean })
], Ct.prototype, "narrow", 2);
Ct = ee([
  b("spz-bottom-sheet")
], Ct);
var _s = Object.defineProperty, zs = Object.getOwnPropertyDescriptor, qt = (e, t, s, i) => {
  for (var o = i > 1 ? void 0 : i ? zs(t, s) : t, r = e.length - 1, n; r >= 0; r--)
    (n = e[r]) && (o = (i ? n(t, s, o) : n(o)) || o);
  return i && o && _s(t, s, o), o;
};
let at = class extends m {
  constructor() {
    super(...arguments), this.open = !1, this.heading = "", this.body = "", this.confirmLabel = "";
  }
  cancel() {
    this.dispatchEvent(new CustomEvent("confirm-cancel"));
  }
  confirm() {
    this.dispatchEvent(new CustomEvent("confirm-ok"));
  }
  render() {
    return this.open ? d`<div class="scrim" @click=${this.cancel}>
      <div class="box" role="alertdialog" aria-modal="true" @click=${(e) => e.stopPropagation()}>
        <h3>${this.heading}</h3>
        <p>${this.body}</p>
        <div class="actions">
          <button @click=${this.cancel}>${a("common.cancel")}</button>
          <button class="danger" @click=${this.confirm}>
            ${this.confirmLabel || a("common.delete")}
          </button>
        </div>
      </div>
    </div>` : d``;
  }
};
at.styles = g`
    .scrim {
      position: fixed;
      inset: 0;
      z-index: 70;
      background: rgba(0, 0, 0, 0.55);
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 24px;
    }
    .box {
      background: var(--card-background-color, #1c1c1c);
      border-radius: var(--ha-card-border-radius, 12px);
      padding: 22px;
      width: min(400px, 100%);
      color: var(--primary-text-color, #e1e1e1);
    }
    h3 {
      margin: 0 0 10px;
      font-size: 18px;
      font-weight: 500;
    }
    p {
      margin: 0 0 20px;
      font-size: 14px;
      color: var(--secondary-text-color, #9b9b9b);
      line-height: 1.5;
    }
    .actions {
      display: flex;
      gap: 10px;
      justify-content: flex-end;
    }
    button {
      font-family: inherit;
      cursor: pointer;
      border-radius: 10px;
      padding: 12px 18px;
      font-size: 14px;
      font-weight: 600;
      border: 1px solid var(--divider-color, rgba(225, 225, 225, 0.12));
      background: transparent;
      color: var(--primary-text-color, #e1e1e1);
    }
    .danger {
      background: var(--error-color, #ef5350);
      color: #fff;
      border: none;
    }
  `;
qt([
  p({ type: Boolean })
], at.prototype, "open", 2);
qt([
  p()
], at.prototype, "heading", 2);
qt([
  p()
], at.prototype, "body", 2);
qt([
  p()
], at.prototype, "confirmLabel", 2);
at = qt([
  b("spz-confirm-dialog")
], at);
const ks = ["ean_13", "ean_8", "upc_a", "code_128", "qr_code"], Ss = 3e3;
async function Ps(e, t) {
  const s = await navigator.mediaDevices.getUserMedia({
    video: { facingMode: "environment" }
  });
  e.srcObject = s, await e.play();
  const i = s.getVideoTracks()[0], r = !!(i.getCapabilities?.() ?? {}).torch;
  let n = !1, h = "", l = 0;
  const x = (q) => {
    const yt = Date.now();
    q === h && yt - l < Ss || (h = q, l = yt, navigator.vibrate && navigator.vibrate(50), t(q));
  }, w = () => {
    n = !0, s.getTracks().forEach((q) => q.stop());
  }, f = async (q) => {
    if (!r) return !1;
    try {
      return await i.applyConstraints({ advanced: [{ torch: q }] }), !0;
    } catch {
      return !1;
    }
  }, A = window.BarcodeDetector;
  if (A) {
    const q = new A({ formats: ks }), yt = async () => {
      if (!n) {
        try {
          const ae = await q.detect(e);
          ae.length && x(ae[0].rawValue);
        } catch {
        }
        n || setTimeout(yt, 100);
      }
    };
    return yt(), { stop: w, setTorch: f, torchSupported: r };
  }
  const { BrowserMultiFormatReader: L } = await import("./zxing-vC13hMXY.js"), De = await new L().decodeFromVideoElement(e, (q) => {
    q && x(q.getText());
  });
  return {
    stop: () => {
      De.stop(), w();
    },
    setTorch: f,
    torchSupported: r
  };
}
function Cs() {
  return window.isSecureContext || location.hostname === "localhost";
}
var js = Object.defineProperty, Es = Object.getOwnPropertyDescriptor, Z = (e, t, s, i) => {
  for (var o = i > 1 ? void 0 : i ? Es(t, s) : t, r = e.length - 1, n; r >= 0; r--)
    (n = e[r]) && (o = (i ? n(t, s, o) : n(o)) || o);
  return i && o && js(t, s, o), o;
};
let R = class extends m {
  constructor() {
    super(...arguments), this.sessionCount = 0, this.serial = !0, this.error = "", this.torchOn = !1, this.torchSupported = !1, this.flash = !1;
  }
  async connectedCallback() {
    if (super.connectedCallback(), !Cs()) {
      this.error = "https";
      return;
    }
    await this.updateComplete;
    try {
      this.handle = await Ps(this.video, (e) => this.onDetect(e)), this.torchSupported = this.handle.torchSupported;
    } catch {
      this.error = "camera";
    }
  }
  disconnectedCallback() {
    super.disconnectedCallback(), this.handle?.stop();
  }
  onDetect(e) {
    this.flash = !0, setTimeout(() => this.flash = !1, 300), this.dispatchEvent(new CustomEvent("code", { detail: { code: e } }));
  }
  submitManual(e) {
    e.preventDefault();
    const t = this.renderRoot.querySelector(".manual input"), s = t?.value.trim();
    s && (this.onDetect(s), t && (t.value = ""));
  }
  async toggleTorch() {
    await this.handle?.setTorch(!this.torchOn) && (this.torchOn = !this.torchOn);
  }
  close() {
    this.dispatchEvent(new CustomEvent("scanner-close"));
  }
  toggleSerial() {
    this.serial = !this.serial, this.dispatchEvent(
      new CustomEvent("serial-changed", { detail: { serial: this.serial } })
    );
  }
  render() {
    return d`
      <div class="top">
        <button class="icon-btn" aria-label=${a("common.close")} @click=${this.close}>
          ✕
        </button>
        <div class="counter">${a("scan.session_added", { n: this.sessionCount })}</div>
        ${this.torchSupported ? d`<button
              class="icon-btn torch ${this.torchOn ? "on" : ""}"
              aria-label="🔦"
              @click=${this.toggleTorch}
            >
              🔦
            </button>` : ""}
      </div>

      ${this.error ? d`<div class="error">
            <div class="big">${this.error === "https" ? "🔒" : "📷"}</div>
            <div style="font-size:18px;font-weight:500;">
              ${this.error === "https" ? a("scan.no_https") : a("scan.no_camera")}
            </div>
            <div style="font-size:14px;opacity:.8;max-width:320px;">
              ${this.error === "https" ? a("scan.no_https_sub") : a("scan.no_camera_sub")}
            </div>
          </div>` : d`
            <div class="stage">
              <video muted playsinline></video>
              <div class="frame ${this.flash ? "flash" : ""}">
                <div class="laser"></div>
              </div>
            </div>
            <div class="hint">${a("scan.hint")}</div>
            <div class="serial-row">
              <button class="serial ${this.serial ? "on" : ""}" @click=${this.toggleSerial}>
                ${this.serial ? a("scan.serial_on") : a("scan.serial_off")}
              </button>
            </div>
          `}

      <form class="manual" @submit=${this.submitManual}>
        <input inputmode="numeric" placeholder=${a("scan.manual")} />
        <button type="submit">OK</button>
      </form>
    `;
  }
};
R.styles = g`
    :host {
      position: fixed;
      inset: 0;
      z-index: 80;
      background: linear-gradient(150deg, #0b141a, #1d2f38);
      display: flex;
      flex-direction: column;
      color: #fff;
    }
    .top {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 16px;
    }
    .icon-btn {
      border: none;
      background: rgba(0, 0, 0, 0.35);
      color: #fff;
      width: 40px;
      height: 40px;
      border-radius: 50%;
      font-size: 18px;
      cursor: pointer;
    }
    .counter {
      margin-left: auto;
      display: flex;
      gap: 6px;
      background: rgba(0, 0, 0, 0.35);
      border-radius: 999px;
      padding: 7px 14px;
      font-size: 13px;
    }
    .torch.on {
      background: var(--primary-color, #03a9f4);
    }
    .stage {
      flex: 1;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 0 32px;
      position: relative;
      overflow: hidden;
    }
    video {
      position: absolute;
      inset: 0;
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
    .frame {
      position: relative;
      width: 100%;
      aspect-ratio: 3 / 2;
      border-radius: 16px;
      border: 2px solid rgba(255, 255, 255, 0.9);
      box-shadow: 0 0 0 2000px rgba(0, 0, 0, 0.4);
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .frame.flash {
      border-color: var(--success-color, #66bb6a);
      box-shadow: 0 0 0 2000px rgba(0, 0, 0, 0.4),
        0 0 24px var(--success-color, #66bb6a);
    }
    .laser {
      width: 78%;
      height: 2px;
      background: var(--primary-color, #03a9f4);
      box-shadow: 0 0 14px var(--primary-color, #03a9f4);
    }
    .hint {
      text-align: center;
      font-size: 13px;
      opacity: 0.85;
      margin-bottom: 14px;
    }
    .serial-row {
      display: flex;
      justify-content: center;
      margin-bottom: 14px;
    }
    .serial {
      border: 1px solid rgba(255, 255, 255, 0.3);
      background: rgba(255, 255, 255, 0.08);
      color: #fff;
      border-radius: 999px;
      padding: 8px 16px;
      font-size: 13px;
      cursor: pointer;
    }
    .serial.on {
      background: var(--primary-color, #03a9f4);
      border-color: transparent;
    }
    .manual {
      padding: 16px;
      background: rgba(0, 0, 0, 0.45);
      display: flex;
      gap: 10px;
      align-items: center;
    }
    .manual input {
      flex: 1;
      min-width: 0;
      border: 1px solid rgba(255, 255, 255, 0.25);
      background: rgba(255, 255, 255, 0.08);
      color: #fff;
      border-radius: 10px;
      padding: 12px;
      font-size: 15px;
    }
    .manual button {
      border: none;
      background: var(--primary-color, #03a9f4);
      color: #fff;
      font-weight: 600;
      padding: 12px 16px;
      border-radius: 10px;
      cursor: pointer;
      white-space: nowrap;
    }
    .error {
      flex: 1;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      text-align: center;
      gap: 12px;
      padding: 24px;
    }
    .error .big {
      font-size: 48px;
    }
  `;
Z([
  p({ type: Number })
], R.prototype, "sessionCount", 2);
Z([
  p({ type: Boolean })
], R.prototype, "serial", 2);
Z([
  c()
], R.prototype, "error", 2);
Z([
  c()
], R.prototype, "torchOn", 2);
Z([
  c()
], R.prototype, "torchSupported", 2);
Z([
  c()
], R.prototype, "flash", 2);
Z([
  Ut("video")
], R.prototype, "video", 2);
R = Z([
  b("spz-scanner")
], R);
var Os = Object.defineProperty, As = Object.getOwnPropertyDescriptor, gt = (e, t, s, i) => {
  for (var o = i > 1 ? void 0 : i ? As(t, s) : t, r = e.length - 1, n; r >= 0; r--)
    (n = e[r]) && (o = (i ? n(t, s, o) : n(o)) || o);
  return i && o && Os(t, s, o), o;
};
let K = class extends m {
  constructor() {
    super(...arguments), this.value = 1, this.min = 0, this.max = 9999, this.step = 1, this.bump = !1;
  }
  change(e) {
    const t = Math.max(this.min, Math.min(this.max, +(this.value + e).toFixed(3)));
    t !== this.value && (this.value = t, this.bump = !0, setTimeout(() => this.bump = !1, 220), this.dispatchEvent(
      new CustomEvent("value-changed", { detail: { value: this.value } })
    ));
  }
  render() {
    return d`
      <button
        aria-label="−"
        ?disabled=${this.value <= this.min}
        @click=${() => this.change(-this.step)}
      >
        −
      </button>
      <div class="value ${this.bump ? "bump" : ""}">${this.value}</div>
      <button
        aria-label="+"
        ?disabled=${this.value >= this.max}
        @click=${() => this.change(this.step)}
      >
        ＋
      </button>
    `;
  }
};
K.styles = g`
    :host {
      display: flex;
      align-items: center;
      gap: 14px;
    }
    button {
      width: 52px;
      height: 52px;
      flex: none;
      border-radius: 14px;
      border: 1px solid var(--divider-color, rgba(225, 225, 225, 0.12));
      background: var(--card-background-color, #1c1c1c);
      color: var(--primary-text-color, #e1e1e1);
      font-size: 28px;
      cursor: pointer;
    }
    button:disabled {
      opacity: 0.4;
      cursor: not-allowed;
    }
    .value {
      flex: 1;
      text-align: center;
      font-size: 30px;
      font-weight: 500;
      color: var(--primary-text-color, #e1e1e1);
    }
    .bump {
      animation: tick 0.2s ease;
    }
    @keyframes tick {
      0% {
        transform: scale(1);
      }
      40% {
        transform: scale(1.25);
      }
      100% {
        transform: scale(1);
      }
    }
  `;
gt([
  p({ type: Number })
], K.prototype, "value", 2);
gt([
  p({ type: Number })
], K.prototype, "min", 2);
gt([
  p({ type: Number })
], K.prototype, "max", 2);
gt([
  p({ type: Number })
], K.prototype, "step", 2);
gt([
  c()
], K.prototype, "bump", 2);
K = gt([
  b("spz-qty-stepper")
], K);
var qs = Object.defineProperty, Ds = Object.getOwnPropertyDescriptor, Dt = (e, t, s, i) => {
  for (var o = i > 1 ? void 0 : i ? Ds(t, s) : t, r = e.length - 1, n; r >= 0; r--)
    (n = e[r]) && (o = (i ? n(t, s, o) : n(o)) || o);
  return i && o && qs(t, s, o), o;
};
let rt = class extends m {
  constructor() {
    super(...arguments), this.date = null, this.precision = "day", this.suggested = !1, this.activeChip = "";
  }
  emit(e, t) {
    this.activeChip = t, this.date = e.date, this.precision = e.precision, this.suggested = !1, this.dispatchEvent(new CustomEvent("date-changed", { detail: e }));
  }
  onCalendar(e) {
    const t = e.target.value || null;
    this.emit({ date: t, precision: "day" }, "pick");
  }
  render() {
    const e = vt(), t = [
      { key: "none", label: a("date.none"), val: () => ({ date: null, precision: "none" }) },
      { key: "3m", label: a("date.3m"), val: () => Wt(3) },
      { key: "6m", label: a("date.6m"), val: () => Wt(6) },
      { key: "1y", label: a("date.1y"), val: () => be(1) },
      { key: "2y", label: a("date.2y"), val: () => be(2) },
      { key: "eoy", label: a("date.eoy"), val: () => vs() }
    ], s = this.precision === "none" || !this.date ? a("date.no_date") : Pt(this.date, this.precision, e);
    return d`
      <div class="chips">
        ${t.map(
      (i) => d`<button
            class="chip ${this.activeChip === i.key ? "active" : ""}"
            @click=${() => this.emit(i.val(), i.key)}
          >
            ${i.label}
          </button>`
    )}
        <label class="chip" style="display:inline-flex;align-items:center;gap:6px;">
          ${a("date.pick")}
          <input type="date" @change=${this.onCalendar} .value=${this.date ?? ""} />
        </label>
      </div>
      <div class="selected">
        ${s}
        ${this.suggested ? d`<span class="suggested">${a("add.suggested")}</span>` : ""}
      </div>
    `;
  }
};
rt.styles = g`
    .chips {
      display: flex;
      gap: 8px;
      flex-wrap: wrap;
    }
    button.chip {
      font-family: inherit;
      cursor: pointer;
      border-radius: 999px;
      padding: 8px 12px;
      font-size: 13px;
      border: 1px solid var(--divider-color, rgba(225, 225, 225, 0.12));
      background: var(--card-background-color, #1c1c1c);
      color: var(--primary-text-color, #e1e1e1);
    }
    button.chip.active {
      border-color: var(--primary-color, #03a9f4);
      color: var(--primary-color, #03a9f4);
    }
    .selected {
      margin-top: 14px;
      font-size: 26px;
      font-weight: 500;
      color: var(--primary-text-color, #e1e1e1);
      display: flex;
      align-items: center;
      gap: 10px;
      flex-wrap: wrap;
    }
    .suggested {
      font-size: 12px;
      font-weight: 600;
      color: var(--success-color, #66bb6a);
      background: color-mix(
        in srgb,
        var(--card-background-color, #1c1c1c) 82%,
        var(--success-color, #66bb6a) 18%
      );
      padding: 3px 9px;
      border-radius: 999px;
    }
    input[type="date"] {
      font-family: inherit;
      background: var(--card-background-color, #1c1c1c);
      color: var(--primary-text-color, #e1e1e1);
      border: 1px solid var(--primary-color, #03a9f4);
      border-radius: 8px;
      padding: 8px;
    }
    .cal {
      margin-top: 12px;
    }
  `;
Dt([
  p()
], rt.prototype, "date", 2);
Dt([
  p()
], rt.prototype, "precision", 2);
Dt([
  p({ type: Boolean })
], rt.prototype, "suggested", 2);
Dt([
  c()
], rt.prototype, "activeChip", 2);
rt = Dt([
  b("spz-date-quick-pick")
], rt);
var Is = Object.defineProperty, Ts = Object.getOwnPropertyDescriptor, Ft = (e, t, s, i) => {
  for (var o = i > 1 ? void 0 : i ? Ts(t, s) : t, r = e.length - 1, n; r >= 0; r--)
    (n = e[r]) && (o = (i ? n(t, s, o) : n(o)) || o);
  return i && o && Is(t, s, o), o;
};
let mt = class extends m {
  constructor() {
    super(...arguments), this.rooms = [], this.shelves = [], this.roomId = "";
  }
  pickShelf(e) {
    this.dispatchEvent(
      new CustomEvent("shelf-picked", { detail: { shelfId: e } })
    );
  }
  render() {
    if (!this.roomId)
      return d`
        <div class="title">${a("nav.rooms")}</div>
        <div class="list">
          ${this.rooms.map(
        (t) => d`<button @click=${() => this.roomId = t.id}>
              <ha-icon icon=${t.icon}></ha-icon>
              <span>${t.name}</span>
              <span class="chevron">›</span>
            </button>`
      )}
        </div>
      `;
    const e = this.shelves.filter((t) => t.room_id === this.roomId);
    return d`
      <button class="back" @click=${() => this.roomId = ""}>‹ ${a("common.back")}</button>
      <div class="title">${a("room.shelves")}</div>
      <div class="list">
        ${e.map(
      (t) => d`<button @click=${() => this.pickShelf(t.id)}>
            <span>${t.name}</span>
            <span class="chevron">›</span>
          </button>`
    )}
      </div>
    `;
  }
};
mt.styles = g`
    .list {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }
    button {
      font-family: inherit;
      text-align: left;
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 10px;
      background: var(--card-background-color, #1c1c1c);
      border: 1px solid var(--divider-color, rgba(225, 225, 225, 0.12));
      border-radius: 12px;
      padding: 14px 16px;
      color: var(--primary-text-color, #e1e1e1);
      font-size: 15px;
    }
    .chevron {
      margin-left: auto;
      color: var(--secondary-text-color, #9b9b9b);
    }
    .back {
      background: none;
      border: none;
      color: var(--primary-color, #03a9f4);
      cursor: pointer;
      font-size: 14px;
      padding: 0 0 10px;
    }
    .title {
      font-size: 16px;
      font-weight: 500;
      margin-bottom: 12px;
      color: var(--primary-text-color, #e1e1e1);
    }
  `;
Ft([
  p({ attribute: !1 })
], mt.prototype, "rooms", 2);
Ft([
  p({ attribute: !1 })
], mt.prototype, "shelves", 2);
Ft([
  c()
], mt.prototype, "roomId", 2);
mt = Ft([
  b("spz-location-picker")
], mt);
var Ns = Object.defineProperty, Ms = Object.getOwnPropertyDescriptor, _ = (e, t, s, i) => {
  for (var o = i > 1 ? void 0 : i ? Ms(t, s) : t, r = e.length - 1, n; r >= 0; r--)
    (n = e[r]) && (o = (i ? n(t, s, o) : n(o)) || o);
  return i && o && Ns(t, s, o), o;
};
let $ = class extends m {
  constructor() {
    super(...arguments), this.shelfId = "", this.narrow = !0, this.qty = 1, this.unit = "szt", this.date = null, this.precision = "day", this.suggested = !1, this.showMore = !1, this.opened = !1, this.note = "", this.production = null, this.pickingLocation = !1, this.rooms = [], this.shelves = [], this.busy = !1;
  }
  connectedCallback() {
    super.connectedCallback(), this.reset(), this.loadLocations();
  }
  async loadLocations() {
    this.rooms = (await this.appState.api.listRooms()).rooms, this.shelves = (await this.appState.api.listShelves()).shelves, !this.shelfId && this.shelves.length && (this.shelfId = this.shelves[0].id);
  }
  reset() {
    if (this.qty = 1, this.unit = this.product?.default_unit ?? "szt", this.showMore = !1, this.opened = !1, this.note = "", this.production = null, this.product?.default_shelf_life_days) {
      const e = Math.round(this.product.default_shelf_life_days / 30), t = Wt(e);
      this.date = t.date, this.precision = t.precision, this.suggested = !0;
    } else
      this.date = null, this.precision = "day", this.suggested = !1;
  }
  shelfPath() {
    const e = this.shelves.find((s) => s.id === this.shelfId);
    return e ? `${this.rooms.find((s) => s.id === e.room_id)?.name ?? "?"} / ${e.name}` : "—";
  }
  onDate(e) {
    this.date = e.detail.date, this.precision = e.detail.precision, this.suggested = !1;
  }
  async submit(e) {
    if (!(!this.product || !this.shelfId || this.busy)) {
      this.busy = !0;
      try {
        const { item: t } = await this.appState.api.addItem({
          product_id: this.product.id,
          shelf_id: this.shelfId,
          quantity: this.qty,
          unit: this.unit,
          best_before: this.date,
          best_before_precision: this.precision,
          production_date: this.production,
          opened: this.opened,
          notes: this.note
        });
        this.dispatchEvent(
          new CustomEvent("added", {
            detail: { item: t, next: e, location: this.shelfPath() }
          })
        ), this.reset();
      } finally {
        this.busy = !1;
      }
    }
  }
  render() {
    return this.product ? d`<div class="wrap">
      <div class="product-head">
        <span class="glyph" aria-hidden="true">${N(this.product.emoji, this.product.category)}</span>
        <div style="flex:1">
          <div class="name">${this.product.name}</div>
          <div class="change" @click=${() => this.dispatchEvent(new CustomEvent("change-product"))}>
            ${a("add.change_product")}
          </div>
        </div>
      </div>

      <div>
        <div class="field-label">${a("add.quantity")}</div>
        <div class="qty-row">
          <spz-qty-stepper .value=${this.qty} min="0" step="1"
            @value-changed=${(e) => this.qty = e.detail.value}></spz-qty-stepper>
          <button class="unit-chip">${a("unit." + this.unit)}</button>
        </div>
      </div>

      <div>
        <div class="field-label">${a("add.best_before")}</div>
        <spz-date-quick-pick .date=${this.date} .precision=${this.precision}
          .suggested=${this.suggested} @date-changed=${this.onDate}></spz-date-quick-pick>
      </div>

      <div>
        <div class="field-label">${a("add.shelf")}</div>
        <button class="shelf-btn" @click=${() => this.pickingLocation = !0}>
          ${this.shelfPath()}<span class="chev">›</span>
        </button>
      </div>

      <button class="more-toggle" @click=${() => this.showMore = !this.showMore}>
        ${this.showMore ? a("common.less") : a("common.more")}
      </button>
      ${this.showMore ? d`<div style="display:flex;flex-direction:column;gap:14px;">
            <div>
              <div class="field-label">${a("add.production")}</div>
              <input type="date" .value=${this.production ?? ""}
                @change=${(e) => this.production = e.target.value || null} />
            </div>
            <div>
              <div class="field-label">${a("add.note")}</div>
              <textarea rows="2" placeholder=${a("add.note_placeholder")}
                @input=${(e) => this.note = e.target.value}></textarea>
            </div>
            <label style="display:flex;align-items:center;gap:10px;font-size:14px;">
              <input type="checkbox" style="width:auto" .checked=${this.opened}
                @change=${(e) => this.opened = e.target.checked} />
              ${a("add.opened")}
            </label>
          </div>` : ""}

      <div class="cta">
        <button class="btn btn-primary btn-block" ?disabled=${this.busy} @click=${() => this.submit(!1)}>
          ${a("add.submit")}
        </button>
        <button class="btn btn-ghost btn-block" ?disabled=${this.busy} @click=${() => this.submit(!0)}>
          ${a("add.submit_next")}
        </button>
      </div>

      <spz-bottom-sheet .open=${this.pickingLocation} .narrow=${this.narrow}
        @sheet-close=${() => this.pickingLocation = !1}>
        <spz-location-picker .rooms=${this.rooms} .shelves=${this.shelves}
          @shelf-picked=${(e) => {
      this.shelfId = e.detail.shelfId, this.pickingLocation = !1;
    }}>
        </spz-location-picker>
      </spz-bottom-sheet>
    </div>` : d`<div class="wrap">${a("add.sheet_pick")}</div>`;
  }
};
$.styles = [C, j, g`
    :host { display: block; }
    .wrap { display: flex; flex-direction: column; gap: 20px; }
    .product-head {
      background: var(--spz-card); border: 1px solid var(--spz-divider);
      border-radius: var(--spz-radius); padding: 16px; display: flex; align-items: center; gap: 14px;
    }
    .product-head .glyph { font-size: 40px; }
    .product-head .name { font-size: 18px; font-weight: 500; color: var(--spz-text); }
    .product-head .change { font-size: 13px; color: var(--spz-primary); cursor: pointer; }
    .unit-chip {
      border-radius: 999px; padding: 8px 14px; font-size: 13px; font-weight: 500;
      border: 1px solid var(--spz-primary); color: var(--spz-primary); background: transparent;
      cursor: pointer; font-family: inherit;
    }
    .qty-row { display: flex; align-items: center; gap: 14px; }
    .shelf-btn {
      width: 100%; text-align: left; border: 1px solid var(--spz-divider);
      background: var(--spz-card); color: var(--spz-text); border-radius: 10px;
      padding: 14px 16px; font-size: 15px; cursor: pointer; display: flex; align-items: center;
      font-family: inherit;
    }
    .shelf-btn .chev { margin-left: auto; color: var(--spz-text-2); }
    .more-toggle { border: none; background: transparent; color: var(--spz-primary);
      font-size: 14px; text-align: left; padding: 0; cursor: pointer; font-family: inherit; }
    .cta { display: flex; flex-direction: column; gap: 10px; }
  `];
_([
  p({ attribute: !1 })
], $.prototype, "appState", 2);
_([
  p({ attribute: !1 })
], $.prototype, "product", 2);
_([
  p()
], $.prototype, "shelfId", 2);
_([
  p({ type: Boolean })
], $.prototype, "narrow", 2);
_([
  c()
], $.prototype, "qty", 2);
_([
  c()
], $.prototype, "unit", 2);
_([
  c()
], $.prototype, "date", 2);
_([
  c()
], $.prototype, "precision", 2);
_([
  c()
], $.prototype, "suggested", 2);
_([
  c()
], $.prototype, "showMore", 2);
_([
  c()
], $.prototype, "opened", 2);
_([
  c()
], $.prototype, "note", 2);
_([
  c()
], $.prototype, "production", 2);
_([
  c()
], $.prototype, "pickingLocation", 2);
_([
  c()
], $.prototype, "rooms", 2);
_([
  c()
], $.prototype, "shelves", 2);
_([
  c()
], $.prototype, "busy", 2);
$ = _([
  b("spz-add-form")
], $);
function se(e) {
  return [...e].sort((t, s) => {
    if (t.opened !== s.opened) return t.opened ? -1 : 1;
    const i = t.best_before ?? "9999-99-99", o = s.best_before ?? "9999-99-99";
    return i !== o ? i < o ? -1 : 1 : t.added_at < s.added_at ? -1 : 1;
  });
}
function Ls(e, t) {
  const s = se(e);
  if (!(s.findIndex((o) => o.id === t) <= 0))
    return s[0];
}
var Rs = Object.defineProperty, Bs = Object.getOwnPropertyDescriptor, dt = (e, t, s, i) => {
  for (var o = i > 1 ? void 0 : i ? Bs(t, s) : t, r = e.length - 1, n; r >= 0; r--)
    (n = e[r]) && (o = (i ? n(t, s, o) : n(o)) || o);
  return i && o && Rs(t, s, o), o;
};
let W = class extends m {
  constructor() {
    super(...arguments), this.items = [], this.selectedId = "", this.qty = 1, this.busy = !1;
  }
  connectedCallback() {
    super.connectedCallback(), this.load();
  }
  updated(e) {
    e.has("product") && this.load();
  }
  async load() {
    if (!this.product) return;
    const e = await this.appState.api.listItems({ product_id: this.product.id });
    this.items = se(e.items), this.selectedId = this.items[0]?.id ?? "", this.qty = 1;
  }
  async confirm() {
    if (!this.selectedId || this.busy) return;
    this.busy = !0;
    const e = this.product?.name ?? "";
    try {
      const t = this.items.find((s) => s.id === this.selectedId);
      t && this.qty <= t.quantity ? await this.appState.api.consume(this.selectedId, this.qty) : await this.appState.api.consumeFefo(this.product.id, this.qty), this.dispatchEvent(
        new CustomEvent("dispensed", { detail: { name: e, qty: this.qty } })
      );
    } finally {
      this.busy = !1;
    }
  }
  render() {
    if (!this.product) return d``;
    const e = vt(), t = Ls(this.items, this.selectedId), s = this.items.find((i) => i.id === this.selectedId)?.quantity ?? 1;
    return d`<div class="wrap">
      <div class="head">
        <span class="glyph" aria-hidden="true">${N(this.product.emoji, this.product.category)}</span>
        <div>
          <div class="name">${this.product.name}</div>
          <div class="sub">${Q(this.items.length)}</div>
        </div>
      </div>

      <div>
        <div class="field-label">${a("sheet.batches_fefo")}</div>
        <div class="list">
          ${this.items.map((i, o) => {
      const r = [
        o === 0 ? a("sheet.oldest") : "",
        i.opened ? a("sheet.opened_tag") : ""
      ].filter(Boolean).join(" · ");
      return d`<button
              class="batch ${i.id === this.selectedId ? "selected" : ""}"
              @click=${() => {
        this.selectedId = i.id, this.qty = 1;
      }}
            >
              <spz-freshness-badge .status=${i.status} .date=${i.best_before}
                .precision=${i.best_before_precision} .daysLeft=${i.days_left}></spz-freshness-badge>
              <div class="info">
                <div class="qty">${i.quantity} ${a("unit." + i.unit)}</div>
                <div class="tag">${r}</div>
              </div>
              ${i.id === this.selectedId ? d`<span style="color:var(--spz-primary);font-size:20px">●</span>` : ""}
            </button>`;
    })}
        </div>
      </div>

      ${t ? d`<div class="anti">⚠️ ${a("sheet.anti_waste", { date: Pt(t.best_before, t.best_before_precision, e) })}</div>` : ""}

      <div>
        <div class="field-label">${a("add.quantity")}</div>
        <spz-qty-stepper .value=${this.qty} min="1" .max=${Math.max(s, this.qty)} step="1"
          @value-changed=${(i) => this.qty = i.detail.value}></spz-qty-stepper>
      </div>

      <button class="btn btn-primary btn-block" ?disabled=${this.busy} @click=${this.confirm}>
        ${a("dashboard.quick_consume")}
      </button>
    </div>`;
  }
};
W.styles = [C, j, g`
    :host { display: block; }
    .wrap { display: flex; flex-direction: column; gap: 16px; }
    .head {
      background: var(--spz-card); border: 1px solid var(--spz-divider);
      border-radius: var(--spz-radius); padding: 16px; display: flex; align-items: center; gap: 14px;
    }
    .head .glyph { font-size: 36px; }
    .head .name { font-size: 18px; font-weight: 500; color: var(--spz-text); }
    .head .sub { font-size: 13px; color: var(--spz-text-2); }
    .batch {
      display: flex; align-items: center; gap: 12px; width: 100%; cursor: pointer;
      border: 1px solid var(--spz-divider); border-radius: 12px; padding: 12px 14px;
      background: var(--spz-card); color: var(--spz-text); font-family: inherit; text-align: left;
    }
    .batch.selected { border-color: var(--spz-primary); }
    .batch .info { flex: 1; }
    .batch .qty { font-size: 14px; font-weight: 500; }
    .batch .tag { font-size: 12px; color: var(--spz-text-2); }
    .anti {
      display: flex; align-items: center; gap: 10px; font-size: 13px; color: var(--spz-text);
      background: color-mix(in srgb, var(--spz-card) 80%, var(--spz-warning) 20%);
      border: 1px solid var(--spz-warning); border-radius: 10px; padding: 12px;
    }
    .list { display: flex; flex-direction: column; gap: 10px; }
  `];
dt([
  p({ attribute: !1 })
], W.prototype, "appState", 2);
dt([
  p({ attribute: !1 })
], W.prototype, "product", 2);
dt([
  c()
], W.prototype, "items", 2);
dt([
  c()
], W.prototype, "selectedId", 2);
dt([
  c()
], W.prototype, "qty", 2);
dt([
  c()
], W.prototype, "busy", 2);
W = dt([
  b("spz-dispense-form")
], W);
var Us = Object.defineProperty, Fs = Object.getOwnPropertyDescriptor, ie = (e, t, s, i) => {
  for (var o = i > 1 ? void 0 : i ? Fs(t, s) : t, r = e.length - 1, n; r >= 0; r--)
    (n = e[r]) && (o = (i ? n(t, s, o) : n(o)) || o);
  return i && o && Us(t, s, o), o;
};
let jt = class extends m {
  constructor() {
    super(...arguments), this.selected = "", this.includeAll = !0;
  }
  pick(e) {
    this.selected = e, this.dispatchEvent(
      new CustomEvent("category-changed", { detail: { category: e } })
    );
  }
  render() {
    return d`<div class="row">
      ${this.includeAll ? d`<button
            class=${this.selected === "" ? "active" : ""}
            @click=${() => this.pick("")}
          >
            ${a("common.all")}
          </button>` : ""}
      ${Ce.map(
      (e) => d`<button
          class=${this.selected === e ? "active" : ""}
          @click=${() => this.pick(e)}
        >
          ${lt[e]} ${a("cat." + e)}
        </button>`
    )}
    </div>`;
  }
};
jt.styles = g`
    .row {
      display: flex;
      gap: 8px;
      overflow-x: auto;
      padding-bottom: 2px;
      scrollbar-width: thin;
    }
    button {
      font-family: inherit;
      cursor: pointer;
      border-radius: 999px;
      padding: 8px 14px;
      font-size: 13px;
      font-weight: 500;
      white-space: nowrap;
      border: 1px solid var(--divider-color, rgba(225, 225, 225, 0.12));
      background: var(--card-background-color, #1c1c1c);
      color: var(--primary-text-color, #e1e1e1);
    }
    button.active {
      background: color-mix(
        in srgb,
        var(--card-background-color, #1c1c1c) 82%,
        var(--primary-color, #03a9f4) 18%
      );
      border-color: var(--primary-color, #03a9f4);
      color: var(--primary-color, #03a9f4);
    }
  `;
ie([
  p()
], jt.prototype, "selected", 2);
ie([
  p({ type: Boolean })
], jt.prototype, "includeAll", 2);
jt = ie([
  b("spz-category-chips")
], jt);
var Hs = Object.defineProperty, Vs = Object.getOwnPropertyDescriptor, It = (e, t, s, i) => {
  for (var o = i > 1 ? void 0 : i ? Vs(t, s) : t, r = e.length - 1, n; r >= 0; r--)
    (n = e[r]) && (o = (i ? n(t, s, o) : n(o)) || o);
  return i && o && Hs(t, s, o), o;
};
let nt = class extends m {
  constructor() {
    super(...arguments), this.products = [], this.query = "", this.category = "";
  }
  connectedCallback() {
    super.connectedCallback(), this.load();
  }
  async load() {
    const e = await this.appState.api.listProducts({
      query: this.query || void 0,
      category: this.category || void 0,
      limit: 60
    });
    this.products = e.products;
  }
  onQuery(e) {
    this.query = e.target.value, clearTimeout(this.timer), this.timer = window.setTimeout(() => this.load(), 250);
  }
  pick(e) {
    this.dispatchEvent(new CustomEvent("product-picked", { detail: { product: e } }));
  }
  render() {
    return d`
      <div class="title">${a("add_menu.catalog")}</div>
      <input class="search" placeholder=${a("catalog.search")} .value=${this.query} @input=${this.onQuery} />
      <spz-category-chips .selected=${this.category}
        @category-changed=${(e) => {
      this.category = e.detail.category, this.load();
    }}></spz-category-chips>
      <div class="list" style="margin-top:12px">
        ${this.products.map(
      (e) => d`<button class="row" @click=${() => this.pick(e)}>
            <span class="glyph" aria-hidden="true">${N(e.emoji, e.category)}</span>
            <div style="flex:1;min-width:0">
              <div class="name">${e.name}</div>
              <div class="cat">${a("cat." + e.category)}</div>
            </div>
            <span style="color:var(--spz-text-2)">›</span>
          </button>`
    )}
      </div>
    `;
  }
};
nt.styles = [C, j, g`
    :host { display: block; }
    .search { margin-bottom: 12px; }
    .row {
      display: flex; align-items: center; gap: 14px; width: 100%; cursor: pointer;
      background: var(--spz-card); border: 1px solid var(--spz-divider); border-radius: 12px;
      padding: 12px 14px; color: var(--spz-text); font-family: inherit; text-align: left;
      margin-bottom: 8px;
    }
    .row .glyph { font-size: 28px; }
    .row .name { font-size: 15px; font-weight: 500; }
    .row .cat { font-size: 13px; color: var(--spz-text-2); }
    .title { font-size: 18px; font-weight: 500; margin-bottom: 12px; }
    .list { max-height: 52vh; overflow-y: auto; }
  `];
It([
  p({ attribute: !1 })
], nt.prototype, "appState", 2);
It([
  c()
], nt.prototype, "products", 2);
It([
  c()
], nt.prototype, "query", 2);
It([
  c()
], nt.prototype, "category", 2);
nt = It([
  b("spz-product-picker")
], nt);
var Ws = Object.defineProperty, Gs = Object.getOwnPropertyDescriptor, E = (e, t, s, i) => {
  for (var o = i > 1 ? void 0 : i ? Gs(t, s) : t, r = e.length - 1, n; r >= 0; r--)
    (n = e[r]) && (o = (i ? n(t, s, o) : n(o)) || o);
  return i && o && Ws(t, s, o), o;
};
const Ys = ["szt", "słoik", "butelka", "puszka", "opak", "kg", "g", "l", "ml"];
let k = class extends m {
  constructor() {
    super(...arguments), this.presetName = "", this.presetBarcode = "", this.name = "", this.category = "other", this.emoji = "", this.unit = "szt", this.shelfLife = null, this.minStock = null, this.notes = "", this.busy = !1;
  }
  connectedCallback() {
    super.connectedCallback(), this.existing ? (this.name = this.existing.name, this.category = this.existing.category, this.emoji = this.existing.emoji, this.unit = this.existing.default_unit, this.shelfLife = this.existing.default_shelf_life_days, this.minStock = this.existing.min_stock, this.notes = this.existing.notes) : this.presetName && (this.name = this.presetName);
  }
  async save() {
    if (!(!this.name.trim() || this.busy)) {
      this.busy = !0;
      try {
        const e = {
          name: this.name.trim(),
          category: this.category,
          emoji: this.emoji || lt[this.category],
          default_unit: this.unit,
          default_shelf_life_days: this.shelfLife,
          min_stock: this.minStock,
          notes: this.notes,
          barcodes: this.presetBarcode ? [this.presetBarcode] : void 0
        };
        let t;
        this.existing ? t = (await this.appState.api.updateProduct(this.existing.id, e)).product : t = (await this.appState.api.createProduct(e)).product, this.dispatchEvent(new CustomEvent("saved", { detail: { product: t } }));
      } finally {
        this.busy = !1;
      }
    }
  }
  render() {
    const e = [lt[this.category], "🫙", "🥫", "🍯", "🌾", "🧂"];
    return d`<div class="wrap">
      <div class="title">${this.existing ? a("common.edit") : a("add_menu.new")}</div>

      <div>
        <div class="field-label">${a("product.name")}</div>
        <input .value=${this.name} @input=${(t) => this.name = t.target.value} />
      </div>

      <div>
        <div class="field-label">${a("product.category")}</div>
        <spz-category-chips .selected=${this.category} .includeAll=${!1}
          @category-changed=${(t) => this.category = t.detail.category || Ce[0]}></spz-category-chips>
      </div>

      <div>
        <div class="field-label">${a("product.emoji")}</div>
        <input .value=${this.emoji} placeholder=${lt[this.category]}
          @input=${(t) => this.emoji = t.target.value} />
        <div class="emoji-suggest">
          ${e.map(
      (t) => d`<button class=${this.emoji === t ? "active" : ""} @click=${() => this.emoji = t}>${t}</button>`
    )}
        </div>
      </div>

      <div>
        <div class="field-label">${a("product.default_unit")}</div>
        <select @change=${(t) => this.unit = t.target.value}>
          ${Ys.map((t) => d`<option value=${t} ?selected=${t === this.unit}>${a("unit." + t)}</option>`)}
        </select>
      </div>

      <div>
        <div class="field-label">${a("product.shelf_life")}</div>
        <input type="number" min="0" .value=${this.shelfLife ?? ""}
          @input=${(t) => {
      const s = t.target.value;
      this.shelfLife = s ? Number(s) : null;
    }} />
      </div>

      <div>
        <div class="field-label">${a("product.min_stock")}</div>
        <input type="number" min="0" step="0.1" .value=${this.minStock ?? ""}
          @input=${(t) => {
      const s = t.target.value;
      this.minStock = s ? Number(s) : null;
    }} />
      </div>

      <div>
        <div class="field-label">${a("product.notes")}</div>
        <textarea rows="2" .value=${this.notes}
          @input=${(t) => this.notes = t.target.value}></textarea>
      </div>

      <button class="btn btn-primary btn-block" ?disabled=${this.busy} @click=${this.save}>${a("common.save")}</button>
    </div>`;
  }
};
k.styles = [C, j, g`
    :host { display: block; }
    .wrap { display: flex; flex-direction: column; gap: 16px; }
    .title { font-size: 18px; font-weight: 500; }
    .emoji-suggest { display: flex; gap: 8px; flex-wrap: wrap; margin-top: 8px; }
    .emoji-suggest button {
      font-size: 22px; width: 44px; height: 44px; border-radius: 10px;
      border: 1px solid var(--spz-divider); background: var(--spz-card); cursor: pointer;
    }
    .emoji-suggest button.active { border-color: var(--spz-primary); }
    select { appearance: auto; }
  `];
E([
  p({ attribute: !1 })
], k.prototype, "appState", 2);
E([
  p({ attribute: !1 })
], k.prototype, "existing", 2);
E([
  p()
], k.prototype, "presetName", 2);
E([
  p({ attribute: !1 })
], k.prototype, "presetBarcode", 2);
E([
  c()
], k.prototype, "name", 2);
E([
  c()
], k.prototype, "category", 2);
E([
  c()
], k.prototype, "emoji", 2);
E([
  c()
], k.prototype, "unit", 2);
E([
  c()
], k.prototype, "shelfLife", 2);
E([
  c()
], k.prototype, "minStock", 2);
E([
  c()
], k.prototype, "notes", 2);
E([
  c()
], k.prototype, "busy", 2);
k = E([
  b("spz-product-form")
], k);
function Ae(e) {
  switch (e) {
    case "add":
      return "➕";
    case "consume":
      return "➖";
    case "move":
      return "↔️";
    case "adjust":
      return "✏️";
    case "open":
      return "🥄";
    case "delete":
      return "🗑️";
    case "expire_notice":
      return "⚠️";
    default:
      return "•";
  }
}
function qe(e) {
  const t = e.quantity_delta != null ? `${Math.abs(e.quantity_delta)}${e.unit ? " " + e.unit : ""}` : "", s = e.product_name || "";
  switch (e.type) {
    case "add":
      return a("history.add", { qty: t, product: s });
    case "consume":
      return a("history.consume", { qty: t, product: s });
    case "adjust":
      return a("history.adjust", { product: s });
    case "move":
      return a("history.move", { product: s });
    case "open":
      return a("history.open", { product: s });
    case "delete":
      return a("history.delete", { product: s });
    default:
      return s;
  }
}
var Qs = Object.defineProperty, Ks = Object.getOwnPropertyDescriptor, Ht = (e, t, s, i) => {
  for (var o = i > 1 ? void 0 : i ? Ks(t, s) : t, r = e.length - 1, n; r >= 0; r--)
    (n = e[r]) && (o = (i ? n(t, s, o) : n(o)) || o);
  return i && o && Qs(t, s, o), o;
};
let ft = class extends m {
  constructor() {
    super(...arguments), this.emoji = "📦", this.heading = "", this.description = "";
  }
  render() {
    return d`
      <div class="emoji" aria-hidden="true">${this.emoji}</div>
      <div class="heading">${this.heading}</div>
      ${this.description ? d`<div class="desc">${this.description}</div>` : ""}
      <div class="actions"><slot></slot></div>
    `;
  }
};
ft.styles = g`
    :host {
      display: flex;
      flex-direction: column;
      align-items: center;
      text-align: center;
      gap: 8px;
      padding: 40px 24px;
    }
    .emoji {
      font-size: 56px;
      line-height: 1;
      margin-bottom: 8px;
    }
    .heading {
      font-size: 18px;
      font-weight: 500;
      color: var(--primary-text-color, #e1e1e1);
    }
    .desc {
      font-size: 14px;
      color: var(--secondary-text-color, #9b9b9b);
      max-width: 320px;
    }
    .actions {
      display: flex;
      gap: 10px;
      margin-top: 12px;
      flex-wrap: wrap;
      justify-content: center;
    }
  `;
Ht([
  p()
], ft.prototype, "emoji", 2);
Ht([
  p()
], ft.prototype, "heading", 2);
Ht([
  p()
], ft.prototype, "description", 2);
ft = Ht([
  b("spz-empty-state")
], ft);
var Zs = Object.defineProperty, Js = Object.getOwnPropertyDescriptor, oe = (e, t, s, i) => {
  for (var o = i > 1 ? void 0 : i ? Js(t, s) : t, r = e.length - 1, n; r >= 0; r--)
    (n = e[r]) && (o = (i ? n(t, s, o) : n(o)) || o);
  return i && o && Zs(t, s, o), o;
};
let Et = class extends m {
  constructor() {
    super(...arguments), this.narrow = !0;
  }
  connectedCallback() {
    super.connectedCallback(), this.unsub = this.appState.subscribe(() => this.requestUpdate());
  }
  disconnectedCallback() {
    super.disconnectedCallback(), this.unsub?.();
  }
  goStatus(e) {
    window.dispatchEvent(new CustomEvent("spz-status-filter", { detail: { status: e } }));
  }
  render() {
    const e = this.appState.overview;
    if (!e) return d`<div class="wrap">${this.skeleton()}</div>`;
    const t = e.stats, s = this.appState.settings?.expiring_soon_days ?? 30, i = vt(), o = [];
    return t.expired > 0 && o.push({
      ico: "🔴",
      num: t.expired,
      color: "var(--spz-error)",
      lbl: a("dashboard.expired"),
      status: "expired"
    }), t.expiring_soon > 0 && o.push({
      ico: "🟠",
      num: t.expiring_soon,
      color: "var(--spz-warning)",
      lbl: a("dashboard.expiring", { days: s }),
      status: "expiring_soon"
    }), t.low_stock > 0 && o.push({
      ico: "🛒",
      num: t.low_stock,
      color: "var(--spz-info)",
      lbl: a("dashboard.low_stock"),
      status: "low_stock"
    }), d`<div class="wrap">
      ${o.length ? d`<div class="alerts">
            ${o.map(
      (r) => d`<button class="alert" style="border-left:4px solid ${r.color}"
                @click=${() => this.goStatus(r.status)}>
                <span class="ico">${r.ico}</span>
                <div style="flex:1;min-width:0;">
                  <div class="num" style="color:${r.color}">${r.num}</div>
                  <div class="lbl">${r.lbl}</div>
                </div>
                <span class="chev">›</span>
              </button>`
    )}
          </div>` : d`<div class="alert" style="border-left:4px solid var(--spz-success)">
            <span class="ico">✅</span>
            <div>
              <div class="num" style="color:var(--spz-success)">${a("dashboard.all_fresh")}</div>
              <div class="lbl">${a("dashboard.all_fresh_sub")}</div>
            </div>
          </div>`}

      <div class="quick">
        <button @click=${() => z("scan")}><span class="ico">📷</span>${a("dashboard.quick_scan")}</button>
        <button @click=${() => z("add")}><span class="ico">➕</span>${a("dashboard.quick_add")}</button>
        <button @click=${() => window.dispatchEvent(new CustomEvent("spz-consume-scan"))}>
          <span class="ico">➖</span>${a("dashboard.quick_consume")}
        </button>
      </div>

      <div>
        <div class="section-label">${a("dashboard.rooms")}</div>
        <div class="rooms">
          ${e.rooms.map(
      (r) => d`<button class="room" @click=${() => z("room", r.id)}>
              <div class="top">
                <ha-icon icon=${r.icon}></ha-icon>
                <div class="dots">
                  ${r.expired ? d`<span class="dot exp">${r.expired}</span>` : ""}
                  ${r.expiring ? d`<span class="dot soon">${r.expiring}</span>` : ""}
                </div>
              </div>
              <div class="name">${r.name}</div>
              <div class="meta">${Q(r.item_count)} · ${r.shelf_count} ${Pe(r.shelf_count, ["półka", "półki", "półek"])}</div>
            </button>`
    )}
          <button class="new-room" @click=${() => window.dispatchEvent(new CustomEvent("spz-new-room"))}>
            ${a("dashboard.new_room")}
          </button>
        </div>
      </div>

      <div class="card">
        <div class="activity-head">
          <div class="section-title" style="margin-bottom:0">${a("dashboard.activity")}</div>
          <a href="#" @click=${(r) => {
      r.preventDefault(), z("history");
    }}>${a("dashboard.all_history")}</a>
        </div>
        ${e.recent_history.length ? e.recent_history.map((r) => d`<div class="act-row">
              <span class="act-ico">${Ae(r.type)}</span>
              <div style="flex:1;min-width:0;">
                <div class="act-text">${qe(r)}</div>
                <div class="act-meta">${je(r.ts, i)}${r.user_name ? ` · ${r.user_name}` : ""}</div>
              </div>
            </div>`) : d`<div class="act-meta" style="padding:11px 0">${a("history.empty")}</div>`}
      </div>
    </div>`;
  }
  skeleton() {
    return d`<div class="card" style="height:72px"></div>
      <div class="card" style="height:88px"></div>
      <div class="card" style="height:160px"></div>`;
  }
};
Et.styles = [C, j, g`
    :host { display: block; }
    .wrap { display: flex; flex-direction: column; gap: 20px; }
    .alerts { display: grid; gap: 12px; }
    .alert {
      text-align: left; cursor: pointer; display: flex; align-items: center; gap: 12px;
      border: 1px solid var(--spz-divider); border-radius: var(--spz-radius);
      padding: 14px 16px; background: var(--spz-card);
      font-family: inherit;
    }
    .alert .num { font-size: 20px; font-weight: 700; line-height: 1; }
    .alert .lbl { font-size: 13px; color: var(--spz-text-2); margin-top: 3px; }
    .alert .ico { font-size: 22px; }
    .alert .chev { margin-left: auto; color: var(--spz-text-2); font-size: 20px; }
    .quick { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; }
    .quick button {
      cursor: pointer; border: 1px solid var(--spz-divider); border-radius: var(--spz-radius);
      background: var(--spz-card); color: var(--spz-text); padding: 16px 8px;
      display: flex; flex-direction: column; align-items: center; gap: 8px;
      font-family: inherit; font-size: 14px; font-weight: 500; min-height: 48px;
    }
    .quick .ico { font-size: 24px; }
    .rooms { display: grid; grid-template-columns: repeat(2, 1fr); gap: 12px; }
    .room {
      text-align: left; cursor: pointer; border: 1px solid var(--spz-divider);
      border-radius: var(--spz-radius); background: var(--spz-card); padding: 16px;
      display: flex; flex-direction: column; gap: 10px; font-family: inherit;
    }
    .room .top { display: flex; align-items: center; gap: 10px; }
    .room ha-icon { --mdc-icon-size: 26px; color: var(--spz-text); }
    .room .name { font-size: 16px; font-weight: 500; color: var(--spz-text); }
    .room .meta { font-size: 13px; color: var(--spz-text-2); }
    .dots { display: flex; gap: 5px; margin-left: auto; }
    .dot { display: inline-flex; align-items: center; font-size: 11px; font-weight: 700;
      border-radius: 999px; padding: 2px 7px; }
    .dot.exp { color: var(--spz-error); background: color-mix(in srgb, transparent 86%, var(--spz-error) 14%); }
    .dot.soon { color: var(--spz-warning); background: color-mix(in srgb, transparent 86%, var(--spz-warning) 14%); }
    .new-room {
      cursor: pointer; border: 1.5px dashed var(--spz-divider); border-radius: var(--spz-radius);
      background: transparent; color: var(--spz-text-2); padding: 16px;
      display: flex; align-items: center; justify-content: center; gap: 8px;
      font-size: 14px; min-height: 88px; font-family: inherit;
    }
    .activity-head { display: flex; align-items: center; margin-bottom: 6px; }
    .activity-head a { margin-left: auto; font-size: 13px; }
    .act-row { display: flex; align-items: center; gap: 12px; padding: 11px 0; border-top: 1px solid var(--spz-divider); }
    .act-ico { width: 34px; height: 34px; flex: none; border-radius: 50%; display: flex;
      align-items: center; justify-content: center; font-size: 16px; background: var(--spz-bg-2); }
    .act-text { font-size: 14px; color: var(--spz-text); line-height: 1.3; }
    .act-meta { font-size: 12px; color: var(--spz-text-2); }
    @media (min-width: 700px) {
      .rooms { grid-template-columns: repeat(3, 1fr); }
      .alerts { grid-template-columns: repeat(3, 1fr); }
    }
  `];
oe([
  p({ attribute: !1 })
], Et.prototype, "appState", 2);
oe([
  p({ type: Boolean })
], Et.prototype, "narrow", 2);
Et = oe([
  b("spz-view-dashboard")
], Et);
var Xs = Object.defineProperty, ti = Object.getOwnPropertyDescriptor, O = (e, t, s, i) => {
  for (var o = i > 1 ? void 0 : i ? ti(t, s) : t, r = e.length - 1, n; r >= 0; r--)
    (n = e[r]) && (o = (i ? n(t, s, o) : n(o)) || o);
  return i && o && Xs(t, s, o), o;
};
let S = class extends m {
  constructor() {
    super(...arguments), this.name = "", this.emoji = "", this.image = null, this.category = "other", this.qtyLabel = "", this.status = "ok", this.date = null, this.precision = "day", this.daysLeft = null, this.opened = !1, this.group = !1, this.groupInfo = "";
  }
  open() {
    this.dispatchEvent(new CustomEvent("tile-open"));
  }
  minus(e) {
    e.stopPropagation(), this.dispatchEvent(new CustomEvent("tile-minus"));
  }
  render() {
    return d`
      <div
        class="tile"
        style="background:${te(this.category)}"
        @click=${this.open}
      >
        <spz-freshness-badge
          class="badge"
          .status=${this.status}
          .date=${this.date}
          .precision=${this.precision}
          .daysLeft=${this.daysLeft}
        ></spz-freshness-badge>
        ${this.image ? d`<img class="img" src=${this.image} alt="" aria-hidden="true" />` : d`<div class="glyph" aria-hidden="true">
              ${N(this.emoji, this.category)}
            </div>`}
        <div class="name">${this.name}</div>
        <div class="qty-row">
          <span>${this.qtyLabel}</span>
          ${this.opened ? d`<span class="opened">· 🥄</span>` : ""}
        </div>
        ${this.group ? d`<div class="group-info">${this.groupInfo}</div>` : ""}
        <button class="minus" aria-label="−1" @click=${this.minus}>−</button>
      </div>
    `;
  }
};
S.styles = g`
    .tile {
      position: relative;
      cursor: pointer;
      border: 1px solid var(--divider-color, rgba(225, 225, 225, 0.12));
      border-radius: var(--ha-card-border-radius, 12px);
      padding: 12px;
      display: flex;
      flex-direction: column;
      gap: 8px;
      min-height: 150px;
    }
    .badge {
      position: absolute;
      top: 10px;
      right: 10px;
    }
    .glyph {
      font-size: 40px;
      line-height: 1;
    }
    .img {
      width: 44px;
      height: 44px;
      border-radius: 8px;
      object-fit: cover;
    }
    .name {
      font-size: 14px;
      font-weight: 500;
      color: var(--primary-text-color, #e1e1e1);
      line-height: 1.25;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }
    .qty-row {
      margin-top: auto;
      display: flex;
      align-items: center;
      gap: 6px;
      flex-wrap: wrap;
      font-size: 14px;
      font-weight: 500;
      color: var(--primary-text-color, #e1e1e1);
    }
    .opened {
      font-size: 11px;
      color: var(--secondary-text-color, #9b9b9b);
    }
    .group-info {
      font-size: 11px;
      color: var(--secondary-text-color, #9b9b9b);
    }
    .minus {
      position: absolute;
      bottom: 10px;
      right: 10px;
      width: 32px;
      height: 32px;
      border-radius: 50%;
      border: 1px solid var(--divider-color, rgba(225, 225, 225, 0.12));
      background: var(--card-background-color, #1c1c1c);
      color: var(--primary-text-color, #e1e1e1);
      font-size: 18px;
      font-weight: 700;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      line-height: 1;
    }
  `;
O([
  p()
], S.prototype, "name", 2);
O([
  p()
], S.prototype, "emoji", 2);
O([
  p()
], S.prototype, "image", 2);
O([
  p()
], S.prototype, "category", 2);
O([
  p()
], S.prototype, "qtyLabel", 2);
O([
  p()
], S.prototype, "status", 2);
O([
  p()
], S.prototype, "date", 2);
O([
  p()
], S.prototype, "precision", 2);
O([
  p({ type: Number })
], S.prototype, "daysLeft", 2);
O([
  p({ type: Boolean })
], S.prototype, "opened", 2);
O([
  p({ type: Boolean })
], S.prototype, "group", 2);
O([
  p()
], S.prototype, "groupInfo", 2);
S = O([
  b("spz-product-tile")
], S);
var ei = Object.defineProperty, si = Object.getOwnPropertyDescriptor, T = (e, t, s, i) => {
  for (var o = i > 1 ? void 0 : i ? si(t, s) : t, r = e.length - 1, n; r >= 0; r--)
    (n = e[r]) && (o = (i ? n(t, s, o) : n(o)) || o);
  return i && o && ei(t, s, o), o;
};
let P = class extends m {
  constructor() {
    super(...arguments), this.shelfId = "", this.narrow = !0, this.items = [], this.category = "", this.grouped = !0, this.sort = "date", this.consumeQty = 1, this.loading = !0, this.lastSignal = -1;
  }
  connectedCallback() {
    super.connectedCallback(), this.unsub = this.appState.subscribe(() => {
      this.appState.changeSignal !== this.lastSignal && (this.lastSignal = this.appState.changeSignal, this.load());
    }), this.load();
  }
  disconnectedCallback() {
    super.disconnectedCallback(), this.unsub?.();
  }
  updated(e) {
    e.has("shelfId") && this.load();
  }
  async load() {
    this.loading = !0;
    const e = await this.appState.api.listItems({ shelf_id: this.shelfId });
    this.items = e.items, this.loading = !1;
  }
  filtered() {
    let e = this.items;
    return this.category && (e = e.filter((t) => t.product?.category === this.category)), e;
  }
  buildGroups() {
    const e = /* @__PURE__ */ new Map();
    for (const s of this.filtered()) {
      const i = s.product_id;
      let o = e.get(i);
      o || (o = {
        key: i,
        productId: i,
        name: s.product?.name ?? "",
        emoji: s.product?.emoji ?? "",
        image: s.product?.image ?? null,
        category: s.product?.category ?? "other",
        unit: s.unit,
        totalQty: 0,
        items: [],
        first: s
      }, e.set(i, o)), o.totalQty += s.quantity, o.items.push(s);
    }
    for (const s of e.values())
      s.items = se(s.items), s.first = s.items[0];
    const t = [...e.values()];
    return this.sortGroups(t);
  }
  sortGroups(e) {
    const t = (s) => ({ expired: 0, expiring_soon: 1, ok: 2, no_date: 3 })[s.first.status] ?? 9;
    return e.sort((s, i) => {
      switch (this.sort) {
        case "name":
          return s.name.localeCompare(i.name);
        case "qty":
          return i.totalQty - s.totalQty;
        case "added":
          return i.first.added_at.localeCompare(s.first.added_at);
        default:
          return t(s) - t(i) || (s.first.best_before ?? "9").localeCompare(i.first.best_before ?? "9");
      }
    });
  }
  cycleSort() {
    const e = ["date", "name", "qty", "added"];
    this.sort = e[(e.indexOf(this.sort) + 1) % e.length];
  }
  sortLabel() {
    return a("shelf.sort_" + this.sort);
  }
  async quickMinus(e) {
    const t = e.product?.name ?? "";
    await this.appState.api.consume(e.id, 1), wt(a("toast.consumed", { product: t, qty: 1 }), async () => {
      await this.appState.api.addItem({
        product_id: e.product_id,
        shelf_id: e.shelf_id,
        quantity: 1,
        unit: e.unit,
        best_before: e.best_before,
        best_before_precision: e.best_before_precision
      });
    });
  }
  openGroup(e) {
    e.items.length === 1 ? (this.sheetItem = e.items[0], this.sheetGroup = void 0) : (this.sheetGroup = e, this.sheetItem = void 0), this.consumeQty = 1;
  }
  openBatch(e) {
    this.sheetItem = e, this.sheetGroup = void 0, this.consumeQty = 1;
  }
  closeSheet() {
    this.sheetItem = void 0, this.sheetGroup = void 0;
  }
  async confirmConsume() {
    const e = this.sheetItem;
    if (!e) return;
    const t = e.product?.name ?? "", s = this.consumeQty;
    await this.appState.api.consume(e.id, s), this.closeSheet(), wt(a("toast.consumed", { product: t, qty: s }), async () => {
      await this.appState.api.addItem({
        product_id: e.product_id,
        shelf_id: e.shelf_id,
        quantity: s,
        unit: e.unit,
        best_before: e.best_before,
        best_before_precision: e.best_before_precision
      });
    });
  }
  async toggleOpened() {
    if (!this.sheetItem) return;
    const e = await this.appState.api.setOpened(this.sheetItem.id, !this.sheetItem.opened);
    this.sheetItem = e.item;
  }
  async deleteItem() {
    if (!this.sheetItem) return;
    const e = this.sheetItem.product?.name ?? "";
    await this.appState.api.deleteItem(this.sheetItem.id), this.closeSheet(), wt(a("toast.deleted", { product: e }));
  }
  render() {
    const e = vt(), t = this.buildGroups();
    return d`<div class="wrap">
      <div class="toolbar">
        <div class="toolbar-top">
          <button class="sort-btn" @click=${this.cycleSort}>${a("shelf.sort")}: ${this.sortLabel()} ▾</button>
          <label class="group-toggle" @click=${() => this.grouped = !this.grouped}>
            <span class="switch ${this.grouped ? "on" : ""}"><span class="knob"></span></span>
            ${a("shelf.group")}
          </label>
        </div>
        <spz-category-chips .selected=${this.category}
          @category-changed=${(s) => this.category = s.detail.category}></spz-category-chips>
      </div>

      ${this.loading ? d`<div class="grid">${[1, 2, 3, 4].map(() => d`<div class="card" style="height:150px"></div>`)}</div>` : this.items.length === 0 ? d`<spz-empty-state emoji="🫙" heading=${a("shelf.empty_title")} description=${a("shelf.empty_sub")}>
            <button class="btn btn-primary" @click=${() => this.dispatchEvent(new CustomEvent("scan-here", { detail: { shelfId: this.shelfId }, bubbles: !0, composed: !0 }))}>📷 ${a("shelf.scan")}</button>
            <button class="btn" @click=${() => this.dispatchEvent(new CustomEvent("add-here", { detail: { shelfId: this.shelfId }, bubbles: !0, composed: !0 }))}>${a("shelf.from_catalog")}</button>
          </spz-empty-state>` : this.grouped ? this.renderGrid(t) : this.renderFlat()}

      ${this.renderSheet(e)}
    </div>`;
  }
  renderGrid(e) {
    return d`<div class="grid">
      ${e.map(
      (t) => d`<spz-product-tile
          .name=${t.name}
          .emoji=${t.emoji}
          .image=${t.image}
          .category=${t.category}
          .qtyLabel=${`${t.totalQty} ${a("unit." + t.unit)}`}
          .status=${t.first.status}
          .date=${t.first.best_before}
          .precision=${t.first.best_before_precision}
          .daysLeft=${t.first.days_left}
          .opened=${t.first.opened}
          .group=${t.items.length > 1}
          .groupInfo=${a("shelf.group_info", { qty: `${t.totalQty} ${a("unit." + t.unit)}`, batches: Q(t.items.length) })}
          @tile-open=${() => this.openGroup(t)}
          @tile-minus=${() => this.quickMinus(t.first)}
        ></spz-product-tile>`
    )}
    </div>`;
  }
  renderFlat() {
    const e = this.appState ? this.sortFlat(this.filtered()) : [];
    return d`<div class="grid">
      ${e.map(
      (t) => d`<spz-product-tile
          .name=${t.product?.name ?? ""}
          .emoji=${t.product?.emoji ?? ""}
          .image=${t.product?.image ?? null}
          .category=${t.product?.category ?? "other"}
          .qtyLabel=${`${t.quantity} ${a("unit." + t.unit)}`}
          .status=${t.status}
          .date=${t.best_before}
          .precision=${t.best_before_precision}
          .daysLeft=${t.days_left}
          .opened=${t.opened}
          @tile-open=${() => this.openBatch(t)}
          @tile-minus=${() => this.quickMinus(t)}
        ></spz-product-tile>`
    )}
    </div>`;
  }
  sortFlat(e) {
    const t = (s) => ({ expired: 0, expiring_soon: 1, ok: 2, no_date: 3 })[s.status] ?? 9;
    return [...e].sort((s, i) => {
      switch (this.sort) {
        case "name":
          return (s.product?.name ?? "").localeCompare(i.product?.name ?? "");
        case "qty":
          return i.quantity - s.quantity;
        case "added":
          return i.added_at.localeCompare(s.added_at);
        default:
          return t(s) - t(i) || (s.best_before ?? "9").localeCompare(i.best_before ?? "9");
      }
    });
  }
  renderSheet(e) {
    if (this.sheetGroup) {
      const s = this.sheetGroup;
      return d`<spz-bottom-sheet open .narrow=${this.narrow} @sheet-close=${this.closeSheet}>
        <div class="sheet-head">
          <span class="sheet-glyph" aria-hidden="true">${N(s.emoji, s.category)}</span>
          <div style="flex:1">
            <div class="sheet-name">${s.name}</div>
            <div class="sheet-loc">${s.totalQty} ${a("unit." + s.unit)} · ${Q(s.items.length)}</div>
          </div>
        </div>
        ${s.items.map(
        (i) => d`<button class="batch-row" style="width:100%;background:none;border:none;cursor:pointer;text-align:left" @click=${() => this.openBatch(i)}>
            <spz-freshness-badge .status=${i.status} .date=${i.best_before} .precision=${i.best_before_precision} .daysLeft=${i.days_left}></spz-freshness-badge>
            <div style="flex:1">
              <div class="fact-v">${i.quantity} ${a("unit." + i.unit)}</div>
              <div class="fact-k">${i.opened ? a("sheet.opened_tag") : ""}</div>
            </div>
            <span style="color:var(--spz-text-2)">›</span>
          </button>`
      )}
      </spz-bottom-sheet>`;
    }
    const t = this.sheetItem;
    return t ? d`<spz-bottom-sheet open .narrow=${this.narrow} @sheet-close=${this.closeSheet}>
      <div class="sheet-head">
        <span class="sheet-glyph" aria-hidden="true">${N(t.product?.emoji ?? "", t.product?.category ?? "other")}</span>
        <div style="flex:1">
          <div class="sheet-name">${t.product?.name ?? ""}</div>
          <div class="sheet-loc">${t.shelf_path ?? ""}</div>
        </div>
        <spz-freshness-badge .status=${t.status} .date=${t.best_before} .precision=${t.best_before_precision} .daysLeft=${t.days_left}></spz-freshness-badge>
      </div>
      <div class="facts">
        <div><div class="fact-k">${a("sheet.quantity")}</div><div class="fact-v">${t.quantity} ${a("unit." + t.unit)}</div></div>
        <div><div class="fact-k">${a("sheet.best_before")}</div><div class="fact-v">${Pt(t.best_before, t.best_before_precision, e)}</div></div>
        ${t.production_date ? d`<div><div class="fact-k">${a("sheet.production")}</div><div class="fact-v">${Pt(t.production_date, "day", e)}</div></div>` : ""}
        ${t.notes ? d`<div><div class="fact-k">${a("sheet.note")}</div><div class="fact-v">${t.notes}</div></div>` : ""}
      </div>
      <div class="field-label">${a("sheet.dispense_qty")}</div>
      <div style="margin-bottom:18px">
        <spz-qty-stepper .value=${this.consumeQty} min="1" .max=${t.quantity} step="1"
          @value-changed=${(s) => this.consumeQty = s.detail.value}></spz-qty-stepper>
      </div>
      <button class="btn btn-primary btn-block" @click=${this.confirmConsume}>${a("sheet.dispense", { qty: this.consumeQty })}</button>
      <div class="actions">
        <button class="btn" @click=${this.toggleOpened}>${t.opened ? a("sheet.close_pkg") : a("sheet.open")}</button>
        <button class="btn" @click=${() => this.dispatchEvent(new CustomEvent("move-item", { detail: { item: t }, bubbles: !0, composed: !0 }))}>${a("sheet.move")}</button>
        <button class="btn" style="color:var(--spz-error);border-color:var(--spz-error)" @click=${this.deleteItem}>${a("common.delete")}</button>
      </div>
    </spz-bottom-sheet>` : d``;
  }
};
P.styles = [C, j, g`
    :host { display: block; }
    .wrap { display: flex; flex-direction: column; gap: 16px; }
    .toolbar { display: flex; flex-direction: column; gap: 10px; }
    .toolbar-top { display: flex; align-items: center; gap: 10px; }
    .sort-btn {
      cursor: pointer; display: flex; align-items: center; gap: 6px;
      border: 1px solid var(--spz-divider); background: var(--spz-card); color: var(--spz-text);
      border-radius: 8px; padding: 8px 12px; font-size: 13px; font-weight: 500; font-family: inherit;
    }
    .group-toggle { display: flex; align-items: center; gap: 8px; margin-left: auto;
      font-size: 13px; color: var(--spz-text-2); cursor: pointer; }
    .switch { width: 34px; height: 20px; border-radius: 999px; position: relative;
      background: var(--spz-divider); transition: background .2s; }
    .switch.on { background: var(--spz-primary); }
    .knob { position: absolute; top: 2px; left: 2px; width: 16px; height: 16px;
      border-radius: 50%; background: #fff; transition: transform .2s; }
    .switch.on .knob { transform: translateX(14px); }
    .grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 12px; }
    @media (min-width: 700px) { .grid { grid-template-columns: repeat(4, 1fr); } }
    @media (min-width: 1000px) { .grid { grid-template-columns: repeat(5, 1fr); } }
    .sheet-head { display: flex; align-items: center; gap: 14px; margin-bottom: 16px; }
    .sheet-glyph { font-size: 44px; }
    .sheet-name { font-size: 20px; font-weight: 500; color: var(--spz-text); }
    .sheet-loc { font-size: 13px; color: var(--spz-text-2); }
    .facts { display: grid; grid-template-columns: 1fr 1fr; gap: 12px 20px;
      padding: 14px 0; border-top: 1px solid var(--spz-divider);
      border-bottom: 1px solid var(--spz-divider); margin-bottom: 18px; }
    .fact-k { font-size: 12px; color: var(--spz-text-2); }
    .fact-v { font-size: 15px; color: var(--spz-text); font-weight: 500; }
    .actions { display: flex; flex-wrap: wrap; gap: 10px; margin-top: 8px; }
    .actions .btn { flex: 1; min-width: 120px; }
    .batch-row { display: flex; align-items: center; gap: 12px; padding: 12px 0;
      border-top: 1px solid var(--spz-divider); }
  `];
T([
  p({ attribute: !1 })
], P.prototype, "appState", 2);
T([
  p()
], P.prototype, "shelfId", 2);
T([
  p({ type: Boolean })
], P.prototype, "narrow", 2);
T([
  c()
], P.prototype, "items", 2);
T([
  c()
], P.prototype, "category", 2);
T([
  c()
], P.prototype, "grouped", 2);
T([
  c()
], P.prototype, "sort", 2);
T([
  c()
], P.prototype, "sheetItem", 2);
T([
  c()
], P.prototype, "sheetGroup", 2);
T([
  c()
], P.prototype, "consumeQty", 2);
T([
  c()
], P.prototype, "loading", 2);
P = T([
  b("spz-view-shelf")
], P);
var ii = Object.defineProperty, oi = Object.getOwnPropertyDescriptor, J = (e, t, s, i) => {
  for (var o = i > 1 ? void 0 : i ? oi(t, s) : t, r = e.length - 1, n; r >= 0; r--)
    (n = e[r]) && (o = (i ? n(t, s, o) : n(o)) || o);
  return i && o && ii(t, s, o), o;
};
let B = class extends m {
  constructor() {
    super(...arguments), this.roomId = "", this.narrow = !0, this.shelves = [], this.loading = !0, this.addOpen = !1, this.addValue = "", this.lastSignal = -1;
  }
  connectedCallback() {
    super.connectedCallback(), this.unsub = this.appState.subscribe(() => {
      this.appState.changeSignal !== this.lastSignal && (this.lastSignal = this.appState.changeSignal, this.load());
    }), this.load();
  }
  disconnectedCallback() {
    super.disconnectedCallback(), this.unsub?.();
  }
  updated(e) {
    e.has("roomId") && this.load();
  }
  async load() {
    this.loading = !0;
    const e = await this.appState.api.listShelves(this.roomId);
    this.shelves = e.shelves, this.loading = !1;
  }
  async createShelf(e) {
    const t = e.trim();
    t && (await this.appState.api.createShelf(this.roomId, t), this.addOpen = !1, this.addValue = "", this.load());
  }
  quickChips() {
    return [
      a("room.shelf_top"),
      a("room.shelf_mid"),
      a("room.shelf_bottom"),
      a("room.shelf_rack")
    ];
  }
  render() {
    return this.loading && this.shelves.length === 0 ? d`<div class="wrap">
        ${[1, 2, 3].map(() => d`<div class="card" style="height:96px"></div>`)}
      </div>` : this.shelves.length === 0 ? d`<div class="wrap">
        <spz-empty-state emoji="🗄️" heading=${a("room.empty_title")} description=${a("room.empty_sub")}>
          <div class="empty-chips">
            ${this.quickChips().map(
      (e) => d`<button class="chip" @click=${() => this.createShelf(e)}>${e}</button>`
    )}
          </div>
        </spz-empty-state>
        ${this.renderSheet()}
      </div>` : d`<div class="wrap">
      ${this.shelves.map((e) => this.renderShelf(e))}
      <button class="add-shelf" @click=${() => this.addOpen = !0}>＋ ${a("room.add_shelf")}</button>
      ${this.renderSheet()}
    </div>`;
  }
  renderShelf(e) {
    const t = e.preview.slice(0, 8), s = e.preview.length > 8 ? e.preview.length - 8 : 0;
    return d`<button class="shelf" @click=${() => z("shelf", e.id)}>
      <div class="top">
        <span class="name">${e.name}</span>
        <div class="dots">
          ${e.expired ? d`<span class="dot exp">${e.expired}</span>` : ""}
          ${e.expiring ? d`<span class="dot soon">${e.expiring}</span>` : ""}
        </div>
        <span class="meta">${Q(e.item_count)}</span>
      </div>
      ${t.length ? d`<div class="preview">
            ${t.map(
      (i) => i.image ? d`<img src=${i.image} alt="" aria-hidden="true" />` : d`<span class="glyph" aria-hidden="true">${i.emoji}</span>`
    )}
            ${s ? d`<span class="more">+${s}</span>` : ""}
          </div>` : ""}
    </button>`;
  }
  renderSheet() {
    return this.addOpen ? d`<spz-bottom-sheet open .narrow=${this.narrow} @sheet-close=${() => this.addOpen = !1}>
      <div class="sheet-title">${a("room.add_shelf")}</div>
      <input
        type="text"
        .value=${this.addValue}
        placeholder=${a("room.shelf_name_placeholder")}
        @input=${(e) => this.addValue = e.target.value}
        @keydown=${(e) => {
      e.key === "Enter" && this.createShelf(this.addValue);
    }}
      />
      <div class="chips">
        ${this.quickChips().map(
      (e) => d`<button class="chip" @click=${() => this.addValue = e}>${e}</button>`
    )}
      </div>
      <button class="btn btn-primary btn-block" @click=${() => this.createShelf(this.addValue)}>
        ${a("common.add")}
      </button>
    </spz-bottom-sheet>` : d``;
  }
};
B.styles = [C, j, g`
    :host { display: block; }
    .wrap { display: flex; flex-direction: column; gap: 12px; }
    .shelf {
      text-align: left; cursor: pointer; width: 100%;
      border: 1px solid var(--spz-divider); border-radius: var(--spz-radius);
      background: var(--spz-card); padding: 16px; font-family: inherit;
      display: flex; flex-direction: column; gap: 12px;
    }
    .shelf .top { display: flex; align-items: center; gap: 10px; }
    .shelf .name { font-size: 16px; font-weight: 500; color: var(--spz-text); }
    .shelf .meta { font-size: 13px; color: var(--spz-text-2); margin-left: auto; }
    .dots { display: flex; gap: 5px; }
    .dot { display: inline-flex; align-items: center; font-size: 11px; font-weight: 700;
      border-radius: 999px; padding: 2px 7px; }
    .dot.exp { color: var(--spz-error); background: color-mix(in srgb, transparent 86%, var(--spz-error) 14%); }
    .dot.soon { color: var(--spz-warning); background: color-mix(in srgb, transparent 86%, var(--spz-warning) 14%); }
    .preview { display: flex; align-items: center; gap: 6px; }
    .preview .glyph { font-size: 22px; line-height: 1; }
    .preview img { width: 26px; height: 26px; border-radius: 6px; object-fit: cover; }
    .preview .more { font-size: 13px; color: var(--spz-text-2); font-weight: 500; margin-left: 2px; }
    .add-shelf {
      cursor: pointer; border: 1.5px dashed var(--spz-divider); border-radius: var(--spz-radius);
      background: transparent; color: var(--spz-text-2); padding: 16px;
      display: flex; align-items: center; justify-content: center; gap: 8px;
      font-size: 14px; min-height: 56px; font-family: inherit; width: 100%;
    }
    .sheet-title { font-size: 18px; font-weight: 500; color: var(--spz-text); margin-bottom: 14px; }
    .chips { display: flex; flex-wrap: wrap; gap: 8px; margin: 14px 0 18px; }
    .empty-chips { display: flex; flex-wrap: wrap; gap: 8px; justify-content: center; }
  `];
J([
  p({ attribute: !1 })
], B.prototype, "appState", 2);
J([
  p()
], B.prototype, "roomId", 2);
J([
  p({ type: Boolean })
], B.prototype, "narrow", 2);
J([
  c()
], B.prototype, "shelves", 2);
J([
  c()
], B.prototype, "loading", 2);
J([
  c()
], B.prototype, "addOpen", 2);
J([
  c()
], B.prototype, "addValue", 2);
B = J([
  b("spz-view-room")
], B);
var ai = Object.defineProperty, ri = Object.getOwnPropertyDescriptor, X = (e, t, s, i) => {
  for (var o = i > 1 ? void 0 : i ? ri(t, s) : t, r = e.length - 1, n; r >= 0; r--)
    (n = e[r]) && (o = (i ? n(t, s, o) : n(o)) || o);
  return i && o && ai(t, s, o), o;
};
let U = class extends m {
  constructor() {
    super(...arguments), this.narrow = !0, this.products = [], this.query = "", this.category = "", this.sort = "name", this.loading = !0, this.lastSignal = -1;
  }
  connectedCallback() {
    super.connectedCallback(), this.unsub = this.appState.subscribe(() => {
      this.appState.changeSignal !== this.lastSignal && (this.lastSignal = this.appState.changeSignal, this.load());
    }), this.load();
  }
  disconnectedCallback() {
    super.disconnectedCallback(), this.unsub?.(), this.debounceTimer && clearTimeout(this.debounceTimer);
  }
  async load() {
    this.loading = !0;
    const e = await this.appState.api.listProducts({
      query: this.query || void 0,
      category: this.category || void 0
    });
    this.products = e.products, this.loading = !1;
  }
  onSearchInput(e) {
    const t = e.target.value;
    this.debounceTimer && clearTimeout(this.debounceTimer), this.debounceTimer = window.setTimeout(() => {
      this.query = t, this.load();
    }, 250);
  }
  onCategory(e) {
    this.category = e.detail.category, this.load();
  }
  toggleSort() {
    this.sort = this.sort === "name" ? "recent" : "name";
  }
  sorted() {
    return [...this.products].sort(
      (t, s) => this.sort === "recent" ? s.created_at.localeCompare(t.created_at) : t.name.localeCompare(s.name)
    );
  }
  stockLine(e) {
    return e.total_quantity > 0 ? a("catalog.stock", {
      qty: `${e.total_quantity} ${a("unit." + e.default_unit)}`,
      places: e.item_count
    }) : a("catalog.no_stock");
  }
  render() {
    const e = this.sorted();
    return d`<div class="wrap">
      <div class="head">
        <div class="title">${a("nav.catalog")}</div>
        <button class="new-btn"
          @click=${() => this.dispatchEvent(new CustomEvent("new-product", { bubbles: !0, composed: !0 }))}>
          ${a("catalog.new_product")}
        </button>
      </div>

      <div class="toolbar">
        <div class="search-row">
          <input type="search" .value=${this.query}
            placeholder=${a("catalog.search")}
            aria-label=${a("catalog.search")}
            @input=${this.onSearchInput} />
          <button class="sort-btn" @click=${this.toggleSort}>
            ${this.sort === "name" ? a("catalog.sort_name") : a("catalog.sort_recent")} ▾
          </button>
        </div>
        <spz-category-chips .selected=${this.category}
          @category-changed=${this.onCategory}></spz-category-chips>
      </div>

      ${this.loading ? d`<div class="card" style="height:220px"></div>` : e.length === 0 ? d`<spz-empty-state emoji="📖" heading=${a("catalog.empty")}></spz-empty-state>` : d`<div class="list">
            ${e.map(
      (t) => d`<button class="row" @click=${() => z("product", t.id)}>
                <span class="glyph" style="background:${te(t.category)}">
                  ${t.image ? d`<img src=${t.image} alt="" />` : N(t.emoji, t.category)}
                </span>
                <div class="info">
                  <div class="name">
                    ${t.name}${t.barcodes.length > 0 ? d`<span class="tag" aria-hidden="true">🏷️</span>` : ""}
                  </div>
                  <div class="sub">${a("cat." + t.category)} · ${this.stockLine(t)}</div>
                </div>
                <span class="chev" aria-hidden="true">›</span>
              </button>`
    )}
          </div>`}
    </div>`;
  }
};
U.styles = [C, j, g`
    :host { display: block; }
    .wrap { display: flex; flex-direction: column; gap: 16px; }
    .head { display: flex; align-items: center; gap: 10px; }
    .head .title { font-size: 20px; font-weight: 600; color: var(--spz-text); flex: 1; }
    .new-btn {
      cursor: pointer; border: none; border-radius: 10px; padding: 12px 16px;
      background: var(--spz-primary); color: #fff; font-family: inherit;
      font-size: 14px; font-weight: 600; min-height: 48px; white-space: nowrap;
    }
    .toolbar { display: flex; flex-direction: column; gap: 10px; }
    .search-row { display: flex; align-items: center; gap: 10px; }
    .search-row input { flex: 1; }
    .sort-btn {
      cursor: pointer; display: flex; align-items: center; gap: 6px; white-space: nowrap;
      border: 1px solid var(--spz-divider); background: var(--spz-card); color: var(--spz-text);
      border-radius: 8px; padding: 12px 14px; font-size: 13px; font-weight: 500;
      font-family: inherit; min-height: 48px;
    }
    .list { display: flex; flex-direction: column; }
    .row {
      display: flex; align-items: center; gap: 12px; width: 100%; text-align: left;
      cursor: pointer; font-family: inherit; background: none; border: none;
      border-top: 1px solid var(--spz-divider); padding: 12px 4px; min-height: 48px;
      color: var(--spz-text);
    }
    .row:first-child { border-top: none; }
    .glyph {
      width: 44px; height: 44px; flex: none; border-radius: 12px;
      display: flex; align-items: center; justify-content: center; font-size: 24px;
    }
    .glyph img { width: 100%; height: 100%; object-fit: cover; border-radius: 12px; }
    .info { flex: 1; min-width: 0; }
    .name { font-size: 15px; font-weight: 500; color: var(--spz-text);
      overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
    .sub { font-size: 13px; color: var(--spz-text-2); margin-top: 2px;
      overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
    .tag { font-size: 15px; margin-left: 4px; }
    .chev { color: var(--spz-text-2); font-size: 20px; margin-left: 4px; }
  `];
X([
  p({ attribute: !1 })
], U.prototype, "appState", 2);
X([
  p({ type: Boolean })
], U.prototype, "narrow", 2);
X([
  c()
], U.prototype, "products", 2);
X([
  c()
], U.prototype, "query", 2);
X([
  c()
], U.prototype, "category", 2);
X([
  c()
], U.prototype, "sort", 2);
X([
  c()
], U.prototype, "loading", 2);
U = X([
  b("spz-view-catalog")
], U);
var ni = Object.defineProperty, di = Object.getOwnPropertyDescriptor, H = (e, t, s, i) => {
  for (var o = i > 1 ? void 0 : i ? di(t, s) : t, r = e.length - 1, n; r >= 0; r--)
    (n = e[r]) && (o = (i ? n(t, s, o) : n(o)) || o);
  return i && o && ni(t, s, o), o;
};
const ci = ["szt", "słoik", "butelka", "puszka", "opak", "kg", "g", "l", "ml"];
let D = class extends m {
  constructor() {
    super(...arguments), this.productId = "", this.narrow = !0, this.items = [], this.loading = !0, this.editing = !1, this.newBarcode = "", this.lastSignal = -1;
  }
  connectedCallback() {
    super.connectedCallback(), this.unsub = this.appState.subscribe(() => {
      this.appState.changeSignal !== this.lastSignal && (this.lastSignal = this.appState.changeSignal, this.load());
    }), this.load();
  }
  disconnectedCallback() {
    super.disconnectedCallback(), this.unsub?.();
  }
  updated(e) {
    e.has("productId") && this.load();
  }
  async load() {
    this.loading = !0;
    const [e, t] = await Promise.all([
      this.appState.api.listProducts({}),
      this.appState.api.listItems({ product_id: this.productId })
    ]);
    this.product = e.products.find((s) => s.id === this.productId), this.items = t.items, this.loading = !1;
  }
  stockGroups() {
    const e = /* @__PURE__ */ new Map();
    for (const t of this.items) {
      let s = e.get(t.shelf_id);
      s || (s = {
        shelfId: t.shelf_id,
        path: t.shelf_path ?? "",
        qty: 0,
        unit: t.unit
      }, e.set(t.shelf_id, s)), s.qty += t.quantity;
    }
    return [...e.values()].sort((t, s) => t.path.localeCompare(s.path));
  }
  openEdit() {
    const e = this.product;
    e && (this.form = {
      name: e.name,
      emoji: e.emoji,
      category: e.category,
      default_unit: e.default_unit,
      default_shelf_life_days: e.default_shelf_life_days?.toString() ?? "",
      min_stock: e.min_stock?.toString() ?? "",
      notes: e.notes
    }, this.editing = !0);
  }
  closeEdit() {
    this.editing = !1, this.form = void 0;
  }
  setForm(e, t) {
    this.form && (this.form = { ...this.form, [e]: t });
  }
  async saveEdit() {
    if (!this.product || !this.form) return;
    const e = this.form, t = e.default_shelf_life_days.trim(), s = e.min_stock.trim();
    await this.appState.api.updateProduct(this.product.id, {
      name: e.name.trim(),
      emoji: e.emoji.trim(),
      category: e.category,
      default_unit: e.default_unit,
      default_shelf_life_days: t === "" ? null : Number(t),
      min_stock: s === "" ? null : Number(s),
      notes: e.notes.trim()
    }), this.closeEdit(), await this.load();
  }
  async addBarcode() {
    const e = this.newBarcode.trim();
    if (!(!e || !this.product)) {
      if (this.product.barcodes.includes(e)) {
        this.newBarcode = "";
        return;
      }
      await this.appState.api.updateProduct(this.product.id, {
        barcodes: [...this.product.barcodes, e]
      }), this.newBarcode = "", await this.load();
    }
  }
  async deleteProduct() {
    if (!this.product) return;
    const e = this.product.name;
    await this.appState.api.deleteProduct(this.product.id), wt(a("toast.deleted", { product: e })), z("catalog");
  }
  render() {
    if (this.loading && !this.product)
      return d`<div class="wrap"><div class="card" style="height:96px"></div>
        <div class="card" style="height:180px"></div></div>`;
    const e = this.product;
    if (!e)
      return d`<div class="wrap">
        <spz-empty-state emoji="📖" heading=${a("catalog.empty")}></spz-empty-state>
      </div>`;
    const t = this.stockGroups(), s = this.items.length > 0;
    return d`<div class="wrap">
      <div class="hero">
        <span class="glyph" style="background:${te(e.category)}">
          ${e.image ? d`<img src=${e.image} alt="" />` : N(e.emoji, e.category)}
        </span>
        <div style="flex:1;min-width:0">
          <div class="name">${e.name}</div>
          <div class="sub">${a("cat." + e.category)} · ${a("product.default_unit")}: ${a("unit." + e.default_unit)}</div>
        </div>
      </div>

      <div class="card">
        <div class="card-head">
          <div class="section-title">${a("product.props")}</div>
          <button class="link-btn" @click=${this.openEdit}>${a("common.edit")}</button>
        </div>
        <div class="prop-row">
          <span class="prop-k">${a("product.category")}</span>
          <span class="prop-v">${a("cat." + e.category)}</span>
        </div>
        <div class="prop-row">
          <span class="prop-k">${a("product.default_unit")}</span>
          <span class="prop-v">${a("unit." + e.default_unit)}</span>
        </div>
        <div class="prop-row">
          <span class="prop-k">${a("product.shelf_life")}</span>
          <span class="prop-v">${e.default_shelf_life_days ?? "—"}</span>
        </div>
        <div class="prop-row">
          <span class="prop-k">${a("product.min_stock")}</span>
          <span class="prop-v">${e.min_stock ?? "—"}</span>
        </div>
        ${e.notes ? d`<div class="prop-row">
              <span class="prop-k">${a("product.notes")}</span>
              <span class="prop-v">${e.notes}</span>
            </div>` : ""}
      </div>

      <div class="card">
        <div class="section-title">${a("product.barcodes")}</div>
        <div class="barcodes">
          ${e.barcodes.length ? d`<div class="ean-list">
                ${e.barcodes.map(
      (i) => d`<span class="ean"><span class="kind">EAN</span>${i}</span>`
    )}
              </div>` : ""}
          <div class="barcode-add">
            <input type="text" inputmode="numeric" .value=${this.newBarcode}
              aria-label=${a("product.barcodes")}
              @input=${(i) => this.newBarcode = i.target.value}
              @keydown=${(i) => {
      i.key === "Enter" && this.addBarcode();
    }} />
            <button class="btn" @click=${this.addBarcode}>${a("common.add")}</button>
          </div>
          <button class="btn btn-ghost btn-block"
            @click=${() => this.dispatchEvent(new CustomEvent("scan-barcode-for-product", { detail: { productId: e.id }, bubbles: !0, composed: !0 }))}>
            ${a("product.add_barcode")}
          </button>
        </div>
      </div>

      <div class="card">
        <div class="section-title">${a("product.stock")}</div>
        ${s ? t.map(
      (i) => d`<button class="stock-row" @click=${() => z("shelf", i.shelfId)}>
                <span class="stock-loc">${i.path}</span>
                <span class="stock-qty">${i.qty} ${a("unit." + i.unit)}</span>
                <span class="chev" aria-hidden="true">›</span>
              </button>`
    ) : d`<div class="note">${a("catalog.no_stock")}</div>`}
      </div>

      <button class="btn btn-primary btn-block"
        @click=${() => this.dispatchEvent(new CustomEvent("add-for-product", { detail: { product: e }, bubbles: !0, composed: !0 }))}>
        ${a("product.add_batch")}
      </button>

      ${s ? d`<div class="note">${a("product.cannot_delete", { batches: Q(this.items.length) })}</div>
            <button class="btn btn-block" disabled style="opacity:.5;color:var(--spz-error);border-color:var(--spz-error)">
              ${a("common.delete")}
            </button>` : d`<button class="btn btn-block" style="color:var(--spz-error);border-color:var(--spz-error)"
            @click=${this.deleteProduct}>
            ${a("common.delete")}
          </button>`}

      ${this.renderEditSheet()}
    </div>`;
  }
  renderEditSheet() {
    if (!this.editing || !this.form) return d``;
    const e = this.form;
    return d`<spz-bottom-sheet open .narrow=${this.narrow} @sheet-close=${this.closeEdit}>
      <div class="sheet-title">${a("product.props")}</div>

      <div class="form-field">
        <div class="field-label">${a("product.name")}</div>
        <input type="text" .value=${e.name}
          @input=${(t) => this.setForm("name", t.target.value)} />
      </div>

      <div class="form-field">
        <div class="field-label">${a("product.emoji")}</div>
        <input type="text" .value=${e.emoji}
          @input=${(t) => this.setForm("emoji", t.target.value)} />
      </div>

      <div class="form-field">
        <div class="field-label">${a("product.category")}</div>
        <spz-category-chips .selected=${e.category} .includeAll=${!1}
          @category-changed=${(t) => this.setForm("category", t.detail.category)}></spz-category-chips>
      </div>

      <div class="form-field">
        <div class="field-label">${a("product.default_unit")}</div>
        <select .value=${e.default_unit}
          @change=${(t) => this.setForm("default_unit", t.target.value)}>
          ${ci.map(
      (t) => d`<option value=${t} ?selected=${t === e.default_unit}>${a("unit." + t)}</option>`
    )}
        </select>
      </div>

      <div class="form-field">
        <div class="field-label">${a("product.shelf_life")}</div>
        <input type="number" min="0" inputmode="numeric" .value=${e.default_shelf_life_days}
          @input=${(t) => this.setForm("default_shelf_life_days", t.target.value)} />
      </div>

      <div class="form-field">
        <div class="field-label">${a("product.min_stock")}</div>
        <input type="number" min="0" inputmode="numeric" .value=${e.min_stock}
          @input=${(t) => this.setForm("min_stock", t.target.value)} />
      </div>

      <div class="form-field">
        <div class="field-label">${a("product.notes")}</div>
        <textarea rows="2" .value=${e.notes}
          @input=${(t) => this.setForm("notes", t.target.value)}></textarea>
      </div>

      <div class="form-actions">
        <button class="btn" @click=${this.closeEdit}>${a("common.cancel")}</button>
        <button class="btn btn-primary" @click=${this.saveEdit}>${a("common.save")}</button>
      </div>
    </spz-bottom-sheet>`;
  }
};
D.styles = [C, j, g`
    :host { display: block; }
    .wrap { display: flex; flex-direction: column; gap: 16px; }
    .hero { display: flex; align-items: center; gap: 16px; }
    .hero .glyph {
      width: 72px; height: 72px; flex: none; border-radius: 16px;
      display: flex; align-items: center; justify-content: center; font-size: 40px;
    }
    .hero .glyph img { width: 100%; height: 100%; object-fit: cover; border-radius: 16px; }
    .hero .name { font-size: 22px; font-weight: 600; color: var(--spz-text); }
    .hero .sub { font-size: 14px; color: var(--spz-text-2); margin-top: 4px; }
    .card-head { display: flex; align-items: center; margin-bottom: 12px; }
    .card-head .section-title { margin-bottom: 0; flex: 1; }
    .link-btn {
      cursor: pointer; background: none; border: none; color: var(--spz-primary);
      font-family: inherit; font-size: 14px; font-weight: 600; padding: 8px;
      min-height: 44px;
    }
    .prop-row { display: flex; align-items: baseline; gap: 12px; padding: 10px 0;
      border-top: 1px solid var(--spz-divider); }
    .prop-row:first-child { border-top: none; }
    .prop-k { font-size: 13px; color: var(--spz-text-2); flex: 1; }
    .prop-v { font-size: 15px; color: var(--spz-text); font-weight: 500; text-align: right; }
    .barcodes { display: flex; flex-direction: column; gap: 10px; }
    .ean-list { display: flex; flex-wrap: wrap; gap: 8px; }
    .ean { display: inline-flex; align-items: center; gap: 6px; font-size: 13px;
      color: var(--spz-text); background: var(--spz-bg-2); border-radius: 999px;
      padding: 6px 12px; font-variant-numeric: tabular-nums; }
    .ean .kind { font-size: 11px; font-weight: 700; color: var(--spz-text-2); }
    .barcode-add { display: flex; gap: 10px; }
    .barcode-add input { flex: 1; }
    .stock-row {
      display: flex; align-items: center; gap: 12px; width: 100%; text-align: left;
      cursor: pointer; font-family: inherit; background: none; border: none;
      border-top: 1px solid var(--spz-divider); padding: 12px 0; min-height: 48px;
      color: var(--spz-text);
    }
    .stock-row:first-child { border-top: none; }
    .stock-loc { flex: 1; min-width: 0; font-size: 15px; color: var(--spz-text);
      overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
    .stock-qty { font-size: 15px; font-weight: 500; color: var(--spz-text); }
    .chev { color: var(--spz-text-2); font-size: 20px; }
    .note { font-size: 13px; color: var(--spz-text-2); }
    .form-field { margin-bottom: 14px; }
    .sheet-title { font-size: 18px; font-weight: 600; color: var(--spz-text); margin-bottom: 16px; }
    .form-actions { display: flex; gap: 10px; margin-top: 8px; }
    .form-actions .btn { flex: 1; }
  `];
H([
  p({ attribute: !1 })
], D.prototype, "appState", 2);
H([
  p()
], D.prototype, "productId", 2);
H([
  p({ type: Boolean })
], D.prototype, "narrow", 2);
H([
  c()
], D.prototype, "product", 2);
H([
  c()
], D.prototype, "items", 2);
H([
  c()
], D.prototype, "loading", 2);
H([
  c()
], D.prototype, "editing", 2);
H([
  c()
], D.prototype, "form", 2);
H([
  c()
], D.prototype, "newBarcode", 2);
D = H([
  b("spz-view-product")
], D);
var pi = Object.defineProperty, li = Object.getOwnPropertyDescriptor, tt = (e, t, s, i) => {
  for (var o = i > 1 ? void 0 : i ? li(t, s) : t, r = e.length - 1, n; r >= 0; r--)
    (n = e[r]) && (o = (i ? n(t, s, o) : n(o)) || o);
  return i && o && pi(t, s, o), o;
};
const ye = 50;
let F = class extends m {
  constructor() {
    super(...arguments), this.narrow = !0, this.entries = [], this.total = 0, this.loading = !1, this.offset = 0, this.filters = [
      { key: "history.all", type: void 0 },
      { key: "history.added", type: "add" },
      { key: "history.consumed", type: "consume" },
      { key: "history.trashed", type: "delete" }
    ], this.lastSignal = -1;
  }
  connectedCallback() {
    super.connectedCallback(), this.unsub = this.appState.subscribe(() => {
      this.appState.changeSignal !== this.lastSignal && (this.lastSignal = this.appState.changeSignal, this.load());
    }), this.load();
  }
  disconnectedCallback() {
    super.disconnectedCallback(), this.unsub?.(), this.observer?.disconnect();
  }
  firstUpdated() {
    this.observer = new IntersectionObserver(
      (e) => {
        e.some((t) => t.isIntersecting) && this.loadMore();
      },
      { rootMargin: "300px" }
    ), this.sentinel && this.observer.observe(this.sentinel);
  }
  async load() {
    this.loading = !0, this.offset = 0;
    const e = await this.appState.api.listHistory({
      limit: ye,
      offset: 0,
      type: this.type
    });
    this.entries = e.entries, this.total = e.total, this.offset = e.entries.length, this.loading = !1;
  }
  async loadMore() {
    if (this.loading || this.entries.length >= this.total) return;
    this.loading = !0;
    const e = await this.appState.api.listHistory({
      limit: ye,
      offset: this.offset,
      type: this.type
    });
    this.entries = [...this.entries, ...e.entries], this.total = e.total, this.offset += e.entries.length, this.loading = !1;
  }
  setFilter(e) {
    this.type !== e && (this.type = e, this.load());
  }
  buildGroups(e) {
    const t = [];
    for (const s of this.entries) {
      const i = fs(s.ts, e), o = i === "__today__" ? a("history.today") : i === "__yesterday__" ? a("history.yesterday") : i, r = t[t.length - 1];
      r && r.header === o ? r.entries.push(s) : t.push({ header: o, entries: [s] });
    }
    return t;
  }
  render() {
    const e = vt(), t = this.buildGroups(e);
    return d`<div class="wrap">
      <div class="filters">
        ${this.filters.map(
      (s) => d`<button
            class="chip ${this.type === s.type ? "active" : ""}"
            @click=${() => this.setFilter(s.type)}
          >
            ${a(s.key)}
          </button>`
    )}
      </div>

      ${!this.loading && this.entries.length === 0 ? d`<spz-empty-state emoji="🕓" heading=${a("history.empty")}></spz-empty-state>` : t.map(
      (s) => d`<div class="group">
              <div class="group-head">${s.header}</div>
              <div class="card">
                ${s.entries.map(
        (i) => d`<div class="act-row">
                    <span class="act-ico" aria-hidden="true">${Ae(i.type)}</span>
                    <div style="flex:1;min-width:0;">
                      <div class="act-text">${qe(i)}</div>
                      <div class="act-meta">${je(i.ts, e)}${i.user_name ? ` · ${i.user_name}` : ""}</div>
                    </div>
                  </div>`
      )}
              </div>
            </div>`
    )}

      ${this.loading && this.entries.length > 0 ? d`<div class="loading">${a("common.loading")}</div>` : ""}
      <div id="sentinel"></div>
    </div>`;
  }
};
F.styles = [C, j, g`
    :host { display: block; }
    .wrap { display: flex; flex-direction: column; gap: 16px; }
    .filters { display: flex; gap: 8px; overflow-x: auto; padding-bottom: 2px; scrollbar-width: thin; }
    .filters .chip { min-height: 40px; }
    .group { display: flex; flex-direction: column; gap: 8px; }
    .group-head { font-size: 13px; font-weight: 600; color: var(--spz-text-2);
      text-transform: uppercase; letter-spacing: 0.04em; padding: 0 2px; }
    .act-row { display: flex; align-items: center; gap: 12px; padding: 11px 0; }
    .act-row + .act-row { border-top: 1px solid var(--spz-divider); }
    .act-ico { width: 34px; height: 34px; flex: none; border-radius: 50%; display: flex;
      align-items: center; justify-content: center; font-size: 16px; background: var(--spz-bg-2); }
    .act-text { font-size: 14px; color: var(--spz-text); line-height: 1.3; }
    .act-meta { font-size: 12px; color: var(--spz-text-2); margin-top: 2px; }
    #sentinel { height: 1px; }
    .loading { font-size: 13px; color: var(--spz-text-2); text-align: center; padding: 12px 0; }
  `];
tt([
  p({ attribute: !1 })
], F.prototype, "appState", 2);
tt([
  p({ type: Boolean })
], F.prototype, "narrow", 2);
tt([
  c()
], F.prototype, "entries", 2);
tt([
  c()
], F.prototype, "total", 2);
tt([
  c()
], F.prototype, "type", 2);
tt([
  c()
], F.prototype, "loading", 2);
tt([
  Ut("#sentinel")
], F.prototype, "sentinel", 2);
F = tt([
  b("spz-view-history")
], F);
var hi = Object.defineProperty, ui = Object.getOwnPropertyDescriptor, G = (e, t, s, i) => {
  for (var o = i > 1 ? void 0 : i ? ui(t, s) : t, r = e.length - 1, n; r >= 0; r--)
    (n = e[r]) && (o = (i ? n(t, s, o) : n(o)) || o);
  return i && o && hi(t, s, o), o;
};
const xe = "spz-recent-search", mi = 6, fi = 250;
let M = class extends m {
  constructor() {
    super(...arguments), this.narrow = !0, this.query = "", this.products = [], this.items = [], this.loading = !1, this.recent = [], this.lastSignal = -1;
  }
  connectedCallback() {
    super.connectedCallback(), this.recent = this.loadRecent(), this.unsub = this.appState.subscribe(() => {
      if (this.appState.changeSignal !== this.lastSignal) {
        this.lastSignal = this.appState.changeSignal;
        const e = this.query.trim();
        e.length >= 2 && this.runSearch(e);
      }
    });
  }
  disconnectedCallback() {
    super.disconnectedCallback(), this.unsub?.(), this.debounceTimer && clearTimeout(this.debounceTimer);
  }
  firstUpdated() {
    this.input?.focus();
  }
  loadRecent() {
    try {
      const e = localStorage.getItem(xe), t = e ? JSON.parse(e) : [];
      return Array.isArray(t) ? t.filter((s) => typeof s == "string") : [];
    } catch {
      return [];
    }
  }
  addRecent(e) {
    const t = e.trim();
    if (t.length < 2) return;
    const s = [t, ...this.recent.filter((i) => i.toLowerCase() !== t.toLowerCase())].slice(
      0,
      mi
    );
    this.recent = s;
    try {
      localStorage.setItem(xe, JSON.stringify(s));
    } catch {
    }
  }
  onInput(e) {
    const t = e.target.value;
    this.query = t, this.debounceTimer && clearTimeout(this.debounceTimer);
    const s = t.trim();
    if (s.length < 2) {
      this.products = [], this.items = [], this.loading = !1;
      return;
    }
    this.loading = !0, this.debounceTimer = window.setTimeout(() => void this.runSearch(s), fi);
  }
  onKeydown(e) {
    if (e.key === "Enter") {
      const t = this.query.trim();
      t.length >= 2 && (this.debounceTimer && clearTimeout(this.debounceTimer), this.runSearch(t), this.addRecent(t));
    }
  }
  async runSearch(e) {
    const t = await this.appState.api.search(e);
    e === this.query.trim() && (this.products = t.products, this.items = t.items, this.loading = !1);
  }
  runRecent(e) {
    this.query = e, this.input && (this.input.value = e), this.loading = !0, this.runSearch(e), this.addRecent(e), this.input?.focus();
  }
  async quickConsume(e, t) {
    e.stopPropagation();
    const s = t.product?.name ?? "";
    await this.appState.api.consume(t.id, 1), wt(a("toast.consumed", { product: s, qty: 1 }), async () => {
      await this.appState.api.addItem({
        product_id: t.product_id,
        shelf_id: t.shelf_id,
        quantity: 1,
        unit: t.unit,
        best_before: t.best_before,
        best_before_precision: t.best_before_precision
      });
    });
  }
  addForProduct(e) {
    this.dispatchEvent(
      new CustomEvent("add-for-product", {
        detail: { product: e },
        bubbles: !0,
        composed: !0
      })
    );
  }
  createProduct(e) {
    this.dispatchEvent(
      new CustomEvent("new-product", {
        detail: { name: e },
        bubbles: !0,
        composed: !0
      })
    );
  }
  render() {
    const e = this.query.trim();
    return d`<div class="wrap">
      <div class="searchbar">
        <ha-icon icon="mdi:magnify"></ha-icon>
        <input
          id="q"
          type="search"
          autofocus
          .value=${this.query}
          placeholder=${a("search.placeholder")}
          @input=${this.onInput}
          @keydown=${this.onKeydown}
        />
      </div>
      ${e.length < 2 ? this.renderIdle() : this.renderResults(e)}
    </div>`;
  }
  renderIdle() {
    return this.recent.length ? d`<div class="group">
        <div class="section-label">${a("search.recent")}</div>
        <div class="recent-row">
          ${this.recent.map(
      (e) => d`<button class="chip" @click=${() => this.runRecent(e)}>${e}</button>`
    )}
        </div>
      </div>` : d`<spz-empty-state emoji="🔎" heading=${a("search.hint")}></spz-empty-state>`;
  }
  renderResults(e) {
    const t = !this.loading && this.items.length === 0 && this.products.length === 0;
    return d`
      ${this.items.length ? d`<div class="group">
            <div class="section-label">${a("search.in_pantry")}</div>
            <div class="divide">
              ${this.items.map((s) => this.renderItemRow(s))}
            </div>
          </div>` : ""}

      ${this.products.length ? d`<div class="group">
            <div class="section-label">${a("search.catalog")}</div>
            <div class="divide">
              ${this.products.map((s) => this.renderProductRow(s))}
            </div>
          </div>` : ""}

      ${t ? d`<div class="empty-inline">${a("search.empty")}</div>` : ""}

      <div class="group">
        <div class="section-label">${a("search.actions")}</div>
        <div class="divide">
          <div class="res-item">
            <button class="res-row" @click=${() => this.createProduct(e)}>
              <span class="glyph" aria-hidden="true">➕</span>
              <div class="res-main">
                <div class="res-name">${a("search.create", { query: e })}</div>
              </div>
            </button>
          </div>
        </div>
      </div>
    `;
  }
  renderItemRow(e) {
    const t = N(e.product?.emoji, e.product?.category ?? "other");
    return d`<div class="res-item">
      <button class="res-row" @click=${() => z("shelf", e.shelf_id)}>
        <span class="glyph" aria-hidden="true">${t}</span>
        <div class="res-main">
          <div class="res-name">${e.product?.name ?? ""}</div>
          <div class="res-sub">${e.quantity} ${a("unit." + e.unit)}</div>
          ${e.shelf_path ? d`<div class="res-loc">${e.shelf_path}</div>` : ""}
        </div>
        <spz-freshness-badge
          .status=${e.status}
          .date=${e.best_before}
          .precision=${e.best_before_precision}
          .daysLeft=${e.days_left}
        ></spz-freshness-badge>
      </button>
      <button
        class="icon-btn"
        aria-label=${a("dashboard.quick_consume")}
        @click=${(s) => this.quickConsume(s, e)}
      >
        ➖
      </button>
    </div>`;
  }
  renderProductRow(e) {
    const t = N(e.emoji, e.category);
    return d`<div class="res-item">
      <div class="res-static">
        <span class="glyph" aria-hidden="true">${t}</span>
        <div class="res-main">
          <div class="res-name">${e.name}</div>
          <div class="res-sub">${a("cat." + e.category)}</div>
        </div>
      </div>
      <button class="pill-btn" @click=${() => this.addForProduct(e)}>
        ${a("search.add_batch")}
      </button>
    </div>`;
  }
};
M.styles = [C, j, g`
    :host { display: block; }
    .wrap { display: flex; flex-direction: column; gap: 16px; }
    .searchbar { display: flex; align-items: center; gap: 10px;
      border: 1px solid var(--spz-divider); border-radius: 12px;
      background: var(--spz-card); padding: 0 14px; }
    .searchbar ha-icon { color: var(--spz-text-2); --mdc-icon-size: 22px; flex: none; }
    .searchbar input { border: none; background: transparent; padding: 14px 0;
      min-height: 48px; border-radius: 0; }
    .searchbar input:focus { outline: none; border: none; }
    .group { display: flex; flex-direction: column; }
    .recent-row { display: flex; gap: 8px; overflow-x: auto; padding-bottom: 2px; scrollbar-width: thin; }
    .recent-row .chip { min-height: 40px; }
    .res-item { display: flex; align-items: center; gap: 8px; }
    .res-item + .res-item, .group .res-item:not(:first-child) { }
    .res-row {
      flex: 1; min-width: 0; display: flex; align-items: center; gap: 12px;
      padding: 10px 0; background: none; border: none; text-align: left;
      cursor: pointer; font-family: inherit; color: var(--spz-text); min-height: 48px;
    }
    .res-static {
      flex: 1; min-width: 0; display: flex; align-items: center; gap: 12px;
      padding: 10px 0; min-height: 48px;
    }
    .divide .res-item { border-top: 1px solid var(--spz-divider); }
    .divide .res-item:first-child { border-top: none; }
    .glyph { width: 40px; height: 40px; flex: none; border-radius: 10px; display: flex;
      align-items: center; justify-content: center; font-size: 22px; background: var(--spz-bg-2); }
    .res-main { flex: 1; min-width: 0; }
    .res-name { font-size: 15px; font-weight: 500; color: var(--spz-text);
      overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
    .res-sub { font-size: 13px; color: var(--spz-text-2); margin-top: 2px; }
    .res-loc { font-size: 13px; color: var(--spz-primary); margin-top: 2px; font-weight: 500;
      overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
    .icon-btn { flex: none; min-width: 48px; min-height: 48px; border-radius: 10px;
      border: 1px solid var(--spz-divider); background: var(--spz-card); color: var(--spz-text);
      font-size: 18px; cursor: pointer; font-family: inherit; }
    .pill-btn { flex: none; min-height: 48px; padding: 0 14px; border-radius: 10px;
      border: 1px solid var(--spz-primary); background: transparent; color: var(--spz-primary);
      font-size: 13px; font-weight: 600; cursor: pointer; font-family: inherit; white-space: nowrap; }
    .empty-inline { font-size: 14px; color: var(--spz-text-2); padding: 8px 2px; }
  `];
G([
  p({ attribute: !1 })
], M.prototype, "appState", 2);
G([
  p({ type: Boolean })
], M.prototype, "narrow", 2);
G([
  c()
], M.prototype, "query", 2);
G([
  c()
], M.prototype, "products", 2);
G([
  c()
], M.prototype, "items", 2);
G([
  c()
], M.prototype, "loading", 2);
G([
  c()
], M.prototype, "recent", 2);
G([
  Ut("#q")
], M.prototype, "input", 2);
M = G([
  b("spz-view-search")
], M);
var vi = Object.defineProperty, gi = Object.getOwnPropertyDescriptor, V = (e, t, s, i) => {
  for (var o = i > 1 ? void 0 : i ? gi(t, s) : t, r = e.length - 1, n; r >= 0; r--)
    (n = e[r]) && (o = (i ? n(t, s, o) : n(o)) || o);
  return i && o && vi(t, s, o), o;
};
let I = class extends m {
  constructor() {
    super(...arguments), this.narrow = !0, this.version = "", this.days = -1, this.renameValue = "", this.deleteShelves = 0, this.deleteItems = 0;
  }
  connectedCallback() {
    super.connectedCallback(), this.unsub = this.appState.subscribe(() => this.requestUpdate()), this.appState.settings || this.appState.refreshSettings();
  }
  disconnectedCallback() {
    super.disconnectedCallback(), this.unsub?.(), this.slideTimer && clearTimeout(this.slideTimer);
  }
  onSlide(e) {
    const t = Number(e.target.value);
    this.days = t, this.slideTimer && clearTimeout(this.slideTimer), this.slideTimer = window.setTimeout(() => {
      this.appState.api.updateSettings({ expiring_soon_days: t });
    }, 400);
  }
  toggleOff() {
    const e = this.appState.settings?.off_enabled ?? !1;
    this.appState.api.updateSettings({ off_enabled: !e });
  }
  openRename(e) {
    this.renameRoom = e, this.renameValue = e.name;
  }
  async saveRename() {
    if (!this.renameRoom) return;
    const e = this.renameValue.trim();
    e && await this.appState.api.updateRoom(this.renameRoom.id, { name: e }), this.renameRoom = void 0;
  }
  async askDelete(e) {
    const t = await this.appState.api.deleteRoom(e.id, !0);
    this.deleteShelves = t.affected_shelves, this.deleteItems = t.affected_items, this.deleteTarget = e;
  }
  async confirmDelete() {
    this.deleteTarget && (await this.appState.api.deleteRoom(this.deleteTarget.id, !1), this.deleteTarget = void 0);
  }
  async exportJson() {
    const e = await this.appState.api.exportData(), t = new Blob([JSON.stringify(e.data, null, 2)], { type: "application/json" }), s = URL.createObjectURL(t), i = document.createElement("a");
    i.href = s, i.download = `spizarnia-export-${(/* @__PURE__ */ new Date()).toISOString().slice(0, 10)}.json`, document.body.appendChild(i), i.click(), i.remove(), URL.revokeObjectURL(s);
  }
  render() {
    const e = this.appState.settings, t = this.appState.overview, s = t?.rooms ?? [];
    this.days === -1 && e && (this.days = e.expiring_soon_days);
    const i = this.days === -1 ? e?.expiring_soon_days ?? 30 : this.days, o = e?.off_enabled ?? !1;
    return d`<div class="wrap">
      <div class="card">
        <div class="head"><span class="title">${a("settings.alerts")}</span></div>
        <input type="range" min="1" max="365" .value=${String(i)} @input=${this.onSlide} />
        <div class="desc">${a("settings.threshold", { days: i })}</div>
        <div class="desc">${a("settings.threshold_effect", { batches: Q(t?.stats.expiring_soon ?? 0) })}</div>
      </div>

      <div class="card">
        <div class="head">
          <span class="title">${a("settings.off")}</span>
          <div class="knob-wrap">
            <div class="switch ${o ? "on" : ""}" role="switch" aria-checked=${o}
              @click=${this.toggleOff}><span class="knob"></span></div>
          </div>
        </div>
        <div class="desc">${a("settings.off_desc")}</div>
        <div class="desc">${a("settings.off_locale", { locale: e?.off_locale ?? "" })}</div>
      </div>

      <div class="card">
        <div class="head"><span class="title">${a("settings.rooms")}</span></div>
        ${s.map(
      (r) => d`<div class="room-row">
            <span class="grab" aria-hidden="true">≡</span>
            <button class="room-main" @click=${() => this.openRename(r)}>
              <div class="name">${r.name}</div>
              <div class="meta">${r.shelf_count} · ${Q(r.item_count)}</div>
            </button>
            <button class="del" title=${a("room.delete")} @click=${() => this.askDelete(r)}>
              <ha-icon icon="mdi:delete"></ha-icon>
            </button>
          </div>`
    )}
      </div>

      <div class="card">
        <div class="head"><span class="title">${a("settings.data")}</span></div>
        <div class="desc">${a("settings.records", { n: t?.stats.total_items ?? 0 })}</div>
        <button class="btn" @click=${this.exportJson}>${a("settings.export")}</button>
      </div>

      <div class="card">
        <div class="head"><span class="title">${a("settings.about")}</span></div>
        <div class="about-row">
          <span class="desc">${a("settings.version", { version: this.version })}</span>
          <span class="desc">${a("settings.license")}</span>
          <a href="https://github.com/kamilserwata/homeassistant-spizarnia" target="_blank" rel="noopener noreferrer">${a("settings.github")}</a>
        </div>
      </div>

      ${this.renderRenameSheet()}
      ${this.renderDeleteDialog()}
    </div>`;
  }
  renderRenameSheet() {
    return this.renameRoom ? d`<spz-bottom-sheet open .narrow=${this.narrow} @sheet-close=${() => this.renameRoom = void 0}>
      <div class="sheet-title">${a("room.rename")}</div>
      <input
        type="text"
        .value=${this.renameValue}
        @input=${(e) => this.renameValue = e.target.value}
        @keydown=${(e) => {
      e.key === "Enter" && this.saveRename();
    }}
      />
      <div class="sheet-actions">
        <button class="btn" @click=${() => this.renameRoom = void 0}>${a("common.cancel")}</button>
        <button class="btn btn-primary" @click=${this.saveRename}>${a("common.save")}</button>
      </div>
    </spz-bottom-sheet>` : d``;
  }
  renderDeleteDialog() {
    const e = this.deleteTarget;
    return e ? d`<spz-confirm-dialog
      open
      heading=${a("confirm.delete_room", { name: e.name })}
      body=${a("confirm.delete_room_body", {
      shelves: a("confirm.shelves", { n: this.deleteShelves }),
      items: a("confirm.items", { n: this.deleteItems })
    })}
      @confirm-cancel=${() => this.deleteTarget = void 0}
      @confirm-ok=${this.confirmDelete}
    ></spz-confirm-dialog>` : d``;
  }
};
I.styles = [C, j, g`
    :host { display: block; }
    .wrap { display: flex; flex-direction: column; gap: 16px; }
    .card { display: flex; flex-direction: column; gap: 12px; }
    .head { display: flex; align-items: center; gap: 12px; }
    .head .title { font-size: 15px; font-weight: 600; color: var(--spz-text); }
    .head .knob-wrap { margin-left: auto; }
    .desc { font-size: 13px; color: var(--spz-text-2); }
    input[type="range"] { width: 100%; accent-color: var(--spz-primary); padding: 0; }
    .switch { width: 46px; height: 28px; border-radius: 999px; position: relative;
      background: var(--spz-divider); transition: background .2s; cursor: pointer; flex: none; }
    .switch.on { background: var(--spz-primary); }
    .knob { position: absolute; top: 3px; left: 3px; width: 22px; height: 22px;
      border-radius: 50%; background: #fff; transition: transform .2s; }
    .switch.on .knob { transform: translateX(18px); }
    .room-row { display: flex; align-items: center; gap: 12px; padding: 10px 0;
      border-top: 1px solid var(--spz-divider); }
    .room-row:first-of-type { border-top: none; }
    .grab { color: var(--spz-text-2); font-size: 18px; cursor: grab; user-select: none; }
    .room-main { flex: 1; min-width: 0; text-align: left; background: none; border: none;
      cursor: pointer; font-family: inherit; padding: 4px 0; }
    .room-main .name { font-size: 15px; color: var(--spz-text); }
    .room-main .meta { font-size: 13px; color: var(--spz-text-2); margin-top: 2px; }
    .del { flex: none; display: inline-flex; align-items: center; justify-content: center;
      width: 40px; height: 40px; border-radius: 8px; background: none; border: none;
      cursor: pointer; color: var(--spz-text-2); }
    .del:hover { color: var(--spz-error); }
    .del ha-icon { --mdc-icon-size: 20px; }
    .about-row { display: flex; flex-direction: column; gap: 6px; font-size: 14px; }
    .sheet-title { font-size: 18px; font-weight: 500; color: var(--spz-text); margin-bottom: 14px; }
    .sheet-actions { display: flex; gap: 10px; margin-top: 16px; }
    .sheet-actions .btn { flex: 1; }
  `];
V([
  p({ attribute: !1 })
], I.prototype, "appState", 2);
V([
  p({ type: Boolean })
], I.prototype, "narrow", 2);
V([
  p()
], I.prototype, "version", 2);
V([
  c()
], I.prototype, "days", 2);
V([
  c()
], I.prototype, "renameRoom", 2);
V([
  c()
], I.prototype, "renameValue", 2);
V([
  c()
], I.prototype, "deleteTarget", 2);
V([
  c()
], I.prototype, "deleteShelves", 2);
V([
  c()
], I.prototype, "deleteItems", 2);
I = V([
  b("spz-view-settings")
], I);
var bi = Object.defineProperty, yi = Object.getOwnPropertyDescriptor, y = (e, t, s, i) => {
  for (var o = i > 1 ? void 0 : i ? yi(t, s) : t, r = e.length - 1, n; r >= 0; r--)
    (n = e[r]) && (o = (i ? n(t, s, o) : n(o)) || o);
  return i && o && bi(t, s, o), o;
};
const xi = "0.1.0";
let v = class extends m {
  constructor() {
    super(...arguments), this.narrow = !1, this.current = { view: "dashboard" }, this.overlay = "none", this.pendingShelfId = "", this.scanMode = "add", this.scanSerial = !0, this.scanSession = 0, this.scanLooking = !1, this.statusFilter = "", this.statusItems = [], this.moveShelves = [], this.presetName = "", this.presetBarcode = "", this.headerTitle = "", this.headerSub = "", this.ready = !1;
  }
  connectedCallback() {
    super.connectedCallback(), this._onLocation = () => this.syncRoute(), this._onToast = (e) => {
      const t = e.detail;
      this.toastEl?.show(t.message, t.undo);
    }, this._onConsumeScan = () => this.startScan("consume"), this._onNewRoom = () => this.newRoom(), this._onStatusFilter = (e) => this.openStatusList(e.detail.status), window.addEventListener("location-changed", this._onLocation), window.addEventListener("popstate", this._onLocation), window.addEventListener("spz-toast", this._onToast), window.addEventListener("spz-consume-scan", this._onConsumeScan), window.addEventListener("spz-new-room", this._onNewRoom), window.addEventListener("spz-status-filter", this._onStatusFilter), this.addEventListener("new-product", (e) => this.onNewProduct(e)), this.addEventListener(
      "add-for-product",
      (e) => this.openAddForm(e.detail.product)
    ), this.addEventListener("scan-here", (e) => {
      this.pendingShelfId = e.detail.shelfId, this.startScan("add");
    }), this.addEventListener("add-here", (e) => {
      this.pendingShelfId = e.detail.shelfId, this.overlay = "picker";
    }), this.addEventListener("move-item", (e) => {
      this.moveItem = e.detail.item, this.appState.api.listShelves().then((t) => {
        this.moveShelves = t.shelves, this.overlay = "move";
      });
    }), this.addEventListener("scan-barcode-for-product", (e) => {
      this.pendingProduct = e.detail.product ?? this.pendingProduct, this.startScan("barcode-for-product");
    }), this.syncRoute();
  }
  disconnectedCallback() {
    super.disconnectedCallback(), window.removeEventListener("location-changed", this._onLocation), window.removeEventListener("popstate", this._onLocation), window.removeEventListener("spz-toast", this._onToast), window.removeEventListener("spz-consume-scan", this._onConsumeScan), window.removeEventListener("spz-new-room", this._onNewRoom), window.removeEventListener("spz-status-filter", this._onStatusFilter), this.appState?.disconnect();
  }
  willUpdate(e) {
    e.has("hass") && this.hass && !this.appState ? (ps(this.hass.language), this.appState = new ns(this.hass), this.appState.connect().then(() => {
      this.ready = !0, this.requestUpdate(), this.updateHeader();
    }), this.appState.subscribe(() => this.requestUpdate())) : e.has("hass") && this.appState && this.appState.setHass(this.hass);
  }
  syncRoute() {
    this.current = ls(window.location.pathname), this.updateHeader(), this.requestUpdate();
  }
  async updateHeader() {
    const e = this.current;
    switch (this.headerSub = "", e.view) {
      case "dashboard":
        this.headerTitle = a("app.title");
        break;
      case "room": {
        const t = this.appState?.rooms?.find((s) => s.id === e.id);
        this.headerTitle = t?.name ?? a("nav.rooms");
        break;
      }
      case "shelf": {
        if (this.appState) {
          const s = (await this.appState.api.listShelves()).shelves.find((o) => o.id === e.id), i = this.appState.rooms?.find((o) => o.id === s?.room_id);
          this.headerTitle = s?.name ?? a("nav.rooms"), this.headerSub = i?.name ?? "";
        }
        break;
      }
      case "catalog":
        this.headerTitle = a("nav.catalog");
        break;
      case "product":
        this.headerTitle = a("nav.catalog");
        break;
      case "history":
        this.headerTitle = a("nav.history");
        break;
      case "search":
        this.headerTitle = a("nav.search");
        break;
      case "settings":
        this.headerTitle = a("nav.settings");
        break;
    }
    this.requestUpdate();
  }
  // ---- overlays / flows ----
  openAddMenu() {
    this.overlay = "add-menu";
  }
  closeOverlay() {
    this.overlay = "none", this.pendingProduct = void 0, this.moveItem = void 0;
  }
  startScan(e) {
    this.scanMode = e, this.scanSession = 0, this.overlay = "scanner";
  }
  async onScanCode(e) {
    const t = e.detail.code;
    if (this.scanMode === "barcode-for-product" && this.pendingProduct) {
      const s = [...this.pendingProduct.barcodes, t];
      await this.appState.api.updateProduct(this.pendingProduct.id, { barcodes: s }), this.toastEl?.show(a("toast.moved", { product: this.pendingProduct.name })), this.closeOverlay();
      return;
    }
    this.scanLooking = !0;
    try {
      const s = await this.appState.api.barcodeLookup(t);
      if (s.match === "local")
        this.pendingProduct = s.product, this.afterProductChosen();
      else if (s.match === "off") {
        const i = await this.appState.api.createProduct({
          name: s.suggestion.name,
          category: s.suggestion.suggested_category,
          barcodes: [s.suggestion.code]
        });
        this.pendingProduct = i.product, this.afterProductChosen();
      } else
        this.presetBarcode = t, this.presetName = "", this.overlay = "new-product";
    } finally {
      this.scanLooking = !1;
    }
  }
  afterProductChosen() {
    this.scanMode === "consume" ? this.overlay = "dispense" : this.overlay = "add-form";
  }
  openAddForm(e) {
    this.pendingProduct = e, this.overlay = e ? "add-form" : "picker";
  }
  onAdded(e) {
    const { next: t, location: s } = e.detail, i = this.pendingProduct, o = e.detail.item?.quantity ?? "";
    this.toastEl?.show(
      a("toast.added", { product: i?.name ?? "", qty: o, location: s }),
      void 0
    ), t ? this.startScan("add") : this.closeOverlay();
  }
  onDispensed(e) {
    this.toastEl?.show(a("toast.consumed", e.detail)), this.scanSerial && this.scanMode === "consume" ? this.startScan("consume") : this.closeOverlay();
  }
  onProductPicked(e) {
    this.pendingProduct = e.detail.product, this.overlay = this.scanMode === "consume" ? "dispense" : "add-form";
  }
  onNewProduct(e) {
    this.presetName = e.detail?.name ?? "", this.presetBarcode = "", this.overlay = "new-product";
  }
  onProductSaved(e) {
    this.pendingProduct = e.detail.product, this.overlay = "add-form";
  }
  async newRoom() {
    const e = prompt(a("dashboard.new_room"));
    if (e?.trim()) {
      const { room: t } = await this.appState.api.createRoom(e.trim());
      await this.appState.api.createShelf(t.id, "Półka 1");
    }
  }
  async onMovePicked(e) {
    if (!this.moveItem) return;
    const t = e.detail.shelfId, s = this.moveItem.product?.name ?? "";
    await this.appState.api.moveItem(this.moveItem.id, t), this.toastEl?.show(a("toast.moved", { product: s })), this.closeOverlay();
  }
  async openStatusList(e) {
    if (this.statusFilter = e, e === "low_stock")
      this.statusItems = [];
    else {
      const t = await this.appState.api.listItems({ status: e });
      this.statusItems = t.items;
    }
    this.overlay = "status";
  }
  async trashStatusItem(e) {
    await this.appState.api.deleteItem(e.id, "expired"), this.statusItems = this.statusItems.filter((t) => t.id !== e.id), this.toastEl?.show(a("toast.deleted", { product: e.product?.name ?? "" }));
  }
  // ---- render ----
  render() {
    return this.ready ? this.appState.error ? d`<div class="looking">${a("common.error")}</div>` : this.overlay === "scanner" ? d`
        <spz-scanner
          .sessionCount=${this.scanSession}
          .serial=${this.scanSerial}
          @code=${(e) => this.onScanCode(e)}
          @serial-changed=${(e) => this.scanSerial = e.detail.serial}
          @scanner-close=${() => this.closeOverlay()}
        ></spz-scanner>
        ${this.scanLooking ? d`<div class="looking">${a("scan.lookup")}</div>` : u}
        <spz-toast></spz-toast>
      ` : d`
      <div class="shell">
        ${this.narrow ? this.renderMobileHeader() : this.renderDesktopBar()}
        <div class="content">
          <div class="inner ${this.narrow ? "" : "desktop"}">${this.renderView()}</div>
        </div>
        ${this.narrow ? this.renderNav() : u}
      </div>
      ${this.renderOverlays()}
      <spz-confirm-dialog
        .open=${!!this.confirmCfg}
        .heading=${this.confirmCfg?.heading ?? ""}
        .body=${this.confirmCfg?.body ?? ""}
        @confirm-cancel=${() => this.confirmCfg = void 0}
        @confirm-ok=${() => {
      this.confirmCfg?.onOk(), this.confirmCfg = void 0;
    }}
      ></spz-confirm-dialog>
      <spz-toast></spz-toast>
    ` : d`<div class="looking">${a("common.loading")}</div>`;
  }
  renderMobileHeader() {
    const e = this.current.view !== "dashboard";
    return d`<div class="m-header">
      ${e ? d`<button class="back" aria-label=${a("common.back")} @click=${() => us()}>‹</button>` : u}
      <div class="title">
        ${this.headerSub ? d`<div class="sub">${this.headerSub}</div>` : u}
        ${this.headerTitle}
      </div>
    </div>`;
  }
  renderDesktopBar() {
    const e = [
      { view: "dashboard", label: a("nav.dashboard") },
      { view: "catalog", label: a("nav.catalog") },
      { view: "history", label: a("nav.history") },
      { view: "settings", label: a("nav.settings") }
    ];
    return d`<div class="d-bar">
      <div class="brand"><span>🫙</span> ${a("app.title")}</div>
      <div class="d-tabs">
        ${e.map(
      (t) => d`<button
            class=${this.current.view === t.view ? "active" : ""}
            @click=${() => z(t.view)}
          >${t.label}</button>`
    )}
      </div>
      <div class="d-actions">
        <button class="d-search" @click=${() => z("search")}>🔍 ${a("search.placeholder")}</button>
        <button class="d-add" @click=${() => this.openAddMenu()}>⊕ ${a("common.add")}</button>
      </div>
    </div>`;
  }
  renderNav() {
    const e = [
      { view: "dashboard", icon: "🏠", label: a("nav.dashboard") },
      { view: "catalog", icon: "📖", label: a("nav.rooms") }
    ], t = [
      { view: "search", icon: "🔍", label: a("nav.search") },
      { view: "history", icon: "🕓", label: a("nav.more") }
    ];
    return d`<div class="m-nav">
      ${e.map(
      (s) => d`<button class=${this.current.view === s.view ? "active" : ""} @click=${() => z(s.view)}>
          <span class="ico">${s.icon}</span><span class="lbl">${s.label}</span>
        </button>`
    )}
      <button style="visibility:hidden"></button>
      ${t.map(
      (s) => d`<button class=${this.current.view === s.view ? "active" : ""} @click=${() => z(s.view)}>
          <span class="ico">${s.icon}</span><span class="lbl">${s.label}</span>
        </button>`
    )}
      <button class="fab" aria-label=${a("common.add")} @click=${() => this.openAddMenu()}>＋</button>
    </div>`;
  }
  renderView() {
    const e = this.current, t = this.appState;
    switch (e.view) {
      case "room":
        return d`<spz-view-room .appState=${t} .narrow=${this.narrow} .roomId=${e.id ?? ""}></spz-view-room>`;
      case "shelf":
        return d`<spz-view-shelf .appState=${t} .narrow=${this.narrow} .shelfId=${e.id ?? ""}></spz-view-shelf>`;
      case "catalog":
        return d`<spz-view-catalog .appState=${t} .narrow=${this.narrow}></spz-view-catalog>`;
      case "product":
        return d`<spz-view-product .appState=${t} .narrow=${this.narrow} .productId=${e.id ?? ""}></spz-view-product>`;
      case "history":
        return d`<spz-view-history .appState=${t} .narrow=${this.narrow}></spz-view-history>`;
      case "search":
        return d`<spz-view-search .appState=${t} .narrow=${this.narrow}></spz-view-search>`;
      case "settings":
        return d`<spz-view-settings .appState=${t} .narrow=${this.narrow} .version=${xi}></spz-view-settings>`;
      default:
        return d`<spz-view-dashboard .appState=${t} .narrow=${this.narrow}></spz-view-dashboard>`;
    }
  }
  renderStatusList() {
    const e = this.statusFilter === "expired" ? a("status.expired") : this.statusFilter === "expiring_soon" ? a("status.expiring_soon") : a("dashboard.low_stock");
    return this.statusFilter === "low_stock" ? d`<div style="padding:8px 0">
        <div style="font-size:18px;font-weight:500;margin-bottom:12px">${e}</div>
        <button class="btn btn-primary btn-block" @click=${() => {
      this.closeOverlay(), z("catalog");
    }}>
          ${a("nav.catalog")}
        </button>
      </div>` : d`<div style="padding:8px 0">
      <div style="font-size:18px;font-weight:500;margin-bottom:12px">${e}</div>
      ${this.statusItems.length === 0 ? d`<div style="color:var(--spz-text-2);padding:12px 0">${a("dashboard.all_fresh")}</div>` : this.statusItems.map(
      (t) => d`<div style="display:flex;align-items:center;gap:12px;padding:12px 0;border-top:1px solid var(--spz-divider)">
              <span style="font-size:26px" aria-hidden="true">${N(t.product?.emoji ?? "", t.product?.category ?? "other")}</span>
              <button style="flex:1;min-width:0;text-align:left;background:none;border:none;cursor:pointer;color:var(--spz-text)"
                @click=${() => {
        this.closeOverlay(), z("shelf", t.shelf_id);
      }}>
                <div style="font-size:15px;font-weight:500">${t.product?.name ?? ""}</div>
                <div style="font-size:12px;color:var(--spz-text-2)">${t.quantity} ${a("unit." + t.unit)} · ${t.shelf_path ?? ""}</div>
              </button>
              <spz-freshness-badge .status=${t.status} .date=${t.best_before} .precision=${t.best_before_precision} .daysLeft=${t.days_left}></spz-freshness-badge>
              <button class="btn" style="min-height:40px;padding:8px 12px;color:var(--spz-error);border-color:var(--spz-error)"
                @click=${() => this.trashStatusItem(t)}>🗑️</button>
            </div>`
    )}
    </div>`;
  }
  renderOverlays() {
    const e = this.narrow;
    return d`
      <spz-bottom-sheet .open=${this.overlay === "add-menu"} .narrow=${e} @sheet-close=${() => this.closeOverlay()}>
        <div class="add-menu">
          <div class="title">${a("add_menu.title")}</div>
          <button class="primary" @click=${() => this.startScan("add")}><span class="ico">📷</span>${a("add_menu.scan")}</button>
          <button @click=${() => {
      this.scanMode = "add", this.overlay = "picker";
    }}><span class="ico">📖</span>${a("add_menu.catalog")}</button>
          <button @click=${() => this.onNewProduct(new CustomEvent("x"))}><span class="ico">✨</span>${a("add_menu.new")}</button>
          <button @click=${() => this.startScan("consume")}><span class="ico">➖</span>${a("add_menu.consume_scan")}</button>
        </div>
      </spz-bottom-sheet>

      <spz-bottom-sheet .open=${this.overlay === "add-form"} .narrow=${e} @sheet-close=${() => this.closeOverlay()}>
        ${this.overlay === "add-form" ? d`<spz-add-form .appState=${this.appState} .product=${this.pendingProduct}
              .shelfId=${this.pendingShelfId} .narrow=${e}
              @added=${(t) => this.onAdded(t)}
              @change-product=${() => this.overlay = "picker"}></spz-add-form>` : u}
      </spz-bottom-sheet>

      <spz-bottom-sheet .open=${this.overlay === "dispense"} .narrow=${e} @sheet-close=${() => this.closeOverlay()}>
        ${this.overlay === "dispense" ? d`<spz-dispense-form .appState=${this.appState} .product=${this.pendingProduct}
              @dispensed=${(t) => this.onDispensed(t)}></spz-dispense-form>` : u}
      </spz-bottom-sheet>

      <spz-bottom-sheet .open=${this.overlay === "picker"} .narrow=${e} @sheet-close=${() => this.closeOverlay()}>
        ${this.overlay === "picker" ? d`<spz-product-picker .appState=${this.appState}
              @product-picked=${(t) => this.onProductPicked(t)}></spz-product-picker>` : u}
      </spz-bottom-sheet>

      <spz-bottom-sheet .open=${this.overlay === "new-product"} .narrow=${e} @sheet-close=${() => this.closeOverlay()}>
        ${this.overlay === "new-product" ? d`<spz-product-form .appState=${this.appState} .presetName=${this.presetName}
              .presetBarcode=${this.presetBarcode}
              @saved=${(t) => this.onProductSaved(t)}></spz-product-form>` : u}
      </spz-bottom-sheet>

      <spz-bottom-sheet .open=${this.overlay === "status"} .narrow=${e} @sheet-close=${() => this.closeOverlay()}>
        ${this.overlay === "status" ? this.renderStatusList() : u}
      </spz-bottom-sheet>

      <spz-bottom-sheet .open=${this.overlay === "move"} .narrow=${e} @sheet-close=${() => this.closeOverlay()}>
        ${this.overlay === "move" ? d`<spz-location-picker .rooms=${this.appState.rooms ?? []}
              .shelves=${this.moveShelves} @shelf-picked=${(t) => this.onMovePicked(t)}></spz-location-picker>` : u}
      </spz-bottom-sheet>
    `;
  }
};
v.styles = [C, j, g`
    :host {
      display: block;
      height: 100%;
      background: var(--spz-bg);
      color: var(--spz-text);
    }
    .shell { display: flex; flex-direction: column; height: 100%; }
    /* Mobile header */
    .m-header {
      flex: none; display: flex; align-items: center; gap: 12px;
      padding: 16px 16px 12px; border-bottom: 1px solid var(--spz-divider);
      background: var(--spz-bg);
    }
    .m-header .back {
      border: none; background: transparent; color: var(--spz-text);
      font-size: 26px; line-height: 1; cursor: pointer; padding: 0 4px 0 0;
    }
    .m-header .title { flex: 1; font-size: 22px; font-weight: 500; }
    .m-header .sub { font-size: 13px; color: var(--spz-text-2); }
    .m-header .menu { border: none; background: transparent; color: var(--spz-text-2);
      font-size: 22px; cursor: pointer; width: 40px; height: 40px; }
    /* Desktop top bar */
    .d-bar {
      flex: none; display: flex; align-items: center; gap: 22px;
      padding: 0 24px; height: 64px; background: var(--spz-primary); color: #fff;
    }
    .d-bar .brand { display: flex; align-items: center; gap: 10px; font-size: 20px; font-weight: 500; }
    .d-tabs { display: flex; gap: 4px; height: 100%; align-items: stretch; }
    .d-tabs button {
      border: none; background: transparent; color: #fff; cursor: pointer;
      padding: 0 16px; font-size: 14px; font-family: inherit; opacity: .85;
      border-bottom: 3px solid transparent;
    }
    .d-tabs button.active { opacity: 1; border-bottom-color: #fff; font-weight: 500; }
    .d-actions { margin-left: auto; display: flex; align-items: center; gap: 12px; }
    .d-search {
      display: flex; align-items: center; gap: 8px; background: rgba(255,255,255,0.18);
      border-radius: 8px; padding: 8px 14px; width: 240px; color: rgba(255,255,255,0.85);
      font-size: 14px; cursor: pointer; border: none; font-family: inherit;
    }
    .d-add {
      border: none; cursor: pointer; background: #fff; color: var(--spz-primary);
      font-weight: 600; font-size: 14px; padding: 9px 16px; border-radius: 8px; font-family: inherit;
    }
    /* Content */
    .content { flex: 1; overflow-y: auto; }
    .inner { padding: 16px; }
    .inner.desktop { max-width: 1200px; margin: 0 auto; padding: 24px; }
    /* Bottom nav + FAB */
    .m-nav {
      flex: none; position: relative; height: 64px; border-top: 1px solid var(--spz-divider);
      background: var(--spz-card); display: flex; align-items: stretch;
    }
    .m-nav button {
      flex: 1; border: none; background: transparent; cursor: pointer;
      display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 3px;
      color: var(--spz-text-2); font-family: inherit;
    }
    .m-nav button.active { color: var(--spz-primary); }
    .m-nav .ico { font-size: 20px; line-height: 1; }
    .m-nav .lbl { font-size: 10px; }
    .fab {
      position: absolute; bottom: 42px; left: 50%; transform: translateX(-50%);
      width: 58px; height: 58px; border-radius: 50%; border: 4px solid var(--spz-bg);
      background: var(--spz-primary); color: #fff; font-size: 30px; line-height: 1;
      cursor: pointer; box-shadow: 0 6px 18px rgba(0,0,0,0.35); z-index: 5;
    }
    .add-menu { display: flex; flex-direction: column; gap: 10px; }
    .add-menu .title { font-size: 18px; font-weight: 500; margin-bottom: 4px; }
    .add-menu button {
      display: flex; align-items: center; gap: 14px; padding: 16px; border-radius: 12px;
      border: 1px solid var(--spz-divider); background: var(--spz-card); color: var(--spz-text);
      font-size: 15px; cursor: pointer; font-family: inherit; text-align: left; min-height: 48px;
    }
    .add-menu button.primary { background: var(--spz-primary); color: #fff; border: none; }
    .add-menu .ico { font-size: 22px; }
    .looking { text-align: center; padding: 20px; color: var(--spz-text-2); }
  `];
y([
  p({ attribute: !1 })
], v.prototype, "hass", 2);
y([
  p({ type: Boolean })
], v.prototype, "narrow", 2);
y([
  p({ attribute: !1 })
], v.prototype, "route", 2);
y([
  p({ attribute: !1 })
], v.prototype, "panel", 2);
y([
  c()
], v.prototype, "current", 2);
y([
  c()
], v.prototype, "overlay", 2);
y([
  c()
], v.prototype, "pendingProduct", 2);
y([
  c()
], v.prototype, "pendingShelfId", 2);
y([
  c()
], v.prototype, "scanMode", 2);
y([
  c()
], v.prototype, "scanSerial", 2);
y([
  c()
], v.prototype, "scanSession", 2);
y([
  c()
], v.prototype, "scanLooking", 2);
y([
  c()
], v.prototype, "moveItem", 2);
y([
  c()
], v.prototype, "statusFilter", 2);
y([
  c()
], v.prototype, "statusItems", 2);
y([
  c()
], v.prototype, "moveShelves", 2);
y([
  c()
], v.prototype, "presetName", 2);
y([
  c()
], v.prototype, "presetBarcode", 2);
y([
  c()
], v.prototype, "headerTitle", 2);
y([
  c()
], v.prototype, "headerSub", 2);
y([
  c()
], v.prototype, "ready", 2);
y([
  c()
], v.prototype, "confirmCfg", 2);
y([
  Ut("spz-toast")
], v.prototype, "toastEl", 2);
v = y([
  b("spizarnia-panel")
], v);
export {
  v as SpizarniaPanel
};
