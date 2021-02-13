// RECEIVE =================================================================

// SEND ======================================================================
export const sendReport = async (
  device: HIDDevice,
  reportId: number,
  query: ArrayBuffer | ArrayBufferView
): Promise<void> => await device.sendReport(reportId, query);
