import Link from "next/link";

export default function Home() {
  return (
    <div className="p-4 pb-20 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      <main className="flex flex-col tems-center sm:items-start">
        <div className="mb-10 border-b-theme-2 border-b-2 w-full">
          <h1>Scott Haley, Engineer</h1>
        </div>
        <div>
          <h2>Who Am I?</h2>
          <p className="mb-4">
            Hello! My name is Scott Haley and I am an engineer, consultant, game
            developer, and musician. I created this website to write about
            things that I want to write about and to have a place to host little
            expirements and prototypes that I build. I've been building software
            for nearly 20 years and have made lots of neat little things, most
            of which have been lost to time. I'm hoping that this project will
            encourage me to keep <i>some</i> record of the things I make. I hope
            you click around and find something useful or at least interesting.
          </p>
          <p>
            <Link href="blog/1">How I Built This Website</Link> might be a good
            place to start!
          </p>
        </div>
      </main>
      <footer className="row-start-3 flex gap-6 flex-wrap items-center justify-center"></footer>
    </div>
  );
}
