import { useState, useEffect } from 'react'
import { doc, getDoc, collection, query, where, onSnapshot } from 'firebase/firestore'
import { db } from './firebase'
import ProfileSetup from './pages/ProfileSetup'
import CategorySelect from './pages/CategorySelect'
import Requests from './pages/Requests'

function App() {
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [step, setStep] = useState('loading') // loading | profile | main
  const [activeTab, setActiveTab] = useState('home') // home | requests
  const [pendingCount, setPendingCount] = useState(0)

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

    const checkProfile = async () => {
      try {
        const userRef = doc(db, 'users', String(tgUser.id))
        const snap = await getDoc(userRef)

        if (snap.exists() && snap.data().isProfileComplete) {
          setProfile(snap.data())
          setStep('main')
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

  // পেন্ডিং রিকোয়েস্ট কাউন্ট
  useEffect(() => {
    if (!user) return

    const q = query(
      collection(db, 'requests'),
      where('toUserId', '==', String(user.id)),
      where('status', '==', 'pending')
    )

    const unsubscribe = onSnapshot(q, (snapshot) => {
      setPendingCount(snapshot.size)
    })

    return () => unsubscribe()
  }, [user])

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
          setStep('main')
        }}
      />
    )
  }

  return (
    <div style={{ minHeight: '100vh', background: '#0f0f0f', color: '#fff', paddingBottom: '70px' }}>
      {/* মেইন কন্টেন্ট */}
      {activeTab === 'home' && (
        <CategorySelect user={user} profile={profile} />
      )}

      {activeTab === 'requests' && (
        <Requests user={user} />
      )}

      {/* বটম নেভিগেশন */}
      <div style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        height: '65px',
        background: '#1a1a1a',
        borderTop: '1px solid #333',
        display: 'flex',
        justifyContent: 'space-around',
        alignItems: 'center',
        zIndex: 100
      }}>
        <button
          onClick={() => setActiveTab('home')}
          style={{
            background: 'transparent',
            color: activeTab === 'home' ? '#0088cc' : '#888',
            fontSize: '13px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '3px'
          }}
        >
          <span style={{ fontSize: '22px' }}>🏠</span>
          হোম
        </button>

        <button
          onClick={() => setActiveTab('requests')}
          style={{
            background: 'transparent',
            color: activeTab === 'requests' ? '#0088cc' : '#888',
            fontSize: '13px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '3px',
            position: 'relative'
          }}
        >
          <span style={{ fontSize: '22px' }}>📩</span>
          রিকোয়েস্ট
          {pendingCount > 0 && (
            <span style={{
              position: 'absolute',
              top: '-2px',
              right: '-8px',
              background: '#ef4444',
              color: '#fff',
              fontSize: '11px',
              width: '18px',
              height: '18px',
              borderRadius: '50%',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center'
            }}>
              {pendingCount}
            </span>
          )}
        </button>
      </div>
    </div>
  )
}

export default App
