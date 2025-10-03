import type { JSX } from "react";

export type IconProps = {
  className?: string;
};

export const CheckIcon = ({ className }: IconProps): JSX.Element => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    aria-hidden="true"
    focusable="false"
    stroke="currentColor"
    strokeWidth={1.8}
    fill="none"
  >
    <path d="M5 12.5 10 17l9-10" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export const PowerIcon = ({ className }: IconProps): JSX.Element => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    aria-hidden="true"
    focusable="false"
  >
    <circle
      cx="12"
      cy="12"
      r="8.5"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.6}
    />

    <line
      x1="12"
      y1="6"
      x2="12"
      y2="12.5"
      stroke="currentColor"
      strokeWidth={1.6}
      strokeLinecap="round"
    />
  </svg>
);

export const SnowflakeIcon = ({ className }: IconProps): JSX.Element => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    aria-hidden="true"
    focusable="false"
  >
    <path
      d="M12 2.5v19"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.4}
      strokeLinecap="round"
    />

    <path
      d="M4.2 7l15.6 10"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.4}
      strokeLinecap="round"
    />

    <path
      d="M4.2 17l15.6-10"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.4}
      strokeLinecap="round"
    />

    <path
      d="M2.8 12h18.4"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.4}
      strokeLinecap="round"
    />
  </svg>
);

export const SunIcon = ({ className }: IconProps): JSX.Element => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    aria-hidden="true"
    focusable="false"
  >
    <circle
      cx="12"
      cy="12"
      r="4.2"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.6}
    />

    <path
      d="M12 3v2.1"
      stroke="currentColor"
      strokeWidth={1.4}
      strokeLinecap="round"
    />

    <path
      d="M12 18.9V21"
      stroke="currentColor"
      strokeWidth={1.4}
      strokeLinecap="round"
    />

    <path
      d="M4.7 4.7l1.5 1.5"
      stroke="currentColor"
      strokeWidth={1.4}
      strokeLinecap="round"
    />

    <path
      d="M17.8 17.8l1.5 1.5"
      stroke="currentColor"
      strokeWidth={1.4}
      strokeLinecap="round"
    />

    <path
      d="M3 12h2.1"
      stroke="currentColor"
      strokeWidth={1.4}
      strokeLinecap="round"
    />

    <path
      d="M18.9 12H21"
      stroke="currentColor"
      strokeWidth={1.4}
      strokeLinecap="round"
    />

    <path
      d="M4.7 19.3l1.5-1.5"
      stroke="currentColor"
      strokeWidth={1.4}
      strokeLinecap="round"
    />

    <path
      d="M17.8 6.2l1.5-1.5"
      stroke="currentColor"
      strokeWidth={1.4}
      strokeLinecap="round"
    />
  </svg>
);

export const AutoIcon = ({ className }: IconProps): JSX.Element => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    aria-hidden="true"
    focusable="false"
  >
    <circle
      cx="12"
      cy="12"
      r="4.4"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
    />

    <path
      d="M4 12a8 8 0 0 1 13.5-5.6"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.4}
      strokeLinecap="round"
    />

    <path
      d="M18 19.8V16h-3.8"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.4}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

export const FanIcon = ({ className }: IconProps): JSX.Element => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    aria-hidden="true"
    focusable="false"
  >
    <circle cx="12" cy="12" r="1.4" fill="currentColor" />

    <path
      d="M12 5c1.8 0 3.3 1.4 3.3 3.2 0 1.5-1 2.8-2.5 3.1"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.4}
      strokeLinecap="round"
      strokeLinejoin="round"
    />

    <path
      d="M8.4 7.4c-1.6 0.8-2.3 2.8-1.5 4.4 0.6 1.2 1.9 1.8 3.2 1.7"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.4}
      strokeLinecap="round"
      strokeLinejoin="round"
    />

    <path
      d="M9.6 18.5c-1.5-0.9-2-3-0.9-4.5 0.8-1.1 2.1-1.6 3.3-1.2"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.4}
      strokeLinecap="round"
      strokeLinejoin="round"
    />

    <path
      d="M15.5 15.2c0.9 1.5 0.2 3.5-1.4 4.3-1.3 0.6-2.7 0.2-3.6-0.8"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.4}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);
