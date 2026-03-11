import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useAuthStore } from '../store/authStore'
import api from '../utils/api'
import toast from 'react-hot-toast'

const steps = ['profile', 'location']

export default function OnboardingPage() {
  const navigate = useNavigate()
  const { setUser, setLocation } = useAuthStore()
  const [step, setStep] = useState(0)
  const [form, setForm] = useState({ name: '', gender: '', dob: '' })
  const [loading, setLoading] = useState(false)

  const saveProfile = async () => {
    if (!form.name) return toast.error('Name is required')
    setLoading(true)
    try {
      const { data } = await api.put('/users/me', form)
      setUser(data)
      setStep(1)
    } catch { toast.error('Failed to save profile') }
    finally { setLoading(false) }
  }

  const getLocation = () => {
    navigator.geolocation.getCurrentPosition(async (pos) => {
      const { latitude: lat, longitude: lng } = pos.coords
      await api.put('/users/location', { lat, lng })
      setLocation({ lat, lng })
      toast.success('Location saved!')
      navigate('/')
    }, () => {
      toast('Location skipped — you can set it later', { icon: '📍' })
      navigate('/')
    })
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-50 to-cream flex items-center justify-center p-6">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-3xl p-8 w-full max-w-md shadow-xl">
        {step === 0 ? (
          <>
            <h2 className="font-display text-3xl font-bold text-ink mb-1">Let's set up your profile</h2>
            <p className="text-ink/50 text-sm mb-8">This helps us personalize your experience</p>

            <label className="text-xs uppercase tracking-wider text-ink/50 font-medium">Your Name *</label>
            <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
              className="w-full mt-1 mb-4 border border-brand-200 rounded-xl px-4 py-3 focus:outline-none focus:border-brand-500"
              placeholder="e.g. Priya Sharma" />

            <label className="text-xs uppercase tracking-wider text-ink/50 font-medium">Gender</label>
            <div className="flex gap-2 mt-1 mb-4 flex-wrap">
              {['female', 'male', 'other', 'prefer_not_to_say'].map(g => (
                <button key={g} onClick={() => setForm(f => ({ ...f, gender: g }))}
                  className={`px-4 py-2 rounded-full text-sm border transition-colors ${form.gender === g ? 'bg-brand-600 text-white border-brand-600' : 'border-brand-200 text-ink/60 hover:border-brand-400'}`}>
                  {g.replace(/_/g, ' ')}
                </button>
              ))}
            </div>

            <label className="text-xs uppercase tracking-wider text-ink/50 font-medium">Date of Birth</label>
            <input type="date" value={form.dob} onChange={e => setForm(f => ({ ...f, dob: e.target.value }))}
              className="w-full mt-1 mb-8 border border-brand-200 rounded-xl px-4 py-3 focus:outline-none focus:border-brand-500" />

            <button onClick={saveProfile} disabled={loading}
              className="w-full bg-brand-600 text-white py-3 rounded-xl font-medium hover:bg-brand-700 transition-colors disabled:opacity-50">
              {loading ? 'Saving...' : 'Continue →'}
            </button>
          </>
        ) : (
          <>
            <div className="text-6xl text-center mb-6">📍</div>
            <h2 className="font-display text-3xl font-bold text-ink mb-2 text-center">Allow location access</h2>
            <p className="text-ink/50 text-sm mb-8 text-center">We'll show you stores and delivery options within 15km of you</p>
            <button onClick={getLocation} className="w-full bg-brand-600 text-white py-3 rounded-xl font-medium hover:bg-brand-700 transition-colors mb-3">
              Allow Location →
            </button>
            <button onClick={() => navigate('/')} className="w-full text-ink/40 text-sm py-2">
              Skip for now
            </button>
          </>
        )}
      </motion.div>
    </div>
  )
}
