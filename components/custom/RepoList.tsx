import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

import Repo from '@/types/Repo';
import {
  CheckCircle2,
  ListChecks,
  Sparkles,
  StarIcon,
  TrendingUp,
  XCircle,
} from 'lucide-react';
import Image from 'next/image';
import StatusCard from './StatusCard';
import { Button } from '../ui/button';
type Props = {
  repositories: Repo[];
};
const RepoList = ({ repositories }: Props) => {
  const totalTests = 100;
  const passedTests = 80;
  const failedTests = 20;
  const passRate =
    totalTests > 0 ? ((passedTests / totalTests) * 100).toFixed(2) : '0.00';
  return (
    <div>
      {repositories.map((repo) => (
        <Accordion
          type="single"
          collapsible
          defaultValue="item-1"
          key={repo.id}
        >
          <AccordionItem value="item-1">
            <AccordionTrigger>
              <div className="flex items-center space-x-2">
                <Image
                  src="/image/github.svg"
                  alt="Repo Icon"
                  width={24}
                  height={24}
                />
                <div className="flex flex-col items-start gap-1">
                  <h3 className="text-lg font-semibold">{repo.fullName}</h3>
                  <div className="flex items-center gap-4">
                    <p className="text-sm text-gray-500">
                      {repo.defaultBranch} . {repo.language}{' '}
                    </p>
                    <div className="flex items-center gap-1">
                      <StarIcon className="inline-block w-4 h-4 text-yellow-500 g-yellow-800" />
                      <span className="text-sm text-gray-500">
                        {repo.stargazersCount}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </AccordionTrigger>
            <AccordionContent>
              <div className="pt-4 space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  <StatusCard
                    title="Total Tests"
                    value={totalTests}
                    icon={<ListChecks className="w-5 h-5 text-blue-600" />}
                    bgColor="bg-blue-50"
                  />
                  <StatusCard
                    title="Passed"
                    value={passedTests}
                    icon={<CheckCircle2 className="w-5 h-5 text-green-600" />}
                    bgColor="bg-green-50"
                  />
                  <StatusCard
                    title="Failed"
                    value={failedTests}
                    icon={<XCircle className="w-5 h-5 text-red-600" />}
                    bgColor="bg-red-50"
                  />
                  <StatusCard
                    title="Pass Rate"
                    value={`${passRate}%`}
                    icon={<TrendingUp className="w-5 h-5 text-purple-600" />}
                    bgColor="bg-purple-50"
                  />
                </div>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border rounded-xl p-4 bg-gray-40">
                  <div>
                    <h3 className="font-medium">Generate AI Test Cases</h3>
                    <p className="text-sm text-gray-500 mt-1">
                      Analyze this repository's code to generate relevant
                      automated test cases using AI.
                    </p>
                  </div>
                  <Button className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition-colors duration-200">
                    <Sparkles className="w-4 h-4 mr-2" />
                    Generate Test Cases
                  </Button>
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      ))}
    </div>
  );
};

export default RepoList;
