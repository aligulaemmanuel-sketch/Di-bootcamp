// Exercise 5: useEffect to fetch typed data with loading and error states.
import { useEffect, useState } from 'react'

interface Geo {
  lat: string
  lng: string
}

interface Address {
  street: string
  suite: string
  city: string
  zipcode: string
  geo: Geo
}

interface Company {
  name: string
  catchPhrase: string
  bs: string
}

interface User {
  id: number
  name: string
  username: string
  email: string
  address: Address
  phone: string
  website: string
  company: Company
}

const API_URL = 'https://jsonplaceholder.typicode.com/users'

function UserList() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const controller = new AbortController()

    const fetchUsers = async (): Promise<void> => {
      try {
        const response = await fetch(API_URL, { signal: controller.signal })
        if (!response.ok) {
          throw new Error(`Request failed with status ${response.status}`)
        }
        const data: User[] = await response.json()
        setUsers(data)
        setError(null)
      } catch (err) {
        // Ignore the abort that happens when the component unmounts.
        if (err instanceof DOMException && err.name === 'AbortError') return
        setError(err instanceof Error ? err.message : 'Something went wrong')
      } finally {
        if (!controller.signal.aborted) setLoading(false)
      }
    }

    fetchUsers()

    // Cleanup: cancel the request if the component unmounts mid-fetch.
    return () => controller.abort()
  }, [])

  if (loading) return <p>Loading users…</p>
  if (error) return <p role="alert">Error: {error}</p>

  return (
    <ul className="user-list">
      {users.map((user) => (
        <li key={user.id} className="card">
          <strong>{user.name}</strong> (@{user.username})
          <br />
          {user.email} · {user.address.city}
          <br />
          {user.company.name}
        </li>
      ))}
    </ul>
  )
}

export default UserList
