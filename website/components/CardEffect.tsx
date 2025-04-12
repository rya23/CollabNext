import { HoverEffect } from "./ui/card-hover-effect";
import {
  Pencil,
  FileEdit,
  Users,
  RefreshCw,
  Settings,
  Book,
  Layers,
  Eye,
} from "lucide-react";

export function CardHoverEffectDemo() {
  return (
    <div className="max-w-5xl mx-auto px-8">
      <HoverEffect items={projects} />
    </div>
  );
}
export const projects = [
  {
    title: "Content Structuring",
    description:
      "Assisting creators in structuring content across formats like articles, scripts, marketing materials, and video narratives.",
   
    link: "#",
  },
  {
    title: "Efficient Draft Management",
    description:
      "Streamlining multiple drafts, from the initial version to revisions and final copy, for a smoother editorial process.",
    
    link: "#",
  },
  {
    title: "Collaborative Editing",
    description:
      "Enabling real-time comments, suggestions, and team reviews to enhance the creative workflow.",
    
    link: "#",
  },
  {
    title: "Automation of Repetitive Tasks",
    description:
      "Reducing manual work by automating scene descriptions, sound effects, and visual cue insertions.",
   
    link: "#",
  },
  {
    title: "Content Enhancement",
    description:
      "Providing AI-driven tools to refine tone, readability, and engagement for a polished final product.",
  
    link: "#",
  },
  {
    title: "Poetic & Literary Analysis",
    description:
      "Assisting in poetic enhancement by adding figures of speech and improving artistic expression.",
   
    link: "#",
  },
  {
    title: "Story Element Tracking",
    description:
      "Helping creators maintain themes, narrative arcs, and audience engagement strategies throughout content development.",

    link: "#",
  },
  {
    title: "AI-Powered Review & Refinement",
    description:
      "Using AI to refine content while preserving the creator's unique voice and vision.",
    
    link: "#",
  },
];
