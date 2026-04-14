export default function Home() {
  return (
    <>
      <header className="sticky top-0 z-50 border-b-2 border-black bg-white">
        <div className="flex h-14 items-center px-6">
          <span className="text-lg font-bold tracking-tight">Groundwork</span>
        </div>
      </header>
      <main className="flex flex-1 flex-col px-6 py-16">
        <div className="max-w-2xl">
          <p className="text-sm font-medium tracking-widest uppercase text-gray-400">
            Training Journal
          </p>
          <h1 className="mt-4 text-5xl font-bold tracking-tight">
            Your daily practice,
            <br />
            distilled.
          </h1>
          <p className="mt-6 max-w-md text-lg leading-relaxed text-gray-500">
            One entry per day. Set your focus. Write your notes. Nothing more.
          </p>
        </div>
      </main>
    </>
  );
}
