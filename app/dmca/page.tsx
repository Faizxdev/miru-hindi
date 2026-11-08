import { Metadata } from "next";

export const metadata: Metadata = {
  title: "DMCA - Miru Hindi",
  description: "Digital Millennium Copyright Act (DMCA) Policy for Miru Hindi",
};

export default function DMCAPage() {
  return (
    <main className="w-full px-4 sm:px-6 md:px-10 lg:px-12 py-12 md:py-24 space-y-12">
      <div className="max-w-4xl mx-auto space-y-10">
        <header className="space-y-4 text-center">
          <h1 className="text-3xl md:text-5xl font-bold font-serif text-accent tracking-wide">DMCA & Legal Disclaimer</h1>
          <p className="text-content-secondary leading-relaxed max-w-2xl mx-auto italic">
            "Miru Hindi does not store any files on its own server. We only index links from the internet which are hosted on third-party services. We index links just like Google."
          </p>
        </header>

        <section className="bg-bg-surface border border-border-subtle p-6 md:p-10 rounded-3xl shadow-2xl shadow-black/40 space-y-8">
          <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl">
             <p className="text-red-400 text-sm font-bold uppercase tracking-wider mb-1">Notice of Liability</p>
             <p className="text-content-secondary text-sm">We are not responsible for any activities of the site or the content hosted on external third-party servers. All users use this site at their own risk.</p>
          </div>
          <p className="text-content-primary leading-relaxed">
            The Digital Millennium Copyright Act (DMCA) established a process for addressing claims of copyright infringement. If you own a copyright or have authority to act on behalf of a copyright owner and want to report a claim that a third party is infringing that material on or through our services, please submit a DMCA report, and we will take appropriate action.
          </p>

          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-white flex items-center gap-3">
              <span className="text-accent underline decoration-4 underline-offset-8">Report</span> Requirements
            </h2>
            <ul className="list-disc list-inside space-y-4 text-content-secondary leading-relaxed marker:text-accent">
              <li>A description of the copyrighted work that you claim is being infringed;</li>
              <li>A description of the material you claim is infringing and that you want removed, including the specific URL or location of that material;</li>
              <li>Your name, title (if acting as an agent), address, telephone number, and email address;</li>
              <li>The following statement: <span className="text-content-primary italic">"I have a good faith belief that the use of the copyrighted material I am complaining of is not authorized by the copyright owner, its agent, or the law."</span>;</li>
              <li>The following statement: <span className="text-content-primary italic">"The information in this notice is accurate and, under penalty of perjury, I am the owner, or authorized to act on behalf of the owner, of the copyright or of an exclusive right that is allegedly infringed."</span>;</li>
              <li>An electronic or physical signature of the owner of the copyright or a person authorized to act on the owner's behalf.</li>
            </ul>
          </div>

          <div className="p-8 bg-accent/5 border border-accent/20 rounded-[2rem] space-y-4">
            <div className="flex items-center gap-4">
               <div className="w-12 h-12 bg-accent/10 rounded-full flex items-center justify-center text-2xl">📥</div>
               <div>
                  <h3 className="text-lg font-bold text-white">Submit a Request</h3>
                  <p className="text-sm text-content-tertiary">We typically respond to valid requests within 48-72 hours.</p>
               </div>
            </div>
            <p className="text-content-primary">
              Please send all infringement notices to: <a href="mailto:dmca@miruhindi.com" className="text-accent hover:underline font-bold">dmca@miruhindi.com</a>
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}
