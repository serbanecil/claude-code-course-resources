import type { ReactNode } from 'react';

export type TipTapMark = { type: string; attrs?: Record<string, unknown> };
export type TipTapNode = {
  type: string;
  attrs?: Record<string, unknown>;
  content?: TipTapNode[];
  text?: string;
  marks?: TipTapMark[];
};

const SAFE_HREF = /^(https?:|mailto:)/i;

function renderMarks(text: string, marks: TipTapMark[] = []): ReactNode {
  return marks.reduce<ReactNode>((child, mark) => {
    switch (mark.type) {
      case 'bold':
        return <strong className='font-semibold'>{child}</strong>;
      case 'italic':
        return <em>{child}</em>;
      case 'strike':
        return <s>{child}</s>;
      case 'underline':
        return <u>{child}</u>;
      case 'code':
        return (
          <code className='rounded border border-foreground/25 bg-foreground/15 px-1.5 py-0.5 font-mono text-[0.9em]'>
            {child}
          </code>
        );
      case 'link': {
        const href = String(mark.attrs?.href ?? '');
        if (!SAFE_HREF.test(href)) return child;
        return (
          <a href={href} target='_blank' rel='noopener noreferrer nofollow' className='underline'>
            {child}
          </a>
        );
      }
      default:
        return child;
    }
  }, text);
}

function renderChildren(nodes?: TipTapNode[]): ReactNode {
  return nodes?.map((node, i) => <NoteNode key={i} node={node} />);
}

function NoteNode({ node }: { node: TipTapNode }) {
  const children = renderChildren(node.content);
  switch (node.type) {
    case 'text':
      return <>{renderMarks(node.text ?? '', node.marks)}</>;
    case 'paragraph':
      return <p className='min-h-[1lh]'>{children}</p>;
    case 'heading': {
      const level = Number(node.attrs?.level);
      if (level === 1) return <h1 className='text-3xl font-bold'>{children}</h1>;
      if (level === 2) return <h2 className='text-2xl font-bold'>{children}</h2>;
      return <h3 className='text-xl font-semibold'>{children}</h3>;
    }
    case 'bulletList':
      return <ul className='list-disc pl-6'>{children}</ul>;
    case 'orderedList':
      return (
        <ol start={Number(node.attrs?.start) || 1} className='list-decimal pl-6'>
          {children}
        </ol>
      );
    case 'listItem':
      return <li>{children}</li>;
    case 'blockquote':
      return (
        <blockquote className='border-l-4 border-foreground/30 pl-4 italic'>{children}</blockquote>
      );
    case 'codeBlock':
      return (
        <pre className='overflow-x-auto rounded-md border border-foreground/25 bg-foreground/12 px-4 py-3 font-mono text-[0.9em]'>
          <code>{children}</code>
        </pre>
      );
    case 'hardBreak':
      return <br />;
    case 'horizontalRule':
      return <hr className='border-foreground/30' />;
    default:
      return <>{children}</>;
  }
}

export function NoteRenderer({ doc }: { doc: TipTapNode }) {
  return <div className='flex flex-col gap-3 break-words'>{renderChildren(doc.content)}</div>;
}
