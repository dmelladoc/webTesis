'use client';

import { BibtexEntry } from '@/lib/bibtex';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCalendar, faBook, faLink, faSearch, faChevronDown, faChevronUp } from '@fortawesome/free-solid-svg-icons';
import { useState, useMemo } from 'react';

const entryTypeTranslations: Record<string, string> = {
  article: 'Artículo',
  book: 'Libro',
  incollection: 'Capítulo de libro',
  inproceedings: 'Conferencia',
  proceedings: 'Actas',
  phdthesis: 'Tesis doctoral',
  mastersthesis: 'Tesis de maestría',
  techreport: 'Reporte técnico',
  manual: 'Manual',
  misc: 'Misceláneo',
  online: 'En línea',
  report: 'Reporte',
};

const translateEntryType = (type: string): string => {
  return entryTypeTranslations[type.toLowerCase()] || type;
};

const highlightKeywords = (text: string) => {
  if (!text) return text;
  
  // Eliminar todos los corchetes {} y {{}} de forma recursiva
  let cleanText = text;
  let previousText = '';
  
  // Repetir hasta que no haya más cambios (maneja corchetes anidados)
  while (cleanText !== previousText) {
    previousText = cleanText;
    cleanText = cleanText
      .replace(/\{\{([^{}]*)\}\}/g, '$1')  // Primero eliminar corchetes dobles
      .replace(/\{([^{}]*)\}/g, '$1');      // Luego corchetes simples
  }
  
  return cleanText.trim();
};

const formatAuthorsOrEditors = (text: string, maxDisplay: number = 3): string => {
  if (!text) return '';
  
  // Primero eliminar corchetes
  let cleanText = text
    .replace(/\{\{([\s\S]+?)\}\}/g, (_, content) => content.trim())
    .replace(/\{([\s\S]+?)\}/g, (_, content) => content.trim());
  
  // Manejar formato extendido de Biblatex: family=Apellido, given=Nombre
  if (cleanText.includes('family=')) {
    const names = cleanText.split(' and ').map(person => {
      const familyMatch = person.match(/family=([^,]+)/);
      const givenMatch = person.match(/given=([^,]+)/);
      
      if (familyMatch) {
        const family = familyMatch[1].trim();
        const given = givenMatch ? givenMatch[1].trim() : '';
        // Remover prefijos como "given-i=" que puedan quedar
        const cleanGiven = given.split(',')[0].trim();
        return cleanGiven ? `${family}, ${cleanGiven}` : family;
      }
      return person.trim();
    });
    
    if (names.length > maxDisplay) {
      return names.slice(0, maxDisplay).join('; ') + ' et al.';
    }
    return names.join('; ');
  }
  
  // Formato estándar de BibTeX: Apellido, Nombre and Apellido, Nombre
  const authors = cleanText.split(' and ').map(a => a.trim());
  
  if (authors.length > maxDisplay) {
    return authors.slice(0, maxDisplay).join('; ') + ' et al.';
  }
  
  return authors.join('; ');
};

const sortEntries = (entries: BibtexEntry[], sortBy: 'author-year' | 'year-author' = 'author-year') => {
  return [...entries].sort((a, b) => {
    // Extraer el primer autor (antes de "and")
    const getFirstAuthor = (entry: BibtexEntry) => {
      const authorOrEditor = entry.entryTags.author || entry.entryTags.editor || '';
      const firstAuthor = authorOrEditor.split(' and ')[0].trim();
      // Extraer el apellido (última palabra antes de la coma)
      const parts = firstAuthor.split(',');
      return parts[0]?.trim().toLowerCase() || '';
    };
    
    // Extraer el año
    const getYear = (entry: BibtexEntry) => {
      const dateStr = entry.entryTags.date || entry.entryTags.year || '';
      // Extraer solo el año (primeros 4 dígitos)
      const yearMatch = dateStr.match(/\d{4}/);
      return yearMatch ? parseInt(yearMatch[0]) : 9999;
    };
    
    const authorA = getFirstAuthor(a);
    const authorB = getFirstAuthor(b);
    const yearA = getYear(a);
    const yearB = getYear(b);
    
    if (sortBy === 'year-author') {
      // Ordenar primero por año (más reciente primero)
      if (yearA !== yearB) {
        return yearB - yearA;  // Orden descendente (más reciente primero)
      }
      
      // Si el año es igual, ordenar por autor
      if (authorA < authorB) return -1;
      if (authorA > authorB) return 1;
      
      return 0;
    } else {
      // Ordenar primero por autor
      if (authorA < authorB) return -1;
      if (authorA > authorB) return 1;
      
      // Si el autor es igual, ordenar por año
      return yearA - yearB;
    }
  });
};

interface BibliographyPageProps {
  title: string;
  entries: BibtexEntry[];
  sortBy?: 'author-year' | 'year-author';
}

export default function BibliographyPage({ title, entries, sortBy = 'author-year' }: BibliographyPageProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [selectedYear, setSelectedYear] = useState<string>('all');
  const [typeDropdownOpen, setTypeDropdownOpen] = useState(false);
  const [yearDropdownOpen, setYearDropdownOpen] = useState(false);

  // Obtener tipos únicos
  const uniqueTypes = useMemo(() => {
    const types = new Set(entries.map(e => e.entryType));
    return Array.from(types).sort();
  }, [entries]);

  // Obtener años únicos
  const uniqueYears = useMemo(() => {
    const years = new Set(
      entries
        .map(e => {
          const dateStr = e.entryTags.date || e.entryTags.year || '';
          const yearMatch = dateStr.match(/\d{4}/);
          return yearMatch ? yearMatch[0] : null;
        })
        .filter(Boolean) as string[]
    );
    return Array.from(years).sort((a, b) => parseInt(b) - parseInt(a));
  }, [entries]);

  // Filtrar y buscar entradas
  const filteredEntries = useMemo(() => {
    let filtered = [...entries];

    // Filtrar por tipo
    if (selectedType !== 'all') {
      filtered = filtered.filter(e => e.entryType === selectedType);
    }

    // Filtrar por año
    if (selectedYear !== 'all') {
      filtered = filtered.filter(e => {
        const dateStr = e.entryTags.date || e.entryTags.year || '';
        const yearMatch = dateStr.match(/\d{4}/);
        return yearMatch && yearMatch[0] === selectedYear;
      });
    }

    // Buscar en título, autor, abstract
    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      filtered = filtered.filter(e => {
        const title = (e.entryTags.title || '').toLowerCase();
        const author = (e.entryTags.author || '').toLowerCase();
        const editor = (e.entryTags.editor || '').toLowerCase();
        const abstract = (e.entryTags.abstract || '').toLowerCase();
        return title.includes(search) || author.includes(search) || editor.includes(search) || abstract.includes(search);
      });
    }

    return sortEntries(filtered, sortBy);
  }, [entries, searchTerm, selectedType, selectedYear, sortBy]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-gray-100 to-gray-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 py-16 px-4">
      <main className="max-w-5xl mx-auto">
        <div className="mb-12 text-center">
          <h1 className="text-5xl font-bold text-gray-900 dark:text-white mb-2 tracking-tight">
            {title}
          </h1>
        </div>

        {/* Barra de búsqueda y filtros */}
        <div className="mb-10 bg-white dark:bg-gray-800 rounded-xl shadow-sm hover:shadow-xl transition-all duration-300 p-8 border border-gray-100 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 hover:-translate-y-1">
          {/* Barra de búsqueda */}
          <div className="relative mb-6">
            <FontAwesomeIcon 
              icon={faSearch} 
              className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500 w-5 h-5 transition-colors"
            />
            <input
              type="text"
              placeholder="Buscar por título, autor o contenido..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-14 pr-6 py-4 rounded-xl border-2 border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-900 dark:focus:ring-white focus:border-transparent focus:bg-white dark:focus:bg-gray-800 transition-all duration-300 text-base shadow-sm hover:shadow-md"
            />
          </div>

          {/* Filtros */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 mb-6">
            <div className="relative">
              <label className="flex items-center gap-2 text-sm font-bold text-gray-800 dark:text-gray-200 mb-3 uppercase tracking-wide">
                <FontAwesomeIcon icon={faBook} className="w-4 h-4" />
                Tipo de publicación
              </label>
              <button
                onClick={() => {
                  setTypeDropdownOpen(!typeDropdownOpen);
                  setYearDropdownOpen(false);
                }}
                className="w-full px-5 py-3.5 rounded-xl border-2 border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-gray-900 dark:focus:ring-white focus:border-transparent focus:bg-white dark:focus:bg-gray-800 transition-all duration-300 cursor-pointer shadow-sm hover:shadow-md font-medium text-left flex items-center justify-between"
              >
                <span>{selectedType === 'all' ? '● Todos los tipos' : translateEntryType(selectedType)}</span>
                <FontAwesomeIcon icon={typeDropdownOpen ? faChevronUp : faChevronDown} className="w-4 h-4" />
              </button>
              {typeDropdownOpen && (
                <div className="absolute z-10 w-full mt-2 bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-600 rounded-xl shadow-xl max-h-64 overflow-y-auto">
                  <button
                    onClick={() => {
                      setSelectedType('all');
                      setTypeDropdownOpen(false);
                    }}
                    className={`w-full px-5 py-3 text-left font-medium transition-colors ${
                      selectedType === 'all'
                        ? 'bg-gray-900 dark:bg-white text-white dark:text-gray-900'
                        : 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700'
                    }`}
                  >
                    ● Todos los tipos
                  </button>
                  {uniqueTypes.map(type => (
                    <button
                      key={type}
                      onClick={() => {
                        setSelectedType(type);
                        setTypeDropdownOpen(false);
                      }}
                      className={`w-full px-5 py-3 text-left font-medium transition-colors border-t border-gray-100 dark:border-gray-700 ${
                        selectedType === type
                          ? 'bg-gray-900 dark:bg-white text-white dark:text-gray-900'
                          : 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700'
                      }`}
                    >
                      {translateEntryType(type)}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="relative">
              <label className="flex items-center gap-2 text-sm font-bold text-gray-800 dark:text-gray-200 mb-3 uppercase tracking-wide">
                <FontAwesomeIcon icon={faCalendar} className="w-4 h-4" />
                Año de publicación
              </label>
              <button
                onClick={() => {
                  setYearDropdownOpen(!yearDropdownOpen);
                  setTypeDropdownOpen(false);
                }}
                className="w-full px-5 py-3.5 rounded-xl border-2 border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-gray-900 dark:focus:ring-white focus:border-transparent focus:bg-white dark:focus:bg-gray-800 transition-all duration-300 cursor-pointer shadow-sm hover:shadow-md font-medium text-left flex items-center justify-between"
              >
                <span>{selectedYear === 'all' ? '● Todos los años' : selectedYear}</span>
                <FontAwesomeIcon icon={yearDropdownOpen ? faChevronUp : faChevronDown} className="w-4 h-4" />
              </button>
              {yearDropdownOpen && (
                <div className="absolute z-10 w-full mt-2 bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-600 rounded-xl shadow-xl max-h-64 overflow-y-auto">
                  <button
                    onClick={() => {
                      setSelectedYear('all');
                      setYearDropdownOpen(false);
                    }}
                    className={`w-full px-5 py-3 text-left font-medium transition-colors ${
                      selectedYear === 'all'
                        ? 'bg-gray-900 dark:bg-white text-white dark:text-gray-900'
                        : 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700'
                    }`}
                  >
                    ● Todos los años
                  </button>
                  {uniqueYears.map(year => (
                    <button
                      key={year}
                      onClick={() => {
                        setSelectedYear(year);
                        setYearDropdownOpen(false);
                      }}
                      className={`w-full px-5 py-3 text-left font-medium transition-colors border-t border-gray-100 dark:border-gray-700 ${
                        selectedYear === year
                          ? 'bg-gray-900 dark:bg-white text-white dark:text-gray-900'
                          : 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700'
                      }`}
                    >
                      {year}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {(searchTerm || selectedType !== 'all' || selectedYear !== 'all') && (
              <div className="flex items-end" onClick={() => {
                setTypeDropdownOpen(false);
                setYearDropdownOpen(false);
              }}>
                <button
                  onClick={() => {
                    setSearchTerm('');
                    setSelectedType('all');
                    setSelectedYear('all');
                  }}
                  className="w-full px-6 py-3.5 rounded-xl bg-gray-900 dark:bg-white text-white dark:text-gray-900 font-bold hover:bg-gray-700 dark:hover:bg-gray-200 transition-all duration-300 shadow-md hover:shadow-xl hover:-translate-y-0.5 uppercase tracking-wide text-sm"
                >
                  ✕ Limpiar filtros
                </button>
              </div>
            )}
          </div>

          {/* Contador de resultados */}
          <div className="flex items-center gap-3 px-4 py-3 bg-gray-50 dark:bg-gray-900 rounded-lg border-l-4 border-gray-900 dark:border-white">
            <div className="w-2 h-2 rounded-full bg-gray-900 dark:bg-white animate-pulse"></div>
            <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">
              Mostrando <span className="text-gray-900 dark:text-white font-bold">{filteredEntries.length}</span> de <span className="text-gray-900 dark:text-white font-bold">{entries.length}</span> referencia{entries.length !== 1 ? 's' : ''}
            </p>
          </div>
        </div>
        
        <div className="space-y-6">
          {filteredEntries.map((entry) => (
            <article
              key={entry.citationKey}
              className="group bg-white dark:bg-gray-800 rounded-xl shadow-sm hover:shadow-xl transition-all duration-300 p-8 border border-gray-100 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 hover:-translate-y-1"
            >
              <div className="flex items-start justify-between mb-4">
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white flex-1 leading-tight group-hover:text-gray-700 dark:group-hover:text-gray-200 transition-colors">
                  {highlightKeywords(entry.entryTags.title || 'Sin título')}
                </h3>
                <span className="ml-4 px-4 py-1.5 text-xs font-semibold bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-full uppercase tracking-wider">
                  {translateEntryType(entry.entryType)}
                </span>
              </div>
              
              {entry.entryTags.author && (
                <p className="text-base text-gray-700 dark:text-gray-300 mb-3">
                  <span className="font-semibold">Autores:</span> <span className="italic">{formatAuthorsOrEditors(entry.entryTags.author, 5)}</span>
                </p>
              )}
              
              {entry.entryTags.editor && (
                <p className="text-base text-gray-700 dark:text-gray-300 mb-3">
                  <span className="font-semibold">Editores:</span> <span className="italic">{formatAuthorsOrEditors(entry.entryTags.editor, 5)}</span>
                </p>
              )}
              
              {entry.entryType === 'book' && (
                <div className="mb-4 space-y-2 p-4 bg-gray-50 dark:bg-gray-900 rounded-lg border-l-4 border-gray-900 dark:border-white">
                  {entry.entryTags.publisher && (
                    <p className="text-sm text-gray-700 dark:text-gray-300">
                      <span className="font-semibold">Editorial:</span> {highlightKeywords(entry.entryTags.publisher)}
                    </p>
                  )}
                  {entry.entryTags.location && (
                    <p className="text-sm text-gray-700 dark:text-gray-300">
                      <span className="font-semibold">Lugar:</span> {highlightKeywords(entry.entryTags.location)}
                    </p>
                  )}
                  {entry.entryTags.series && (
                    <p className="text-sm text-gray-700 dark:text-gray-300">
                      <span className="font-semibold">Serie:</span> {highlightKeywords(entry.entryTags.series)}
                    </p>
                  )}
                  <div className="flex flex-wrap gap-4 text-sm text-gray-700 dark:text-gray-300">
                    {entry.entryTags.edition && (
                      <span><span className="font-semibold">Edición:</span> {highlightKeywords(entry.entryTags.edition)}</span>
                    )}
                    {entry.entryTags.volume && (
                      <span><span className="font-semibold">Volumen:</span> {highlightKeywords(entry.entryTags.volume)}</span>
                    )}
                    {entry.entryTags.isbn && (
                      <span><span className="font-semibold">ISBN:</span> {highlightKeywords(entry.entryTags.isbn)}</span>
                    )}
                  </div>
                </div>
              )}
              
              <div className="flex flex-wrap gap-5 text-sm text-gray-600 dark:text-gray-400 mb-5 pb-4 border-b border-gray-200 dark:border-gray-700">
                {entry.entryTags.date && (
                  <span className="flex items-center gap-1.5">
                    <FontAwesomeIcon icon={faCalendar} className="w-3.5 h-3.5" />
                    {highlightKeywords(entry.entryTags.date)}
                  </span>
                )}
                {entry.entryTags.journaltitle && (
                  <span className="flex items-center gap-1.5">
                    <FontAwesomeIcon icon={faBook} className="w-3.5 h-3.5" />
                    {highlightKeywords(entry.entryTags.journaltitle)}
                  </span>
                )}
                {entry.entryTags.doi && (
                  <span className="flex items-center gap-1.5">
                    <FontAwesomeIcon icon={faLink} className="w-3.5 h-3.5" />
                    DOI: {highlightKeywords(entry.entryTags.doi)}
                  </span>
                )}
              </div>
              
              {entry.entryTags.abstract && (
                <details className="mt-5">
                  <summary className="cursor-pointer text-sm font-bold text-gray-900 dark:text-white hover:text-gray-600 dark:hover:text-gray-300 transition-colors">
                    Ver resumen
                  </summary>
                  <p className="mt-4 text-base text-gray-700 dark:text-gray-300 leading-relaxed">
                    {highlightKeywords(entry.entryTags.abstract)}
                  </p>
                </details>
              )}
              
              {entry.entryTags.url && (
                <a
                  href={entry.entryTags.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 mt-5 px-5 py-2.5 text-sm font-semibold text-white dark:text-gray-900 bg-gray-900 dark:bg-white rounded-lg hover:bg-gray-700 dark:hover:bg-gray-200 transition-all duration-300 hover:shadow-lg"
                >
                  Ver artículo completo
                  <span className="text-lg">→</span>
                </a>
              )}
            </article>
          ))}
        </div>
        
        {filteredEntries.length === 0 && (
          <p className="text-center text-gray-600 dark:text-gray-400 py-12">
            {entries.length === 0 
              ? 'No se encontraron referencias'
              : 'No se encontraron referencias que coincidan con los filtros seleccionados'}
          </p>
        )}
      </main>
    </div>
  );
}
