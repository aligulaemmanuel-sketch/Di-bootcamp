import './App.css'
import Greeting from './components/Greeting'
import Counter from './components/Counter'
import UserCard from './components/UserCard'
import UserList from './components/UserList'
import BookApp from './components/BookApp'

function App() {
  return (
    <main className="app">
      <h1>React + TypeScript Exercises</h1>

      <section>
        <h2>Exercise 2: Greeting (typed props)</h2>
        <Greeting name="Ada" messageCount={3} />
      </section>

      <section>
        <h2>Exercise 3: Counter (useState)</h2>
        <Counter />
      </section>

      <section>
        <h2>Exercise 4: UserCard (optional props)</h2>
        <div className="row">
          <UserCard name="Grace Hopper" age={85} role="Admin" />
          <UserCard name="Linus" />
          <UserCard />
        </div>
      </section>

      <section>
        <h2>Exercise 5: UserList (useEffect + fetch)</h2>
        <UserList />
      </section>

      <section>
        <h2>Daily Challenge: Book List (generic List)</h2>
        <BookApp />
      </section>
    </main>
  )
}

export default App
