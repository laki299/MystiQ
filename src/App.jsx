import { useState, useEffect } from 'react'
import ProfileSetup from './pages/ProfileSetup'
import CategorySelect from './pages/CategorySelect'

function App() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Telegram WebApp থেকে ইউজার ইনফো নেওয়া
    const tg = window.Telegram?.WebApp
    if (tg) {
      tg.ready()
      tg.expand()
      
      const tgUser = tg.initDataUnsafe?.user
      if (tgUser) {
        setUser({
          id: tgUser.id,
          first_name: tgUser.first_name,
          username: tgUser.username || null,
        })
      }
    }
    setLoading(false)
  }, [])

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        লোড হচ্ছে...
      </div>
    )
  }

  if (!user) {
    return (
      <div style={{ padding: 20, textAlign: 'center' }}>
        <h2>অনুগ্রহ করে Telegram থেকে অ্যাপটি খুলুন</h2>
      </div>
    )
  }

  return (
    <div>
      {/* পরে এখানে রাউটিং বসাব */}
      <ProfileSetup user={user} />
    </div>
  )
}

export default App
