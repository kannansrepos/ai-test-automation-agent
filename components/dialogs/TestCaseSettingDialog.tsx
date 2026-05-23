import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { SettingsIcon } from 'lucide-react';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { DialogClose } from '@radix-ui/react-dialog';
import { Button } from '../ui/button';
import { TestCase } from '../../types/TestCase';
import { useState } from 'react';
import axios from 'axios';

type Props = {
  testCase?: TestCase;
  setReload: (reload: boolean) => void;
};

const TestCaseSettingDialog = ({ testCase, setReload }: Props) => {
  const [formTestcase, setFormTestcase] = useState({
    title: testCase?.title || '',
    description: testCase?.description || '',
    targetRoute: testCase?.targetRoute || '',
    expectedResult: testCase?.expectedResult || '',
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleUpdate = async () => {
    setIsLoading(true);
    try {
      const updatedStatus = await axios.put(
        `/api/test-cases?testcaseId=${testCase?.id}`,
        {
          title: formTestcase.title,
          description: formTestcase.description,
          targetRoute: formTestcase.targetRoute,
          expectedResult: formTestcase.expectedResult,
        },
      );
      console.log('Updated test case status:', updatedStatus.data);
      setReload(true);
    } catch (error) {
      console.error('Error updating test case:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog>
      <DialogTrigger className="border p-2 rounded-sm cursor-pointer onhover:bg-gray-100 transition-colors duration-200 shadow-sm">
        <SettingsIcon className="w-4 h-4" />
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Testing Requirements</DialogTitle>
          <DialogDescription>
            Modify the testing requirements for this test case.
          </DialogDescription>
        </DialogHeader>
        <div>
          <div>
            <label className="block text-sm font-medium mb-1">Title</label>
            <Input
              placeholder="Enter test case title"
              className="w-full mt-1"
              value={formTestcase.title}
              onChange={(e) =>
                setFormTestcase({ ...formTestcase, title: e.target.value })
              }
            />
          </div>
          <div className="mt-4">
            <label className="block text-sm font-medium mb-1">
              Description
            </label>
            <Textarea
              placeholder="Enter test case description"
              className="w-full mt-1"
              value={formTestcase.description}
              onChange={(e) =>
                setFormTestcase({
                  ...formTestcase,
                  description: e.target.value,
                })
              }
            />
          </div>
          <div className="mt-4">
            <label className="block text-sm font-medium mb-1">
              Target Route
            </label>
            <Input
              placeholder="Enter target route (e.g., /login)"
              className="w-full mt-1"
              value={formTestcase.targetRoute}
              onChange={(e) =>
                setFormTestcase({
                  ...formTestcase,
                  targetRoute: e.target.value,
                })
              }
            />
          </div>
          <div className="mt-4">
            <label className="block text-sm font-medium mb-1">
              Expected Result
            </label>
            <Input
              placeholder="Enter expected result"
              className="w-full mt-1"
              value={formTestcase.expectedResult}
              onChange={(e) =>
                setFormTestcase({
                  ...formTestcase,
                  expectedResult: e.target.value,
                })
              }
            />
          </div>
        </div>
        <DialogFooter>
          <DialogClose className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium py-1 px-4 rounded-md">
            Cancel
          </DialogClose>
          <Button onClick={handleUpdate} disabled={isLoading}>
            {isLoading ? 'Updating...' : 'Update Case'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default TestCaseSettingDialog;
