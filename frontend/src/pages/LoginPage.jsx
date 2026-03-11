import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { RecaptchaVerifier, signInWithPhoneNumber, GoogleAuthProvider, signInWithPopup } from 'firebase/auth'
import { auth } from '../utils/firebase'
import { useAuthStore } from '../store/authStore'
import api from '../utils/api'
import toast from 'react-hot-toast'

export default function LoginPage() {
  const navigate = useNavigate()
  const setAuth = useAuthStore(s => s.setAuth)

  const [mode, setMode] = useState('phone') // 'phone' | 'otp'
  const [phone, setPhone] = useState('')
  const [otp, setOtp] = useState('')
  const [confirmResult, setConfirmResult] = useState(null)
  const [loading, setLoading] = useState(false)

  const setupRecaptcha = () => {
    if (!window.recaptchaVerifier) {
      window.recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', { size: 'invisible' })
    }
  }

  const sendOTP = async () => {
    if (!phone || phone.length < 10) return toast.error('Enter valid phone number')
    setLoading(true)
    try {
      setupRecaptcha()
      const full = phone.startsWith('+') ? phone : `+91${phone}`
      const result = await signInWithPhoneNumber(auth, full, window.recaptchaVerifier)
      setConfirmResult(result)
      setMode('otp')
      toast.success('OTP sent!')
    } catch (e) {
      toast.error('Failed to send OTP: ' + e.message)
    } finally {
      setLoading(false)
    }
  }

  const verifyOTP = async () => {
    if (!otp || otp.length !== 6) return toast.error('Enter 6-digit OTP')
    setLoading(true)
    try {
      const result = await confirmResult.confirm(otp)
      const { data } = await api.post('/auth/verify-phone', { firebaseUid: result.user.uid, phone })
      setAuth(data.token, data.user)
      data.isNewUser ? navigate('/onboarding') : navigate('/')
    } catch (e) {
      toast.error('Invalid OTP')
    } finally {
      setLoading(false)
    }
  }

  const googleLogin = async () => {
    setLoading(true)
    try {
      const provider = new GoogleAuthProvider()
      const result = await signInWithPopup(auth, provider)
      const idToken = await result.user.getIdToken()
      const { data } = await api.post('/auth/google', { idToken })
      setAuth(data.token, data.user)
      !data.user.name ? navigate('/onboarding') : navigate('/')
    } catch (e) {
      toast.error('Google sign-in failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-ink flex">
      {/* Left decorative panel */}
      <div className="hidden lg:flex w-1/2 bg-gradient-to-br from-brand-700 to-brand-900 items-center justify-center p-12 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '40px 40px' }} />
        <div className="relative text-center text-white">
          <h1 className="font-display text-6xl font-bold italic mb-4">Clozet</h1>
          <p className="text-brand-200 text-xl font-light">Fashion at your door<br />in minutes.</p>
          <div className="mt-12 flex gap-4 justify-center">
            {['👗', '👠', '🧣', '💍'].map((e, i) => (
              <motion.span key={i} className="text-4xl" animate={{ y: [0, -8, 0] }} transition={{ duration: 2, delay: i * 0.3, repeat: Infinity }}>
                {e}
              </motion.span>
            ))}
          </div>
        </div>
      </div>

      {/* Right form */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          <div className="lg:hidden text-center mb-10">
            <h1 className="font-display text-5xl font-bold italic text-white mb-2">Clozet</h1>
            <p className="text-white/50">Fashion at your door</p>
          </div>

          <div className="bg-white rounded-3xl p-8 shadow-2xl">
            <h2 className="font-display text-2xl font-bold text-ink mb-1">Welcome back</h2>
            <p className="text-ink/50 text-sm mb-8">Sign in to continue shopping</p>

            <AnimatePresence mode="wait">
              {mode === 'phone' ? (
                <motion.div key="phone" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}>
                  <label className="text-xs font-medium text-ink/50 uppercase tracking-wider">Phone Number</label>
                  <div className="flex mt-1 mb-4">
                    <span className="flex items-center px-3 bg-brand-50 border border-r-0 border-brand-200 rounded-l-xl text-sm text-ink/60 font-mono">+91</span>
                    <input
                      type="tel" maxLength={10}
                      value={phone} onChange={e => setPhone(e.target.value.replace(/\D/g, ''))}
                      className="flex-1 border border-brand-200 rounded-r-xl px-4 py-3 text-sm focus:outline-none focus:border-brand-500 font-mono"
                      placeholder="9876543210"
                      onKeyDown={e => e.key === 'Enter' && sendOTP()}
                    />
                  </div>
                  <button onClick={sendOTP} disabled={loading}
                    className="w-full bg-brand-600 hover:bg-brand-700 text-white py-3 rounded-xl font-medium transition-colors disabled:opacity-50">
                    {loading ? 'Sending...' : 'Send OTP →'}
                  </button>
                </motion.div>
              ) : (
                <motion.div key="otp" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                  <p className="text-sm text-ink/60 mb-4">OTP sent to <strong>+91 {phone}</strong> <button onClick={() => setMode('phone')} className="text-brand-600 underline">Change</button></p>
                  <label className="text-xs font-medium text-ink/50 uppercase tracking-wider">Enter OTP</label>
                  <input
                    type="text" maxLength={6}
                    value={otp} onChange={e => setOtp(e.target.value.replace(/\D/g, ''))}
                    className="w-full mt-1 mb-4 border border-brand-200 rounded-xl px-4 py-3 text-center text-2xl font-mono tracking-[0.5em] focus:outline-none focus:border-brand-500"
                    placeholder="••••••"
                  />
                  <button onClick={verifyOTP} disabled={loading}
                    className="w-full bg-brand-600 hover:bg-brand-700 text-white py-3 rounded-xl font-medium transition-colors disabled:opacity-50">
                    {loading ? 'Verifying...' : 'Verify & Continue →'}
                  </button>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-brand-100" /></div>
              <div className="relative text-center"><span className="bg-white px-3 text-xs text-ink/40">or continue with</span></div>
            </div>

            <button onClick={googleLogin} disabled={loading}
              className="w-full border border-brand-200 hover:border-brand-400 hover:bg-brand-50 py-3 rounded-xl font-medium text-sm flex items-center justify-center gap-2 transition-colors">
              <svg width="18" height="18" viewBox="0 0 48 48"><path fill="#FFC107" d="M43.6 20H24v8h11.3C33.7 33.4 29.3 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3 0 5.7 1.1 7.8 2.9l5.7-5.7C34 6.4 29.2 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20c11 0 19.7-8 19.7-20 0-1.3-.1-2.7-.1-4z"/><path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.5 16 19 12 24 12c3 0 5.7 1.1 7.8 2.9l5.7-5.7C34 6.4 29.2 4 24 4 16.3 4 9.7 8.4 6.3 14.7z"/><path fill="#4CAF50" d="M24 44c5.2 0 9.9-1.9 13.5-5.1l-6.2-5.2C29.5 35.5 26.9 36 24 36c-5.2 0-9.7-3.5-11.3-8.3l-6.6 5.1C9.7 39.6 16.3 44 24 44z"/><path fill="#1976D2" d="M43.6 20H24v8h11.3c-.8 2.1-2.2 3.9-4.1 5.2l6.2 5.2C41.3 35.4 44 30 44 24c0-1.3-.1-2.7-.4-4z"/></svg>
              Sign in with Google
            </button>
          </div>
        </div>
      </div>
      <div id="recaptcha-container" />
    </div>
  )
}
