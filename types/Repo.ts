interface Repo {
  id: number;
  name: string;
  full_name: string;
  description: string;
  html_url: string;
  stargazers_count: number;
  isPrivate: boolean;
  language: string;
  default_branch: string;
  owner: string;
  updated_at: string;
  created_at: string;
}

export default Repo;
