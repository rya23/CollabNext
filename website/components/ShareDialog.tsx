import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Check, Copy, QrCode } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/components/ui/use-toast";

interface ShareDialogProps {
  isOpen: boolean;
  onClose: () => void;
  projectId: string;
  projectTitle: string;
}

export default function ShareDialog({
  isOpen,
  onClose,
  projectId,
  projectTitle,
}: ShareDialogProps) {
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState("link");
  const { toast } = useToast();

  const shareLink = `${window.location.origin}/share/project/${projectId}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(shareLink);
    setCopied(true);
    toast({
      title: "Link copied to clipboard",
      description: "You can now share this link with others",
    });

    setTimeout(() => {
      setCopied(false);
    }, 2000);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md bg-gray-800 border-gray-700 text-white">
        <DialogHeader>
          <DialogTitle className="text-white">Share Project</DialogTitle>
          <DialogDescription className="text-gray-400">
            Share "{projectTitle}" with others
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2 bg-gray-700">
            <TabsTrigger value="link">Share Link</TabsTrigger>
            <TabsTrigger value="qr">QR Code</TabsTrigger>
          </TabsList>

          <TabsContent value="link" className="pt-4">
            <div className="flex items-center space-x-2">
              <div className="grid flex-1 gap-2">
                <Input
                  value={shareLink}
                  readOnly
                  className="bg-gray-700 border-gray-600 text-gray-100"
                />
              </div>
              <Button size="icon" onClick={handleCopy}>
                {copied ? (
                  <Check className="h-4 w-4" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </Button>
            </div>
            <p className="text-xs text-gray-400 mt-2">
              Anyone with this link will be able to view this project
            </p>
          </TabsContent>

          <TabsContent value="qr" className="pt-4 flex flex-col items-center">
            <div className="bg-white p-4 rounded-lg">
              <img
                src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(
                  shareLink
                )}`}
                alt="QR Code"
                width={200}
                height={200}
              />
            </div>
            <p className="text-xs text-gray-400 mt-4 text-center">
              Scan this QR code to access the project
            </p>
          </TabsContent>
        </Tabs>

        <DialogFooter className="sm:justify-start">
          <Button
            type="button"
            variant="secondary"
            onClick={onClose}
            className="bg-gray-700 hover:bg-gray-600"
          >
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
