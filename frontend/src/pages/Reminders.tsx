
import {
  Bell,
  CalendarDays,
  Clock,
  AlertTriangle,
  CheckCircle,
} from "lucide-react";

type Task = {
  id: number;
  title: string;
  description: string;
  projectId: number | null;
  priority: string;
  status: string;
  dueDate: string;
};

type RemindersProps = {
  tasks: Task[];
};

function Reminders({ tasks }: RemindersProps) {
  // Get today's date in YYYY-MM-DD format
  const today = new Date();
  const todayString = [
    today.getFullYear(),
    String(today.getMonth() + 1).padStart(2, "0"),
    String(today.getDate()).padStart(2, "0"),
  ].join("-");

  // Ignore completed tasks
  const pendingTasks = tasks.filter(
    (task) => task.status.toLowerCase() !== "completed"
  );

  const dueToday = pendingTasks.filter(
    (task) => task.dueDate === todayString
  );

  const upcoming = pendingTasks.filter(
    (task) => task.dueDate > todayString
  );

  const overdue = pendingTasks.filter(
    (task) => task.dueDate < todayString
  );

  const reminderTasks = [...pendingTasks]
    .filter((task) => task.dueDate)
    .sort((a, b) => a.dueDate.localeCompare(b.dueDate));

  const reminderStats = [
    {
      title: "Due Today",
      count: dueToday.length,
      icon: CalendarDays,
    },
    {
      title: "Upcoming",
      count: upcoming.length,
      icon: Clock,
    },
    {
      title: "Overdue",
      count: overdue.length,
      icon: AlertTriangle,
    },
  ];

  return (
    <div>
      <p className="eyebrow">TASK NOTIFICATIONS</p>

      <div className="page-heading">
        <div>
          <h1>Reminders</h1>
          <p className="subtitle">
            Stay updated with your task deadlines.
          </p>
        </div>
      </div>

      <div className="stats-grid">
        {reminderStats.map((item) => {
          const Icon = item.icon;

          return (
            <div className="stat-card" key={item.title}>
              <div className="stat-icon">
                <Icon size={22} />
              </div>
              <div>
                <p>{item.title}</p>
                <h2>{item.count}</h2>
              </div>
            </div>
          );
        })}
      </div>

      <div className="dashboard-panel">
        <div className="panel-heading">
          <div>
            <h2>Upcoming Reminders</h2>
            <p className="subtitle">
              Tasks that need your attention.
            </p>
          </div>
          <Bell size={22} />
        </div>

        {reminderTasks.length === 0 ? (
          <div className="empty-state">
            <CheckCircle size={35} />
            <h3>You're all caught up!</h3>
            <p>No reminders available right now.</p>
          </div>
        ) : (
          <div className="planning-task-list">
            {reminderTasks.map((task) => {
              const isOverdue = task.dueDate < todayString;
              const isToday = task.dueDate === todayString;

              return (
                <div className="planning-task" key={task.id}>
                  <div className="planning-task-top">
                    <div>
                      <h3>{task.title}</h3>
                      <p>{task.status}</p>
                    </div>

                    <span
                      className={
                        isOverdue ? "overdue-badge" : "task-status"
                      }
                    >
                      {isOverdue
                        ? "Overdue"
                        : isToday
                        ? "Due Today"
                        : "Upcoming"}
                    </span>
                  </div>

                  <p style={{ marginTop: "12px" }}>
                    Due: {task.dueDate}
                  </p>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div className="dashboard-panel">
        <div className="panel-heading">
          <div>
            <h2>Notification Settings</h2>
            <p className="subtitle">
              Manage how you receive reminders.
            </p>
          </div>
        </div>

        <div className="notification-setting">
          <div>
            <h3>Email Notifications</h3>
            <p>Receive task deadline reminders by email.</p>
          </div>
          <span className="notification-status">
            Coming soon
          </span>
        </div>
      </div>
    </div>
  );
}

export default Reminders;
