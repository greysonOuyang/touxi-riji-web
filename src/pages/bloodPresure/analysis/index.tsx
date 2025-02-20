  setBpData(response.data.map(item => ({
    systolic: item.systolic,
    diastolic: item.diastolic,
    heartRate: item.heartRate ?? 0,
    timestamp: item.timestamp
  }))); 