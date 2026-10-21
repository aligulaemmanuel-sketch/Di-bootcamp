// Exercise 2: a functional component with typed props.

interface GreetingProps {
  name: string
  messageCount: number
}

function Greeting({ name, messageCount }: GreetingProps) {
  return (
    <div className="card">
      <h3>Hello, {name}!</h3>
      <p>
        You have {messageCount} unread {messageCount === 1 ? 'message' : 'messages'}.
      </p>
    </div>
  )
}

export default Greeting
