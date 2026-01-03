import { getBibtexEntriesFromFolder } from '@/lib/bibtex';
import BibliographyPage from '@/components/BibliographyPage';

export default function Home() {
  const entries = getBibtexEntriesFromFolder('investigacion');

  return <BibliographyPage title="Referencias de la Investigación" entries={entries} />;
}
