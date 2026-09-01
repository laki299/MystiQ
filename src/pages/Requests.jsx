import { useState, useEffect } from 'react'
import {
  collection, query, where, onSnapshot,
  updateDoc, doc, writeBatch, getDocs
} from 'firebase/firestore'
import { db } from '../firebase'

function Requests({ user }) {
  const [requests, setRequests] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const q = query(
      collection(db, 'requests'),
      where('toUserId', '==', String(user.id)),
      where('status', '==', 'pending')
    )

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const list = []
      snapshot.forEach((doc) => {
        list.push({ id: doc.id, ...doc.data() })
      })
      setRequests(list)
      setLoading(false)
    })

    return () => unsubscribe()
  }, [user.id])

  const handleAccept = async (request) => {
    try {
      const batch = writeBatch(db)

      // এই রিকোয়েস্টটা accepted করা
      const reqRef = doc(db, 'requests', request.id)
      batch.update(reqRef, { status: 'accepted' })

      // এই ইউজারের অন্য সব pending রিকোয়েস্ট বাতিল করা
      const q1 = query(
        collection(db, 'requests'),
        where('fromUserId', '==', String(user.id)),
        where('status', '==', 'pending')
      )
      const q2 = query(
        collection(db, 'requests'),
        where('toUserId', '==', String(user.id)),
        where('status', '==', 'pending')
      )

      const [snap1, snap2] = await Promise.all([getDocs(q1), getDocs(q2)])

      snap1.forEach((d) => {
        if (d.id !== request.id) batch.update(d.ref, { status: 'cancelled' })
      })
      snap2.forEach((d) => {
        if (d.id !== request.id) batch.update(d.ref, { status: 'cancelled' })
      })

      await batch.commit()

      // পার্সোনাল চ্যাটে নিয়ে যাওয়া
      const tg = window.Telegram?.WebApp
      if (tg) {
        tg.openTelegramLink(`https://t.me/${request.fromUserId}`)
        // অথবা: tg.openTelegramLink(`tg://user?id=${request.fromUserId}`)
      } else {
        window.open(`https://t.me/${request.fromUserId}`, '_blank')
      }

    } catch (err) {
      console.error(err)
      alert('Accept করতে সমস্যা হয়েছে')
    }
  }

  const handleReject = async (requestId) => {
    try {
      await updateDoc(doc(db, 'requests', requestId), {
        status: 'rejected'
      })
    } catch (err) {
      console.error(err)
      alert('Reject করতে সমস্যা হয়েছে')
    }
  }

  if (loading) {
    return <p style={{ textAlign: 'center', color: '#aaa', padding: 20 }}>লোড হচ্ছে...</p>
  }

  if (requests.length === 0) {
    return (
      <div style={{ padding: 20, textAlign: 'center', color: '#aaa' }}>
        কোনো নতুন রিকোয়েস্ট নেই
      </div>
    )
  }

  return (
    <div style={{ padding: '20px', maxWidth: '420px', margin: '0 auto' }}>
      <h2 style={{ marginBottom: '16px' }}>রিকোয়েস্ট ({requests.length})</h2>

      <div style={{ display: 'grid', gap: '12px' }}>
        {requests.map((req) => (
          <div key={req.id} style={{
            background: '#1a1a1a',
            padding: '16px',
            borderRadius: '12px',
            border: '1px solid #333'
          }}>
            <div style={{ marginBottom: '12px' }}>
              <div style={{ fontWeight: '600', fontSize: '17px' }}>{req.fromNickname}</div>
              <div style={{ color: '#aaa', fontSize: '14px' }}>{req.fromAge} বছর</div>
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                onClick={() => handleAccept(req)}
                style={{
                  flex: 1,
                  padding: '12px',
                  borderRadius: '8px',
                  background: '#0088cc',
                  color: '#fff',
                  fontWeight: '600'
                }}
              >
                Accept
              </button>
              <button
                onClick={() => handleReject(req.id)}
                style={{
                  flex: 1,
                  padding: '12px',
                  borderRadius: '8px',
                  background: '#333',
                  color: '#fff'
                }}
              >
                Reject
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default Requests
