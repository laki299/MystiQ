import { useState } from 'react'
import { doc, setDoc, getDoc } from 'firebase/firestore'
import { db } from '../firebase'

function ProfileSetup({ user }) {
  const [nickname, setNickname] = useState('')
  const [gender, setGender] = useState('')
  const [age, setAge] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!nickname || !gender || !age) {
      setMessage('সব তথ্য পূরণ করুন')
      return
    }

    setLoading(true)
    setMessage('')

    try {
      const userRef = doc(db, 'users', String(user.id))
      
      await setDoc(userRef, {
        telegramId: user.id,
        nickname: nickname.trim(),
        gender: gender,
        age: Number(age),
        username: user.username || null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        isProfileComplete: true
      }, { merge: true })

      setMessage('প্রোফাইল সফলভাবে সেভ হয়েছে!')
      
      // পরে এখানে ক্যাটাগরি পেজে নিয়ে যাব
    } catch (error) {
      console.error(error)
      setMessage('সেভ করতে সমস্যা হয়েছে। আবার চেষ্টা করুন।')
    }

    setLoading(false)
  }

  return (
    <div style={{ padding: '20px', maxWidth: '400px', margin: '0 auto' }}>
      <h2 style={{ marginBottom: '20px', textAlign: 'center' }}>প্রোফাইল তৈরি করুন</h2>
      
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', marginBottom: '6px' }}>নিকনেম</label>
          <input
            type="text"
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
            placeholder="আপনার নিকনেম লিখুন"
            style={{
              width: '100%',
              padding: '12px',
              borderRadius: '8px',
              border: '1px solid #333',
              background: '#1a1a1a',
              color: '#fff',
              fontSize: '16px'
            }}
          />
        </div>

        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', marginBottom: '6px' }}>লিঙ্গ</label>
          <select
            value={gender}
            onChange={(e) => setGender(e.target.value)}
            style={{
              width: '100%',
              padding: '12px',
              borderRadius: '8px',
              border: '1px solid #333',
              background: '#1a1a1a',
              color: '#fff',
              fontSize: '16px'
            }}
          >
            <option value="">সিলেক্ট করুন</option>
            <option value="male">ছেলে</option>
            <option value="female">মেয়ে</option>
          </select>
        </div>

        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', marginBottom: '6px' }}>বয়স</label>
          <input
            type="number"
            value={age}
            onChange={(e) => setAge(e.target.value)}
            placeholder="আপনার বয়স"
            min="18"
            max="60"
            style={{
              width: '100%',
              padding: '12px',
              borderRadius: '8px',
              border: '1px solid #333',
              background: '#1a1a1a',
              color: '#fff',
              fontSize: '16px'
            }}
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          style={{
            width: '100%',
            padding: '14px',
            borderRadius: '8px',
            background: loading ? '#555' : '#0088cc',
            color: '#fff',
            fontSize: '16px',
            fontWeight: 'bold'
          }}
        >
          {loading ? 'সেভ হচ্ছে...' : 'প্রোফাইল সেভ করুন'}
        </button>
      </form>

      {message && (
        <p style={{ marginTop: '15px', textAlign: 'center', color: message.includes('সফল') ? '#4ade80' : '#f87171' }}>
          {message}
        </p>
      )}
    </div>
  )
}

export default ProfileSetup
