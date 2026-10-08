import { Bird, Mountain, Salad, Waves } from 'lucide-react'
import { NavLink } from 'react-router-dom'

const categories = [
  { label: 'Mountain', path: '/mountain', icon: Mountain },
  { label: 'Beaches', path: '/beaches', icon: Waves },
  { label: 'Birds', path: '/birds', icon: Bird },
  { label: 'Food', path: '/food', icon: Salad },
]

function Navigation() {
  return (
    <nav className="main-nav" aria-label="Photo categories">
      {categories.map(({ label, path, icon: Icon }) => (
        <NavLink key={path} to={path}>
          <Icon size={15} strokeWidth={1.8} aria-hidden="true" />
          {label}
        </NavLink>
      ))}
    </nav>
  )
}

export default Navigation