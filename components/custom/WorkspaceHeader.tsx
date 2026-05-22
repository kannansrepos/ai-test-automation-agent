import { UserButton } from '@clerk/nextjs';
import Image from 'next/image';

const WorkspaceHeader = () => {
  return (
    <div className="flex items-center justify-between p-4 bg-white shadow">
      {/* Logo */}
      <Image src="/logo.svg" alt="Logo" width={300} height={200} />
      {/* Menu option */}
      <ul className="flex space-x-4 text-xl">
        <li className="hover: border-b-primary hover:border-b hover:cursor-pointer hover:scale-105 transition-transform duration-200">
          Home
        </li>
        <li className="hover: border-b-primary hover:border-b hover:cursor-pointer hover:scale-105 transition-transform duration-200">
          About
        </li>
        <li className="hover: border-b-primary hover:border-b hover:cursor-pointer hover:scale-105 transition-transform duration-200">
          Contact
        </li>
      </ul>
      {/* User Button */}
      <UserButton />
    </div>
  );
};

export default WorkspaceHeader;
