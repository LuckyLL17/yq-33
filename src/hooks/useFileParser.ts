import { useState, useCallback } from 'react';
import mammoth from 'mammoth';

export async function parseFile(file: File): Promise<{ text: string; fileName: string }> {
  const ext = file.name.split('.').pop()?.toLowerCase();
  const fileName = file.name.replace(/\.[^.]+$/, '');

  switch (ext) {
    case 'txt': {
      return parseTxt(file, fileName);
    }
    case 'docx': {
      return parseDocx(file, fileName);
    }
    case 'pdf': {
      return parsePdf(file, fileName);
    }
    default: {
      throw new Error(`不支持的文件格式: .${ext}。请上传 .txt、.docx 或 .pdf 文件。`);
    }
  }
}

async function parseTxt(file: File, fileName: string): Promise<{ text: string; fileName: string }> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      let text = e.target?.result as string;
      if (text.charCodeAt(0) === 0xfeff) {
        text = text.slice(1);
      }
      resolve({ text, fileName });
    };
    reader.onerror = () => {
      reject(new Error('读取 TXT 文件失败'));
    };
    reader.readAsText(file, 'UTF-8');
  });
}

async function parseDocx(file: File, fileName: string): Promise<{ text: string; fileName: string }> {
  try {
    const arrayBuffer = await file.arrayBuffer();
    const result = await mammoth.extractRawText({ arrayBuffer });
    return { text: result.value, fileName };
  } catch {
    throw new Error('解析 DOCX 文件失败');
  }
}

async function parsePdf(file: File, fileName: string): Promise<{ text: string; fileName: string }> {
  try {
    const pdfjs = await import('pdfjs-dist');
    const pdfjsWorker = await import('pdfjs-dist/build/pdf.worker.min.mjs');
    pdfjs.GlobalWorkerOptions.workerSrc = pdfjsWorker.default;

    const arrayBuffer = await file.arrayBuffer();
    const loadingTask = pdfjs.getDocument({ data: arrayBuffer });
    const pdf = await loadingTask.promise;

    const pagesText: string[] = [];
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const textContent = await page.getTextContent();
      const pageText = textContent.items
        .map((item) => ('str' in item ? item.str : ''))
        .join(' ');
      pagesText.push(pageText);
    }

    return { text: pagesText.join('\n\n'), fileName };
  } catch {
    throw new Error('解析 PDF 文件失败');
  }
}

export function useFileParser() {
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const handleParseFile = useCallback(async (file: File): Promise<string> => {
    setIsLoading(true);
    setError(null);
    setProgress(0);

    try {
      setProgress(10);
      const result = await parseFile(file);
      setProgress(100);
      return result.text;
    } catch (err) {
      const message = err instanceof Error ? err.message : '文件解析失败';
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    isLoading,
    progress,
    error,
    parseFile: handleParseFile,
  };
}
