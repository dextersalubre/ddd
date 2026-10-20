import { useState } from 'react'
import { ArrowLeft, ArrowRight, GripVertical, Plus, Search, X } from 'lucide-react'
import tokyoPhoto from './tokyo-for-digital-nomads.jpg'
import cebuPhoto from './cebu.jpg'
import parisPhoto from './paris.jpg'
import boholPhoto from './bohol.jpg'
import seoulPhoto from './seoul.jpg'
import palawanPhoto from './palawan.jpg'

const tripPhotos = {
  tokyo: tokyoPhoto,
  cebu: cebuPhoto,
  paris: parisPhoto,
  bohol: boholPhoto,
  seoul: seoulPhoto,
  palawan: palawanPhoto,
}

const trips = [
  { id: 'tokyo', name: 'Tokyo Adventure', city: 'Tokyo, Japan', startDate: '2026-03-10', endDate: '2026-03-14', dates: 'Mar 10 – Mar 14, 2026', days: 5, activities: 12, dayActivityCounts: [3, 2, 4, 2, 1], color: '#10998d' },
  { id: 'cebu', name: 'Cebu Island Hopping', city: 'Cebu, Philippines', startDate: '2026-04-02', endDate: '2026-04-05', dates: 'Apr 2 – Apr 5, 2026', days: 4, activities: 9, dayActivityCounts: [3, 2, 2, 2], color: '#0ea5e9' },
  { id: 'paris', name: 'Paris Getaway', city: 'Paris, France', startDate: '2026-06-18', endDate: '2026-06-22', dates: 'Jun 18 – Jun 22, 2026', days: 5, activities: 10, dayActivityCounts: [2, 2, 2, 2, 2], color: '#f97316' },
  { id: 'bohol', name: 'Bohol Weekend', city: 'Bohol, Philippines', startDate: '2026-07-04', endDate: '2026-07-06', dates: 'Jul 4 – Jul 6, 2026', days: 3, activities: 6, dayActivityCounts: [2, 2, 2], color: '#8b5cf6' },
  { id: 'seoul', name: 'Seoul Food Trail', city: 'Seoul, South Korea', startDate: '2026-09-12', endDate: '2026-09-16', dates: 'Sep 12 – Sep 16, 2026', days: 5, activities: 11, dayActivityCounts: [3, 2, 2, 2, 2], color: '#ec4899' },
  { id: 'palawan', name: 'Palawan Escape', city: 'Palawan, Philippines', startDate: '2026-12-20', endDate: '2026-12-24', dates: 'Dec 20 – Dec 24, 2026', days: 5, activities: 8, dayActivityCounts: [2, 2, 2, 1, 1], color: '#22c55e' },
]

const initialDays = [
  { id: 1, date: 'Tue, Mar 10', sorted: true, activities: [
    { id: 'sensoji', time: '09:00 AM', name: 'Senso-ji Temple', location: 'Asakusa, Taito City', category: 'Sightseeing' },
    { id: 'ramen', time: '12:30 PM', name: 'Lunch at Ichiran Ramen', location: 'Shibuya', category: 'Food' },
    { id: 'hotel', time: '06:00 PM', name: 'Check in at Hotel Gracery', location: 'Shinjuku', category: 'Lodging' },
  ] },
  { id: 2, date: 'Wed, Mar 11', sorted: false, activities: [
    { id: 'meiji', time: '02:00 PM', name: 'Meiji Shrine Walk', location: 'Harajuku', category: 'Sightseeing' },
    { id: 'tsukiji', time: '10:30 AM', name: 'Tsukiji Outer Market Breakfast', location: 'Chuo City', category: 'Food' },
  ] },
]

const categories = {
  Sightseeing: 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300',
  Food: 'bg-orange-100 text-orange-700 dark:bg-amber-950 dark:text-amber-300',
  Lodging: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300',
  Transport: 'bg-violet-100 text-violet-700 dark:bg-violet-950 dark:text-violet-300',
  Shopping: 'bg-pink-100 text-pink-700 dark:bg-pink-950 dark:text-pink-300',
}

function timeToMinutes(time) {
  const [clock, period] = time.split(' ')
  let [hours, minutes] = clock.split(':').map(Number)
  if (period === 'PM' && hours !== 12) hours += 12
  if (period === 'AM' && hours === 12) hours = 0
  return hours * 60 + minutes
}

function getDateRows(startDate, endDate) {
  if (!startDate || !endDate || endDate < startDate) return []
  const rows = []
  const current = new Date(`${startDate}T00:00:00`)
  const last = new Date(`${endDate}T00:00:00`)
  while (current <= last && rows.length < 366) {
    rows.push(new Date(current))
    current.setDate(current.getDate() + 1)
  }
  return rows
}

function formatTripDates(startDate, endDate) {
  const format = (date, includeYear = false) => new Intl.DateTimeFormat('en-US', {
    month: 'short', day: 'numeric', ...(includeYear ? { year: 'numeric' } : {}),
  }).format(new Date(`${date}T00:00:00`))
  return `${format(startDate)} – ${format(endDate, true)}`
}

function createTripDays(trip) {
  return getDateRows(trip.startDate, trip.endDate).map((date, index) => ({
    id: index + 1,
    date: new Intl.DateTimeFormat('en-US', { weekday: 'short', month: 'short', day: 'numeric' }).format(date),
    sorted: true,
    activities: [],
  }))
}

function App() {
  const [darkMode, setDarkMode] = useState(false)
  const [search, setSearch] = useState('')
  const [selectedTrip, setSelectedTrip] = useState(null)
  const [tripList, setTripList] = useState(trips)
  const [tripEditor, setTripEditor] = useState(null)
  const [tripToDelete, setTripToDelete] = useState(null)
  const [tripDayPlans, setTripDayPlans] = useState({ tokyo: initialDays })
  const [modalDay, setModalDay] = useState(null)
  const [draggedActivity, setDraggedActivity] = useState(null)
  const days = selectedTrip ? tripDayPlans[selectedTrip.id] ?? createTripDays(selectedTrip) : []
  const visibleTrips = tripList.filter((trip) => `${trip.name} ${trip.city}`.toLowerCase().includes(search.toLowerCase()))

  function updateCurrentDays(update) {
    if (!selectedTrip) return
    setTripDayPlans((current) => ({
      ...current,
      [selectedTrip.id]: update(current[selectedTrip.id] ?? createTripDays(selectedTrip)),
    }))
  }

  function openTrip(trip) {
    setSelectedTrip(trip)
  }

  function openNewTrip() {
    setSelectedTrip(null)
    setTripEditor({ mode: 'create' })
  }

  function openEditTrip(trip) {
    setSelectedTrip(null)
    setTripEditor({ mode: 'edit', tripId: trip.id })
  }

  function saveTrip(draft) {
    const existing = tripList.find((trip) => trip.id === tripEditor.tripId)
    const dateRows = getDateRows(draft.startDate, draft.endDate)
    const dayActivityCounts = dateRows.map((_, index) => existing?.dayActivityCounts?.[index] ?? 0)
    const updatedTrip = {
      ...existing,
      id: existing?.id ?? crypto.randomUUID(),
      name: draft.name.trim(),
      city: draft.destination.trim(),
      startDate: draft.startDate,
      endDate: draft.endDate,
      dates: formatTripDates(draft.startDate, draft.endDate),
      days: dateRows.length,
      activities: dayActivityCounts.reduce((total, count) => total + count, 0),
      dayActivityCounts,
      color: existing?.color ?? '#10998d',
    }
    if (existing) {
      setTripDayPlans((current) => {
        const previousDays = current[existing.id] ?? createTripDays(existing)
        const nextDays = dateRows.map((date, index) => previousDays[index]
          ? { ...previousDays[index], id: index + 1, date: new Intl.DateTimeFormat('en-US', { weekday: 'short', month: 'short', day: 'numeric' }).format(date) }
          : createTripDays({ startDate: draft.startDate, endDate: draft.endDate })[index])
        return { ...current, [existing.id]: nextDays }
      })
    }
    setTripList((current) => existing
      ? current.map((trip) => trip.id === existing.id ? updatedTrip : trip)
      : [updatedTrip, ...current])
    setTripEditor(null)
  }

  function confirmDeleteTrip() {
    setTripList((current) => current.filter((trip) => trip.id !== tripToDelete.id))
    setTripDayPlans((current) => Object.fromEntries(Object.entries(current).filter(([id]) => id !== tripToDelete.id)))
    setTripToDelete(null)
    setTripEditor(null)
    setSelectedTrip(null)
  }

  function toggleSort(dayId) {
    updateCurrentDays((current) => current.map((day) => {
      if (day.id !== dayId) return day
      const sorted = !day.sorted
      return { ...day, sorted, activities: sorted ? [...day.activities].sort((a, b) => timeToMinutes(a.time) - timeToMinutes(b.time)) : day.activities }
    }))
  }

  function addActivity(event) {
    event.preventDefault()
    const data = new FormData(event.currentTarget)
    const activity = {
      id: crypto.randomUUID(), name: data.get('name').trim(), time: formatTime(data.get('time')),
      category: data.get('category'), location: data.get('location').trim() || 'Location not set', notes: data.get('notes').trim(),
    }
    updateCurrentDays((current) => current.map((day) => {
      if (day.id !== modalDay) return day
      const activities = [...day.activities, activity]
      return { ...day, activities: day.sorted ? activities.sort((a, b) => timeToMinutes(a.time) - timeToMinutes(b.time)) : activities }
    }))
    setModalDay(null)
  }

  function moveActivity(dayId, targetId) {
    if (!draggedActivity || draggedActivity.dayId !== dayId || draggedActivity.id === targetId) return
    updateCurrentDays((current) => current.map((day) => {
      if (day.id !== dayId) return day
      const activities = [...day.activities]
      const from = activities.findIndex((item) => item.id === draggedActivity.id)
      const to = activities.findIndex((item) => item.id === targetId)
      const [moved] = activities.splice(from, 1)
      activities.splice(to, 0, moved)
      return { ...day, activities, sorted: false }
    }))
    setDraggedActivity(null)
  }

  return (
    <div className={darkMode ? 'dark min-h-screen' : 'min-h-screen'}>
      <div className="min-h-screen bg-[#f7f9fc] text-[#172033] transition-colors dark:bg-[#0b1222] dark:text-[#edf2fb]">
        <header className="h-[62px] border-b border-[#e3e9f1] bg-white dark:border-[#202c43] dark:bg-[#111b2f]">
          <div className="mx-auto flex h-full max-w-[1440px] items-center px-5 sm:px-8 lg:px-12">
            <button onClick={() => setSelectedTrip(null)} aria-label="Wanderlust home" className="flex items-center gap-3 text-left">
              <span className="grid size-8 place-items-center rounded-full bg-[#10998d] text-sm font-bold text-white">W</span>
              <span className="text-[20px] font-bold tracking-[-0.4px]">Wanderlust</span>
            </button>
            <button onClick={() => setSelectedTrip(null)} className="ml-8 text-sm font-semibold text-[#10998d] sm:ml-10">My Trips</button>
            <div className="ml-auto flex items-center gap-3 text-[13px] font-medium text-[#77869d]">
              <span>Dark mode</span>
              <button type="button" role="switch" aria-checked={darkMode} aria-label="Toggle dark mode" onClick={() => setDarkMode((value) => !value)} className={`relative h-6 w-[50px] rounded-full transition-colors ${darkMode ? 'bg-[#10998d]' : 'bg-[#cbd5e1]'}`}>
                <span className={`absolute left-[3px] top-[3px] size-[18px] rounded-full bg-white shadow-sm transition-transform ${darkMode ? 'translate-x-[26px]' : 'translate-x-0'}`} />
              </button>
            </div>
          </div>
        </header>

        <main className="mx-auto max-w-[1440px] px-5 pb-16 pt-8 sm:px-8 sm:pt-9 lg:px-12">
          {selectedTrip ? (
            <TripDetail trip={selectedTrip} days={days} onBack={() => setSelectedTrip(null)} onAdd={setModalDay} onSort={toggleSort} onDragStart={(dayId, id) => setDraggedActivity(dayId === null ? null : { dayId, id })} onDrop={moveActivity} />
          ) : tripEditor ? (
            <TripEditor
              key={tripEditor.tripId ?? 'new-trip'}
              trip={tripList.find((trip) => trip.id === tripEditor.tripId) ?? null}
              onBack={() => setTripEditor(null)}
              onSave={saveTrip}
              onDelete={() => setTripToDelete(tripList.find((trip) => trip.id === tripEditor.tripId))}
            />
          ) : (
            <>
              <section className="mb-6">
                <h1 className="text-[30px] font-bold leading-tight tracking-[-0.8px]">My Trips</h1>
                <p className="mt-1 text-[15px] text-[#77869d]">Plan, organize and revisit every adventure.</p>
              </section>
              <div className="mb-7 flex items-center gap-5">
                <label className="flex h-11 w-full max-w-[414px] items-center gap-2 rounded-[10px] border border-[#dce4ef] bg-white px-3.5 text-[#77869d] shadow-[0_1px_2px_rgba(20,40,70,0.02)] focus-within:border-[#10998d] focus-within:ring-2 focus-within:ring-[#10998d]/10 dark:border-[#263550] dark:bg-[#111b2f]">
                  <Search size={18} strokeWidth={2.3} />
                  <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search trips by name or destination" className="min-w-0 flex-1 bg-transparent text-sm text-[#172033] outline-none placeholder:text-[#8795aa] dark:text-[#edf2fb]" />
                </label>
                <span className="ml-auto whitespace-nowrap text-sm font-semibold text-[#77869d]">{visibleTrips.length} trips</span>
                <button onClick={openNewTrip} className="inline-flex h-10 shrink-0 items-center gap-1.5 rounded-lg bg-[#10998d] px-4 text-[13px] font-bold text-white transition hover:bg-[#087f75]"><Plus size={16} /> New Trip</button>
              </div>
              {visibleTrips.length ? (
                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 lg:gap-6">
                  {visibleTrips.map((trip) => (
                    <article key={trip.id} className="group relative overflow-hidden rounded-[16px] border border-[#e0e8f1] bg-white shadow-[0_1px_2px_rgba(24,39,75,0.02)] transition duration-200 hover:-translate-y-0.5 hover:shadow-md dark:border-[#263550] dark:bg-[#111b2f]">
                        <button onClick={() => openTrip(trip)} className="block w-full text-left focus-visible:outline-2 focus-visible:outline-[#10998d]">
                        <div
                          className="flex h-[82px] items-start justify-between bg-cover bg-center px-5 py-3.5"
                          style={tripPhotos[trip.id]
                            ? { backgroundImage: `linear-gradient(rgba(13, 29, 42, 0.18), rgba(13, 29, 42, 0.3)), url(${tripPhotos[trip.id]})` }
                            : { backgroundColor: trip.color }}
                        >
                          <span className="text-[44px] font-bold leading-none text-white">{trip.name[0]}</span>
                          <span className="rounded-full bg-white/25 px-4 py-1 text-[12px] font-semibold text-white">{trip.days} days</span>
                        </div>
                        <div className="px-5 pb-2.5 pt-3">
                          <h2 className="truncate text-[17px] font-bold leading-6">{trip.name}</h2>
                          <p className="mt-0.5 text-[14px] leading-5 text-[#77869d]">{trip.city}</p>
                          <p className="mt-0.5 text-[13px] leading-5 text-[#77869d]">{trip.dates}</p>
                        </div>
                      </button>
                      <div className="flex h-9 items-center justify-between border-t border-[#e5ebf2] px-5 text-[13px] dark:border-[#263550]">
                        <span className="text-[#77869d]">{trip.activities} activities</span>
                        <button onClick={() => openTrip(trip)} className="inline-flex items-center gap-1 font-bold text-[#10998d]">View itinerary <ArrowRight size={15} /></button>
                      </div>
                      <div className="absolute right-3 top-[43px] flex gap-1 opacity-100 transition-opacity sm:opacity-0 sm:group-hover:opacity-100 sm:group-focus-within:opacity-100">
                        <button onClick={() => openEditTrip(trip)} className="rounded-md bg-white/90 px-2.5 py-1 text-[11px] font-bold text-[#344256] shadow-sm hover:bg-white">Edit</button>
                        <button onClick={() => setTripToDelete(trip)} className="rounded-md bg-white/90 px-2.5 py-1 text-[11px] font-bold text-[#d94343] shadow-sm hover:bg-white">Delete</button>
                      </div>
                    </article>
                  ))}
                </div>
              ) : <div className="rounded-xl border border-dashed border-[#cbd5e1] py-14 text-center text-sm text-[#77869d] dark:border-[#33415c]">No trips match “{search}”. Try another destination.</div>}
            </>
          )}
        </main>

        {modalDay !== null && <ActivityModal day={days.find((day) => day.id === modalDay)} onClose={() => setModalDay(null)} onSubmit={addActivity} />}
        {tripToDelete && <DeleteTripDialog trip={tripToDelete} onCancel={() => setTripToDelete(null)} onConfirm={confirmDeleteTrip} />}
      </div>
    </div>
  )
}

function TripEditor({ trip, onBack, onSave, onDelete }) {
  const [draft, setDraft] = useState({
    name: trip?.name ?? '',
    destination: trip?.city ?? '',
    startDate: trip?.startDate ?? '2026-11-06',
    endDate: trip?.endDate ?? '2026-11-10',
  })
  const previewDays = getDateRows(draft.startDate, draft.endDate)

  function updateField(event) {
    setDraft((current) => ({ ...current, [event.target.name]: event.target.value }))
  }

  return (
    <>
      <button onClick={onBack} className="mb-2 inline-flex items-center gap-1.5 text-[14px] font-semibold text-[#10998d] hover:text-[#087d73]"><ArrowLeft size={16} /> Back to trips</button>
      <div className="mb-7">
        <h1 className="text-[30px] font-bold leading-tight tracking-[-0.8px]">{trip ? 'Edit Trip' : 'Create New Trip'}</h1>
        <p className="mt-1 text-[15px] text-[#77869d]">{trip ? 'Update the details of your trip.' : 'Pick your dates and Wanderlust will generate each day of your itinerary.'}</p>
      </div>
      <div className="grid items-stretch gap-5 lg:grid-cols-[1.2fr_0.86fr]">
        <form onSubmit={(event) => { event.preventDefault(); onSave(draft) }} className="flex min-h-[460px] flex-col overflow-hidden rounded-[16px] border border-[#dfe7f0] bg-white dark:border-[#263550] dark:bg-[#111b2f]">
          <div className="flex-1 space-y-4 px-6 py-7 sm:px-[30px]">
            <label className="block text-[13px] font-semibold">Trip name <span className="text-[#10998d]">*</span>
              <input required name="name" value={draft.name} onChange={updateField} placeholder="e.g. Kyoto Temple Trip" className="mt-1.5 block h-[42px] w-full rounded-lg border border-[#dfe7f0] bg-white px-3 text-[14px] font-normal outline-none placeholder:text-[#8795aa] focus:border-[#10998d] focus:ring-2 focus:ring-[#10998d]/15 dark:border-[#33415c] dark:bg-[#0b1222]" />
            </label>
            <label className="block text-[13px] font-semibold">Destination <span className="text-[#10998d]">*</span>
              <input required name="destination" value={draft.destination} onChange={updateField} placeholder="e.g. Kyoto, Japan" className="mt-1.5 block h-[42px] w-full rounded-lg border border-[#dfe7f0] bg-white px-3 text-[14px] font-normal outline-none placeholder:text-[#8795aa] focus:border-[#10998d] focus:ring-2 focus:ring-[#10998d]/15 dark:border-[#33415c] dark:bg-[#0b1222]" />
            </label>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6">
              <label className="block text-[13px] font-semibold">Start date <span className="text-[#10998d]">*</span>
                <input required type="date" name="startDate" value={draft.startDate} onChange={updateField} className="mt-1.5 block h-[42px] w-full rounded-lg border border-[#dfe7f0] bg-white px-3 text-[14px] font-normal outline-none focus:border-[#10998d] focus:ring-2 focus:ring-[#10998d]/15 dark:border-[#33415c] dark:bg-[#0b1222]" />
              </label>
              <label className="block text-[13px] font-semibold">End date <span className="text-[#10998d]">*</span>
                <input required type="date" name="endDate" min={draft.startDate} value={draft.endDate} onChange={updateField} className="mt-1.5 block h-[42px] w-full rounded-lg border border-[#dfe7f0] bg-white px-3 text-[14px] font-normal outline-none focus:border-[#10998d] focus:ring-2 focus:ring-[#10998d]/15 dark:border-[#33415c] dark:bg-[#0b1222]" />
              </label>
            </div>
            <p className="pt-0.5 text-[13px] font-bold text-[#10998d]">
              {previewDays.length ? `${previewDays.length} days ${trip ? 'in this trip' : 'will be generated'}` : 'Choose a valid date range'}
            </p>
            {trip && <p className="-mt-3 text-[13px] text-[#8795aa]">Changing the dates adds or removes days at the end of the trip.</p>}
          </div>
          <footer className="flex flex-wrap items-center justify-between gap-3 border-t border-[#e5ebf2] px-6 py-4 sm:px-[30px] dark:border-[#263550]">
            {trip && <button type="button" onClick={onDelete} className="h-[39px] rounded-lg border border-red-300 px-5 text-[13px] font-semibold text-red-600 hover:bg-red-50 dark:border-red-900 dark:hover:bg-red-950/40">Delete trip</button>}
            <div className="ml-auto flex gap-2.5">
              <button type="button" onClick={onBack} className="h-[39px] rounded-lg border border-[#dfe7f0] px-5 text-[13px] font-semibold hover:bg-[#f7f9fc] dark:border-[#33415c] dark:hover:bg-[#17243b]">Cancel</button>
              <button type="submit" disabled={!previewDays.length} className="h-[39px] rounded-lg bg-[#10998d] px-6 text-[13px] font-bold text-white hover:bg-[#087f75] disabled:cursor-not-allowed disabled:opacity-50">{trip ? 'Save Changes' : 'Create Trip'}</button>
            </div>
          </footer>
        </form>

        <aside className="overflow-hidden rounded-[16px] border border-[#dfe7f0] bg-white dark:border-[#263550] dark:bg-[#111b2f]">
          <div className="border-b border-[#e5ebf2] px-5 py-4 dark:border-[#263550]">
            <h2 className="text-[17px] font-bold">Itinerary preview</h2>
            <p className="mt-0.5 text-[13px] text-[#77869d]">Days are auto-generated from the date range</p>
          </div>
          <div className="space-y-2.5 px-5 py-3.5">
            {previewDays.map((date, index) => (
              <div key={date.toISOString()} className="flex min-h-[51px] items-center justify-between rounded-[10px] border border-[#dfe7f0] bg-[#f8fafc] px-3.5 dark:border-[#263550] dark:bg-[#17243b]">
                <div>
                  <p className="text-[14px] font-bold">Day {index + 1}</p>
                  <p className="text-[12px] text-[#77869d]">{new Intl.DateTimeFormat('en-US', { weekday: 'short', month: 'short', day: 'numeric' }).format(date)}</p>
                </div>
                <span className="text-[12px] text-[#77869d]">{trip?.dayActivityCounts?.[index] ?? 0} {trip?.dayActivityCounts?.[index] === 1 ? 'activity' : 'activities'}</span>
              </div>
            ))}
          </div>
          <p className="px-5 pb-5 pt-4 text-[13px] text-[#8795aa]">
            {trip ? `${trip.activities} activities in total.` : 'Add activities to each day after creating the trip.'}
          </p>
        </aside>
      </div>
    </>
  )
}

function DeleteTripDialog({ trip, onCancel, onConfirm }) {
  return (
    <div className="fixed inset-0 z-30 flex items-center justify-center bg-black/50 p-4" onMouseDown={(event) => event.target === event.currentTarget && onCancel()}>
      <section role="alertdialog" aria-modal="true" aria-labelledby="delete-trip-title" className="w-full max-w-[440px] rounded-[16px] border border-[#e0e8f1] bg-white p-6 shadow-[0_20px_70px_rgba(10,22,40,0.25)] dark:border-[#263550] dark:bg-[#111b2f]">
        <h2 id="delete-trip-title" className="text-[20px] font-bold">Delete this trip?</h2>
        <p className="mt-3 text-[14px] leading-5 text-[#77869d]">{trip.name}, including its {trip.days} days and {trip.activities} activities, will be permanently deleted. This can’t be undone.</p>
        <div className="mt-6 flex justify-end gap-2.5">
          <button onClick={onCancel} className="h-[39px] rounded-lg border border-[#dfe7f0] px-5 text-[13px] font-semibold hover:bg-[#f7f9fc] dark:border-[#33415c] dark:hover:bg-[#17243b]">Cancel</button>
          <button onClick={onConfirm} className="h-[39px] rounded-lg bg-red-600 px-5 text-[13px] font-bold text-white hover:bg-red-700">Delete Trip</button>
        </div>
      </section>
    </div>
  )
}

function TripDetail({ trip, days, onBack, onAdd, onSort, onDragStart, onDrop }) {
  return (
    <>
      <button onClick={onBack} className="mb-2 inline-flex items-center gap-1.5 text-[14px] font-semibold text-[#10998d] hover:text-[#087d73]"><ArrowLeft size={16} /> Back to trips</button>
      <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-[30px] font-bold leading-tight tracking-[-0.8px] sm:text-[32px]">{trip.name}</h1>
          <p className="mt-1 text-[14px] text-[#77869d] sm:text-[15px]">{trip.city} <span className="px-1">·</span> {trip.dates} <span className="px-1">·</span> {trip.days} days</p>
        </div>
        <p className="hidden pb-1 text-[13px] text-[#8795aa] sm:block">Drag the handle to reorder activities</p>
      </div>
      <div className="space-y-5">
        {days.map((day) => (
          <section key={day.id} className="overflow-hidden rounded-[16px] border border-[#dfe7f0] bg-white dark:border-[#263550] dark:bg-[#111b2f]">
            <div className="flex min-h-[60px] flex-wrap items-center gap-2 border-b border-[#e5ebf2] px-4 py-2.5 sm:px-5 dark:border-[#263550]">
              <h2 className="mr-1 text-[17px] font-bold">Day {day.id}</h2>
              <span className="mr-auto text-[14px] text-[#77869d]">{day.date}</span>
              {day.sorted ? <span className="rounded-full bg-[#e1f4f2] px-4 py-1.5 text-[12px] font-semibold text-[#10998d] dark:bg-[#123a3c]">Sorted by time</span> : <><button onClick={() => onSort(day.id)} className="rounded-lg border border-[#dfe7f0] px-3 py-2 text-[13px] font-semibold hover:bg-[#f7f9fc] dark:border-[#33415c] dark:hover:bg-[#17243b]">Sort by time</button><span className="rounded-full bg-[#fff0d9] px-4 py-1.5 text-[12px] font-semibold text-[#c76613] dark:bg-[#493316] dark:text-[#f7bb68]">Manual order</span></>}
              <button onClick={() => onAdd(day.id)} className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-[#10998d] px-4 text-[13px] font-bold text-white transition hover:bg-[#087f75]"><Plus size={15} strokeWidth={2.5} /> Add Activity</button>
            </div>
            <div className="space-y-2.5 p-4 sm:px-5 sm:py-3">
              {day.activities.map((activity) => (
                <article key={activity.id} draggable onDragStart={() => onDragStart(day.id, activity.id)} onDragOver={(event) => event.preventDefault()} onDrop={() => onDrop(day.id, activity.id)} onDragEnd={() => onDragStart(null, null)} className="group flex min-h-[58px] items-center gap-2.5 rounded-[10px] border border-[#e0e8f1] bg-[#f8fafc] px-2.5 py-2 transition-colors hover:border-[#10a699] hover:bg-[#edf7f6] sm:gap-3 sm:px-3 dark:border-[#263550] dark:bg-[#17243b] dark:hover:bg-[#142c37]">
                  <span className="cursor-grab touch-none text-[#7b8ba2] active:cursor-grabbing" aria-label="Drag to reorder"><GripVertical size={19} /></span>
                  <span className="w-[68px] shrink-0 text-[14px] font-bold text-[#10998d] sm:w-[80px] sm:text-[15px]">{activity.time}</span>
                  <div className="min-w-0 flex-1"><h3 className="truncate text-[14px] font-bold leading-5 sm:text-[15px]">{activity.name}</h3><p className="truncate text-[13px] leading-5 text-[#8795aa]">{activity.location}</p></div>
                  <span className={`shrink-0 rounded-full px-3 py-1 text-center text-[11px] font-bold sm:min-w-[100px] sm:text-[12px] ${categories[activity.category] || categories.Sightseeing}`}>{activity.category}</span>
                </article>
              ))}
              {day.activities.length === 0 && <p className="py-5 text-center text-sm text-[#8795aa]">No activities yet. Add one to start planning.</p>}
            </div>
          </section>
        ))}
      </div>
    </>
  )
}

function ActivityModal({ day, onClose, onSubmit }) {
  return (
    <div className="fixed inset-0 z-20 flex items-center justify-center overflow-y-auto bg-black/50 p-4" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <section role="dialog" aria-modal="true" aria-labelledby="activity-modal-title" className="my-auto w-full max-w-[500px] overflow-hidden rounded-[16px] border border-[#e0e8f1] bg-white shadow-[0_20px_70px_rgba(10,22,40,0.25)] dark:border-[#263550] dark:bg-[#111b2f]">
        <div className="flex items-start justify-between border-b border-[#e5ebf2] px-6 pb-4 pt-5 dark:border-[#263550]">
          <div><h2 id="activity-modal-title" className="text-[20px] font-bold">Add Activity</h2><p className="mt-0.5 text-[13px] text-[#77869d]">Day {day.id} <span className="px-1">·</span> {day.date}</p></div>
          <button onClick={onClose} aria-label="Close dialog" className="rounded-md p-1 text-[#77869d] hover:bg-[#f1f5f9] dark:hover:bg-[#17243b]"><X size={20} /></button>
        </div>
        <form id="activity-form" onSubmit={onSubmit} className="space-y-3.5 px-6 py-4">
          <label className="block text-[13px] font-semibold">Activity name <span className="text-[#10998d]">*</span><input required autoFocus name="name" placeholder="e.g. Visit Senso-ji Temple" className="mt-1 block h-[40px] w-full rounded-lg border border-[#dfe7f0] bg-white px-3 text-[14px] font-normal outline-none placeholder:text-[#8795aa] focus:border-[#10998d] focus:ring-2 focus:ring-[#10998d]/15 dark:border-[#33415c] dark:bg-[#0b1222]" /></label>
          <div className="grid grid-cols-2 gap-3">
            <label className="block text-[13px] font-semibold">Time <span className="text-[#10998d]">*</span><input required name="time" type="time" defaultValue="09:00" className="mt-1 block h-[40px] w-full rounded-lg border border-[#dfe7f0] bg-white px-3 text-[14px] font-normal outline-none focus:border-[#10998d] focus:ring-2 focus:ring-[#10998d]/15 dark:border-[#33415c] dark:bg-[#0b1222]" /></label>
            <label className="block text-[13px] font-semibold">Category<select name="category" className="mt-1 block h-[40px] w-full rounded-lg border border-[#dfe7f0] bg-white px-3 text-[14px] font-normal outline-none focus:border-[#10998d] focus:ring-2 focus:ring-[#10998d]/15 dark:border-[#33415c] dark:bg-[#0b1222]">{Object.keys(categories).map((category) => <option key={category}>{category}</option>)}</select></label>
          </div>
          <label className="block text-[13px] font-semibold">Location<input name="location" placeholder="e.g. Asakusa, Taito City" className="mt-1 block h-[40px] w-full rounded-lg border border-[#dfe7f0] bg-white px-3 text-[14px] font-normal outline-none placeholder:text-[#8795aa] focus:border-[#10998d] focus:ring-2 focus:ring-[#10998d]/15 dark:border-[#33415c] dark:bg-[#0b1222]" /></label>
          <label className="block text-[13px] font-semibold">Notes<textarea name="notes" rows="3" placeholder="Add any details (optional)" className="mt-1 block w-full resize-y rounded-lg border border-[#dfe7f0] bg-white px-3 py-2 text-[14px] font-normal outline-none placeholder:text-[#8795aa] focus:border-[#10998d] focus:ring-2 focus:ring-[#10998d]/15 dark:border-[#33415c] dark:bg-[#0b1222]" /></label>
        </form>
        <div className="flex justify-end gap-2.5 border-t border-[#e5ebf2] px-6 py-3.5 dark:border-[#263550]">
          <button onClick={onClose} className="h-[39px] rounded-lg border border-[#dfe7f0] px-5 text-[13px] font-semibold hover:bg-[#f7f9fc] dark:border-[#33415c] dark:hover:bg-[#17243b]">Cancel</button>
          <button type="submit" form="activity-form" className="h-[39px] rounded-lg bg-[#10998d] px-5 text-[13px] font-bold text-white hover:bg-[#087f75]">Add Activity</button>
        </div>
      </section>
    </div>
  )
}

function formatTime(value) {
  const [hourString, minutes] = value.split(':')
  const hour = Number(hourString)
  return `${String(hour % 12 || 12).padStart(2, '0')}:${minutes} ${hour >= 12 ? 'PM' : 'AM'}`
}

export default App