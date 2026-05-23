interface Repo {
  id: number;
  repoId: number;
  name: string;
  fullName: string;
  description: string;
  htmlUrl: string;
  stargazersCount: number;
  isPrivate: boolean;
  language: string;
  defaultBranch: string;
  owner: string;
  targetDomain: string;
  globalInstructions: string;
  updatedAt: string;
  createdAt: string;
}

export default Repo;
