import { useState, useEffect } from 'react'
import { doc, getDoc } from 'firebase/firestore'
import { db } from './firebase'
import ProfileSetup from './pages/ProfileSetup'
import CategorySelect from './pages/CategorySelect'

function App() {
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [step, setStep] = useState('loading') // loading | profile | category

  useEffect(() => {
    const tg = window.Telegram?.WebApp
    if (tg) {
      tg.ready()
      tg.expand()
      tg.setHeaderColor('#0f0f0f')
      tg.setBackgroundColor('#0f0f0f')
    }

    const tgUser = tg?.initDataUnsafe?.user

    if (!tgUser) {
      setLoading(false)
      setStep('error')
      return
    }

    const currentUser = {
      id: tgUser.id,
      first_name: tgUser.first_name,
      username: tgUser.username || null,
    }
    setUser(currentUser)

    // প্রোফাইল আছে কিনা চেক করা
    const checkProfile = async () => {
      try {
        const userRef = doc(db, 'users', String(tgUser.id))
        const snap = await getDoc(userRef)

        if (snap.exists() && snap.data().isProfileComplete) {
          setProfile(snap.data())
          setStep('category')
        } else {
          setStep('profile')
        }
      } catch (err) {
        console.error(err)
        setStep('profile')
      } finally {
        setLoading(false)
      }
    }

    checkProfile()
  }, [])

  if (loading || step === 'loading') {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: '#0f0f0f', color: '#fff' }}>
        লোড হচ্ছে...
      </div>
    )
  }

  if (step === 'error' || !user) {
    return (
      <div style={{ padding: 30, textAlign: 'center', background: '#0f0f0f', color: '#fff', minHeight: '100vh' }}>
        <h2>অনুগ্রহ করে Telegram অ্যাপ থেকে খুলুন</h2>
      </div>
    )
  }

  if (step === 'profile') {
    return (
      <ProfileSetup
        user={user}
        onComplete={(profileData) => {
          setProfile(profileData)
          setStep('category')
        }}
      />
    )
  }

  return (
    <CategorySelect
      user={user}
      profile={profile}
    />
  )
}

export default App
