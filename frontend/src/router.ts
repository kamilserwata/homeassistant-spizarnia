// Internal routing on top of the HA `route` prop (SPEC §9.3, DESIGN §4).

export type ViewName =
  | "dashboard"
  | "room"
  | "shelf"
  | "scan"
  | "add"
  | "catalog"
  | "product"
  | "history"
  | "search"
  | "settings";

export interface Route {
  view: ViewName;
  id?: string;
  query?: Record<string, string>;
}

const BASE = "/spizarnia";

export function parsePath(pathname: string): Route {
  let rest = pathname.startsWith(BASE) ? pathname.slice(BASE.length) : pathname;
  rest = rest.replace(/^\/+/, "").replace(/\/+$/, "");
  if (!rest) return { view: "dashboard" };
  const [head, id] = rest.split("/");
  switch (head) {
    case "room":
      return { view: "room", id };
    case "shelf":
      return { view: "shelf", id };
    case "scan":
      return { view: "scan" };
    case "add":
      return { view: "add" };
    case "catalog":
      return id ? { view: "product", id } : { view: "catalog" };
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

export function buildPath(view: ViewName, id?: string): string {
  switch (view) {
    case "dashboard":
      return BASE;
    case "product":
      return `${BASE}/catalog/${id}`;
    case "room":
    case "shelf":
      return `${BASE}/${view}/${id}`;
    default:
      return `${BASE}/${view}`;
  }
}

// Navigate the HA way: pushState + location-changed so the sidebar updates.
export function navigate(view: ViewName, id?: string): void {
  const path = buildPath(view, id);
  history.pushState(null, "", path);
  window.dispatchEvent(new Event("location-changed"));
}

export function navigateBack(): void {
  history.back();
}
