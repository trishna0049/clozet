import { useState, useRef } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'
import { verifyOTP, sendOTP } from '../../services/api'
import { useAuthStore } from '../../store/authStore'

export default function OTPPage() {
  const navigate = useNavigate()
  const { state } = useLocation()
  const { setAuth } = useAuthStore()
  const contact = state?.contact || ''
  const [otp, setOtp] = useState(Array(6).fill(''))
  const [loading, setLoading] = useState(false)
  const refs = useRef([])

  const handleChange = (val, idx) => {
    if (!/^\d*$/.test(val)) return
    const next = [...otp]
    next[idx] = val.slice(-1)
    setOtp(next)
    if (val && idx < 5) refs.current[idx + 1]?.focus()
  }

  const handleKeyDown = (e, idx) => {
    if (e.key === 'Backspace' && !otp[idx] && idx > 0) refs.current[idx - 1]?.focus()
  }

  const handleVerify = async () => {
    const code = otp.join('')
    if (code.length < 6) return toast.error('Enter 6-digit OTP')
    setLoading(true)
    try {
      const { data } = await verifyOTP(contact, code)
      setAuth(data.token, data.user, data.user.role)
      if (!data.user.profileComplete) navigate('/setup-profile')
      else navigate('/home')
      toast.success('Logged in!')
    } catch (e) {
      toast.error(e.response?.data?.message || 'Invalid OTP')
    } finally {
      setLoading(false)
    }
  }

  const resend = async () => {
    await sendOTP(contact)
    toast.success('OTP resent!')
  }

  return (
    <div className="min-h-screen bg-dark flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-3xl p-8 w-full max-w-sm shadow-2xl text-center"
      >
        <h2 className="font-display text-2xl font-bold mb-2">Verify OTP</h2>
        <p className="text-gray-500 text-sm mb-8">
          Code sent to <span className="font-medium text-gray-800">{contact}</span>
        </p>

        <div className="flex gap-2 justify-center mb-8">
          {otp.map((v, i) => (
            <input
              key={i}
              ref={(el) => (refs.current[i] = el)}
              value={v}
              onChange={(e) => handleChange(e.target.value, i)}
              onKeyDown={(e) => handleKeyDown(e, i)}
              maxLength={1}
              className="w-12 h-12 text-center text-xl font-bold border-2 border-gray-200 rounded-xl focus:border-brand-500 focus:outline-none"
            />
          ))}
        </div>

        <button onClick={handleVerify} disabled={loading} className="btn-primary w-full mb-4">
          {loading ? 'Verifying...' : 'Verify & Continue'}
        </button>

        <p className="text-sm text-gray-400">
          Didn't receive?{' '}
          <span className="text-brand-600 cursor-pointer" onClick={resend}>Resend</span>
        </p>
      </motion.div>
    </div>
  )
}
