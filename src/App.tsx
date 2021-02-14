import React, { useState } from "react";
import "./App.css";
import {
  HID_NINTENDO_SWITCH_FILTER_JOYCON_L,
  HID_NINTENDO_SWITCH_FILTER_JOYCON_R,
  HID_NINTENDO_SWITCH_FILTER_PROCON,
} from "./hid_nintendo_switch/constants/filters";
import { delay } from "./utils";
import { dataViewToArray } from "./hid_common/utils";
import { DEFAULT_RUMBLE_DATA } from "./hid_nintendo_switch/constants/rumble";
import { sendSubCommand } from "./hid_nintendo_switch/utils";

const HID_NINTENDO_SWITCH_FILTERS: HIDDeviceFilter[] = [
  HID_NINTENDO_SWITCH_FILTER_JOYCON_L,
  HID_NINTENDO_SWITCH_FILTER_JOYCON_R,
  HID_NINTENDO_SWITCH_FILTER_PROCON,
];

// Report
const handleReceiveReport = (e: HIDInputReportEvent): void => {
  if (e.reportId === 0x3f) {
    console.warn("Simple HID mode");
    console.warn(dataViewToArray(e.data));
  } else if (e.reportId === 0x30) {
    console.warn("Standard full mode");
    console.warn(dataViewToArray(e.data));
  } else {
    console.log(
      `${e.device.productName}: got input report (0x${e.reportId.toString(16)})`
    );
    console.log(dataViewToArray(e.data));
  }
};

const sendSampleSubCommands = async (
  device: HIDDevice,
  packetNum: number
): Promise<number> => {
  let _packetId = packetNum;
  // Enable sensor
  await sendSubCommand(device, _packetId, DEFAULT_RUMBLE_DATA, 0x40, [0x01]);
  _packetId++;
  // Enable vibration
  await sendSubCommand(device, _packetId, DEFAULT_RUMBLE_DATA, 0x48, [0x01]);
  _packetId++;
  // Set input mode
  await sendSubCommand(device, _packetId, DEFAULT_RUMBLE_DATA, 0x03, [0x30]);
  _packetId++;
  // Request Info
  await sendSubCommand(device, _packetId, DEFAULT_RUMBLE_DATA, 0x02, []);
  _packetId++;
  return _packetId;
};

interface WebHIDProps {}

const WebHID = (props: WebHIDProps) => {
  const [device, setDevice] = useState<HIDDevice>();
  // keep packet id
  const [packetNum, setPacketNum] = useState<number>(0);

  // OPEN ====================================================================
  const connectDevice = async (_: React.MouseEvent) => {
    const devices: HIDDevice[] = await navigator.hid.requestDevice({
      filters: HID_NINTENDO_SWITCH_FILTERS,
    });
    await delay(500);
    console.log(devices);
    if (devices) {
      const _device = devices[0];
      // Keep instance.
      if (_device) {
        console.log("waiting device ...");
        await _device.open();
        console.log("device connected! ...");
        // Set device event listener
        _device.addEventListener("inputreport", handleReceiveReport);
      }
      // save device instance
      setDevice(_device);
    } else {
      console.error("Device is not found.");
    }
  };

  // OUTPUT(Send data) =======================================================
  const sendData = async (_: React.MouseEvent) => {
    if (device) {
      setPacketNum(await sendSampleSubCommands(device, packetNum));
    } else {
      console.error("Open device first");
    }
  };

  // CLOSE ===================================================================
  const handleClose = async (event: React.MouseEvent) => {
    if (device) {
      await device.close();
      setDevice(undefined);
    }
  };

  return (
    <div>
      <div onClick={connectDevice}>Open</div>
      <div>Current device: {device?.productName}</div>
      <div onClick={sendData}>Send</div>
      <div onClick={handleClose}>Close</div>
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
