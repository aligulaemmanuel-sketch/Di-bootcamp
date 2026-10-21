// Exercise 4: optional props with default values.

interface UserCardProps {
  name?: string
  age?: number
  role?: string
}

function UserCard({ name = 'Anonymous', age, role = 'Guest' }: UserCardProps) {
  return (
    <div className="card">
      <h3>{name}</h3>
      <p>Age: {age !== undefined ? age : 'Not specified'}</p>
      <p>Role: {role}</p>
    </div>
  )
}

export default UserCard
