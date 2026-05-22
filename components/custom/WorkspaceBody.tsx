'use client';

import { useContext, useEffect, useState } from 'react';
import { UserDetailContext } from '@/contexts/userDetailContext';
import Image from 'next/image';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import EmptyRepo from './EmptyRepo';
import { useRouter } from 'next/navigation';
import axios from 'axios';

const WorkspaceBody = () => {
  const [token, setToken] = useState<string | null>(null);

  const { userDetail } = useContext(UserDetailContext);
  const router = useRouter();

  const GetGithubToken = async () => {
    try {
      const response = await axios.get('/api/github/token');
      const data = response.data;
      setToken(data.token);
    } catch (error) {
      console.error('Error fetching GitHub token:', error);
    }
  };

  const handleOnSetupRepo = async () => {
    router.push('/api/github');
  };

  const handleOnAddRepo = async () => {
    router.push('/api/github');
  };

  useEffect(() => {
    GetGithubToken();
  }, []);

  return (
    <div>
      <div className="p-4  flex justify-between items-center">
        <h2 className="text-4xl font-bold">Workspace</h2>
        <h2 className="bg-blue-100 text-blue-800 px-2 py-1 font-semibold rounded-xl">
          Remaining Credits:{' '}
          <span className="font-bold">{userDetail?.credits ?? 0}</span>
        </h2>
      </div>
      <Card className="mt-5 flex justify-between items-center p-4 bg-white border rounded-lg">
        <div className="flex gap-2 items-center">
          <Image
            src="/image/github.svg"
            alt="GitHub Logo"
            width={40}
            height={40}
          />
          <h2 className="text-xl font-semibold">
            Connect Github & Add Repository
          </h2>
        </div>
        <div>
          {' '}
          {(!token && (
            <Button
              className="mt-5 bg-green-600 text-white p-4 rounded hover:bg-green-700 transition-colors duration-200 flex gap-2 items-center hover:cursor-pointer"
              onClick={handleOnSetupRepo}
            >
              Setup GitHub
            </Button>
          )) || (
            <Button
              className="mt-5 bg-green-600 text-white p-4 rounded hover:bg-green-700 transition-colors duration-200 flex gap-2 items-center hover:cursor-pointer"
              onClick={handleOnAddRepo}
            >
              + Add Repository
            </Button>
          )}
        </div>
      </Card>
      <Card className="mt-5 flex justify-center items-center p-4 bg-white border rounded-lg">
        <EmptyRepo />
      </Card>
    </div>
  );
};

export default WorkspaceBody;
