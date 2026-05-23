export interface TestCase {
  id: number;
  repoId: number;
  githubRepoId: number;
  repoName: string;
  repoOwner: string;
  branch: string;
  title: string;
  description: string;
  type: string;
  priority: string;
  targetRoute: string;
  targetFile: string[];
  expectedResult: string;
  testScript: string;
  status: string;
  createdAt: string;
}
