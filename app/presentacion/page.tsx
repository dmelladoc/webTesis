import { getBibtexEntriesFromFolder } from '@/lib/bibtex';
import BibliographyPage from '@/components/BibliographyPage';

export default function PresentacionPage() {
  const entries = getBibtexEntriesFromFolder('presentacion');

  return <BibliographyPage title="Referencias de la Presentación" entries={entries} />;
}
