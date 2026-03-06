import { 
  collection, addDoc, getDocs, getDoc,
  doc, updateDoc, deleteDoc, query, 
  orderBy, limit, where, serverTimestamp,
  onSnapshot, increment, runTransaction
} from 'firebase/firestore'
import { db } from './firebase'

// BLOG POSTS
export const getBlogPosts = async (publishedOnly = true) => {
  const q = publishedOnly 
    ? query(collection(db, 'blog_posts'), 
        where('published', '==', true),
        orderBy('createdAt', 'desc'))
    : query(collection(db, 'blog_posts'), 
        orderBy('createdAt', 'desc'))
  const snap = await getDocs(q)
  return snap.docs.map(d => ({ id: d.id, ...d.data() }))
}

export const getBlogPost = async (id: string) => {
  const snap = await getDoc(doc(db, 'blog_posts', id))
  return snap.exists() ? { id: snap.id, ...snap.data() } : null
}

export const createBlogPost = async (data: any) => {
  return addDoc(collection(db, 'blog_posts'), {
    ...data, 
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
    published: false
  })
}

export const updateBlogPost = async (id: string, data: any) => {
  return updateDoc(doc(db, 'blog_posts', id), {
    ...data,
    updatedAt: serverTimestamp()
  })
}

export const deleteBlogPost = async (id: string) => {
  return deleteDoc(doc(db, 'blog_posts', id))
}

// GUESTBOOK
export const getGuestbookEntries = (callback: any) => {
  const q = query(
    collection(db, 'guestbook'),
    orderBy('createdAt', 'desc'),
    limit(100)
  )
  return onSnapshot(q, snap => {
    const entries = snap.docs.map(d => ({ id: d.id, ...d.data() }))
    callback(entries)
  })
}

export const addGuestbookEntry = async (data: any) => {
  // Get and increment visitor counter
  const counterRef = doc(db, 'meta', 'counters')
  let visitorNum = 1
  
  await runTransaction(db, async (transaction) => {
    const counterDoc = await transaction.get(counterRef)
    if (!counterDoc.exists()) {
      transaction.set(counterRef, { guestbook_count: 1 })
      visitorNum = 1
    } else {
      visitorNum = (counterDoc.data().guestbook_count || 0) + 1
      transaction.update(counterRef, { 
        guestbook_count: increment(1) 
      })
    }
  })
  
  const entry = await addDoc(collection(db, 'guestbook'), {
    ...data,
    visitorNum,
    createdAt: serverTimestamp()
  })
  
  return { id: entry.id, visitorNum }
}

export const deleteGuestbookEntry = async (id: string) => {
  return deleteDoc(doc(db, 'guestbook', id))
}

// PROJECTS
export const getProjects = async () => {
  const q = query(
    collection(db, 'projects'), 
    orderBy('order', 'asc')
  )
  const snap = await getDocs(q)
  return snap.docs.map(d => ({ id: d.id, ...d.data() }))
}

export const createProject = async (data: any) => {
  return addDoc(collection(db, 'projects'), {
    ...data,
    createdAt: serverTimestamp()
  })
}

export const updateProject = async (id: string, data: any) => {
  return updateDoc(doc(db, 'projects', id), data)
}

export const deleteProject = async (id: string) => {
  return deleteDoc(doc(db, 'projects', id))
}

// EXPERIENCE
export const getExperience = async () => {
  const q = query(
    collection(db, 'experience'),
    orderBy('order', 'asc')
  )
  const snap = await getDocs(q)
  return snap.docs.map(d => ({ id: d.id, ...d.data() }))
}

export const createExperience = async (data: any) => {
  return addDoc(collection(db, 'experience'), {
    ...data,
    createdAt: serverTimestamp()
  })
}

export const updateExperience = async (id: string, data: any) => {
  return updateDoc(doc(db, 'experience', id), data)
}

export const deleteExperience = async (id: string) => {
  return deleteDoc(doc(db, 'experience', id))
}

// VISITOR TRACKING
export const addVisitor = async (data: any) => {
  return addDoc(collection(db, 'visitors'), {
    ...data,
    timestamp: serverTimestamp()
  })
}

export const getVisitors = async () => {
  const snap = await getDocs(query(collection(db, 'visitors'), orderBy('timestamp', 'desc')))
  return snap.docs.map(d => ({ id: d.id, ...d.data() }))
}
