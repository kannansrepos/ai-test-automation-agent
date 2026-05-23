import { TestCase } from '@/types/TestCase';
import { Checkbox } from '../ui/checkbox';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Play, RefreshCw, Settings2Icon, SettingsIcon } from 'lucide-react';
import { ReactNode, useState } from 'react';
import TestCaseSettingDialog from '../dialogs/TestCaseSettingDialog';
import { cn } from '../../lib/utils';
import TestExecutionModal from '../dialogs/TestExecutionDialog';
type Props = {
  testCases: TestCase[];
  repository: any;
  onReload: () => void;
};
const TestCaseList = ({ testCases, repository, onReload }: Props) => {
  const [selectedTestCases, setSelectedTestCases] = useState<TestCase[]>([]);
  const [testExecutionOpen, setTestExecutionOpen] = useState(false);

  const toggleTestCaseSelection = (testCase: TestCase) => {
    setSelectedTestCases((prevSelected) => {
      if (prevSelected.some((tc) => tc.id === testCase.id)) {
        return prevSelected.filter((tc) => tc.id !== testCase.id);
      }
      return [...prevSelected, testCase];
    });
  };

  const isAllSelected =
    testCases.length > 0 && selectedTestCases.length === testCases.length;

  const toggleSelectAll = () => {
    if (isAllSelected) {
      setSelectedTestCases([]);
    } else {
      setSelectedTestCases(testCases);
    }
  };

  const GetStatusBadge = (status: string): ReactNode => {
    let cls = '';
    switch (status) {
      case 'failed': {
        cls = 'text-red-200 bg-red-700 hover:text-red-200 hover:bg-red-700';
        break;
      }
      case 'passed': {
        cls =
          'text-green-200 bg-green-700 hover:text-green-200 hover:bg-green-700';
        break;
      }
      case 'running': {
        cls =
          'text-yellow-200 bg-yellow-700 hover:text-yellow-200 hover:bg-yellow-700';
        break;
      }
      default: {
        cls = 'text-gray-700 bg-gray-200 hover:text-gray-700 hover:bg-gray-200';
        break;
      }
    }
    return <Badge className={cn('ml-auto p-2', cls)}>{status}</Badge>;
  };
  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold mb-4 ">Generated Testcases</h2>
        <Button
          size="icon"
          variant="outline"
          className="mb-4"
          onClick={() => onReload()}
        >
          <RefreshCw className="w-4 h-4" />
        </Button>
      </div>
      <div className="border p-4 mb-2 flex items-center space-x-3 rounded bg-gray-100">
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center space-x-3">
            <Checkbox onCheckedChange={toggleSelectAll} />
            <h2 className="font-semibold">Select All</h2>
          </div>
          <div>
            <Button
              size="sm"
              variant="outline"
              disabled={selectedTestCases.length === 0}
              onClick={() => setTestExecutionOpen(true)}
            >
              <Play className="w-4 h-4 mr-2" />
              Run Selected
            </Button>
            <TestExecutionModal
              repository={repository}
              testCases={selectedTestCases}
              onClose={() => {
                setTestExecutionOpen(false);
              }}
              isOpen={testExecutionOpen}
            />
          </div>
        </div>
      </div>
      {testCases.map((testCase: TestCase) => (
        <div
          key={testCase.id}
          className="border p-4 mb-2 flex items-center space-x-3 rounded"
        >
          <div className="flex items-center space-x-3">
            <Checkbox
              checked={selectedTestCases.some((tc) => tc.id === testCase.id)}
              onCheckedChange={() => toggleTestCaseSelection(testCase)}
            />
            <div>
              <h3 className="font-semibold">{testCase.title}</h3>
              <p>{testCase.description}</p>
            </div>
          </div>
          <div className="ml-auto flex items-center space-x-4">
            <Badge className="ml-auto p-2" variant="secondary">
              {testCase.type}
            </Badge>
            {GetStatusBadge(testCase.status)}
            <TestCaseSettingDialog testCase={testCase} setReload={onReload} />
          </div>
        </div>
      ))}
    </div>
  );
};

export default TestCaseList;
