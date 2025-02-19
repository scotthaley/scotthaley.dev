export const metadata = {
  title: "How I Built This Website",
};

export default function Page() {
  return (
    <div className="p-4 pb-20 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      <main className="flex flex-col tems-center sm:items-start">
        <div className="mb-10 border-b-theme-2 border-b-2 w-full">
          <h1>How I Built This Website</h1>
        </div>
        <div>
          <p className="mb-4">
            If you just want to see how I built this and you don't care about my
            advice on deciding how to start a new project, skip to{" "}
            <a href="#for-real">
              How I Built This Website (For Real This Time)
            </a>
            .
          </p>
          <h2>Choosing a stack</h2>
          <p className="mb-4">
            Choosing your tech stack when starting a new project seems like it
            would be pretty important. This is a decision you will have to live
            with for the rest of the life of the project, right?
          </p>
          <p className="mb-4">
            Something that is both a blessing and a curse in software
            development is that most things can be built with most things. There
            are certain technologies or languages that have certain advantages
            or disadvantages for certain types of applications, but by and
            large, you can build your app with whatever stack you want.
          </p>
          <p className="mb-4">
            When it comes to building a website, not only is it possible to use
            pretty much any language, most languages have a modern, open source,
            framework that will get you started quickly.
          </p>
          <p className="mb-4">
            For example, I've been working in Rust quite a bit lately for a game
            I'm working on using{" "}
            <a href="https://bevyengine.org/">Bevy Engine</a>, so let's say I
            wanted to build this website using Rust. I could get a project up
            and running quickly with <a href="https://rocket.rs/">Rocket</a>.
          </p>
          <p className="my-8">
            <img
              src="/RocketScreenshot.png"
              alt="Hello World screenshot of Rocket framework"
              className="shadow-lg rounded-lg"
            ></img>
          </p>
          <p className="mb-4">
            Okay, I admit I haven't actually used Rocket, but it looks pretty
            nice, doesn't it? Similar frameworks exist for{" "}
            <a href="https://gin-gonic.com/">Go</a>,{" "}
            <a href="https://flask.palletsprojects.com/en/stable/">Python</a>,{" "}
            <a href="https://www.phoenixframework.org/">Elixir</a>,{" "}
            <a href="https://dotnet.microsoft.com/en-us/apps/aspnet">C#</a>,{" "}
            <a href="https://drogon.org/">C++</a>,{" "}
            <a href="https://spring.io/">Java</a>,{" "}
            <a href="https://github.com/zigzap/zap">Zig</a>,{" "}
            <a href="https://laravel.com/">PHP</a>,{" "}
            <a href="https://rubyonrails.org/">Ruby</a>,{" "}
            <a href="https://vapor.codes/">Swift</a>,{" "}
            <a href="https://ktor.io/">Kotlin</a>,{" "}
            <a href="https://technostacks.com/blog/best-javascript-frameworks/#:~:text=Answer%3A%20There%20are%20at%20least,js%2C%20react.">
              and about a hundred in JavaScript/TypeScript
            </a>
            . You could also just do it the old fashioned way and build
            something with vanilla HTML, JS, and CSS and would do just fine
            (although I probably wouldn't if I was building anything more than a
            basic static website).
          </p>
          <h2>So then how do I pick?</h2>
          <p className="mb-4">
            There are a few things to consider when picking a tech stack.
          </p>
          <ol className="list-decimal mt-4 list-inside">
            <li>Do I want to build something quickly?</li>
            <li>Do I want to learn something new?</li>
            <li>Do I care about performance?</li>
          </ol>
          <h3>Build Quickly vs. Learn Something New</h3>
          <p className="mb-4">
            I'd argue you can't prioritize both of these things. There's
            certainly merit to both. You can't really learn a new thing without
            actually building something with it. If you want to build something
            quickly you should stick with what you already know. This gets a
            little more nuanced if the thing you know isn't a JS or TS
            framework.
          </p>
          <p className="mb-4">
            For example, if the language you are most comfortable in is Go, then
            your best bet to build something quickly is to use Go. However, if
            the thing you are wanting to build is a very frontend heavy
            application that needs complicated state management, it would
            probably be a good idea to learn a JS framework to handle that. In
            my opinion, <a href="https://vuejs.org/">Vue.js</a> is one of the
            easier ones to learn. <a href="https://alpinejs.dev/">Alpine.js</a>{" "}
            might also be a good option.
          </p>
          <h3>Prioritizing Performance</h3>
          <p className="mb-4">
            This might actually be the most nuanced decision point. Performant
            applications can be built on pretty much any tech stack and in the
            world of web development, there's really only one category that is{" "}
            <i>probably</i> going to be less performant, and that is client-side
            JS/TS frameworks.
          </p>
          <p className="mb-4">
            A client-side JS/TS framework (like React, Vue.js, Angular, etc.)
            works by running a full application client-side (in the browser)
            that is responsible for fetching data, rendering, and handling
            events. For a sufficiently complex application, a website built on
            this type of technology is going to <i>feel</i> more performant if
            built well if for no other reason than because the application state
            can update without needing to load a new page. Imagine an instant
            messaging app that reloads the whole page every time you send or
            recieve a new message.
          </p>
          <p className="mb-4">
            If you are building a website that doesn't have this type of
            stateful complexity (like this one), then you might get a better
            experience by going with a server-side rendered (SSR) application.
            SSR is just a fancy way of describing the way all websites worked
            until we started building these complex JS applications that handle
            the rendering client-side. Any of the non-JS/TS frameworks mentioned
            earlier are examples of SSR frameworks. All this means is that the
            actual HTML and CSS that ends up getting rendered in the browser is
            created on the server which is then downloaded in its entirety
            rather than the server providing the actual <i>application</i>{" "}
            responsible for creating that HTML and CSS.
          </p>
          <div className="my-8 p-4 bg-theme-6 text-theme-1 font-semibold flex rounded-lg">
            <p className="mr-4 font-bold">Note:</p>
            <p>
              The term <b>rendering</b> in "client-side rendering" and
              "server-side rendering" is misleading in my opinion. I would
              consider the process of rendering to be the part of the system
              that actually paints pixels on the screen, which for anything
              running in the browser, this is all handled by the{" "}
              <b>rendering engine</b> in the browser. The{" "}
              <b>rendering engine</b> takes HTML and CSS, and translates that to
              the actual pixels you see on your screen. <br />
              <br />
              When we are talking about client-side versus server-side
              rendering, we are actually referring to where the actual HTML and
              CSS that will be rendered by the browser is generated. It's not
              technically wrong to call what happens here "rendering", just
              don't get it confused with the computer graphics definition of the
              term.
            </p>
          </div>
          <p className="mb-4">
            There is also a category of frameworks that give a good middleground
            between client-side and server-side rendering. Frameworks like{" "}
            <a href="https://nextjs.org/">Next.js</a>,{" "}
            <a href="https://nuxt.com/">Nuxt</a>, and{" "}
            <a href="https://remix.run">Remix</a> provide mechanisms for mixing
            client-side and server-side rendering depending on the type of
            content. Typically, this type of framework works via a process
            called <b>"hydration"</b> which basically means the full initial
            HTML and CSS is generated server side which is then "taken over" by
            the client-side application. If the initial server-side state
            matches the initial client-side state (which most frameworks attempt
            to ensure) then there will be no noticible difference when the
            client-side application takes over. This strategy gives you most of
            the benefits of both rendering strategies at the expense of some
            complexity and a larger download bundle than a pure server-side
            rendering strategy.
          </p>
          <h3>Deploying My App</h3>
          <p className="mb-4">
            Another important part of the tech stack to consider is how you will
            deploy your app. This topic is much too big to cover in any sort of
            detail in this article, but I did want to take the opportunity to
            give some advice. These days there are about as many ways to deploy
            your app as there are ways to build the app. <br />
            <br />
            You could containerize your application and deploy on some sort of
            managed container service like Azure App Service or Amazon Elastic
            Container Service (ECS). If you are a masochist you could deploy
            your own kubernetes instance and deploy your containerized app that
            way. You could also provision an AWS EC2 instance or Azure VM and
            run your app on that with some sort of network gateway and
            potentially a load balancer. You could do a similar thing using
            Digital Ocean or Rackspace. Depending on how you built the
            application, you could also host the app statically in AWS S3 and
            then use AWS Lambda functions for any sort of server-side logic you
            might need.
            <br />
            <br />
            There are a ton of incredible tools available to you to solve all
            kinds of scalability, security, and cost problems. For personal
            projects, these tools solve all of these problems easily, because{" "}
            <b>
              you probably won't launch your application at all because you'll
              spend all of your time trying to figure out DevOps things.
            </b>
            <br />
            <br />
            Instead, you should look to a platform that will manage all of this
            for you. There are a few different ones that I've personally had
            success with: Firebase, Digital Ocean App Platform, and Vercel.
            These platforms connect to your git repository, and handle all of
            the DevOps stuff for you. They handle networking, load balancing,
            CI/CD, and in Vercel's case even provide tools for QA.
            <br />
            <br />
            Even if you are planning on building a huge website with tons of
            users and traffic, deploy first on something like Vercel and then
            migrate when it is necessary.
          </p>
        </div>
        <div>
          <h2>What stack did I pick?</h2>
          <p className="mb-4">
            Taking my own advice, I went with a tech stack that I was already
            very familiar with because I wanted to get this up and running
            quickly so I could have a place to write about the other projects I
            have that are more focused on learning things.
            <br />
            <br />
            As I've already hinted at, this website is a good use case for a
            server-side rendered application since it is largely static and has
            no complex state management needs. I could have gone with a pure SSR
            solution, but because I'm planning on doing some prototypes and
            experiments that will be more complex, I decided to go with{" "}
            <b>Next.js</b> which gives me a good middleground between
            server-side and client-side rendering. This choice has the added
            benefit of being a framework that I've used heavily recently.
            <br />
            <br />
            Another benefit of going with Next.js, is it integrates well with{" "}
            <b>Vercel</b> which is currently my favorite way to deploy an
            application. Vercel has a nice boilerplate setup for Next.js that
            also includes <b>Tailwind CSS</b>, which I've also made use of.
          </p>
        </div>
        <div id="for-real">
          <h2>How I Built This Website (For Real This Time)</h2>
          <p className="mb-4">
            I'm not trying to make this an ad for Vercel, but I do love Vercel
            and it allowed me to get this website up and running quickly. There
            are a few ways to set up a project on Vercel, but the fastest way
            when creating a new project is to clone one of their templates.
            <br />
            <br />
            After logging into Vercel, and choosing to create a new project, I
            get presented with this screen:
          </p>
          <div className="flex justify-center my-8">
            <img
              src="/vercel-create-new.png"
              alt="Screenshot of new project page in Vercel"
              className="shadow-lg rounded-lg mb-4"
            ></img>
          </div>
          <p className="mb-4">
            Because I've logged into Vercel using GitHub SSO, Vercel already has
            access to my GitHub account. If you created your account a different
            way, you would need to authenticate separately with your git
            provider under Account Settings.
            <br />
            <br />I could choose to import an existing repository, which would
            create the project in Vercel and set up everything I need for CI/CD,
            but in this case I'm going to choose to clone the Next.js
            Boilerplate project since this was a new project.
          </p>
          <div className="flex justify-center my-8">
            <img
              src="/vercel-clone-nextjs.png"
              alt="Screenshot of new project page in Vercel"
              width="60%"
              className="shadow-lg rounded-lg"
            ></img>
          </div>
          <p className="mb-4">
            From here, I can choose the name for my repository, and after
            clicking "Create", Vercel will create this project for me in my
            GitHub account, set up the project, and finally deploy the project.
            <br />
            <br />
            After this is done deploying, I can then clone the new repo that was
            created, and I'm ready to begin working on my new application.
            Everything will already be set up by Vercel to handle deploying new
            versions whenever I push changes to the repo. It's worth learning
            how to set something like this up manually, but when trying to get a
            project up and running quickly, this is a great solution.
          </p>
          <h3>Adding a custom domain name</h3>
          <p className="mb-4">
            Vercel also makes adding a custom domain name <i>very</i> easy.
            Again, this is something that would be worth learning how to do
            manually, but having a way to do this quickly is extremely valuable.
            <br />
            <br />
            First navigate to the "Domains" tab in Vercel (if you don't see
            this, it might be because you are in the context of a project, and
            need to click the Vercel logo in the top right to go up a level).
          </p>
          <div className="flex justify-center my-8">
            <img
              src="/vercel-domains.png"
              alt="Screenshot showing where the domains tab is in Vercel"
              className="shadow-lg rounded-lg"
            ></img>
          </div>
          <p className="mb-4">
            Next click the "Buy" button to purchase a new domain.
          </p>
          <div className="flex justify-center my-8">
            <img
              src="/vercel-domains-buy.png"
              alt="Screenshot showing where the buy button is under domains in Vercel"
              className="shadow-lg rounded-lg"
            ></img>
          </div>
          <p className="mb-4">
            Finally, search for a domain you'd like to purchase, and then
            purchase a domain.
          </p>
          <div className="flex justify-center my-8">
            <img
              src="/vercel-domains-list.png"
              alt="Screenshot showing where the buy button is under domains in Vercel"
              className="shadow-lg rounded-lg"
            ></img>
          </div>
          <p className="mb-4">
            After you have purchased your domain, go back to your project, then
            Settings, then "Domains". Click the "Add" button, and then select
            the domain you just purchased in the dropdown, leave environment on
            "Production" (assuming you want this domain for the production
            deployment), leave redirect to at "No Redirect" and click "Add
            Domain". You can choose to set up a redirect to "www." if you'd
            like, (I just went with the recommended option).
            <br />
            <br />
            It will take a minute or so for Vercel to set up the proper DNS
            settings and certificates, but once it looks like the screenshot
            below, your custom domain should be pointing to your website!
          </p>
          <div className="flex justify-center my-8">
            <img
              src="/vercel-domain-assign.png"
              alt="Screenshot showing how to add a custom domain to a project in Vercel"
              className="shadow-lg rounded-lg"
            ></img>
          </div>
          <div className="my-8 p-4 bg-theme-6 text-theme-1 font-semibold flex rounded-lg">
            <p className="mr-4 font-bold">Note:</p>
            <p>
              Domain names work on a system called DNS (Domain Name System)
              which works off of different servers that map domain names to the
              IP address of your server. When DNS settings are changed, which
              Vercel handles for you here, it might take some amount of time for
              those settings to propogate to different DNS servers. Usually this
              happens within a few minutes, but don't stress if your domain name
              doesn't work right away.
            </p>
          </div>
          <h3>Everything else</h3>
          <p className="mb-4">
            Without making this a Next.js tutorial, there's not much else to
            cover here. Feel free to check out the repo for this project{" "}
            <a href="https://github.com/scotthaley/scotthaley.dev">here</a>. In
            some later articles I will describe how specifically things on this
            site are built, but for now, hopefully you got something out of this
            article when it comes to the decisions around your tech stack when
            starting a new project.
          </p>
        </div>
      </main>
      <footer className="row-start-3 flex gap-6 flex-wrap items-center justify-center"></footer>
    </div>
  );
}
