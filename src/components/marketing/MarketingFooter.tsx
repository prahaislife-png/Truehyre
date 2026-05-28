import Link from 'next/link'

const FOOTER_LINKS = {
  Product: [
    { label: 'How it works', href: '#how-it-works' },
    { label: 'Features', href: '#features' },
    { label: 'Pricing', href: '#pricing' },
    { label: 'Comparison', href: '#' },
  ],
  'Who it\'s for': [
    { label: 'Staffing agencies', href: '#who-its-for' },
    { label: 'Tech companies', href: '#who-its-for' },
    { label: 'BFSI & regulated', href: '#who-its-for' },
    { label: 'Startups', href: '#who-its-for' },
  ],
  Company: [
    { label: 'About', href: '#' },
    { label: 'Blog', href: '#' },
    { label: 'Careers', href: '#' },
    { label: 'Contact', href: 'mailto:hello@truehire.app' },
  ],
  Legal: [
    { label: 'Privacy policy', href: '#' },
    { label: 'Terms of service', href: '#' },
    { label: 'Security', href: '#' },
    { label: 'DPDP compliance', href: '#' },
  ],
}

export default function MarketingFooter() {
  return (
    <footer className="bg-white border-t border-gray-100 pt-16 pb-10 px-6">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-10 mb-12">
          {/* Brand column */}
          <div className="col-span-2 md:col-span-1">
            <Link href="/" className="flex items-center gap-2 mb-4">
              <div className="w-7 h-7 bg-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
                <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <span className="font-bold text-lg tracking-tight text-gray-900">
                True<span className="text-blue-500">Hire</span>
              </span>
            </Link>
            <p className="text-sm text-gray-400 leading-relaxed mb-5">
              Identity verification for every hiring touchpoint.
            </p>
            <div className="flex flex-col gap-1.5">
              <span className="inline-flex items-center gap-1.5 text-xs text-gray-400 font-medium">
                <span className="w-4 h-4 rounded bg-gray-100 flex items-center justify-center text-xs">🛡</span>
                DPDP compliant
              </span>
              <span className="inline-flex items-center gap-1.5 text-xs text-gray-400 font-medium">
                <span className="w-4 h-4 rounded bg-gray-100 flex items-center justify-center text-xs">🇪🇺</span>
                GDPR ready
              </span>
              <span className="inline-flex items-center gap-1.5 text-xs text-gray-400 font-medium">
                <span className="w-4 h-4 rounded bg-gray-100 flex items-center justify-center text-xs">🌍</span>
                220+ countries
              </span>
            </div>
          </div>

          {/* Nav columns */}
          {Object.entries(FOOTER_LINKS).map(([heading, links]) => (
            <div key={heading}>
              <p className="text-xs font-black tracking-widest text-gray-400 uppercase mb-4">{heading}</p>
              <ul className="space-y-2.5">
                {links.map(({ label, href }) => (
                  <li key={label}>
                    <a
                      href={href}
                      className="text-sm text-gray-500 hover:text-gray-900 transition-colors"
                    >
                      {label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="border-t border-gray-100 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-gray-400">
            © {new Date().getFullYear()} ThoughtsON Technologies. All rights reserved.
          </p>
          <p className="text-xs text-gray-300">
            Built by ThoughtsON Technologies
          </p>
        </div>
      </div>
    </footer>
  )
}
