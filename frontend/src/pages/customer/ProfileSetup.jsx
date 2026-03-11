import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { setupProfile } from '../../services/api'
import { useAuthStore } from '../../store/authStore'
import { useLocationStore } from '../../store/locationStore'

export default function ProfileSetup() {
  const navigate = useNavigate()
  const { updateUser } = useAuthStore()
  const { setLocation } = useLocationStore()
  const [form, setForm] = useState({ name: '', gender: '', dob: '' })
  const [locLoading, setLocLoading] = useState(false)

  const getLocation = () => {
    setLocLoading(true)
    navigator.geolocation.getCurrentPosition(
      async ({ coords }) => {
        setLocation({ lat: coords.latitude, lng: coords.longitude }, 'Current Location')
        setLocLoading(false)
        toast.success('Location saved!')
      },
      () => { toast.error('Location access denied'); setLocLoading(false) }
    )
  }

  const handleSubmit = async () => {
    if (!form.name || !form.gender || !form.dob) return toast.error('Fill all fields')
    try {
      const { data } = await setupProfile(form)
      updateUser(data.user)
      navigate('/home')
      toast.success('Profile set up!')
    } catch {
      toast.error('Failed to save profile')
    }
  }

  return (
    <div className="min-h-screen bg-dark flex items-center justify-center px-4">
      <div className="bg-white rounded-3xl p-8 w-full max-w-sm shadow-2xl">
        <h2 className="font-display text-2xl font-bold mb-6">Set Up Profile</h2>
        <div className="space-y-4">
          <input
            className="input-field"
            placeholder="Full Name"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />
          <select
            className="input-field"
            value={form.gender}
            onChange={(e) => setForm({ ...form, gender: e.target.value })}
          >
            <option value="">Select Gender</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
            <option value="other">Other</option>
            <option value="prefer_not">Prefer not to say</option>
          </select>
          <div>
            <label className="text-xs text-gray-500 mb-1 block">Date of Birth</label>
            <input
              type="date"
              className="input-field"
              value={form.dob}
              onChange={(e) => setForm({ ...form, dob: e.target.value })}
            />
          </div>
          <button
            onClick={getLocation}
            disabled={locLoading}
            className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-left flex items-center gap-3 hover:bg-gray-50"
          >
            <span className="text-xl">📍</span>
            <span>{locLoading ? 'Getting location...' : 'Allow Location Access'}</span>
          </button>
          <button onClick={handleSubmit} className="btn-primary w-full">
            Continue to Clozet →
          </button>
        </div>
      </div>
    </div>
  )
}
