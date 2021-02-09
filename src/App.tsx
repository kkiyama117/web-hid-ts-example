import React, { useState } from "react";
import "./App.css";
import { NINTENDO_SWITCH_FILTERS } from "./switch_data";
import { handleReceiveReport } from "./switch_events";

interface WebHIDProps {}

const WebHID = (props: WebHIDProps) => {
  const [device, setDevice] = useState<HIDDevice>();

  // OPEN ====================================================================
  const connectDevice = async () => {
    const devices: HIDDevice[] | undefined = await navigator.hid.requestDevice({
      filters: NINTENDO_SWITCH_FILTERS,
    });
    if (devices) {
      const _device = devices[0];
      await _device.open();
      // Add EventListener for device input
      _device?.addEventListener("inputreport", handleReceiveReport);
      setDevice(_device);
    } else {
      console.error("Device is not found.");
    }
  };

  // SEND ====================================================================

  return (
    <div>
      {/*HID OPEN*/}
      <div onClick={connectDevice}>Open</div>
      <div>Current device: {device?.productName}</div>
      {/*HID CLOSE*/}
      {/*<div onClick={handleClose}/>*/}

      {/*<div onClick={(e) => sendReport(HID_REPORT_ID, setRelayArray(true))}>On</div>*/}
      {/*<div onClick={(e) => sendReport(HID_REPORT_ID, setRelayArray(false))}>Off</div>*/}
      {/*<div onClick={(e) => sendReport(HID_REPORT_ID, getDataArray())}>Read data</div>*/}
    </div>
  );
};

const App = () => {
  return (
    <div className="App">
      <WebHID />
    </div>
  );
};

export default App;
