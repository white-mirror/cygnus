import type { CSSProperties, JSX } from "react";
import { useEffect, useMemo, useState } from "react";

import { DeviceList } from "../../components/control-panel/DeviceList";
import { FanSelector } from "../../components/control-panel/FanSelector";
import { HomeSelector } from "../../components/control-panel/HomeSelector";
import { ModeSelector } from "../../components/control-panel/ModeSelector";
import {
  PanelHeader,
  type PanelHeaderNavItem,
} from "../../components/control-panel/PanelHeader";
import { TemperatureCard } from "../../components/control-panel/TemperatureCard";
import { TEMPERATURE_STEP } from "../../features/control-panel/constants";
import { useControlPanel } from "../../features/control-panel/useControlPanel";

const NAV_ITEMS: PanelHeaderNavItem[] = [
  { id: "home", label: "Inicio" },
  { id: "control", label: "Control" },
  { id: "history", label: "Historial" },
];

const USER_PROFILE = {
  name: "Ana Martinez",
  initials: "AM",
};

const THEME_STORAGE_KEY = "ioga-ui-theme";

const readStoredTheme = (): "light" | "dark" => {
  if (typeof window === "undefined") {
    return "light";
  }

  try {
    const storedTheme = window.localStorage.getItem(THEME_STORAGE_KEY);

    if (storedTheme === "light" || storedTheme === "dark") {
      return storedTheme;
    }
  } catch {
    // Ignore storage access issues (e.g., private browsing modes)
  }

  if (
    typeof window.matchMedia === "function" &&
    window.matchMedia("(prefers-color-scheme: dark)").matches
  ) {
    return "dark";
  }

  return "light";
};

export const ControlPanelPage = (): JSX.Element => {
  const { state, handlers } = useControlPanel();
  const [theme, setTheme] = useState<"light" | "dark">(() => {
    const initialTheme = readStoredTheme();

    if (typeof document !== "undefined") {
      document.documentElement.dataset.theme = initialTheme;
    }

    return initialTheme;
  });
  const [activeTab, setActiveTab] = useState<string>("control");

  useEffect(() => {
    if (typeof document !== "undefined") {
      document.documentElement.dataset.theme = theme;
    }

    if (typeof window !== "undefined") {
      try {
        window.localStorage.setItem(THEME_STORAGE_KEY, theme);
      } catch {
        // Ignore storage access issues
      }
    }
  }, [theme]);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const handleStorage = (event: StorageEvent) => {
      if (
        event.key === THEME_STORAGE_KEY &&
        (event.newValue === "light" || event.newValue === "dark")
      ) {
        setTheme(event.newValue);
      }
    };

    window.addEventListener("storage", handleStorage);

    return () => {
      window.removeEventListener("storage", handleStorage);
    };
  }, []);

  const toggleTheme = (): void => {
    setTheme((current) => (current === "dark" ? "light" : "dark"));
  };

  const {
    homes,
    devices,
    selectedHomeId,
    selectedDeviceId,
    controlState,
    isFetchingHomes,
    isFetchingDevices,
    isUpdatingDevice,
    errorMessage,
    statusMessage,
    actualFanSpeed,
    // temperatureTrend,
    currentTemperatureLabel,
    targetTemperatureLabel,
    hasPendingChanges,
    controlsDisabled,
    accentColor,
    modePreviewColor,
    confirmAccentColor,
  } = state;

  const accentStyle = useMemo(
    () =>
      ({
        "--accent-color": accentColor,
        "--confirm-accent": confirmAccentColor,
      }) as CSSProperties,
    [accentColor, confirmAccentColor]
  );

  const applyButtonStyle = useMemo(
    () =>
      ({
        "--action-accent": confirmAccentColor,
      }) as CSSProperties,
    [confirmAccentColor]
  );

  const handleLogout = (): void => {
    // Placeholder for the real logout flow
    console.info("Logout action requested");
  };

  const errorBanner = errorMessage ? (
    <div className="rounded-2xl border border-red-200/70 bg-red-50/90 px-4 py-3 text-sm font-medium text-red-700">
      {errorMessage}
    </div>
  ) : null;

  return (
    <div
      className="relative flex min-h-screen flex-col bg-transparent text-[color:var(--text-primary)]"
      style={accentStyle}
    >
      <PanelHeader
        navItems={NAV_ITEMS}
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        theme={theme}
        onToggleTheme={toggleTheme}
        userName={USER_PROFILE.name}
        userInitials={USER_PROFILE.initials}
        onLogout={handleLogout}
      />

      <main className="relative z-0 flex flex-1 flex-col px-4 py-4 sm:px-6 lg:px-8">
        <div className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-6 pb-12 xl:max-w-7xl">
          <div className="flex flex-1 flex-col gap-6 lg:flex-row lg:items-start lg:justify-center lg:gap-10">
            <section className="flex w-full flex-col gap-6 lg:min-w-[250px] lg:max-w-[300px]">
              <HomeSelector
                homes={homes}
                selectedHomeId={selectedHomeId}
                disabled={isFetchingHomes}
                onSelect={handlers.selectHome}
              />

              <DeviceList
                devices={devices}
                selectedDeviceId={selectedDeviceId}
                isLoading={isFetchingDevices}
                isBusy={isUpdatingDevice}
                onSelect={handlers.selectDevice}
                onQuickToggle={handlers.quickToggleDevicePower}
                className="flex-1"
              />
            </section>

            <section className="flex w-full flex-col gap-6 max-w-full lg:max-w-[500px]">
              <div className="flex h-full w-full flex-col rounded-3xl border border-[color:var(--border-soft)] bg-[var(--surface)]/92 backdrop-blur-md shadow-sm">
                <header className="flex flex-col gap-2 border-b border-[color:var(--border-soft)] px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
                  <h1 className="text-2xl font-semibold text-[color:var(--text-primary)]">
                    Panel de Control
                  </h1>
                  {statusMessage && statusMessage.length > 0 ? (
                    <span className="text-xs font-semibold tracking-wide text-[color:var(--text-muted)]">
                      {statusMessage}
                    </span>
                  ) : null}
                </header>

                <div className="flex flex-col gap-6 p-4">
                  {errorBanner}

                  <TemperatureCard
                    currentLabel={currentTemperatureLabel}
                    targetLabel={targetTemperatureLabel}
                    temperatureValue={
                      controlState ? controlState.temperature : null
                    }
                    controlsDisabled={controlsDisabled}
                    // temperatureTrend={temperatureTrend}
                    onIncrease={() =>
                      handlers.adjustTemperature(TEMPERATURE_STEP)
                    }
                    onDecrease={() =>
                      handlers.adjustTemperature(-TEMPERATURE_STEP)
                    }
                    onChange={handlers.setTemperature}
                    variant="section"
                  />

                  {/* <div className="grid gap-4 lg:grid-cols-2"> */}
                    <ModeSelector
                      activeMode={controlState ? controlState.mode : null}
                      controlsDisabled={controlsDisabled}
                      accentPreview={modePreviewColor}
                      onSelect={handlers.selectMode}
                      variant="section"
                      className="h-full"
                    />

                    <FanSelector
                      actualFanSpeed={actualFanSpeed}
                      pendingFanSpeed={
                        controlState ? controlState.fanSpeed : null
                      }
                      controlsDisabled={controlsDisabled}
                      onSelect={handlers.selectFanSpeed}
                      variant="section"
                      className="h-full"
                    />
                  {/* </div> */}
                </div>

                <footer className="flex flex-col gap-3 border-t border-[color:var(--border-soft)] bg-[var(--surface)]/80 px-4 py-4 sm:flex-row sm:items-center sm:justify-end sm:gap-4 sm:px-6">
                  <button
                    type="button"
                    className="inline-flex items-center justify-center rounded-full border border-[color:var(--border-soft)] bg-[var(--surface)] px-5 py-2 text-sm font-semibold text-[color:var(--text-secondary)] transition hover:bg-[var(--surface-subtle)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--border-soft)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--surface)] disabled:cursor-not-allowed disabled:opacity-50"
                    onClick={() => {
                      handlers.resetChanges();
                    }}
                    disabled={!hasPendingChanges || isUpdatingDevice}
                  >
                    Cancelar
                  </button>

                  <button
                    type="button"
                    className="inline-flex items-center justify-center rounded-full px-6 py-2 text-sm font-semibold text-white transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[rgba(var(--action-accent),0.5)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--surface)] disabled:cursor-not-allowed disabled:opacity-60 bg-[rgb(var(--action-accent))] hover:bg-[rgba(var(--action-accent),0.92)]"
                    style={applyButtonStyle}
                    onClick={() => {
                      void handlers.submitChanges();
                    }}
                    disabled={!hasPendingChanges || controlsDisabled}
                  >
                    Aplicar
                  </button>
                </footer>
              </div>
            </section>
          </div>
        </div>
      </main>
    </div>
  );
};
