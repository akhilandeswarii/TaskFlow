
import { useState } from "react";
import { ChevronLeft, ChevronRight, CalendarDays, Clock } from "lucide-react";

type Task = {
  id: number;
  title: string;
  description: string;
  projectId: number | null;
  priority: string;
  status: string;
  dueDate: string;
};

type PlanningProps = {
  tasks: Task[];
  onReschedule: (id: number, dueDate: string) => void;
};

function formatDate(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function Planning({ tasks, onReschedule }: PlanningProps) {
  const today = formatDate(new Date());

  const [currentMonth, setCurrentMonth] = useState(
    new Date(new Date().getFullYear(), new Date().getMonth(), 1)
  );
  const [selectedDate, setSelectedDate] = useState(today);

  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();

  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const calendarDays = [
    ...Array(firstDay).fill(null),
    ...Array.from({ length: daysInMonth }, (_, index) => index + 1),
  ];

  const selectedTasks = tasks.filter(
    (task) => task.dueDate === selectedDate
  );

  const overdueTasks = tasks.filter(
    (task) =>
      task.dueDate &&
      task.dueDate < today &&
      task.status !== "Completed"
  );

  const monthName = currentMonth.toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });

  function changeMonth(direction: number) {
    setCurrentMonth(new Date(year, month + direction, 1));
  }

  function getTasksForDate(day: number) {
    const date = formatDate(new Date(year, month, day));
    return tasks.filter((task) => task.dueDate === date);
  }

  return (
    <div>
      <p className="eyebrow">TASK SCHEDULING</p>

      <div className="page-heading">
        <div>
          <h1>Planning Calendar</h1>
          <p className="subtitle">
            Schedule tasks and manage your deadlines.
          </p>
        </div>
      </div>

      <div className="planning-layout">
        <section className="panel calendar-panel">
          <div className="calendar-heading">
            <div>
              <h2>{monthName}</h2>
              <p>Choose a date to view its tasks</p>
            </div>

            <div className="calendar-navigation">
              <button onClick={() => changeMonth(-1)} aria-label="Previous month">
                <ChevronLeft size={20} />
              </button>
              <button onClick={() => changeMonth(1)} aria-label="Next month">
                <ChevronRight size={20} />
              </button>
            </div>
          </div>

          <div className="calendar-grid">
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(
              (day) => (
                <div className="calendar-weekday" key={day}>
                  {day}
                </div>
              )
            )}

            {calendarDays.map((day, index) => {
              if (day === null) {
                return <div className="calendar-empty" key={`empty-${index}`} />;
              }

              const date = formatDate(new Date(year, month, day));
              const dayTasks = getTasksForDate(day);
              const hasOverdue = dayTasks.some(
                (task) => task.dueDate < today && task.status !== "Completed"
              );

              return (
                <button
                  key={date}
                  className={`calendar-day ${
                    selectedDate === date ? "selected-day" : ""
                  } ${date === today ? "today" : ""}`}
                  onClick={() => setSelectedDate(date)}
                >
                  <span>{day}</span>
                  {dayTasks.length > 0 && (
                    <span
                      className={`calendar-dot ${
                        hasOverdue ? "overdue-dot" : ""
                      }`}
                    />
                  )}
                  {dayTasks.length > 0 && (
                    <small>{dayTasks.length} tasks</small>
                  )}
                </button>
              );
            })}
          </div>

          <div className="calendar-legend">
            <span><i className="legend-today" /> Today</span>
            <span><i className="legend-task" /> Scheduled tasks</span>
            <span><i className="legend-overdue" /> Overdue</span>
          </div>
        </section>

        <section className="panel planning-tasks">
          <div className="panel-heading">
            <div>
              <h2>Tasks for selected date</h2>
              <span>{selectedDate}</span>
            </div>
            <CalendarDays size={22} />
          </div>

          {selectedTasks.length === 0 ? (
            <div className="empty-state">
              <CalendarDays size={30} />
              <p>No tasks scheduled for this date.</p>
            </div>
          ) : (
            <div className="planning-task-list">
              {selectedTasks.map((task) => {
                const isOverdue =
                  task.dueDate < today && task.status !== "Completed";

                return (
                  <div className="planning-task" key={task.id}>
                    <div className="planning-task-top">
                      <div>
                        <h3>{task.title}</h3>
                        <p>{task.status}</p>
                      </div>
                      <span
                        className={`priority ${task.priority.toLowerCase()}`}
                      >
                        {task.priority}
                      </span>
                    </div>

                    {isOverdue && (
                      <p className="overdue-message">Overdue task</p>
                    )}

                    <label>Reschedule task</label>
                    <input
                      type="date"
                      value={task.dueDate}
                      onChange={(event) =>
                        onReschedule(task.id, event.target.value)
                      }
                    />
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </div>

      <section className="panel overdue-panel">
        <div className="panel-heading">
          <h2>Overdue Tasks</h2>
          <span>{overdueTasks.length} pending</span>
        </div>

        {overdueTasks.length === 0 ? (
          <div className="empty-state">
            <Clock size={25} />
            <p>No overdue tasks. You're on schedule!</p>
          </div>
        ) : (
          <div className="planning-task-list">
            {overdueTasks.map((task) => (
              <div className="overdue-row" key={task.id}>
                <div>
                  <h3>{task.title}</h3>
                  <p>Due: {task.dueDate}</p>
                </div>
                <span className="overdue-badge">Overdue</span>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

export default Planning;
