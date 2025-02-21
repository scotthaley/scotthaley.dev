import type { MDXComponents } from "mdx/types";
import Image, { ImageProps } from "next/image";
import SyntaxHighlighter from "react-syntax-highlighter";
import { anOldHope } from "react-syntax-highlighter/dist/esm/styles/hljs";
import matter from "gray-matter";

export function useMDXComponents(components: MDXComponents): MDXComponents {
  return {
    a: ({ children, ...props }) => (
      <a {...props} target="_blank">
        {children}
      </a>
    ),
    h1: ({ children }) => (
      <div className="mb-10 border-b-theme-2 border-b-2 w-full px-6">
        <h1>{children}</h1>
      </div>
    ),
    h2: ({ children }) => <h2 className="px-6">{children}</h2>,
    h3: ({ children }) => <h3 className="px-6">{children}</h3>,
    h4: ({ children }) => <h4 className="px-6">{children}</h4>,
    h5: ({ children }) => <h5 className="px-6">{children}</h5>,
    h6: ({ children }) => <h6 className="px-6">{children}</h6>,
    p: ({ children }) => <p className="mb-4 px-6">{children}</p>,
    ol: ({ children }) => (
      <ol className="list-decimal mt-4 list-inside my-8 px-6">{children}</ol>
    ),
    img: (props) => (
      <Image
        sizes="100vw"
        width={0}
        height={0}
        className="shadow-lg rounded-lg"
        style={{ width: "100%", height: "auto" }}
        {...(props as ImageProps)}
      />
    ),
    code: ({ children, className }) => {
      const match = /language-(\w+)/.exec(className || "");

      if (match) {
        const { data, content } = matter(children);
        return (
          <div className="bg-code-bg rounded-md overflow-hidden py-2 my-6">
            {data.file && (
              <p className="pb-2 pl-6 text-gray-400">
                <i>{data.file}</i>
              </p>
            )}
            <SyntaxHighlighter
              style={anOldHope}
              language={match[1]}
              showLineNumbers
            >
              {content.trim()}
            </SyntaxHighlighter>
          </div>
        );
      }

      return (
        <code className="bg-code-bg text-theme-7 px-2 pt-1 text-lg rounded-sm text-teal-400">
          {children}
        </code>
      );
    },
    Accent: ({ children }) => (
      <p className="mb-8 text-theme-6 text-md px-6">
        <i>{children}</i>
      </p>
    ),
    Note: ({ children }) => (
      <div className="px-6">
        <div className="my-8 p-4 bg-theme-6 text-theme-1 font-semibold flex rounded-lg">
          <div className="mr-4 font-bold">Note:</div>
          <div>{children}</div>
        </div>
      </div>
    ),
    ...components,
  };
}
