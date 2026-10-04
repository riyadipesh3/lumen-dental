import {
  useEffect,
  useRef,
  useState,
  type FormEvent,
  type ReactNode,
} from 'react'

/* --------------------------------------------------------------------------
   Shared primitive. Scroll reveal uses IntersectionObserver only, never a
   scroll listener, and collapses to fully visible under reduced motion.
   -------------------------------------------------------------------------- */
function Reveal({
  children,
  delay = 0,
  className = '',
}: {
  children: ReactNode
  delay?: number
  className?: string
}) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.classList.add('is-visible')
          io.disconnect()
        }
      },
      { threshold: 0.15, rootMargin: '0px 0px -8% 0px' },
    )
    io.observe(el)
    return () => io.disconnect()
  }, [])

  return (
    <div
      ref={ref}
      className={`reveal ${className}`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  )
}

/* Section headings stack vertically. Never a split header. */
function SectionHead({ title, body }: { title: string; body?: string }) {
  return (
    <div className="max-w-2xl">
      <h2 className="display display-md">{title}</h2>
      {body ? <p className="lede mt-6">{body}</p> : null}
    </div>
  )
}

const NAV = [
  { label: 'Treatments', href: '#treatments' },
  { label: 'The practice', href: '#practice' },
  { label: 'Questions', href: '#questions' },
  { label: 'Book', href: '#book' },
]

/* Fees are the private patient rate, duration is chair time including the
   first consultation. Both are quoted before the appointment is confirmed. */
const TREATMENTS = [
  {
    name: 'Check-up and examination',
    body: 'Soft tissue check, bite assessment, and two small radiographs where clinically needed. Findings written down before you leave the chair.',
    minutes: 30,
    fee: '€65',
  },
  {
    name: 'Scale and polish',
    body: 'Removal of hardened plaque above and below the gum line, then a polish. Usually split across two visits if the build-up is heavy.',
    minutes: 40,
    fee: '€95',
  },
  {
    name: 'Composite filling',
    body: 'Tooth-coloured restoration for a single surface or two. We place a thin liner where the tooth is sensitive afterwards.',
    minutes: 45,
    fee: '€140',
  },
  {
    name: 'Root canal treatment',
    body: 'Single tooth, under rubber dam. Two visits are usual, with a temporary filling between them. Complex cases are referred out.',
    minutes: 90,
    fee: '€480',
  },
  {
    name: 'Crown fitting, porcelain',
    body: 'Preparation and a same-day temporary crown, with the final ceramic fitted at a second appointment about three weeks later.',
    minutes: 75,
    fee: '€720',
  },
  {
    name: 'Simple extraction',
    body: 'For a tooth that can be removed without surgical elevation. Surgical extractions are assessed and priced separately.',
    minutes: 30,
    fee: '€120',
  },
]

const TEAM = [
  {
    name: 'Aoife Brennan',
    role: 'Principal Dentist',
    line: 'Works across routine and restorative care. Registers as the responsible clinician for every treatment plan the practice issues.',
    seed: 'lumen-aoife-brennan-dentist-portrait',
    alt: 'Aoife Brennan seated in the treatment room wearing a clinic apron',
  },
  {
    name: 'Tomasz Wierzbicki',
    role: 'Dentist',
    line: 'Takes on most of the root canal and crown work, and handles the Saturday emergency list.',
    seed: 'lumen-tomasz-wierzbicki-dentist-portrait',
    alt: 'Tomasz Wierzbicki standing by a window in the practice hallway',
  },
  {
    name: 'Niamh Kelleher',
    role: 'Dental Hygienist',
    line: 'Runs the scale and polish appointments and the periodontal recall programme for the practice.',
    seed: 'lumen-niamh-kelleher-hygienist-portrait',
    alt: 'Niamh Kelleher in the hygiene room preparing instruments on a tray',
  },
  {
    name: 'Samuel Ofori',
    role: 'Dentist',
    line: 'Joined in 2024 after two years in hospital dentistry. Sees children and first-time nervous patients.',
    seed: 'lumen-samuel-ofori-dentist-portrait',
    alt: 'Samuel Ofori photographed in the practice reception area',
  },
]

const FAQS = [
  {
    q: 'Are you taking new patients?',
    a: 'Yes. We hold back a small number of slots each week for people who are not yet registered with a dentist. Call the practice or send the form below and we will find you an appointment that suits.',
  },
  {
    q: 'What does a first visit involve?',
    a: 'Thirty minutes in the chair. We go through your medical history, examine the teeth and gums, take radiographs if they are due, and talk through what we found. You leave with the findings in writing and a quoted fee for anything you decide to go ahead with.',
  },
  {
    q: 'I have not seen a dentist in a while. Is that a problem?',
    a: 'No. Gum inflammation settles quickly once it is treated, and most people are not in pain. Tell reception when you book so we can allow a longer first appointment if your gums are sore.',
  },
  {
    q: 'What if I am nervous about treatment?',
    a: 'Say so at the booking and we will book extra time, usually with Niamh or Samuel. We agree a hand signal for stopping before anything starts, and we go through each step as we go.',
  },
  {
    q: 'How long does a crown take from start to finish?',
    a: 'Three weeks across two appointments. The first prepares the tooth and fits a temporary crown. The second takes the scan and fits the ceramic. We will tell you if your tooth needs a root canal first.',
  },
  {
    q: 'How do payments work?',
    a: 'Each visit is paid at the end, by card or cash. Treatment plans over €400 can be split across monthly payments with no interest, arranged in reception before the first appointment.',
  },
]

const TREATMENT_OPTIONS = [
  'Check-up and examination',
  'Scale and polish',
  'Composite filling',
  'Root canal treatment',
  'Crown fitting',
  'Something else, not sure yet',
]

const HOURS = [
  ['Monday to Thursday', '8:00 to 18:00'],
  ['Friday', '8:00 to 16:00'],
  ['Saturday', '9:00 to 13:00, emergency only'],
]

type FieldKey = 'name' | 'phone' | 'email' | 'treatment' | 'date'

export default function App() {
  const [navOpen, setNavOpen] = useState(false)
  const [openFaq, setOpenFaq] = useState<number | null>(0)

  const [values, setValues] = useState({
    name: '',
    phone: '',
    email: '',
    treatment: '',
    date: '',
    note: '',
  })
  const [errors, setErrors] = useState<Partial<Record<FieldKey, string>>>({})
  const [sent, setSent] = useState(false)

  function setValue(key: keyof typeof values, value: string) {
    setValues((prev) => ({ ...prev, [key]: value }))
    if (key in errors) {
      setErrors((prev) => ({ ...prev, [key]: undefined }))
    }
  }

  function submitRequest(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const next: Partial<Record<FieldKey, string>> = {}
    if (values.name.trim().length < 2) next.name = 'Please give us a name to put on the appointment.'
    if (values.phone.replace(/[^0-9]/g, '').length < 7) next.phone = 'We need a number we can reach you on.'
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(values.email.trim())) {
      next.email = 'Please check this address, we send confirmations by email.'
    }
    if (!values.treatment) next.treatment = 'Choose the closest option so we book the right chair time.'
    setErrors(next)
    if (Object.keys(next).length === 0) setSent(true)
  }

  return (
    <>
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:bg-[var(--color-ink)] focus:px-4 focus:py-2 focus:text-[var(--color-canvas)]"
      >
        Skip to content
      </a>

      {/* ---------------------------------------------------------------- */}
      {/* NAV - one line at desktop, 72px                                 */}
      {/* ---------------------------------------------------------------- */}
      <header className="sticky top-0 z-40 border-b border-[var(--color-hairline)] bg-[var(--color-canvas)]/94 backdrop-blur-sm">
        <div className="shell flex h-[72px] items-center justify-between">
          <a
            href="#top"
            className="font-display text-[1.375rem] font-semibold tracking-[-0.02em] text-[var(--color-ink)]"
          >
            Lumen Dental
          </a>

          <nav className="hidden items-center gap-8 md:flex">
            {NAV.map((item) => (
              <a
                key={item.href}
                href={item.href}
                className="text-[0.875rem] font-medium text-[var(--color-body)] transition-colors hover:text-[var(--color-ink)]"
              >
                {item.label}
              </a>
            ))}
          </nav>

          <a href="#book" className="btn btn-primary hidden md:inline-flex">
            Book a visit
          </a>

          <button
            type="button"
            aria-label={navOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={navOpen}
            aria-controls="mobile-nav"
            onClick={() => setNavOpen((v) => !v)}
            className="grid h-10 w-10 place-items-center border border-[var(--color-hairline)] text-[var(--color-ink)] md:hidden"
          >
            <span className="flex w-4 flex-col gap-[4px]">
              <span
                className={`h-px w-full bg-[var(--color-ink)] transition-transform duration-200 ${
                  navOpen ? 'translate-y-[2.5px] rotate-45' : ''
                }`}
              />
              <span
                className={`h-px w-full bg-[var(--color-ink)] transition-transform duration-200 ${
                  navOpen ? '-translate-y-[2.5px] -rotate-45' : ''
                }`}
              />
            </span>
          </button>
        </div>

        {navOpen ? (
          <div id="mobile-nav" className="border-t border-[var(--color-hairline)] md:hidden">
            <nav className="shell flex flex-col py-4">
              {NAV.map((item) => (
                <a
                  key={item.href}
                  href={item.href}
                  onClick={() => setNavOpen(false)}
                  className="border-b border-[var(--color-hairline)] py-3.5 text-[1rem] font-medium text-[var(--color-ink)] last:border-b-0"
                >
                  {item.label}
                </a>
              ))}
              <a
                href="#book"
                onClick={() => setNavOpen(false)}
                className="btn btn-primary mt-5 w-full"
              >
                Book a visit
              </a>
            </nav>
          </div>
        ) : null}
      </header>

      <main id="main">
        {/* -------------------------------------------------------------- */}
        {/* HERO - plain left text block beside a real clinic photograph,  */}
        {/* four text elements total, sits in the first viewport           */}
        {/* -------------------------------------------------------------- */}
        <section id="top" className="shell pt-14 pb-16 md:pt-20 md:pb-20">
          <div className="grid items-center gap-12 lg:grid-cols-12 lg:gap-14">
            <div className="lg:col-span-6">
              <p className="micro mb-6">Dental practice, Dublin 2</p>
              <h1 className="display display-xl">
                Dentistry that tells
                <br />
                you what it costs
              </h1>
              <p className="lede mt-7">
                A two-chair practice on Aungier Street. Appointments run to a
                published length and fees are listed before you book.
              </p>
              <div className="mt-9 flex flex-wrap items-center gap-3">
                <a href="#book" className="btn btn-primary">
                  Book a visit
                </a>
                <a href="#treatments" className="btn btn-secondary">
                  Treatment fees
                </a>
              </div>
            </div>

            <div className="lg:col-span-6">
              <Reveal>
                <div className="frame aspect-3/2 w-full">
                  <img
                    src="https://picsum.photos/seed/lumen-dental-treatment-room-interior/1400/934"
                    alt="Lumen Dental treatment room with a single chair, overhead light and cabinets along the wall"
                    loading="eager"
                    width={1400}
                    height={934}
                  />
                </div>
              </Reveal>
            </div>
          </div>
        </section>

        {/* -------------------------------------------------------------- */}
        {/* TREATMENTS - two-column rows, duration and fee on the right.    */}
        {/* Two rows per band instead of one long list of six.             */}
        {/* -------------------------------------------------------------- */}
        <section id="treatments" className="border-t border-[var(--color-hairline)] py-20 md:py-28">
          <div className="shell">
            <Reveal>
              <SectionHead
                title="Treatments, chair time and fees"
                body="Private patient rates. Each duration below is the time we hold the chair for you, including the talk at the start and the plan afterwards."
              />
              <p className="micro mt-6">Rates from January 2026</p>
            </Reveal>

            <div className="mt-14 grid gap-5 md:grid-cols-2">
              {TREATMENTS.map((t, i) => (
                <Reveal key={t.name} delay={(i % 2) * 70}>
                  <article className="flex h-full flex-col bg-[var(--color-surface)] p-7">
                    <h3 className="serif-item text-[1.3125rem]">{t.name}</h3>
                    <p className="mt-3 flex-1 text-[0.9375rem] leading-relaxed text-[var(--color-body)]">
                      {t.body}
                    </p>
                    <dl className="mt-6 flex items-baseline gap-6 border-t border-[var(--color-hairline)] pt-4">
                      <div>
                        <dt className="meta">Chair time</dt>
                        <dd className="figure mt-1 text-[1.0625rem] text-[var(--color-ink)]">
                          {t.minutes} min
                        </dd>
                      </div>
                      <div className="ml-auto text-right">
                        <dt className="meta">Fee</dt>
                        <dd className="figure mt-1 text-[1.0625rem] text-[var(--color-accent-deep)]">
                          {t.fee}
                        </dd>
                      </div>
                    </dl>
                  </article>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* -------------------------------------------------------------- */}
        {/* PRACTICE AND TEAM - portrait grid, one row of four              */}
        {/* -------------------------------------------------------------- */}
        <section id="practice" className="border-t border-[var(--color-hairline)] py-20 md:py-28">
          <div className="shell">
            <Reveal>
              <div className="max-w-2xl">
                <h2 className="display display-md">The people who would treat you</h2>
                <p className="lede mt-6">
                  Four clinicians, two surgeries, and no franchise. Everyone here
                  is registered with the Dental Council of Ireland, and the
                  dentist who examines you is the dentist who carries out the work.
                </p>
              </div>
            </Reveal>

            <ul className="mt-14 grid gap-x-6 gap-y-10 sm:grid-cols-2 xl:grid-cols-4">
              {TEAM.map((p, i) => (
                <Reveal key={p.name} delay={i * 70}>
                  <li>
                    <div className="frame aspect-4/5 w-full">
                      <img
                        src={`https://picsum.photos/seed/${p.seed}/800/1000`}
                        alt={p.alt}
                        loading="lazy"
                        width={800}
                        height={1000}
                      />
                    </div>
                    <h3 className="serif-item mt-5 text-[1.25rem]">{p.name}</h3>
                    <p className="mt-1 text-[0.8125rem] font-medium text-[var(--color-accent-deep)]">
                      {p.role}
                    </p>
                    <p className="mt-3 text-[0.9375rem] leading-relaxed text-[var(--color-body)]">
                      {p.line}
                    </p>
                  </li>
                </Reveal>
              ))}
            </ul>
          </div>
        </section>

        {/* -------------------------------------------------------------- */}
        {/* QUESTIONS - practical accordion, single open panel            */}
        {/* -------------------------------------------------------------- */}
        <section id="questions" className="border-t border-[var(--color-hairline)] bg-[var(--color-surface)] py-20 md:py-28">
          <div className="shell grid gap-12 lg:grid-cols-12 lg:gap-16">
            <div className="lg:col-span-4">
              <Reveal>
                <h2 className="display display-md">Questions people ask reception</h2>
                <p className="mt-6 text-[0.9375rem] leading-relaxed text-[var(--color-body)]">
                  If your question is not here, call
                  <a
                    href="tel:+35316742280"
                    className="text-[var(--color-accent-deep)] underline underline-offset-4"
                  >
                    +353 1 674 2280
                  </a>{' '}
                  and we will answer it without an appointment.
                </p>
              </Reveal>
            </div>

            <div className="lg:col-span-8">
              <Reveal delay={80}>
                <div className="grid gap-3">
                  {FAQS.map((f, i) => {
                    const open = openFaq === i
                    return (
                      <div key={f.q} className="bg-[var(--color-canvas)]">
                        <h3>
                          <button
                            type="button"
                            onClick={() => setOpenFaq(open ? null : i)}
                            aria-expanded={open}
                            aria-controls={`faq-panel-${i}`}
                            className="flex w-full items-start justify-between gap-6 px-6 py-5 text-left transition-colors hover:text-[var(--color-accent-deep)]"
                          >
                            <span className="serif-item text-[1.1875rem] sm:text-[1.3125rem]">
                              {f.q}
                            </span>
                            <span
                              aria-hidden="true"
                              className="relative mt-2 block h-3.5 w-3.5 shrink-0 text-[var(--color-accent)]"
                            >
                              <span className="absolute left-0 top-1/2 h-px w-full -translate-y-1/2 bg-current" />
                              <span
                                className={`absolute left-1/2 top-0 h-full w-px -translate-x-1/2 bg-current transition-transform duration-200 ${
                                  open ? 'scale-y-0' : 'scale-y-100'
                                }`}
                              />
                            </span>
                          </button>
                        </h3>
                        {open ? (
                          <div
                            id={`faq-panel-${i}`}
                            role="region"
                            className="panel px-6 pb-6"
                          >
                            <p className="max-w-[62ch] text-[0.9688rem] leading-relaxed text-[var(--color-body)]">
                              {f.a}
                            </p>
                          </div>
                        ) : null}
                      </div>
                    )
                  })}
                </div>
              </Reveal>
            </div>
          </div>
        </section>

        {/* -------------------------------------------------------------- */}
        {/* BOOKING FORM - label above every input, inline errors, and a  */}
        {/* composed confirmation state once it validates                   */}
        {/* -------------------------------------------------------------- */}
        <section id="book" className="border-t border-[var(--color-hairline)] py-20 md:py-28">
          <div className="shell grid gap-14 lg:grid-cols-12 lg:gap-16">
            <div className="lg:col-span-5">
              <Reveal>
                <h2 className="display display-lg">
                  Request an
                  <br />
                  appointment
                </h2>
                <p className="lede mt-7">
                  This form does not confirm the appointment on its own. Someone
                  from reception calls you back to agree a time, usually the same
                  working day.
                </p>

                <dl className="mt-10 space-y-6">
                  <div>
                    <dt className="text-[0.8125rem] font-semibold text-[var(--color-ink)]">
                      Reception
                    </dt>
                    <dd className="mt-1.5 text-[0.9375rem] text-[var(--color-body)]">
                      <a href="tel:+35316742280" className="hover:text-[var(--color-accent-deep)]">
                        +353 1 674 2280
                      </a>
                    </dd>
                  </div>
                  <div>
                    <dt className="text-[0.8125rem] font-semibold text-[var(--color-ink)]">
                      Address
                    </dt>
                    <dd className="mt-1.5 text-[0.9375rem] leading-relaxed text-[var(--color-body)]">
                      34 Aungier Street
                      <br />
                      Dublin 2, D02 XK44
                    </dd>
                  </div>
                  <div>
                    <dt className="text-[0.8125rem] font-semibold text-[var(--color-ink)]">
                      Opening hours
                    </dt>
                    <dd className="mt-1.5 space-y-1.5">
                      {HOURS.map(([days, time]) => (
                        <span
                          key={days}
                          className="flex flex-wrap justify-between gap-4 text-[0.9375rem] text-[var(--color-body)] md:flex-nowrap"
                        >
                          <span>{days}</span>
                          <span className="text-[var(--color-ink)]">{time}</span>
                        </span>
                      ))}
                    </dd>
                  </div>
                </dl>
              </Reveal>
            </div>

            <div className="lg:col-span-7">
              <Reveal delay={90}>
                {sent ? (
                  <div className="border border-[var(--color-hairline)] bg-[var(--color-accent-soft)] p-8">
                    <h3 className="display display-md">Request received</h3>
                    <p className="mt-4 max-w-[54ch] text-[0.9688rem] leading-relaxed text-[var(--color-body)]">
                      Thank you, {values.name.trim().split(' ')[0]}. We have your
                      request for {values.treatment.toLowerCase()}. Reception will
                      call {values.phone.trim()} to confirm a time. If it is urgent,
                      ring the practice directly rather than waiting on us.
                    </p>
                    <button
                      type="button"
                      onClick={() => setSent(false)}
                      className="btn btn-secondary mt-7"
                    >
                      Send another
                    </button>
                  </div>
                ) : (
                  <form onSubmit={submitRequest} noValidate className="grid gap-5">
                    <div className="grid gap-5 sm:grid-cols-2">
                      <div className="grid gap-2">
                        <label
                          htmlFor="name"
                          className="text-[0.8125rem] font-semibold text-[var(--color-ink)]"
                        >
                          Full name
                        </label>
                        <input
                          id="name"
                          name="name"
                          type="text"
                          autoComplete="name"
                          value={values.name}
                          onChange={(e) => setValue('name', e.target.value)}
                          aria-invalid={Boolean(errors.name)}
                          aria-describedby="name-hint"
                          className={`field ${errors.name ? 'field-invalid' : ''}`}
                        />
                        <p id="name-hint" className="text-[0.8125rem] text-[var(--color-mute)]">
                          {errors.name ?? 'The name we should put on the record.'}
                        </p>
                      </div>

                      <div className="grid gap-2">
                        <label
                          htmlFor="phone"
                          className="text-[0.8125rem] font-semibold text-[var(--color-ink)]"
                        >
                          Phone
                        </label>
                        <input
                          id="phone"
                          name="phone"
                          type="tel"
                          autoComplete="tel"
                          value={values.phone}
                          onChange={(e) => setValue('phone', e.target.value)}
                          aria-invalid={Boolean(errors.phone)}
                          aria-describedby="phone-hint"
                          className={`field ${errors.phone ? 'field-invalid' : ''}`}
                        />
                        <p id="phone-hint" className="text-[0.8125rem] text-[var(--color-mute)]">
                          {errors.phone ?? 'The number we ring to confirm.'}
                        </p>
                      </div>
                    </div>

                    <div className="grid gap-2">
                      <label
                        htmlFor="email"
                        className="text-[0.8125rem] font-semibold text-[var(--color-ink)]"
                      >
                        Email
                      </label>
                      <input
                        id="email"
                        name="email"
                        type="email"
                        autoComplete="email"
                        value={values.email}
                        onChange={(e) => setValue('email', e.target.value)}
                        aria-invalid={Boolean(errors.email)}
                        aria-describedby="email-hint"
                        className={`field ${errors.email ? 'field-invalid' : ''}`}
                      />
                      <p id="email-hint" className="text-[0.8125rem] text-[var(--color-mute)]">
                        {errors.email ?? 'Confirmations and aftercare notes go here.'}
                      </p>
                    </div>

                    <div className="grid gap-5 sm:grid-cols-2">
                      <div className="grid gap-2">
                        <label
                          htmlFor="treatment"
                          className="text-[0.8125rem] font-semibold text-[var(--color-ink)]"
                        >
                          What you need
                        </label>
                        <select
                          id="treatment"
                          name="treatment"
                          value={values.treatment}
                          onChange={(e) => setValue('treatment', e.target.value)}
                          aria-invalid={Boolean(errors.treatment)}
                          aria-describedby="treatment-hint"
                          className={`field ${errors.treatment ? 'field-invalid' : ''}`}
                        >
                          <option value="">Please choose</option>
                          {TREATMENT_OPTIONS.map((o) => (
                            <option key={o} value={o}>
                              {o}
                            </option>
                          ))}
                        </select>
                        <p id="treatment-hint" className="text-[0.8125rem] text-[var(--color-mute)]">
                          {errors.treatment ?? 'So we hold the right amount of chair time.'}
                        </p>
                      </div>

                      <div className="grid gap-2">
                        <label
                          htmlFor="date"
                          className="text-[0.8125rem] font-semibold text-[var(--color-ink)]"
                        >
                          Preferred day
                        </label>
                        <input
                          id="date"
                          name="date"
                          type="date"
                          value={values.date}
                          onChange={(e) => setValue('date', e.target.value)}
                          aria-describedby="date-hint"
                          className="field"
                        />
                        <p id="date-hint" className="text-[0.8125rem] text-[var(--color-mute)]">
                          Optional. Mornings fill first on Mondays.
                        </p>
                      </div>
                    </div>

                    <div className="grid gap-2">
                      <label
                        htmlFor="note"
                        className="text-[0.8125rem] font-semibold text-[var(--color-ink)]"
                      >
                        Anything we should know
                      </label>
                      <textarea
                        id="note"
                        name="note"
                        rows={4}
                        value={values.note}
                        onChange={(e) => setValue('note', e.target.value)}
                        aria-describedby="note-hint"
                        className="field resize-y"
                      />
                      <p id="note-hint" className="text-[0.8125rem] text-[var(--color-mute)]">
                        Medical conditions, current medication, or what worries you
                        about the appointment.
                      </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-4 pt-1">
                      <button type="submit" className="btn btn-primary">
                        Request appointment
                      </button>
                      <p className="text-[0.8125rem] text-[var(--color-mute)]">
                        Nothing is charged online.
                      </p>
                    </div>
                  </form>
                )}
              </Reveal>
            </div>
          </div>
        </section>
      </main>

      {/* ---------------------------------------------------------------- */}
      {/* FOOTER - practice details, then the Diya Developers credit once,  */}
      {/* plain small text, no pill, no em dash                             */}
      {/* ---------------------------------------------------------------- */}
      <footer className="border-t border-[var(--color-hairline)] bg-[var(--color-surface)] py-12">
        <div className="shell flex flex-col gap-10 md:flex-row md:justify-between">
          <div>
            <p className="font-display text-[1.25rem] font-semibold text-[var(--color-ink)]">
              Lumen Dental
            </p>
            <p className="mt-3 text-[0.875rem] leading-relaxed text-[var(--color-body)]">
              34 Aungier Street, Dublin 2, D02 XK44
              <br />
              reception@lumendental.ie
            </p>
          </div>

          <nav className="flex flex-col gap-2.5 md:items-end">
            {NAV.map((item) => (
              <a
                key={item.href}
                href={item.href}
                className="text-[0.875rem] text-[var(--color-body)] transition-colors hover:text-[var(--color-ink)]"
              >
                {item.label}
              </a>
            ))}
          </nav>
        </div>

        <div className="shell mt-10 border-t border-[var(--color-hairline)] pt-6">
          <p className="text-[0.8125rem] text-[var(--color-body)]">
            Developed by{' '}
            <a
              href="https://thediyadevelopers.com"
              className="underline underline-offset-4 hover:text-[var(--color-ink)]"
            >
              Diya Developers
            </a>
          </p>
        </div>
      </footer>
    </>
  )
}