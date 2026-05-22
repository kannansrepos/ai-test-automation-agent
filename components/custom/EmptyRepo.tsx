import Image from 'next/image';
import { Button } from '../ui/button';

const EmptyRepo = () => {
  return (
    <div>
      <div className="flex flex-col items-center justify-center py-10">
        <Image
          src="/image/folder.svg"
          alt="Empty Repo"
          width={80}
          height={80}
        />
        <h2 className="text-2xl font-semibold mt-4">No Repository Connected</h2>
        <p className="text-gray-600 mt-2">
          Connect your GitHub account and add a repository to get started with
          test automation.
        </p>
      </div>
      <div className="flex flex-col items-center justify-center gap-4">
        <Button className="mt-5 bg-green-600 text-white p-4 rounded hover:bg-green-700 transition-colors duration-200 flex gap-2 items-center">
          <Image
            src="/image/link-chain.svg"
            alt="GitHub Logo"
            width={20}
            height={20}
            className="inline-block ml-2 invert"
          />
          Connect Repository
        </Button>
        <div className="flex items-center gap-2 m-4 ">
          <Image
            src="/image/book.svg"
            alt="Learn More"
            width={20}
            height={20}
          />
          <h2 className="text-blue-600">Learn how it works </h2>
          <span className="text-blue-600 text-2xl">
            <Image
              src="/image/right-arrow.svg"
              alt="Learn More"
              width={20}
              height={10}
            />{' '}
          </span>
        </div>
      </div>
    </div>
  );
};

export default EmptyRepo;
