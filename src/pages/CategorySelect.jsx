import { useState } from 'react'
import { doc, updateDoc } from 'firebase/firestore'
import { db } from '../firebase'
import ActiveList from './ActiveList'

const CATEGORIES = [
  { id: 'sex', title: 'সেক্স', emoji: '🔥' },
  { id: 'general', title: 'সাধারণ', emoji: '💬' },
  { id: 'adda', title: 'আড্ডা', emoji: '☕' },
  { id: 'friendship', title: 'বন্ধুত্ব', emoji: '🤝' },
]

function CategorySelect({ user, profile }) {
  const [selectedCategory, setSelectedCategory] = useState(null)
  const [loading, setLoading] = useState(false)

  const handleSelect = async (categoryId) => {
    setLoading(true)

    try {
      const userRef = doc(db, 'users', String(user.id))
      await updateDoc(userRef, {
        currentCategory: categoryId,
        lastActive: new Date().toISOString(),
        isOnline: true,
        updatedAt: new Date().toISOString()
      })

      setSelectedCategory(categoryId)
    } catch (err) {
      console.error(err)
      alert('সমস্যা হয়েছে, আবার চেষ্টা করুন')
    } finally {
      setLoading(false)
    }
  }

  // ক্যাটাগরি সিলেক্ট হয়ে গেলে Active লিস্ট দেখাবে
  if (selectedCategory) {
    return (
      <ActiveList
        user={user}
        profile={profile}
        category={selectedCategory}
        onBack={() => setSelectedCategory(null)}
      />
    )
  }

  return (
    <div style={{ padding: '20px', maxWidth: '420px', margin: '0 auto', minHeight: '100vh', background: '#0f0f0f', color: '#fff' }}>
      <h2 style={{ textAlign: 'center', marginBottom: '6px' }}>ক্যাটাগরি বেছে নিন</h2>
      <p style={{ textAlign: 'center', color: '#aaa', marginBottom: '25px', fontSize: '14px' }}>
        যে ক্যাটাগরিতে যেতে চান সেটাতে ট্যাপ করুন
      </p>

      <div style={{ display: 'grid', gap: '12px' }}>
        {CATEGORIES.map((cat) => (
          <button
            key={cat.id}
            onClick={() => handleSelect(cat.id)}
            disabled={loading}
            style={{
              padding: '18px',
              borderRadius: '12px',
              background: '#1a1a1a',
              border: '1px solid #333',
              color: '#fff',
              fontSize: '18px',
              textAlign: 'left',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              opacity: loading ? 0.7 : 1
            }}
          >
            <span style={{ fontSize: '24px' }}>{cat.emoji}</span>
            <span>{cat.title}</span>
          </button>
        ))}
      </div>
    </div>
  )
}

export default CategorySelect
