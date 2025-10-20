import type { CSSProperties, JSX, TouchEventHandler } from "react";
import { useEffect, useMemo, useRef, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft, faPowerOff } from "@fortawesome/free-solid-svg-icons";

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
  const [activeMobileSlide, setActiveMobileSlide] = useState<number>(0);
  const touchStartXRef = useRef<number | null>(null);
  const touchCurrentXRef = useRef<number | null>(null);

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

  const goToMobileSlide = (index: number): void => {
    setActiveMobileSlide(() => {
      if (index < 0) {
        return 0;
      }

      if (index > 1) {
        return 1;
      }

      return index;
    });
  };

  const goToNextSlide = (): void => {
    setActiveMobileSlide((current) => (current < 1 ? current + 1 : current));
  };

  const goToPreviousSlide = (): void => {
    setActiveMobileSlide((current) => (current > 0 ? current - 1 : current));
  };

  const handleTouchStart: TouchEventHandler<HTMLDivElement> = (event) => {
    const touch = event.touches[0];

    if (!touch) {
      return;
    }

    touchStartXRef.current = touch.clientX;
    touchCurrentXRef.current = touch.clientX;
  };

  const handleTouchMove: TouchEventHandler<HTMLDivElement> = (event) => {
    if (touchStartXRef.current === null) {
      return;
    }

    const touch = event.touches[0];

    if (!touch) {
      return;
    }

    touchCurrentXRef.current = touch.clientX;
  };

  const resetTouchTracking = (): void => {
    touchStartXRef.current = null;
    touchCurrentXRef.current = null;
  };

  const handleTouchEnd: TouchEventHandler<HTMLDivElement> = () => {
    if (touchStartXRef.current === null || touchCurrentXRef.current === null) {
      resetTouchTracking();
      return;
    }

    const deltaX = touchCurrentXRef.current - touchStartXRef.current;

    if (Math.abs(deltaX) > 40) {
      if (deltaX < 0) {
        goToNextSlide();
      } else {
        goToPreviousSlide();
      }
    }

    resetTouchTracking();
  };

  const handleTouchCancel: TouchEventHandler<HTMLDivElement> = () => {
    resetTouchTracking();
  };

  const {
    homes,
    devices,
    selectedHomeId,
    selectedDeviceId,
    actualPowerOn,
    controlState,
    isFetchingHomes,
    isFetchingDevices,
    isUpdatingDevice,
    errorMessage,
    statusMessage,
    actualMode,
    actualFanSpeed,
    fanControlVisible,
    temperatureControlVisible,
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

  const handleSelectDevice = (deviceId: number): void => {
    handlers.selectDevice(deviceId);

    if (
      typeof window !== "undefined" &&
      !window.matchMedia("(min-width: 1024px)").matches
    ) {
      goToMobileSlide(1);
    }
  };

  const errorBanner = errorMessage ? (
    <div className="rounded-2xl border border-red-200/70 bg-red-50/90 px-4 py-3 text-sm font-medium text-red-700">
      {errorMessage}
    </div>
  ) : null;

  const selectorsSection = (
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
        onSelect={handleSelectDevice}
        onQuickToggle={handlers.quickToggleDevicePower}
        className="flex-1"
      />
    </section>
  );

  const controlSection = (
    <section className="flex w-full flex-col gap-6 max-w-full lg:max-w-[500px]">
      <div className="flex h-full w-full flex-col rounded-3xl border-none bg-[var(--surface)]/92 backdrop-blur-md shadow-sm">
        <header className="flex flex-col gap-2 pb-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex w-full items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <button
                type="button"
                className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-[color:var(--border-soft)] bg-[var(--surface)] text-[color:var(--text-primary)] transition hover:bg-[var(--surface-subtle)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--border-soft)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--surface)] disabled:cursor-not-allowed disabled:opacity-60 lg:hidden"
                aria-label="Volver a la selección"
                onClick={() => {
                  goToPreviousSlide();
                }}
                disabled={activeMobileSlide === 0}
              >
                <FontAwesomeIcon icon={faArrowLeft} className="h-4 w-4" />
              </button>

              <h1 className="text-2xl font-semibold text-[color:var(--text-primary)]">
                Panel de Control
              </h1>
            </div>

            <button
              type="button"
              className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-[rgba(var(--action-accent),0.35)] bg-[rgba(var(--action-accent),0.12)] text-[rgb(var(--action-accent))] transition hover:bg-[rgba(var(--action-accent),0.18)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[rgba(var(--action-accent),0.4)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--surface)] disabled:cursor-not-allowed disabled:opacity-60 lg:hidden"
              style={applyButtonStyle}
              aria-label={
                actualPowerOn
                  ? "Apagar equipo seleccionado"
                  : "Encender equipo seleccionado"
              }
              onClick={() => {
                handlers.togglePanelPower();
              }}
              disabled={
                selectedDeviceId === null ||
                isUpdatingDevice ||
                controlsDisabled
              }
            >
              <FontAwesomeIcon icon={faPowerOff} className="h-4 w-4" />
            </button>
          </div>

          {statusMessage && statusMessage.length > 0 ? (
            <span className="text-xs font-semibold tracking-wide text-[color:var(--text-muted)]">
              {statusMessage}
            </span>
          ) : null}
        </header>

        <div className="flex flex-col gap-4 p-0">
          {errorBanner}
          <div>
            <ModeSelector
              activeMode={controlState ? controlState.mode : null}
              appliedMode={actualMode}
              controlsDisabled={controlsDisabled}
              accentPreview={modePreviewColor}
              onSelect={handlers.selectMode}
              variant="section"
              className="h-full"
            />

            {fanControlVisible ? (
              <FanSelector
                actualFanSpeed={actualFanSpeed}
                pendingFanSpeed={controlState ? controlState.fanSpeed : null}
                controlsDisabled={controlsDisabled}
                onSelect={handlers.selectFanSpeed}
                variant="section"
                className="h-full border-t-2"
              />
            ) : null}
          {temperatureControlVisible ? (
            <TemperatureCard
              currentLabel={currentTemperatureLabel}
              targetLabel={targetTemperatureLabel}
              temperatureValue={controlState ? controlState.temperature : null}
              controlsDisabled={controlsDisabled}
              // temperatureTrend={temperatureTrend}
              onIncrease={() => handlers.adjustTemperature(TEMPERATURE_STEP)}
              onDecrease={() => handlers.adjustTemperature(-TEMPERATURE_STEP)}
              onChange={handlers.setTemperature}
              variant="section"
            />
          ) : null}
          </div>
        </div>

        <footer className="flex flex-col gap-3 bg-[var(--surface)]/80 px-4 py-4 sm:flex-row sm:items-center sm:justify-end sm:gap-4 sm:px-6">
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
  );

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
        <div className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-6 pb-6 xl:max-w-7xl">
          <div className="flex flex-1 flex-col gap-6 lg:flex-row lg:items-start lg:justify-center lg:gap-10">
            <div className="lg:hidden">
              <div className="relative w-full overflow-hidden">
                <div
                  className="flex w-full transition-transform duration-300 ease-out"
                  style={{
                    transform: `translateX(-${activeMobileSlide * 100}%)`,
                  }}
                  onTouchStart={handleTouchStart}
                  onTouchMove={handleTouchMove}
                  onTouchEnd={handleTouchEnd}
                  onTouchCancel={handleTouchCancel}
                >
                  <div className="w-full shrink-0">{selectorsSection}</div>
                  <div className="w-full shrink-0">{controlSection}</div>
                </div>

                <div className="mt-4 flex items-center justify-center gap-2">
                  {[0, 1].map((index) => {
                    const isActive = activeMobileSlide === index;

                    return (
                      <button
                        key={index}
                        type="button"
                        className={`h-2 rounded-full transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--surface)] focus-visible:ring-[color:var(--border-soft)] ${
                          isActive
                            ? "w-6 bg-[color:var(--text-primary)]"
                            : "w-2 bg-[color:var(--border-soft)]"
                        }`}
                        aria-label={
                          index === 0
                            ? "Ver selección de hogar y equipo"
                            : "Ver panel de control"
                        }
                        aria-pressed={isActive}
                        onClick={() => {
                          goToMobileSlide(index);
                        }}
                      />
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="hidden w-full flex-col gap-6 lg:flex lg:flex-row lg:items-start lg:justify-center lg:gap-10">
              {selectorsSection}
              {controlSection}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};
