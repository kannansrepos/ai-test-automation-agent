import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '../ui/button';
import { Settings2, Settings2Icon } from 'lucide-react';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { useState } from 'react';
import Repo from '../../types/Repo';
import axios from 'axios';
type Props = {
  repo: Repo;
  onReload: () => void;
};
const RepoSettingDialog = ({ repo, onReload }: Props) => {
  const [formRepoSettings, setFormRepoSettings] = useState({
    targetDomain: repo.targetDomain || '',
    globalInstructions: repo.globalInstructions || '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isopen, setIsOpen] = useState(false);

  const handleUpdate = async () => {
    setIsLoading(true);
    try {
      const response = await axios.put('/api/github/repos', {
        repoId: repo.repoId,
        targetDomain: formRepoSettings.targetDomain,
        globalInstructions: formRepoSettings.globalInstructions,
      });
      console.log('Updated repository settings:', response.data);
    } catch (error) {
      console.error('Error updating repository settings:', error);
    } finally {
      setIsLoading(false);
      setIsOpen(false);
      onReload();
    }
  };
  return (
    <Dialog open={isopen} onOpenChange={setIsOpen}>
      <DialogTrigger className="border p-2 rounded-sm cursor-pointer bg-primary text-primary-foreground hover:bg-primary/90 transition-colors duration-200 shadow-sm">
        <Settings2Icon className="w-5 h-5 inline-block mr-2" /> Settings
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Settings2 className="w-5 h-5 text-primary" /> Project/Repo Settings
          </DialogTitle>
          <DialogDescription>
            Manage your project or repository settings here.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div>
            <label className="block text-sm font-medium mb-1">
              App URL/Default Target Domain
            </label>
            <Input
              placeholder="Enter app URL or default target domain"
              value={formRepoSettings.targetDomain}
              onChange={(e) =>
                setFormRepoSettings({
                  ...formRepoSettings,
                  targetDomain: e.target.value,
                })
              }
            />
            <p className="text-xs text-muted-foreground">
              This will be used as the default target domain for your
              application.
            </p>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">
              Global Test Instructions
            </label>
            <Textarea
              placeholder="Enter global test instructions"
              value={formRepoSettings.globalInstructions}
              onChange={(e) =>
                setFormRepoSettings({
                  ...formRepoSettings,
                  globalInstructions: e.target.value,
                })
              }
            />
            <p className="text-xs text-muted-foreground">
              These instructions will be included in every test case generated
              for this project/repository.
            </p>
          </div>
        </div>
        <DialogFooter>
          <DialogClose className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium py-1 px-4 rounded-md">
            Cancel
          </DialogClose>
          <Button onClick={handleUpdate} disabled={isLoading}>
            {isLoading ? 'Updating...' : 'Update Settings'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default RepoSettingDialog;
