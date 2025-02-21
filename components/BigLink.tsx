import { JSDOM } from "jsdom";

interface IBigLinkProps {
  url: string;
}

const extractMetaTags = async (url: string) => {
  try {
    const response = await fetch(url);
    const html = await response.text();
    const dom = new JSDOM(html);
    const document = dom.window.document;
    const metaTags = Array.from(document.querySelectorAll("meta")).reduce(
      (tags: { [name: string]: string }, meta) => {
        const name =
          meta.getAttribute("name") ||
          meta.getAttribute("property") ||
          meta.getAttribute("itemprop");
        const content = meta.getAttribute("content");

        if (name && content) {
          tags[name as string] = content;
        }

        return tags;
      },
      {},
    );

    return {
      title: document.title || metaTags["og:title"],
      description: metaTags.description || metaTags["og:description"],
      image: metaTags.image || metaTags["og:image"],
    };
  } catch (error) {
    console.error("Error fetching Open Graph details", error);
  }
};

const BigLink: React.FC<IBigLinkProps> = async ({ url }) => {
  const data = await extractMetaTags(url);

  if (!data) {
    return <p>Failed to fetch link preview.</p>;
  }

  return (
    <a href={url} className="no-underline w-full" target="_blank">
      <div className="flex bg-theme-7 text-theme-1 w-full p-2 rounded-md items-stretch my-6">
        <div className="w-[300px] flex-shrink-0">
          <img
            src={data.image}
            alt={`Preview image for ${url}`}
            className="w-full rounded-md"
          />
        </div>
        <div className="p-4 flex flex-col">
          <h4 className="font-normal mb-4">{data.title}</h4>
          <p className="text-sm">{data.description}</p>
        </div>
      </div>
    </a>
  );
};

export default BigLink;
