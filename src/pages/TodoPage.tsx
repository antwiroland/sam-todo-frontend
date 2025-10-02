import { useEffect, useState } from 'react'
import { useAuth } from '../provider/AuthProvider'

interface Task {
  TaskName: string
  UserId: string
  Status: string
  TaskId: string
  UserEmail: string
  CreatedAt: string
  ExpiryDate?: string
}

const TodoPage: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([])
  const [newTask, setNewTask] = useState('')
  const [expiryDate, setExpiryDate] = useState('') // manual expiration date
  const [loading, setLoading] = useState(false)
  const { tokens, logout, isAuthenticated } = useAuth()

  // Fetch all tasks for the logged-in user
  const fetchTasks = async () => {
    if (!tokens?.idToken) return
    try {
      setLoading(true)
      const response = await fetch('/api/tasks', {
        headers: {
          'Authorization': `Bearer ${tokens.idToken}`,
          'Content-Type': 'application/json'
        }
      })
      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`Failed to fetch tasks: ${response.status} ${errorText}`)
      }
      const data = await response.json()
      setTasks(data.tasks || [])
    } catch (error) {
      console.error('Error fetching tasks:', error)
      alert(`Error fetching tasks. Check console for details.`)
    } finally {
      setLoading(false)
    }
  }

  // Add a new task
  const addTask = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newTask.trim() || !tokens?.idToken) return

    try {
      const taskId = `task-${Date.now()}`
      // Use manual expiry if provided, else default 24 hours
      const taskExpiry = expiryDate
        ? new Date(expiryDate).toISOString()
        : new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()

      const response = await fetch('/api/tasks', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${tokens.idToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          TaskId: taskId,
          TaskName: newTask,
          ExpiryDate: taskExpiry
        })
      })

      if (!response.ok) throw new Error('Failed to create task')

      setNewTask('')
      setExpiryDate('') // reset manual expiry
      fetchTasks()
    } catch (error) {
      console.error('Error creating task:', error)
    }
  }

  // Update task status
  const updateTaskStatus = async (taskId: string, newStatus: string) => {
    if (!tokens?.idToken) return
    try {
      const response = await fetch('/api/tasks', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${tokens.idToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ TaskId: taskId, Status: newStatus })
      })
      if (!response.ok) throw new Error('Failed to update task')
      fetchTasks()
    } catch (error) {
      console.error('Error updating task:', error)
    }
  }

  // Delete a task
  const deleteTask = async (taskId: string) => {
    if (!tokens?.idToken) return
    try {
      const response = await fetch('/api/tasks', {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${tokens.idToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ TaskId: taskId })
      })
      if (!response.ok) throw new Error('Failed to delete task')
      fetchTasks()
    } catch (error) {
      console.error('Error deleting task:', error)
    }
  }

  // Calculate remaining time in hours
  const getRemainingHours = (expiryDate: string) => {
    const now = Date.now()
    const expiry = new Date(expiryDate).getTime()
    return Math.max(Math.floor((expiry - now) / (1000 * 60 * 60)), 0)
  }

  useEffect(() => {
    if (isAuthenticated) fetchTasks()
  }, [isAuthenticated])

  if (!isAuthenticated) return null

  return (
    <div className="min-h-screen flex flex-col items-center justify-start bg-gray-100 py-12 px-4">
      <div className="w-full max-w-lg bg-white p-6 rounded-2xl shadow-xl">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800">My Todo List</h1>
          <button
            onClick={logout}
            className="px-4 py-2 text-sm text-red-600 hover:text-red-800"
          >
            Logout
          </button>
        </div>

        {/* Add Task Form */}
        <form onSubmit={addTask} className="mb-6 flex flex-col gap-2">
          <input
            type="text"
            placeholder="Add a new task..."
            value={newTask}
            onChange={(e) => setNewTask(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <input
            type="datetime-local"
            value={expiryDate}
            onChange={(e) => setExpiryDate(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <button
            type="submit"
            className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            Add Task
          </button>
        </form>

        {/* Tasks List */}
        {loading ? (
          <div className="text-center py-4">Loading tasks...</div>
        ) : (
          <div className="space-y-3">
            {tasks.map((task) => (
              <div
                key={task.TaskId}
                className="p-4 border border-gray-200 rounded-lg shadow-sm flex justify-between items-center"
              >
                <div className="flex flex-col space-y-1">
                  <div className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      disabled={task.Status === 'Expired'}
                      checked={task.Status === 'Completed'}
                      onChange={() =>
                        updateTaskStatus(
                          task.TaskId,
                          task.Status === 'Pending' ? 'Completed' : 'Pending'
                        )
                      }
                      className="h-5 w-5 text-indigo-600 rounded focus:ring-indigo-500"
                    />
                    <span
                      className={
                        task.Status === 'Completed'
                          ? 'line-through text-gray-500'
                          : task.Status === 'Expired'
                          ? 'text-red-600 line-through'
                          : 'text-gray-900'
                      }
                    >
                      {task.TaskName}
                    </span>
                  </div>
                  {task.ExpiryDate && (
                    <span className="text-sm text-gray-400">
                      {task.Status === 'Expired'
                        ? 'Expired'
                        : `Expires in ${getRemainingHours(task.ExpiryDate)} hrs`}
                    </span>
                  )}
                </div>
                <button
                  onClick={() => deleteTask(task.TaskId)}
                  className="px-3 py-1 text-sm text-red-600 hover:text-red-800 border border-red-300 rounded hover:bg-red-50"
                >
                  Delete
                </button>
              </div>
            ))}
            {tasks.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                No tasks yet. Add your first task above!
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default TodoPage
