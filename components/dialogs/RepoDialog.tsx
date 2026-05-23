'use client';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import axios from 'axios';
import { useContext, useEffect, useMemo, useState } from 'react';
import Repo from '@/types/Repo';
import { Input } from '@/components/ui/input';
import { UserDetailContext } from '@/contexts/userDetailContext';

const RepoDialog = ({
  setRefreshPage,
}: {
  setRefreshPage: (refresh: boolean) => void;
}) => {
  const [repositories, setRepositories] = useState<Repo[]>([]);
  const [selectedRepo, setSelectedRepo] = useState<Repo | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isOpen, setIsOpen] = useState(false);

  const { userDetail } = useContext(UserDetailContext);

  const getAllRepos = async () => {
    try {
      const response = await axios.get('/api/github/repos');
      setRepositories(response.data.repos);
    } catch (error) {
      console.error('Error fetching GitHub repositories:', error);
    }
  };

  const handleOnAddRepo = async () => {
    if (selectedRepo) {
      try {
        const response = await axios.post('/api/user-repo', {
          userId: userDetail?.id, // Replace with actual user ID
          repoId: selectedRepo.id,
          repoName: selectedRepo.name,
          fullName: selectedRepo.full_name,
          description: selectedRepo.description,
          htmlUrl: selectedRepo.html_url,
          stargazersCount: selectedRepo.stargazers_count,
          isPrivate: selectedRepo.isPrivate,
          language: selectedRepo.language,
          defaultBranch: selectedRepo.default_branch,
          owner: selectedRepo.owner,
          updatedAt: selectedRepo.updated_at,
        });
        setRefreshPage(true);
      } catch (error) {
        console.error('Error adding repository:', error);
      } finally {
        setIsOpen(false);
      }
    }
  };

  const filteredRepos = useMemo(() => {
    return repositories.filter((repo) =>
      repo.full_name.toLowerCase().includes(searchTerm.toLowerCase()),
    );
  }, [repositories, searchTerm]);

  useEffect(() => {
    getAllRepos();
  }, []);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger
        className="bg-green-600 text-white p-2 rounded hover:bg-green-700 transition-colors duration-200 flex gap-2 items-center hover:cursor-pointer"
        onClick={getAllRepos}
      >
        + Add Repository
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Repository</DialogTitle>
          <DialogDescription>
            Select one repository to connect to your workspace. This will allow
            you to manage and analyze your codebase effectively.
          </DialogDescription>
        </DialogHeader>
        <div>
          {/* Repository list goes here */}
          {repositories.length === 0 ? (
            <p>No repositories found. Please connect your GitHub account.</p>
          ) : (
            <>
              <Input
                placeholder="Search repositories..."
                className="mb-4"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <ul className="max-h-60 overflow-y-auto border rounded-xl">
                {filteredRepos.map((repo) => (
                  <li
                    key={repo.id}
                    className={`p-4 border-b hover:bg-gray-200 transition-colors duration-200 cursor-pointer ${selectedRepo?.id === repo.id ? 'bg-gray-200' : ''}`}
                    onClick={() => setSelectedRepo(repo)}
                  >
                    {repo.full_name}
                  </li>
                ))}
              </ul>
            </>
          )}
        </div>
        <DialogFooter className="flex justify-end gap-4">
          <DialogClose className="hover:cursor-pointer">Cancel</DialogClose>
          <Button
            type="submit"
            className="bg-green-600 text-white p-4 rounded hover:bg-green-700 transition-colors duration-200 flex gap-2 items-center hover:cursor-pointer"
            disabled={!selectedRepo}
            onClick={handleOnAddRepo}
          >
            Add
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default RepoDialog;
