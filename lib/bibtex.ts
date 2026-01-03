import bibtexParse from '@orcid/bibtex-parse-js';
import fs from 'fs';
import path from 'path';

export interface BibtexEntry {
  citationKey: string;
  entryType: string;
  entryTags: {
    title?: string;
    author?: string;
    date?: string;
    year?: string;
    journaltitle?: string;
    doi?: string;
    url?: string;
    abstract?: string;
    [key: string]: string | undefined;
  };
}

export function getBibtexFiles(folder: string = ''): string[] {
  const dataDir = path.join(process.cwd(), 'public', 'data', folder);
  
  // Verificar si el directorio existe
  if (!fs.existsSync(dataDir)) {
    return [];
  }
  
  const files = fs.readdirSync(dataDir);
  return files.filter(file => file.endsWith('.bib'));
}

export function parseBibtexFile(filename: string, folder: string = ''): BibtexEntry[] {
  const filePath = path.join(process.cwd(), 'public', 'data', folder, filename);
  
  // Verificar si el archivo existe
  if (!fs.existsSync(filePath)) {
    return [];
  }
  
  const content = fs.readFileSync(filePath, 'utf-8');
  
  try {
    const entries = bibtexParse.toJSON(content) as BibtexEntry[];
    return entries;
  } catch (error) {
    console.error(`Error parsing ${filename}:`, error);
    return [];
  }
}

export function getAllBibtexEntries(folder: string = ''): { file: string; entries: BibtexEntry[] }[] {
  const files = getBibtexFiles(folder);
  return files.map(file => ({
    file,
    entries: parseBibtexFile(file, folder)
  }));
}

export function getBibtexEntriesFromFolder(folder: string): BibtexEntry[] {
  const data = getAllBibtexEntries(folder);
  return data.flatMap(({ entries }) => entries);
}
