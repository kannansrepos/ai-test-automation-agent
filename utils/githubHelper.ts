import {
  ALLOWED_EXTENSIONS,
  IGNORE_PATHS,
  IMPORTANT_FILES,
} from '@/constans/testcase';
import { RepoTreeRequest } from '@/types/RepoTreeRequest';
import axios from 'axios';
import { cookies } from 'next/headers';

const isUsefulFile = (path: string) => {
  const isIgnored = IGNORE_PATHS.some((item) => path.includes(item));

  const isAllowedExtension = ALLOWED_EXTENSIONS.some((ext) =>
    path.endsWith(ext),
  );

  const isImportantPath = IMPORTANT_FILES.some((item) => path.includes(item));

  return !isIgnored && isAllowedExtension && isImportantPath;
};

const getRepoTree = async ({
  owner,
  repo,
  branch,
  githubToken,
}: RepoTreeRequest) => {
  const repoTreeUrl = `https://api.github.com/repos/${owner}/${repo}/git/trees/${branch}?recursive=1`;
  try {
    const response = await axios.get(repoTreeUrl, {
      headers: {
        Authorization: `Bearer ${githubToken}`,
        Accept: 'application/vnd.github+json',
      },
    });
    if (response.status !== 200) {
      throw new Error(
        `Failed to fetch repository tree: ${response.statusText}`,
      );
    }
    const data = response.data.tree
      .filter((item: any) => item.type === 'blob')
      .filter((item: any) => isUsefulFile(item.path))
      .slice(0, 25); // Limit to 25 files for performance

    return data;
  } catch (error) {
    console.error('Error fetching repository tree:', error);
    throw error;
  }
};

const readGithubFile = async (
  { owner, repo, branch, githubToken }: RepoTreeRequest,
  filePath: string,
) => {
  const fileUrl = `https://api.github.com/repos/${owner}/${repo}/contents/${filePath}?ref=${branch}`;
  try {
    const response = await axios.get(fileUrl, {
      headers: {
        Authorization: `Bearer ${githubToken}`,
        Accept: 'application/vnd.github+json',
      },
    });
    if (response.status !== 200) {
      throw new Error(`Failed to fetch file content: ${response.statusText}`);
    }
    if (!response.data.content) {
      return null;
    }
    const decodedContent = Buffer.from(
      response.data.content,
      'base64',
    ).toString('utf-8');
    return { path: filePath, content: decodedContent.slice(0, 5000) }; // Limit content to 5000 characters
  } catch (error) {
    console.error('Error fetching file content:', error);
    throw error;
  }
};

const getGithubToken = async () => {
  const cookieStore = await cookies();
  const token = cookieStore.get('github_token')?.value;
  return token;
};
const clearGithubToken = async () => {
  const cookieStore = await cookies();
  cookieStore.delete('github_token');
};

export {
  isUsefulFile,
  getRepoTree,
  readGithubFile,
  getGithubToken,
  clearGithubToken,
};
