import type { CSSProperties, JSX } from "react";
import { useEffect, useMemo, useState } from "react";

import { DeviceList } from "../../components/control-panel/DeviceList";
import { FanSelector } from "../../components/control-panel/FanSelector";
import { HomeSelector } from "../../components/control-panel/HomeSelector";
import { ModeSelector } from "../../components/control-panel/ModeSelector";
import { PanelFooter } from "../../components/control-panel/PanelFooter";
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
    actualFanSpeed,
    temperatureTrend,
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
    [accentColor, confirmAccentColor],
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
        <div className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-6 pb-28 lg:flex-row lg:items-start lg:justify-center lg:gap-10 xl:max-w-7xl">
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

          <section className="flex w-full flex-col gap-6 lg:min-w-[650px] lg:max-w-[900px]">
            {errorBanner}

            <TemperatureCard
              currentLabel={currentTemperatureLabel}
              targetLabel={targetTemperatureLabel}
              temperatureValue={controlState ? controlState.temperature : null}
              controlsDisabled={controlsDisabled}
              temperatureTrend={temperatureTrend}
              onIncrease={() => handlers.adjustTemperature(TEMPERATURE_STEP)}
              onDecrease={() => handlers.adjustTemperature(-TEMPERATURE_STEP)}
              onChange={handlers.setTemperature}
            />

            <section className="flex flex-row flex-wrap gap-4">
              <div className="flex-1">
                <ModeSelector
                  activeMode={controlState ? controlState.mode : null}
                  controlsDisabled={controlsDisabled}
                  accentPreview={modePreviewColor}
                  onSelect={handlers.selectMode}
                />
              </div>

              <div className="flex-1">
                <FanSelector
                  actualFanSpeed={actualFanSpeed}
                  pendingFanSpeed={controlState ? controlState.fanSpeed : null}
                  controlsDisabled={controlsDisabled}
                  onSelect={handlers.selectFanSpeed}
                />
              </div>
            </section>

            <PanelFooter
              hasPendingChanges={hasPendingChanges}
              controlsDisabled={controlsDisabled}
              confirmAccent={confirmAccentColor}
              onSubmit={() => {
                void handlers.submitChanges();
              }}
              layout="sticky"
            />
          </section>
        </div>
      </main>

      <PanelFooter
        hasPendingChanges={hasPendingChanges}
        controlsDisabled={controlsDisabled}
        confirmAccent={confirmAccentColor}
        onSubmit={() => {
          void handlers.submitChanges();
        }}
        layout="floating"
      />
    </div>
  );
};
