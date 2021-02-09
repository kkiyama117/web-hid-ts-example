// RECEIVE =================================================================
export const handleReceiveReport = (e: HIDInputReportEvent): void => {
  console.log(e.device.productName + ": got input report " + e.reportId);
  console.log(new Uint8Array(e.data.buffer));
};
