'use client';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

import Repo from '@/types/Repo';
import {
  CheckCircle2,
  Globe2Icon,
  Link2Icon,
  ListChecks,
  Settings2Icon,
  Sparkles,
  StarIcon,
  TrendingUp,
  XCircle,
} from 'lucide-react';
import Image from 'next/image';
import StatusCard from './StatusCard';
import { Button } from '../ui/button';
import { useContext, useState } from 'react';
import { UserDetailContext } from '../../contexts/userDetailContext';
import axios from 'axios';
import { Spinner } from '../ui/spinner';
import TestCaseList from './TestCaseList';
import { StatusData } from '../../types/Statusdata';
import RepoSettingDialog from '../dialogs/RepoSettingDialog';
type Props = {
  repositories: Repo[];
};
const RepoList = ({ repositories }: Props) => {
  const totalTests = 100;
  const passedTests = 80;
  const failedTests = 20;
  const passRate =
    totalTests > 0 ? ((passedTests / totalTests) * 100).toFixed(2) : '0.00';

  const { userDetails } = useContext(UserDetailContext);

  const [isLoading, setIsLoading] = useState(false);
  const [selectedRepoId, setSelectedRepoId] = useState<string | null>(null);
  const [isTestcaseLoading, setIsTestcaseLoading] = useState(false);

  const [testCases, setTestCases] = useState([]);
  const [statusData, setStatusData] = useState<StatusData>({
    totalTests: 0,
    passedTests: 0,
    failedTests: 0,
    passRate: 0.0,
  });

  const handleGenerateTestCases = async (repo: Repo) => {
    try {
      setIsLoading(true);
      console.log('Generating test cases for repo:', repo);
      // Implement the logic to generate AI test cases for the given repository ID
      const result = await axios.post('/api/generate-test-cases', {
        id: repo.id,
        userId: userDetails?.id, // Assuming you have user details in context
        repoId: repo.repoId,
        owner: repo.owner,
        repo: repo.name,
        branch: repo.defaultBranch,
      });
      console.log('Test cases generated:', result.data);
    } catch (error) {
      console.error('Error generating test cases:', error);
    } finally {
      setIsLoading(false);
    }
  };
  const calculatePassRate = (data: any): number => {
    const totalTests = data.length;
    const passedTests = data.filter(
      (test: any) => test.status === 'passed',
    ).length;
    return totalTests > 0 ? (passedTests / totalTests) * 100 : 0;
  };

  const fetchTestCases = async (repoId: string) => {
    try {
      setIsTestcaseLoading(true);
      const response = await axios.get(`/api/test-cases?repoId=${repoId}`);
      setStatusData({
        totalTests: response.data.length,
        passedTests: response.data.filter(
          (test: any) => test.status === 'passed',
        ).length,
        failedTests: response.data.filter(
          (test: any) => test.status === 'failed',
        ).length,
        passRate: calculatePassRate(response.data),
      });
      setTestCases(response.data);
    } catch (error) {
      console.error('Error fetching test cases:', error);
    } finally {
      setIsTestcaseLoading(false);
    }
  };

  return (
    <div className="w-full mt-10">
      <h2 className="text-2xl font-bold my-3">REPOSITORIES</h2>
      <Accordion
        type="single"
        collapsible
        className="w-full"
        onValueChange={(value) => {
          setSelectedRepoId(value);
          if (value) {
            fetchTestCases(value);
          }
        }}
      >
        {repositories.map((repo) => (
          <AccordionItem
            value={`${repo.id}`} // Use repoId as the value for AccordionItem
            key={repo.id}
            className="border rounded-lg px-5 my-4"
          >
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
              {/* Repo level Settings */}
              <div className="bg-gray-50 p-4 rounded-lg mb-6 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Link2Icon className="w-5 h-5 inline-block mr-2 text-primary" />
                  <h2>Target Domain</h2>
                  <h2 className="bg-white text-primary p-1 px-2 border rounded-md font-medium">
                    {repo.targetDomain}
                  </h2>
                </div>
                <RepoSettingDialog
                  repo={repo}
                  onReload={() => fetchTestCases(selectedRepoId!)}
                />
              </div>
              {/* Status Cards and Generate Test Cases Button */}
              <div className="pt-4 space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  <StatusCard
                    title="Total Tests"
                    value={statusData.totalTests}
                    icon={<ListChecks className="w-5 h-5 text-blue-600" />}
                    bgColor="bg-blue-50"
                  />
                  <StatusCard
                    title="Passed"
                    value={statusData.passedTests}
                    icon={<CheckCircle2 className="w-5 h-5 text-green-600" />}
                    bgColor="bg-green-50"
                  />
                  <StatusCard
                    title="Failed"
                    value={statusData.failedTests}
                    icon={<XCircle className="w-5 h-5 text-red-600" />}
                    bgColor="bg-red-50"
                  />
                  <StatusCard
                    title="Pass Rate"
                    value={`${statusData.passRate.toFixed(2)}%`}
                    icon={<TrendingUp className="w-5 h-5 text-purple-600" />}
                    bgColor="bg-purple-50"
                  />
                </div>
                {isTestcaseLoading ? (
                  <div className="flex items-center justify-center py-10">
                    <Spinner className="w-6 h-6 text-gray-500" />
                    <span className="ml-2 text-gray-500">
                      Loading test cases...
                    </span>
                  </div>
                ) : (
                  <>
                    {testCases.length > 0 ? (
                      <div>
                        <TestCaseList
                          testCases={testCases}
                          onReload={() => fetchTestCases(selectedRepoId!)}
                        />
                      </div>
                    ) : (
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border rounded-xl p-4 bg-gray-40">
                        <div>
                          <h3 className="font-medium">
                            Generate AI Test Cases
                          </h3>
                          <p className="text-sm text-gray-500 mt-1">
                            Analyze this repository's code to generate relevant
                            automated test cases using AI.
                          </p>
                        </div>
                        <Button
                          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition-colors duration-200"
                          onClick={() => handleGenerateTestCases(repo)}
                          disabled={isLoading}
                        >
                          {isLoading ? (
                            <span className="flex items-center">
                              <Spinner className="w-4 h-4 mr-2" />
                              Generating...
                            </span>
                          ) : (
                            <span className="flex items-center">
                              <Sparkles className="w-4 h-4 mr-2" />
                              Generate Test Cases
                            </span>
                          )}
                        </Button>
                      </div>
                    )}
                  </>
                )}
              </div>
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  );
};

export default RepoList;
