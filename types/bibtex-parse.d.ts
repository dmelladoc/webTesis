declare module '@orcid/bibtex-parse-js' {
  interface BibtexEntry {
    citationKey: string;
    entryType: string;
    entryTags: {
      [key: string]: string;
    };
  }

  function toJSON(bibtex: string): BibtexEntry[];

  export { toJSON, BibtexEntry };
  export default { toJSON };
}
