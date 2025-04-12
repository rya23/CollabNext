"use client";
import React from 'react';
import EditorWorkspace from '@/components/EditorWorkspace';

import { Toaster } from "@/components/ui/sonner";

export default function CreatePage() {
  return (
   <>
      <EditorWorkspace />
      <Toaster />
   </>
 
  );
}
