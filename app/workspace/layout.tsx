import React from 'react';
import WorkspaceHeader from '@/components/custom/WorkspaceHeader';

const WorkspaceLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="bg-gray-100">
      <WorkspaceHeader />
      {children}
    </div>
  );
};

export default WorkspaceLayout;
