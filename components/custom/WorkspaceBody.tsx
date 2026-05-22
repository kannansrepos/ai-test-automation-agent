'use client';

import { useContext } from 'react';
import { UserDetailContext } from '@/contexts/userDetailContext';
import Image from 'next/image';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import EmptyRepo from './EmptyRepo';

const WorkspaceBody = () => {
  const { userDetail } = useContext(UserDetailContext);
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
          <Button className="ml-10 bg-black text-white hover:bg-green-600 hover:cursor-pointer hover:scale-105 transition-transform duration-200">
            Install
          </Button>
        </div>
      </Card>
      <Card className="mt-5 flex justify-center items-center p-4 bg-white border rounded-lg">
        <EmptyRepo />
      </Card>
    </div>
  );
};

export default WorkspaceBody;
