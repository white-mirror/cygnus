# UI/UX Task List for Climate Control App

## 1. Device State Update

- (status: DONE) After sending a status change to a device, the on-screen state must be updated.
- (status: DONE) Perform a `GET` request on the device after the `UPDATE` API call to refresh its state in the UI.

## 2. Button Adjustments

- (status: DONE) Remove the legend **"Cambios pendientes"** from the **"Enviar cambio"** button.
- (status: DONE) Rename the **"Enviar cambios"** button label to **"Confirmar"**.
- (status: TODO) The **"Confirmar"** button must be positioned at `bottom: 0`.
- (status: TODO) The **"Confirmar"** button must have "sticky" behavior â€” always visible at the bottom, unless the user scrolls to its position.
- (status: TODO) The **"Confirmar"** button must never cover or overlap components beneath it.
- (status: TODO) On mobile: remove all border-radius from the **"Confirmar"** button.

## 3. Temperature Display

- (status: TODO) In the device list, align **"Temp. Deseada..."** and **"Temp Actual..."** to the right.
- (status: TODO) Layout:
  - Use a flexbox row to separate **"modo"** and **temperaturas**.
  - Use a flexbox column for the temperature values.

## 4. Operation Mode Behavior

- (status: TODO) UI components should only update colors once the device state is confirmed by the API.
- (status: TODO) The **"modos de operaciÃ³n"** selector may change colors immediately.
- (status: TODO) All other UI components must wait for the updated state from the API before reflecting changes.

## 5. Mobile Layout Adjustments

- (status: TODO) Remove padding from `<body>` and `<main>`.
- (status: TODO) Remove all border-radius from `<body>`, `<main>`, and the **"Confirmar"** button.
- (status: TODO) Change the **"Encendido/Apagado"** button:
  - It must be a round, icon-only button.
  - Position it in the top-right corner, aligned with the main title.

## 6. Visual/Styling Fixes

- (status: TODO) Remove the **"Climatizando"** indicator.
- (status: TODO) Fix `.temperature-card` gradient: its `::before` element must not extend beyond the defined border-radius.
- (status: TODO) When selecting a device that is **off**, use **dark gray** as the accent color instead of blue/orange/green.
- (status: TODO) Remove the **"Home"** name under the **"Control de clima"** title (redundant with the **"Homes"** selector).
