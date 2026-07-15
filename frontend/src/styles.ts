import { css } from "lit";

// Shared tokens + utilities. HA tokens propagate into shadow DOM via inheritance;
// fallbacks keep the panel usable outside HA (DESIGN §13).
export const tokens = css`
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
`;

export const shared = css`
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
`;
