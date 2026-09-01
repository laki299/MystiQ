import { useState } from 'react'
import { doc, setDoc } from 'firebase/firestore'
import { db } from '../firebase'

function ProfileSetup({ user, onComplete }) {
  const [nickname, setNickname] = useState('')
  const [gender, setGender] = useState('')
  const [age, setAge] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (!nickname.trim() || !gender || !age) {
      setError('সব তথ্য পূরণ করুন')
      return
    }

    if (Number(age) < 18) {
      setError('বয়স ১৮ এর উপরে হতে হবে')
      return
    }

    setLoading(true)

    try {
      const profileData = {
        telegramId: user.id,
        nickname: nickname.trim(),
        gender: gender,
        age: Number(age),
        username: user.username || null,
        firstName: user.first_name || null,
        isProfileComplete: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }

      const userRef = doc(db, 'users', String(user.id))
      await setDoc(userRef, profileData, { merge: true })

      onComplete(profileData)
    } catch (err) {
      console.error(err)
      setError('সেভ করতে সমস্যা হয়েছে। আবার চেষ্টা করুন।')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ padding: '20px', maxWidth: '420px', margin: '0 auto', minHeight: '100vh', background: '#0f0f0f', color: '#fff' }}>
      <h2 style={{ textAlign: 'center', marginBottom: '8px' }}>প্রোফাইল তৈরি করুন</h2>
      <p style={{ textAlign: 'center', color: '#aaa', marginBottom: '25px', fontSize: '14px' }}>
        এই তথ্য অন্যরা দেখতে পাবে
      </p>

      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '16px' }}>
          <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px' }}>নিকনেম</label>
          <input
            type="text"
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
            placeholder="যে নামে পরিচিত হতে চান"
            maxLength={20}
            style={inputStyle}
          />
        </div>

        <div style={{ marginBottom: '16px' }}>
          <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px' }}>লিঙ্গ</label>
          <select value={gender} onChange={(e) => setGender(e.target.value)} style={inputStyle}>
            <option value="">সিলেক্ট করুন</option>
            <option value="male">ছেলে</option>
            <option value="female">মেয়ে</option>
          </select>
        </div>

        <div style={{ marginBottom: '24px' }}>
          <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px' }}>বয়স</label>
          <input
            type="number"
            value={age}
            onChange={(e) => setAge(e.target.value)}
            placeholder="আপনার বয়স"
            min="18"
            max="60"
            style={inputStyle}
          />
        </div>

        {error && (
          <p style={{ color: '#f87171', textAlign: 'center', marginBottom: '12px', fontSize: '14px' }}>
            {error}
          </p>
        )}

        <button type="submit" disabled={loading} style={buttonStyle(loading)}>
          {loading ? 'সেভ হচ্ছে...' : 'পরবর্তী ধাপ'}
        </button>
      </form>
    </div>
  )
}

const inputStyle = {
  width: '100%',
  padding: '13px 14px',
  borderRadius: '10px',
  border: '1px solid #333',
  background: '#1a1a1a',
  color: '#fff',
  fontSize: '16px'
}

const buttonStyle = (loading) => ({
  width: '100%',
  padding: '15px',
  borderRadius: '10px',
  background: loading ? '#444' : '#0088cc',
  color: '#fff',
  fontSize: '16px',
  fontWeight: '600'
})

export default ProfileSetup
