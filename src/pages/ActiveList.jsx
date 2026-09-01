import { useState, useEffect } from 'react'
import { collection, query, where, onSnapshot, addDoc, serverTimestamp } from 'firebase/firestore'
import { db } from '../firebase'

function ActiveList({ user, profile, category, onBack }) {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedUser, setSelectedUser] = useState(null)
  const [sending, setSending] = useState(false)
  const [sentMessage, setSentMessage] = useState('')

  const oppositeGender = profile.gender === 'male' ? 'female' : 'male'

  useEffect(() => {
    const q = query(
      collection(db, 'users'),
      where('currentCategory', '==', category),
      where('gender', '==', oppositeGender),
      where('isOnline', '==', true)
    )

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const list = []
      snapshot.forEach((doc) => {
        if (doc.id !== String(user.id)) {
          list.push({ id: doc.id, ...doc.data() })
        }
      })
      setUsers(list)
      setLoading(false)
    })

    return () => unsubscribe()
  }, [category, oppositeGender, user.id])

  const sendRequest = async () => {
    if (!selectedUser) return
    setSending(true)
    setSentMessage('')

    try {
      await addDoc(collection(db, 'requests'), {
        fromUserId: String(user.id),
        toUserId: selectedUser.id,
        fromNickname: profile.nickname,
        fromAge: profile.age,
        fromGender: profile.gender,
        toNickname: selectedUser.nickname,
        status: 'pending',
        createdAt: serverTimestamp()
      })

      setSentMessage('রিকোয়েস্ট পাঠানো হয়েছে!')
    } catch (err) {
      console.error(err)
      setSentMessage('রিকোয়েস্ট পাঠাতে সমস্যা হয়েছে')
    } finally {
      setSending(false)
    }
  }

  // ইউজার ডিটেইলস ভিউ
  if (selectedUser) {
    return (
      <div style={{ padding: '20px', maxWidth: '420px', margin: '0 auto', minHeight: '100vh', background: '#0f0f0f', color: '#fff' }}>
        <button
          onClick={() => {
            setSelectedUser(null)
            setSentMessage('')
          }}
          style={{ background: 'transparent', color: '#0088cc', marginBottom: '20px', fontSize: '16px' }}
        >
          ← ফিরে যান
        </button>

        <div style={{ background: '#1a1a1a', padding: '20px', borderRadius: '14px', border: '1px solid #333' }}>
          <h2 style={{ marginBottom: '10px' }}>{selectedUser.nickname}</h2>
          <p style={{ color: '#aaa', marginBottom: '6px' }}>বয়স: {selectedUser.age}</p>
          <p style={{ color: '#aaa', marginBottom: '20px' }}>
            লিঙ্গ: {selectedUser.gender === 'male' ? 'ছেলে' : 'মেয়ে'}
          </p>

          <button
            onClick={sendRequest}
            disabled={sending || sentMessage.includes('পাঠানো হয়েছে')}
            style={{
              width: '100%',
              padding: '15px',
              borderRadius: '10px',
              background: sentMessage.includes('পাঠানো হয়েছে') ? '#333' : '#0088cc',
              color: '#fff',
              fontSize: '16px',
              fontWeight: '600',
              opacity: sending ? 0.7 : 1
            }}
          >
            {sending ? 'পাঠানো হচ্ছে...' : sentMessage.includes('পাঠানো হয়েছে') ? 'রিকোয়েস্ট পাঠানো হয়েছে' : 'রিকোয়েস্ট পাঠান'}
          </button>

          {sentMessage && (
            <p style={{
              textAlign: 'center',
              marginTop: '12px',
              color: sentMessage.includes('পাঠানো হয়েছে') ? '#4ade80' : '#f87171',
              fontSize: '14px'
            }}>
              {sentMessage}
            </p>
          )}
        </div>
      </div>
    )
  }

  return (
    <div style={{ padding: '20px', maxWidth: '420px', margin: '0 auto', minHeight: '100vh', background: '#0f0f0f', color: '#fff' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <button onClick={onBack} style={{ background: 'transparent', color: '#0088cc', fontSize: '16px' }}>
          ← ক্যাটাগরি
        </button>
        <span style={{ color: '#aaa', fontSize: '14px' }}>
          {oppositeGender === 'female' ? 'মেয়ে' : 'ছেলে'} • {users.length} জন অনলাইন
        </span>
      </div>

      <h2 style={{ marginBottom: '16px' }}>সচল ইউজার</h2>

      {loading ? (
        <p style={{ textAlign: 'center', color: '#aaa' }}>লোড হচ্ছে...</p>
      ) : users.length === 0 ? (
        <p style={{ textAlign: 'center', color: '#aaa', marginTop: '40px' }}>এখন কেউ অনলাইন নেই</p>
      ) : (
        <div style={{ display: 'grid', gap: '10px' }}>
          {users.map((u) => (
            <div
              key={u.id}
              onClick={() => setSelectedUser(u)}
              style={{
                padding: '16px',
                borderRadius: '12px',
                background: '#1a1a1a',
                border: '1px solid #333',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}
            >
              <div>
                <div style={{ fontWeight: '600', marginBottom: '4px' }}>{u.nickname}</div>
                <div style={{ fontSize: '13px', color: '#aaa' }}>{u.age} বছর</div>
              </div>
              <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#4ade80' }}></div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default ActiveList
