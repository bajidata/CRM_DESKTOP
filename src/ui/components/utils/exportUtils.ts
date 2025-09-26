// export const exportToCSV = (data: any[], filename: string) => {
//   const headers = Object.keys(data[0]).join(',');
//   const rows = data
//     .map((row) => Object.values(row).map((val) => `"${val}"`).join(','))
//     .join('\n');
//   const csv = `${headers}\n${rows}`;
  
//   const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
//   const url = URL.createObjectURL(blob);
//   const link = document.createElement('a');
//   link.href = url;
//   link.setAttribute('download', filename);
//   document.body.appendChild(link);
//   link.click();
//   document.body.removeChild(link);
  
// };

export const exportToCSV = async (csvId: string) => {
  try {
    if (!window.electron) throw new Error("Electron API not available");

    const res = await window.electron.downloadCsv(csvId);

    if (!res?.success || !res.filePath) {
      console.error("CSV download failed or canceled:", res?.error);
      return;
    }

    console.log("CSV saved at:", res.filePath);

    return res.filePath;
  } catch (err: any) {
    console.error("Error exporting CSV:", err.message);
  }
};



export const exportToExcel = async (data: any[], filename: string) => {
  const XLSX = await import('xlsx');
  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Data');
  XLSX.writeFile(workbook, filename);
};