import { TestCase } from '@/types/TestCase';
import { Checkbox } from '../ui/checkbox';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Play, RefreshCw, Settings2Icon, SettingsIcon } from 'lucide-react';
import { useState } from 'react';
import TestCaseSettingDialog from '../dialogs/TestCaseSettingDialog';
type Props = {
  testCases: TestCase[];
  onReload: () => void;
};
const TestCaseList = ({ testCases, onReload }: Props) => {
  const [selectedTestCases, setSelectedTestCases] = useState<TestCase[]>([]);

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

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold mb-4">Generated Testcases</h2>
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
            >
              <Play className="w-4 h-4 mr-2" />
              Run Selected
            </Button>
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
            <Badge className="ml-auto p-2">{testCase.status}</Badge>
            <TestCaseSettingDialog testCase={testCase} setReload={onReload} />
          </div>
        </div>
      ))}
    </div>
  );
};

export default TestCaseList;
