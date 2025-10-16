import type { FC } from "react";
import { useEffect, useRef, useState } from "react";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChevronDown, faMoon, faSignOut, faSun } from "@fortawesome/free-solid-svg-icons";
import { cn } from "../../lib/cn";

export type PanelHeaderNavItem = {
  id: string;
  label: string;
};

type PanelHeaderProps = {
  navItems: PanelHeaderNavItem[];
  activeTab: string;
  onSelectTab: (id: string) => void;
  theme: "light" | "dark";
  onToggleTheme: () => void;
  userName: string;
  userInitials: string;
  onLogout: () => void;
};

type NavTabsProps = {
  navItems: PanelHeaderNavItem[];
  activeTab: string;
  onSelectTab: (id: string) => void;
  className?: string;
};

const NavTabs: FC<NavTabsProps> = ({
  navItems,
  activeTab,
  onSelectTab,
  className,
}) => (
  <nav
    className={cn(
      "flex shrink-0 items-center gap-2 overflow-x-auto pr-1 justify-start",
      className,
    )}
    aria-label="Páginas de la aplicación"
  >
    {navItems.map((item) => (
      <button
        key={item.id}
        type="button"
        className={cn(
          "rounded-full px-4 py-2 text-sm font-semibold transition-colors duration-200",
          activeTab === item.id
            ? "bg-[rgba(var(--accent-color),0.16)] text-[rgb(var(--accent-color))]"
            : "text-[color:var(--text-muted)] hover:text-[color:var(--text-primary)]",
        )}
        onClick={() => onSelectTab(item.id)}
        aria-current={activeTab === item.id ? "page" : undefined}
      >
        {item.label}
      </button>
    ))}
  </nav>
);

export const PanelHeader: FC<PanelHeaderProps> = ({
  navItems,
  activeTab,
  onSelectTab,
  theme,
  onToggleTheme,
  userName,
  userInitials,
  onLogout,
}) => {
  const [isUserMenuOpen, setIsUserMenuOpen] = useState<boolean>(false);
  const menuRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!isUserMenuOpen) {
      return;
    }

    const handleClickAway = (event: MouseEvent) => {
      if (
        menuRef.current &&
        event.target instanceof Node &&
        !menuRef.current.contains(event.target)
      ) {
        setIsUserMenuOpen(false);
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsUserMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickAway);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handleClickAway);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [isUserMenuOpen]);

  const isDarkMode = theme === "dark";
  const themeLabel = isDarkMode
    ? "Cambiar a modo claro"
    : "Cambiar a modo oscuro";
  const logoutLabel = "Cerrar sesión";
  const profileMenuLabel = isUserMenuOpen
    ? "Cerrar menú de usuario"
    : "Abrir menú de usuario";

  const actionBaseClasses =
    "inline-flex items-center justify-center rounded-full border border-[color:var(--border-soft)] bg-[var(--surface-soft)] text-[color:var(--text-secondary)] transition-transform duration-200 hover:bg-[var(--surface-subtle)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[rgb(var(--accent-color))] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--surface)] disabled:opacity-60 transform-gpu will-change-transform";

  return (
    <header className="sticky top-0 z-50 border-b border-[color:var(--border-soft)] bg-[var(--surface)]/92 backdrop-blur-xl">
      <div className="flex w-full flex-col gap-3 px-4 py-4 sm:px-6 lg:px-8">
        <div className="flex w-full flex-wrap items-center gap-3">
          <NavTabs
            navItems={navItems}
            activeTab={activeTab}
            onSelectTab={onSelectTab}
            className="flex-1 min-w-0 justify-start"
          />

          <div className="ml-auto flex shrink-0 items-center gap-3">
            <div ref={menuRef} className="relative">
              <button
                type="button"
                className={cn(
                  actionBaseClasses,
                  "h-11 items-center gap-2 border-transparent bg-[var(--surface)] px-2 pl-2 pr-3 text-[color:var(--text-secondary)]",
                )}
                onClick={() => setIsUserMenuOpen((prev) => !prev)}
                aria-haspopup="menu"
                aria-expanded={isUserMenuOpen}
                aria-label={profileMenuLabel}
                title={profileMenuLabel}
              >
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[rgba(var(--accent-color),0.2)] text-sm font-semibold tracking-wide text-[rgb(var(--accent-color))]">
                  {userInitials}
                </span>
                <FontAwesomeIcon
                  icon={faChevronDown}
                  className={cn(
                    "h-3 w-3 transition-transform duration-200",
                    isUserMenuOpen && "rotate-180",
                  )}
                  aria-hidden="true"
                />
              </button>

              {isUserMenuOpen && (
                <div
                  role="menu"
                  aria-label="Menú de usuario"
                  className="absolute right-0 z-10 mt-3 w-64 rounded-2xl border border-[color:var(--border-soft)] bg-[color:var(--surface)] p-3 shadow-sm"
                >
                  <div className="mb-2 rounded-xl bg-[var(--surface-soft)] px-3 py-2">
                    <p className="text-xs font-semibold tracking-wide text-[color:var(--text-muted)]">
                      Sesión activa
                    </p>
                    <p className="text-sm font-semibold text-[color:var(--text-primary)]">
                      {userName}
                    </p>
                  </div>

                  <button
                    type="button"
                    role="menuitem"
                    className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium text-[color:var(--text-secondary)] transition hover:bg-[var(--surface-subtle)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[rgb(var(--accent-color))] focus-visible:ring-offset-1 focus-visible:ring-offset-[var(--surface)]"
                    onClick={() => {
                      setIsUserMenuOpen(false);
                      onToggleTheme();
                    }}
                    aria-label={themeLabel}
                    title={themeLabel}
                  >
                    <FontAwesomeIcon
                      icon={isDarkMode ? faSun : faMoon}
                      className="h-4 w-4"
                      aria-hidden="true"
                    />
                    <span>{themeLabel}</span>
                  </button>

                  <button
                    type="button"
                    role="menuitem"
                    className="mt-1 flex w-full items-center gap-3 rounded-xl px-3 py-2 text-sm font-semibold text-red-500 transition hover:bg-red-50/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-200 focus-visible:ring-offset-1 focus-visible:ring-offset-[var(--surface)]"
                    onClick={() => {
                      setIsUserMenuOpen(false);
                      onLogout();
                    }}
                    aria-label={logoutLabel}
                    title={logoutLabel}
                  >
                    <FontAwesomeIcon
                      icon={faSignOut}
                      className="h-4 w-4"
                      aria-hidden="true"
                    />
                    <span>{logoutLabel}</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
