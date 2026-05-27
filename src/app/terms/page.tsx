import Link from 'next/link';

export const metadata = {
  title: 'Terms & Conditions — Chedder',
  description: 'Terms and conditions for using the Chedder platform.',
};

export default function TermsPage() {
  return (
    <div className="max-w-4xl mx-auto">
      {/* Back nav */}
      <div className="mb-4">
        <Link
          href="/feed"
          className="inline-flex items-center gap-1.5 text-sm text-gray-500 dark:text-gray-400 hover:text-amber-500 dark:hover:text-amber-400 transition-colors"
        >
          ← Back to feed
        </Link>
      </div>

      {/* Placeholder card */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm p-8 md:p-12">
        <h1 className="text-2xl font-black text-gray-900 dark:text-gray-100 mb-2">
          Terms &amp; Conditions
        </h1>
        <p className="text-sm text-gray-400 dark:text-gray-500 mb-8">Coming soon</p>

        <div className="flex items-center gap-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-100 dark:border-amber-800/40 rounded-xl px-5 py-4">
          <span className="text-amber-500 text-xl">📋</span>
          <p className="text-sm text-amber-800 dark:text-amber-300">
            Our Terms &amp; Conditions are being finalised and will be published here shortly.
            In the meantime, please reach out to{' '}
            <a
              href="mailto:musingatapiwa@gmail.com"
              className="underline underline-offset-2 hover:text-amber-600"
            >
              musingatapiwa@gmail.com
            </a>{' '}
            with any questions.
          </p>
        </div>
      </div>
    </div>
  );
}
