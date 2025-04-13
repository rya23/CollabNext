import { FloatingToolbar, Toolbar } from '@liveblocks/react-tiptap';
import { Editor } from '@tiptap/react';
import { ToolbarMedia } from './ToolbarMedia';
import { ToolbarInlineAdvanced } from './TextInlineAdvanced';
import { ToolbarAlignment } from './ToolbarAlignment';
import { ToolbarBlockSelector } from './ToolbarBlockSelector';
import { ToolbarAudio } from './ToolbarAudio';

type Props = {
    editor: Editor | null;
};

export function StaticToolbar({ editor }: Props) {
    return (
        <Toolbar 
            editor={editor} 
            data-toolbar="static"
            className="flex items-center gap-2 p-2 bg-card rounded-lg border border-border shadow-sm"
        >
            <div className="flex items-center gap-2">
                <Toolbar.SectionHistory className="flex items-center gap-1" />
                <Toolbar.Separator className="w-[1px] h-7 bg-border mx-1" />
                
                <div className="flex items-center gap-2">
                    <ToolbarBlockSelector editor={editor} className="min-w-[120px]" />
                    <Toolbar.Separator className="w-[1px] h-7 bg-border mx-1" />
                    <Toolbar.SectionInline className="flex items-center gap-1" />
                    <ToolbarInlineAdvanced editor={editor} />
                    <Toolbar.Separator className="w-[1px] h-7 bg-border mx-1" />
                    <ToolbarAlignment editor={editor} />
                    <Toolbar.Separator className="w-[1px] h-7 bg-border mx-1" />
                    <ToolbarMedia editor={editor} />
                </div>
                
                <Toolbar.Separator className="w-[1px] h-7 bg-border mx-1" />
                <Toolbar.SectionCollaboration />
            </div>
        </Toolbar>
    );
}

export function SelectionToolbar({ editor }: Props) {
    return (
        <FloatingToolbar 
            editor={editor} 
            data-toolbar="selection"
            className="flex items-center gap-2 p-2 bg-card/95 backdrop-blur border border-border rounded-lg shadow-lg"
        >
            <ToolbarBlockSelector editor={editor} className="min-w-[120px]" />
            <Toolbar.Separator className="w-[1px] h-7 bg-border mx-1" />
            <Toolbar.SectionInline className="flex items-center gap-1" />
            <Toolbar.Separator className="w-[1px] h-7 bg-border mx-1" />
            <Toolbar.SectionCollaboration className="flex items-center gap-1" />
        </FloatingToolbar>
    );
}
