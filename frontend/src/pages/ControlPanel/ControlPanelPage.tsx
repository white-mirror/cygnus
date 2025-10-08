import type { CSSProperties, JSX } from "react";

import { DeviceList } from "../../components/control-panel/DeviceList";
import { FanSelector } from "../../components/control-panel/FanSelector";
import { HomeSelector } from "../../components/control-panel/HomeSelector";
import { ModeSelector } from "../../components/control-panel/ModeSelector";
import { PanelFooter } from "../../components/control-panel/PanelFooter";
import { PanelHeader } from "../../components/control-panel/PanelHeader";
import { TemperatureCard } from "../../components/control-panel/TemperatureCard";
import { TEMPERATURE_STEP } from "../../features/control-panel/constants";
import { useControlPanel } from "../../features/control-panel/useControlPanel";

import "./ControlPanelPage.css";

export const ControlPanelPage = (): JSX.Element => {
  const { state, handlers } = useControlPanel();

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

  const panelClassName = hasPendingChanges
    ? "ac-panel has-pending"
    : "ac-panel";

  const accentStyle = {
    "--accent-color": accentColor,
  } as CSSProperties;

  const headerSubtitle = selectedHome ? undefined : "Selecciona un hogar";

  return (
    <div className="ac-panel-layout" style={accentStyle}>
      <main className={panelClassName}>
        <PanelHeader
          title="Control de clima"
          subtitle={headerSubtitle}
          powerOn={actualPowerOn}
          disabled={controlsDisabled}
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

        {errorMessage && <div className="panel-error">{errorMessage}</div>}

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

        <section className="controls-grid">
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
      </main>

      <PanelFooter
        hasPendingChanges={hasPendingChanges}
        controlsDisabled={controlsDisabled}
        confirmAccent={confirmAccentColor}
        accentColor={accentColor}
        onSubmit={() => {
          void handlers.submitChanges();
        }}
      />
    </div>
  );
};
