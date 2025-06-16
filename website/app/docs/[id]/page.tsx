'use client';
import { nanoid } from "nanoid";
import { useRouter } from "next/navigation";

const router = useRouter();

interface Template {
  id: number;
  title: string;
  description: string;
  icon: any; // Using 'any' for Lucide icons
  color: string;
  fileId?: string;
}

const handleSelectTemplate = (templateId: number) => {
  // Find the selected template
  const template = templates.find((t: Template) => t.id === templateId);

  if (!template) return;

  // If template has a fileId, use that directly
  if (template.fileId) {
    router.push(`/create/file/${template.fileId}`);
    return;
  }

  // Fallback to existing template logic for templates without fileId
  const documentId = nanoid(10);
  const templateNameMap: Record<number, string> = {
    8: "blank",
    2: "college-assignment",
  };
  const templateName = templateNameMap[templateId];
  if (templateName) {
    router.push(`/create/file/${documentId}?template=${templateName}`);
  } else {
    router.push(`/create/file/${documentId}`);
  }
};
