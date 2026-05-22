interface Repo {
  id: number;
  name: string;
  fullName: string;
  description: string;
  htmlUrl: string;
  stargazersCount: number;
  isPrivate: boolean;
  language: string;
  defaultBranch: string;
  owner: string;
  updatedAt: string;
  createdAt: string;
}

export default Repo;
