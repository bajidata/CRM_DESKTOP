import { useState, useEffect } from 'react';

export const useBrandsAndFiles = () => {
  const [brands, setBrands] = useState<string[]>([]);
  const [files, setFiles] = useState<string[]>([]);
  const [selectedBrand, setSelectedBrand] = useState<string>('');
  const [selectedFile, setSelectedFile] = useState<string>('');

  useEffect(() => {
    window.electron?.getBrands().then((res) => {
      if (res.success) setBrands(res.brands ?? []);
    });
  }, []);

  const handleBrandChange = async (brand: string) => {
    setSelectedBrand(brand);
    setSelectedFile('');
    setFiles([]);
    
    const res = await window.electron?.getFiles(brand);
    if (res?.success) setFiles(res.files ?? []);
  };

  const handleFileChange = (file: string) => {
    setSelectedFile(file);
  };

  return {
    brands,
    files,
    selectedBrand,
    selectedFile,
    handleBrandChange,
    handleFileChange
  };
};