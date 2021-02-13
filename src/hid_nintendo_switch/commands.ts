// Rumble
export const DEFAULT_RUMBLE_DATA = [
  0x00,
  0x01,
  0x60,
  0x40,
  0x00,
  0x01,
  0x60,
  0x40,
];

export const sendReport = async (
  device: HIDDevice,
  reportId: number,
  sendData: ArrayBuffer | ArrayBufferView,
  filter: (reportId: number, sendData: ArrayBuffer | ArrayBufferView) => boolean
): Promise<void> => {
  if (filter(reportId, sendData)) {
    await device.sendReport(reportId, sendData);
  }
};

// Get output subcommand without flag
export const createSubCommandQuery = (
  packetNum: number,
  rumbleData: number[],
  subCommand: number,
  subCommandArguments: number[]
): ArrayBuffer | ArrayBufferView => {
  if (rumbleData.length !== 8) {
    throw new Error("Invalid rumble data");
  }
  const query = [
    // Increment by 1 for each packet sent. It loops in 0x0 - 0xF range.
    packetNum % 0x10,
    // Rumble ==================================================================
    // https://github.com/dekuNukem/Nintendo_Switch_Reverse_Engineering/blob/master/bluetooth_hid_notes.md#rumble-data
    // memcpy(buf + 2, rumbleData, 8);
    ...rumbleData,
    // Sub Command =============================================================
    // memcpy(buf + 11, subcommandData, subcommandDataLen);
    subCommand,
    ...subCommandArguments,
  ];
  return Uint8Array.from(query);
};
