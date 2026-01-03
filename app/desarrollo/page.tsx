import { getBibtexEntriesFromFolder } from '@/lib/bibtex';
import BibliographyPage from '@/components/BibliographyPage';

export default function ArticulosPage() {
  const entries = getBibtexEntriesFromFolder('desarrollo');

  return <BibliographyPage title="Artículos Desarrollados" entries={entries} sortBy="year-author" />;
}
