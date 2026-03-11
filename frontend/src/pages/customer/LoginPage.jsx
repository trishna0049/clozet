import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { GoogleLogin } from '@react-oauth/google'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'
import { sendOTP, googleLogin } from '../../services/api'
import { useAuthStore } from '../../store/authStore'

export default function LoginPage() {
  const navigate = useNavigate()
  const { setAuth } = useAuthStore()
  const [contact, setContact] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSendOTP = async () => {
    if (!contact.trim()) return toast.error('Enter your mobile or email')
    setLoading(true)
    try {
      await sendOTP(contact)
      toast.success('OTP sent!')
      navigate('/verify-otp', { state: { contact } })
    } catch (e) {
      toast.error(e.response?.data?.message || 'Failed to send OTP')
    } finally {
      setLoading(false)
    }
  }

  const handleGoogle = async (credential) => {
    try {
      const { data } = await googleLogin(credential)
      setAuth(data.token, data.user, data.user.role)
      if (!data.user.profileComplete) navigate('/setup-profile')
      else navigate('/home')
    } catch {
      toast.error('Google login failed')
    }
  }

  return (
    <div className="min-h-screen bg-dark flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-3xl p-8 w-full max-w-sm shadow-2xl"
      >
        <h1 className="font-display text-3xl font-bold mb-1">Welcome to</h1>
        <p className="font-display text-3xl text-brand-600 font-bold mb-6">Clozet</p>

        <p className="text-gray-500 text-sm mb-6">Sign in to discover fashion near you</p>

        {/* OTP Login */}
        <div className="space-y-3 mb-6">
          <input
            className="input-field"
            placeholder="Mobile number or email"
            value={contact}
            onChange={(e) => setContact(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSendOTP()}
          />
          <button
            onClick={handleSendOTP}
            disabled={loading}
            className="btn-primary w-full"
          >
            {loading ? 'Sending...' : 'Send OTP'}
          </button>
        </div>

        <div className="flex items-center gap-3 mb-6">
          <div className="flex-1 h-px bg-gray-200" />
          <span className="text-gray-400 text-xs">or</span>
          <div className="flex-1 h-px bg-gray-200" />
        </div>

        {/* Google */}
        <div className="flex justify-center">
          <GoogleLogin
            onSuccess={(r) => handleGoogle(r.credential)}
            onError={() => toast.error('Google login failed')}
            shape="pill"
            width="260"
          />
        </div>

        <p className="text-center text-xs text-gray-400 mt-6">
          Are you a store owner?{' '}
          <span
            className="text-brand-600 cursor-pointer"
            onClick={() => navigate('/store/login')}
          >
            Login here
          </span>
        </p>
      </motion.div>
    </div>
  )
}
