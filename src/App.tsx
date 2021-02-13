import React, { useState } from "react";
import "./App.css";
import {
  createSubCommandQuery,
  DEFAULT_RUMBLE_DATA,
} from "./hid_nintendo_switch/commands";
import {
  HID_NINTENDO_SWITCH_FILTER_JOYCON_L,
  HID_NINTENDO_SWITCH_FILTER_JOYCON_R,
  HID_NINTENDO_SWITCH_FILTER_PROCON,
} from "./hid_nintendo_switch/constants/filters";
import { delay } from "./utils";
import { sendReport } from "./hid_common";

const HID_NINTENDO_SWITCH_FILTERS: HIDDeviceFilter[] = [
  HID_NINTENDO_SWITCH_FILTER_JOYCON_L,
  HID_NINTENDO_SWITCH_FILTER_JOYCON_R,
  HID_NINTENDO_SWITCH_FILTER_PROCON,
];

// Report
const handleReceiveReport = (e: HIDInputReportEvent): void => {
  if (e.reportId === 0x30) {
    console.log(
      e.device.productName +
        ": got input report " +
        "0x" +
        e.reportId.toString(16)
    );
    console.log(JSON.stringify(e));
    if (e.data){
      console.error(JSON.stringify(e.data.getUint8(0)));
    }
  } else {
    console.error(
      e.device.productName +
        ": got input report " +
        "0x" +
        e.reportId.toString(16)
    );
    console.error(JSON.stringify(e));
    console.error(JSON.stringify(e.data.getUint8(0)));
  }
};

const handleSendDataBase = async (
  device: HIDDevice,
  packetNum:number,
  rumbles= DEFAULT_RUMBLE_DATA,
  subcommand: number,
  subcommandArgs: number[]
) => {
  await sendReport(
    device,
    0x01,
    createSubCommandQuery(packetNum, rumbles, 0x40, [0x01])
  );
  await delay(500);
};
const handleSendData = async (
  device: HIDDevice,
  packetNum: number
): Promise<number> => {
  let _packetId = packetNum;
  // enable sensor
  await handleSendDataBase(device,_packetId,DEFAULT_RUMBLE_DATA,0x40,[0x01]);
  _packetId++;
  // Enable vibration
  await handleSendDataBase(device,_packetId,DEFAULT_RUMBLE_DATA,0x48,[0x01]);
  _packetId++;
  await handleSendDataBase(device,_packetId,DEFAULT_RUMBLE_DATA,0x03,[0x30]);
  _packetId++;
  await handleSendDataBase(device,_packetId,DEFAULT_RUMBLE_DATA,0x02,[]);
  _packetId++;
  return _packetId;
};

interface WebHIDProps {}

const WebHID = (props: WebHIDProps) => {
  const [device, setDevice] = useState<HIDDevice>();
  const [packetNum, setPacketNum] = useState<number>(0);

  // OPEN ====================================================================
  const connectDevice = async (event: any) => {
    await navigator.hid.requestDevice({
      filters: HID_NINTENDO_SWITCH_FILTERS,
    });
    await delay(500);
    const devices: HIDDevice[] | undefined = await navigator.hid.getDevices();
    console.log(devices);
    if (devices) {
      const _device = devices[0];
      // Keep instance.
      if (_device) {
        console.log("waiting device ...");
        await _device.open();
        console.log("device connected! ...");
        _device.addEventListener("inputreport", handleReceiveReport);
      }
      setDevice(_device);
    } else {
      console.error("Device is not found.");
    }
  };

  const sendData = async (event: any) => {
    if (device) {
      setPacketNum(await handleSendData(device, packetNum));
    }
  };

  return (
    <div>
      {/*HID OPEN*/}
      <div onClick={connectDevice}>Open</div>
      <div>Current device: {device?.productName}</div>
      {/*HID CLOSE*/}
      {/*<div onClick={handleClose}/>*/}

      <div onClick={sendData}>Send</div>
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
