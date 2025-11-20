/**
 * Centralized helpers for repository metadata used throughout the Juicebox UI.
 *
 * Keeping these values in one place makes it easier to reuse them when building
 * Astro head tags, structured data, or UI elements such as the footer.
 */

export interface RepoMetadata {
  owner: string;
  name: string;
  defaultBranch: string;
  url: string;
  latestCommitRef: string;
  latestCommitHash: string;
  latestCommitShortHash: string;
}

export const REPO_METADATA: RepoMetadata = {
  owner: "create-juicey-app",
  name: "juicebox-epsilon",
  defaultBranch: "main",
  url: "https://github.com/create-juicey-app/juicebox-epsilon",
  latestCommitRef: "main@a3f8c2d",
  latestCommitHash: "a3f8c2d",
  latestCommitShortHash: "a3f8c2d".slice(0, 7),
};

/**
 * Returns the canonical GitHub URL for the repository.
 */
export const getRepoUrl = (): string => REPO_METADATA.url;

/**
 * Returns a permalink to a specific path at a given ref (branch, tag, or commit).
 */
export const getRepoPathUrl = (path: string, ref: string = REPO_METADATA.defaultBranch): string =>
  `${REPO_METADATA.url}/blob/${encodeURIComponent(ref)}/${path.replace(/^\/+/, "")}`;

/**
 * Returns display-friendly commit text, optionally prefixed with the branch name.
 */
export const getFormattedCommitLabel = (includeBranch = true): string =>
  includeBranch
    ? REPO_METADATA.latestCommitRef
    : REPO_METADATA.latestCommitShortHash;

/**
 * Generates JSON-LD structured data describing the software project.
 */
export const getProjectStructuredData = () => ({
  "@context": "https://schema.org",
  "@type": "SoftwareSourceCode",
  name: "Juicebox-Epsilon",
  version: REPO_METADATA.latestCommitShortHash,
  programmingLanguage: "TypeScript",
  codeRepository: REPO_METADATA.url,
  license: "https://opensource.org/licenses/MIT",
  source: {
    "@type": "URL",
    "@id": REPO_METADATA.url,
  },
});
