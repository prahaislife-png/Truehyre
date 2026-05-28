'use client'

const LOGOS = [
  'TechVentures', 'GlobalStaff', 'HireHub', 'TalentFirst',
  'StaffBridge', 'RecruitPro', 'PeopleWorks', 'HireGlobal',
  'TalentFlow', 'WorkForce+', 'HireRight', 'StaffSmart',
]

export default function LogoCarousel() {
  return (
    <section className="border-y border-gray-100 bg-gray-50/80 py-10 overflow-hidden">
      <p className="text-center text-xs font-bold tracking-widest text-gray-400 uppercase mb-8">
        Trusted by hiring teams across industries
      </p>
      <div className="relative overflow-hidden">
        <div className="animate-marquee flex gap-10 w-max">
          {[...LOGOS, ...LOGOS].map((name, i) => (
            <div
              key={i}
              className="flex items-center justify-center px-6 py-2.5 bg-white rounded-xl border border-gray-200 shadow-sm min-w-[150px]"
            >
              <span className="text-sm font-bold text-gray-300 tracking-tight whitespace-nowrap">{name}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
