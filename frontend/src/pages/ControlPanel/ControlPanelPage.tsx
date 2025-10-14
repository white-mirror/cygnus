import type { CSSProperties, JSX } from "react";
import { useEffect, useMemo, useState } from "react";

import { DeviceList } from "../../components/control-panel/DeviceList";
import { FanSelector } from "../../components/control-panel/FanSelector";
import { HomeSelector } from "../../components/control-panel/HomeSelector";
import { ModeSelector } from "../../components/control-panel/ModeSelector";
import { PanelFooter } from "../../components/control-panel/PanelFooter";
import { PanelHeader } from "../../components/control-panel/PanelHeader";
import { TemperatureCard } from "../../components/control-panel/TemperatureCard";
import { TEMPERATURE_STEP } from "../../features/control-panel/constants";
import { useControlPanel } from "../../features/control-panel/useControlPanel";
import { cn } from "../../lib/cn";

export const ControlPanelPage = (): JSX.Element => {
  const { state, handlers } = useControlPanel();
  const [theme, setTheme] = useState<"light" | "dark">("light");

  useEffect(() => {
    const rootElement = document.documentElement;
    rootElement.dataset.theme = theme;

    return () => {
      rootElement.dataset.theme = "light";
    };
  }, [theme]);

  const toggleTheme = (): void => {
    setTheme((current) => (current === "dark" ? "light" : "dark"));
  };

  const {
    homes,
    devices,
    selectedHomeId,
    selectedDeviceId,
    selectedHome,
    controlState,
    isFetchingHomes,
    isFetchingDevices,
    isUpdatingDevice,
    errorMessage,
    actualPowerOn,
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
      }) as CSSProperties,
    [accentColor],
  );

  const panelClassName = cn(
    "relative isolate flex flex-col overflow-hidden rounded-[32px] border border-[color:var(--border-soft)] bg-[var(--surface)] shadow-elevated transition duration-200",
    hasPendingChanges && "ring-2 ring-[rgba(var(--accent-color),0.35)]",
  );

  const headerSubtitle = selectedHome ? undefined : "Selecciona un hogar";

  return (
    <div className="flex flex-col gap-6 lg:gap-8" style={accentStyle}>
      <main className={panelClassName}>
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 rounded-[inherit]"
          style={{
            background: `linear-gradient(135deg, rgba(${accentColor}, 0.08), rgba(60, 110, 220, 0.04))`,
          }}
        />

        <div className="relative z-10 grid gap-6 p-6 sm:gap-8 sm:p-8">
          <PanelHeader
            title="Control de clima"
            subtitle={headerSubtitle}
            powerOn={actualPowerOn}
            disabled={controlsDisabled}
            theme={theme}
            onToggleTheme={toggleTheme}
            onTogglePower={handlers.togglePanelPower}
          />

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
          />

          {errorMessage && (
            <div className="rounded-2xl border border-red-200/60 bg-red-50/80 px-4 py-3 text-sm font-medium text-red-700">
              {errorMessage}
            </div>
          )}

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

          <section className="grid gap-6 lg:grid-cols-2">
            <ModeSelector
              activeMode={controlState ? controlState.mode : null}
              controlsDisabled={controlsDisabled}
              accentPreview={modePreviewColor}
              onSelect={handlers.selectMode}
            />

            <FanSelector
              actualFanSpeed={actualFanSpeed}
              pendingFanSpeed={controlState ? controlState.fanSpeed : null}
              controlsDisabled={controlsDisabled}
              onSelect={handlers.selectFanSpeed}
            />
          </section>
        </div>

        <PanelFooter
          hasPendingChanges={hasPendingChanges}
          controlsDisabled={controlsDisabled}
          confirmAccent={confirmAccentColor}
          accentColor={accentColor}
          onSubmit={() => {
            void handlers.submitChanges();
          }}
        />
      </main>
    </div>
  );
};
