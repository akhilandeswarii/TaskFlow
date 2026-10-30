
import { useEffect,useState } from "react";
import Subscription from "./pages/Subscription";
import Planning from "./pages/Planning";
import Reminders from "./pages/Reminders";
import AuthPage from "./pages/AuthPage";
import { logout } from "./services/authService";
import {
  getTasks,
  createTask as apiCreateTask,
  updateTask as apiUpdateTask,
  deleteTask as apiDeleteTask,
} from "./services/taskService";
import {
  getProjects,
  createProject as apiCreateProject,
  updateProject as apiUpdateProject,
  deleteProject as apiDeleteProject,
} from "./services/projectService";
import {
  LayoutDashboard,
  FolderKanban,
  CheckSquare,
  CalendarDays,
  Bell,
  Sun,
  Moon,
  LogOut,
  Plus,
  Clock,
  ArrowUpRight,
  Pencil,
  Trash2,
  X,
  FolderOpen,
  CreditCard,
} from "lucide-react";
import "./App.css";

// PROJECT TYPE
type Project = {
  id: number;
  name: string;
  description: string;
  status: string;
};

// TASK TYPE
type Task = {
  id: number;
  title: string;
  description: string;
  projectId: number | null;
  priority: string;
  status: string;
  dueDate: string;
};

function App() {
  const [active, setActive] = useState("Overview");
  const [dark, setDark] = useState(true);
     const [isAuthenticated, setIsAuthenticated] = useState(
    () => Boolean(localStorage.getItem("token"))
  );

  // PROJECT STATES
  const [projects, setProjects] = useState<Project[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);

  const [projectName, setProjectName] = useState("");
  const [description, setDescription] = useState("");

  // TASK STATES
  const [tasks, setTasks] = useState<Task[]>([]);
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [editTaskId, setEditTaskId] = useState<number | null>(null);

  const [taskTitle, setTaskTitle] = useState("");
  const [taskDescription, setTaskDescription] = useState("");
  const [taskProject, setTaskProject] = useState("");
  const [taskPriority, setTaskPriority] = useState("Medium");
  const [taskStatus, setTaskStatus] = useState("Todo");
  const [taskDueDate, setTaskDueDate] = useState("");

  // NAVIGATION
  const navigation = [
    { name: "Overview", icon: LayoutDashboard },
    { name: "Projects", icon: FolderKanban },
    { name: "My Tasks", icon: CheckSquare },
    { name: "Planning", icon: CalendarDays },
    { name: "Reminders", icon: Bell },
    { name: "Subscription", icon: CreditCard },
  ];

  // DASHBOARD COUNTS
  const totalProjects = projects.length;
  const totalTasks = tasks.length;

  const inProgressTasks = tasks.filter(
    (task) => task.status === "In Progress"
  ).length;

  const completedTasks = tasks.filter(
    (task) => task.status === "Completed"
  ).length;

  const overdueTasks = tasks.filter(
    (task) =>
      task.dueDate &&
      task.dueDate < new Date().toISOString().split("T")[0] &&
      task.status !== "Completed"
  ).length;
useEffect(() => {
  if (!isAuthenticated) return;

  getProjects()
    .then((data) => setProjects(data))
    .catch((error) => {
      console.error("Failed to load projects:", error);
      alert("Could not load projects from the server.");
    });

  getTasks()
    .then((data) => setTasks(data))
    .catch((error) => {
      console.error("Failed to load tasks:", error);
      alert("Could not load tasks from the server.");
    });
}, [isAuthenticated]);

  // ==================================
  // PROJECT FUNCTIONS
  // ==================================

  function openCreateForm() {
    setEditId(null);
    setProjectName("");
    setDescription("");
    setShowForm(true);
  }

  async function saveProject() {
  if (!projectName.trim()) {
    alert("Please enter a project name.");
    return;
  }

  const projectData = {
    name: projectName.trim(),
    description,
    status: "Active",
  };

  try {
    if (editId !== null) {
      const updated = await apiUpdateProject(editId, projectData);

      setProjects((previous) =>
        previous.map((project) =>
          project.id === editId ? updated : project
        )
      );
    } else {
      const created = await apiCreateProject(projectData);
      setProjects((previous) => [...previous, created]);
    }

    setShowForm(false);
    setProjectName("");
    setDescription("");
    setEditId(null);
  } catch (error) {
    console.error("Project save failed:", error);
    alert("Could not save project. Check the backend.");
  }
}
  function editProject(project: Project) {
    setEditId(project.id);
    setProjectName(project.name);
    setDescription(project.description);
    setShowForm(true);
  }

 async function deleteProject(id: number) {
  try {
    await apiDeleteProject(id);

    setProjects((previous) =>
      previous.filter((project) => project.id !== id)
    );
  } catch (error) {
    console.error("Project deletion failed:", error);
    alert("Could not delete project. Please try again.");
  }
}

  // ==================================
  // TASK FUNCTIONS
  // ==================================

  function openTaskForm() {
    setEditTaskId(null);
    setTaskTitle("");
    setTaskDescription("");
    setTaskProject("");
    setTaskPriority("Medium");
    setTaskStatus("Todo");
    setTaskDueDate("");
    setShowTaskForm(true);
  }

  async function saveTask() {
  if (!taskTitle.trim()) {
    alert("Please enter a task title.");
    return;
  }

  const taskData = {
    title: taskTitle.trim(),
    description: taskDescription,
    priority: taskPriority,
    status: taskStatus,
    dueDate: taskDueDate || null,
    project: taskProject ? { id: Number(taskProject) } : null,
  };

  try {
    if (editTaskId !== null) {
      const response = await apiUpdateTask(editTaskId, taskData);
      const updated = response.data;

      const updatedTask: Task = {
        id: updated.id,
        title: updated.title,
        description: updated.description,
        projectId: updated.project?.id ?? null,
        priority: updated.priority,
        status: updated.status,
        dueDate: updated.dueDate ?? "",
      };

      setTasks((previous) =>
        previous.map((task) =>
          task.id === editTaskId ? updatedTask : task
        )
      );
    } else {
      const response = await apiCreateTask(taskData);
      const saved = response.data;

      const newTask: Task = {
        id: saved.id,
        title: saved.title,
        description: saved.description,
        projectId: saved.project?.id ?? null,
        priority: saved.priority,
        status: saved.status,
        dueDate: saved.dueDate ?? "",
      };

      setTasks((previous) => [...previous, newTask]);
    }

    setShowTaskForm(false);
    setEditTaskId(null);
    setTaskTitle("");
    setTaskDescription("");
    setTaskProject("");
    setTaskPriority("Medium");
    setTaskStatus("Todo");
    setTaskDueDate("");
  } catch (error) {
    console.error("Task save failed:", error);
    alert("Could not save task. Check the backend.");
  }
}

  function editTask(task: Task) {
    setEditTaskId(task.id);
    setTaskTitle(task.title);
    setTaskDescription(task.description);
    setTaskProject(task.projectId?.toString() ?? "");
    setTaskPriority(task.priority);
    setTaskStatus(task.status);
    setTaskDueDate(task.dueDate);
    setShowTaskForm(true);
  }

 
    async function deleteTask(id: number) {
  try {
    await apiDeleteTask(id);

    setTasks((previous) =>
      previous.filter((task) => task.id !== id)
    );
  } catch (error) {
    console.error("Task deletion failed:", error);
    alert("Could not delete task. Please try again.");
  }
}
  

async function updateTaskStatus(id: number, status: string) {
  const task = tasks.find((item) => item.id === id);

  if (!task) return;

  try {
    const response = await apiUpdateTask(id, {
      title: task.title,
      description: task.description,
      priority: task.priority,
      status: status,
      dueDate: task.dueDate || null,
      project: task.projectId
        ? { id: task.projectId }
        : null,
    });

    const updated = response.data;

    const updatedTask: Task = {
      id: updated.id,
      title: updated.title,
      description: updated.description,
      projectId: updated.project?.id ?? null,
      priority: updated.priority,
      status: updated.status,
      dueDate: updated.dueDate ?? "",
    };

    setTasks((previous) =>
      previous.map((item) =>
        item.id === id ? updatedTask : item
      )
    );
  } catch (error) {
    console.error("Task status update failed:", error);
    alert("Could not update task status.");
  }
}
  
async function rescheduleTask(id: number, dueDate: string) {
  const task = tasks.find((item) => item.id === id);

  if (!task) return;

  try {
    const response = await apiUpdateTask(id, {
      title: task.title,
      description: task.description,
      priority: task.priority,
      status: task.status,
      dueDate: dueDate || null,
      project: task.projectId
        ? { id: task.projectId }
        : null,
    });

    const updated = response.data;

    const updatedTask: Task = {
      id: updated.id,
      title: updated.title,
      description: updated.description,
      projectId: updated.project?.id ?? null,
      priority: updated.priority,
      status: updated.status,
      dueDate: updated.dueDate ?? "",
    };

    setTasks((previous) =>
      previous.map((item) =>
        item.id === id ? updatedTask : item
      )
    );
  } catch (error) {
    console.error("Task rescheduling failed:", error);
    alert("Could not reschedule task.");
  }
}

  if (!isAuthenticated) {
  return (
    <AuthPage
      onAuthSuccess={() => setIsAuthenticated(true)}
    />
  );
}
  // ==================================
  // MAIN UI
  // ==================================

  return (
    <div className={`app ${dark ? "dark" : "light"}`}>
      {/* SIDEBAR */}

      <aside className="sidebar">
        <div className="brand">
          <div className="brand-symbol">
            <span></span>
            <span></span>
          </div>
          <h2>TaskFlow</h2>
        </div>

        <nav className="navigation">
          {navigation.map(({ name, icon: Icon }) => (
            <button
              key={name}
              className={`nav-item ${
                active === name ? "selected" : ""
              }`}
              onClick={() => setActive(name)}
            >
              <Icon size={20} />
              <span>{name}</span>
            </button>
          ))}
        </nav>

        <div className="sidebar-footer">
          <span className="user-badge">USER</span>
          <p>Welcome to TaskFlow</p>
        </div>
      </aside>

      {/* MAIN CONTENT */}

      <main className="main">
        <header className="topbar">
          <div>
            <p className="eyebrow">TASK MANAGEMENT</p>
            <h3>Welcome, Akki</h3>
          </div>

          <div className="top-actions">
            <button
              className="top-button"
              onClick={() => setDark(!dark)}
            >
              {dark ? <Sun size={18} /> : <Moon size={18} />}
              {dark ? "Light mode" : "Dark mode"}
            </button>

            <button
              className="top-button"
              onClick={() =>
                {
  logout();
  setIsAuthenticated(false);
}
              }
            >
              <LogOut size={18} /> Sign out
            </button>
          </div>
        </header>

        <section className="dashboard">

          {/* ==================================
              OVERVIEW PAGE
          ================================== */}

          {active === "Overview" && (
            <>
              <p className="eyebrow">OVERVIEW</p>

              <h1>Work at a glance</h1>

              <p className="subtitle">
                Your assigned workload, plans and reminders.
              </p>

              <div className="stats-grid">
                <div className="stat-card blue">
                  <p className="stat-title">PROJECTS</p>
                  <h2>{totalProjects}</h2>
                  <p className="stat-subtitle">active workspace</p>
                </div>

                <div className="stat-card cyan">
                  <p className="stat-title">TASKS</p>
                  <h2>{totalTasks}</h2>
                  <p className="stat-subtitle">in current scope</p>
                </div>

                <div className="stat-card yellow">
                  <p className="stat-title">IN PROGRESS</p>
                  <h2>{inProgressTasks}</h2>
                  <p className="stat-subtitle">currently moving</p>
                </div>

                <div className="stat-card purple">
                  <p className="stat-title">OVERDUE</p>
                  <h2>{overdueTasks}</h2>
                  <p className="stat-subtitle">needs attention</p>
                </div>
              </div>

              <div className="content-grid">
                <section className="panel">
                  <div className="panel-heading">
                    <h2>Workflow</h2>
                    <span>Live totals</span>
                  </div>

                  {[
                    { name: "TODO", value: tasks.filter(t => t.status === "Todo").length },
                    { name: "IN PROGRESS", value: inProgressTasks },
                    { name: "COMPLETED", value: completedTasks },
                  ].map((item) => (
                    <div className="workflow-row" key={item.name}>
                      <strong>{item.name}</strong>

                      <div className="progress-track">
                        <div
                          className="progress-fill"
                          style={{
                            width:
                              totalTasks > 0
                                ? `${(item.value / totalTasks) * 100}%`
                                : "0%",
                          }}
                        ></div>
                      </div>

                      <b>{item.value}</b>
                    </div>
                  ))}
                </section>

                <section className="panel">
                  <div className="panel-heading">
                    <h2>Recent tasks</h2>
                    <span>{tasks.length} shown</span>
                  </div>

                  {tasks.length === 0 ? (
                    <div className="empty-state">
                      <CheckSquare size={28} />
                      <p>No tasks in this scope.</p>
                    </div>
                  ) : (
                    tasks.slice(-3).reverse().map((task) => (
                      <div className="workflow-row" key={task.id}>
                        <strong>{task.title}</strong>
                        <span>{task.status}</span>
                      </div>
                    ))
                  )}
                </section>
              </div>

              <div className="bottom-grid">
                <section className="panel">
                  <div className="panel-heading">
                    <h2>Upcoming deadlines</h2>
                    <Clock size={19} />
                  </div>

                  {tasks.filter(
                    (task) =>
                      task.dueDate &&
                      task.status !== "Completed"
                  ).length === 0 ? (
                    <div className="empty-state">
                      <CalendarDays size={25} />
                      <p>No upcoming deadlines.</p>
                    </div>
                  ) : (
                    tasks
                      .filter(
                        (task) =>
                          task.dueDate &&
                          task.status !== "Completed"
                      )
                      .sort((a, b) =>
                        a.dueDate.localeCompare(b.dueDate)
                      )
                      .slice(0, 3)
                      .map((task) => (
                        <div className="workflow-row" key={task.id}>
                          <strong>{task.title}</strong>
                          <span>{task.dueDate}</span>
                        </div>
                      ))
                  )}
                </section>

                <section className="panel">
                  <div className="panel-heading">
                    <h2>Quick actions</h2>
                    <ArrowUpRight size={19} />
                  </div>

                  <div className="quick-actions">
                    <button onClick={openCreateForm}>
                      <Plus size={18} /> Create project
                    </button>

                    <button onClick={openTaskForm}>
                      <Plus size={18} /> Create task
                    </button>
                  </div>
                </section>
              </div>
            </>
          )}

          {/* ==================================
              PROJECTS PAGE
          ================================== */}

          {active === "Projects" && (
            <>
              <p className="eyebrow">WORKSPACE</p>

              <div className="page-heading">
                <div>
                  <h1>My Projects</h1>
                  <p className="subtitle">
                    Organize and manage all your projects.
                  </p>
                </div>

                <button
                  className="create-button"
                  onClick={openCreateForm}
                >
                  <Plus size={19} /> Create Project
                </button>
              </div>

              <div className="project-summary">
                <div>
                  <FolderKanban size={25} />
                  <span>Total Projects</span>
                </div>
                <h2>{totalProjects}</h2>
              </div>

              {projects.length === 0 ? (
                <div className="panel project-empty">
                  <FolderOpen size={48} />
                  <h2>No projects yet</h2>
                  <p>Create your first project to get started.</p>

                  <button
                    className="create-button"
                    onClick={openCreateForm}
                  >
                    <Plus size={18} /> Create your first project
                  </button>
                </div>
              ) : (
                <div className="projects-grid">
                  {projects.map((project) => (
                    <div className="project-card" key={project.id}>
                      <div className="project-card-top">
                        <div className="project-icon">
                          <FolderKanban size={23} />
                        </div>

                        <span className="project-status">
                          {project.status}
                        </span>
                      </div>

                      <h2>{project.name}</h2>

                      <p>
                        {project.description ||
                          "No description provided."}
                      </p>

                      <div className="project-card-footer">
                        <span>
                          {tasks.filter(
                            (task) => task.projectId === project.id
                          ).length}{" "}
                          tasks
                        </span>

                        <div>
                          <button
                            title="Edit project"
                            onClick={() => editProject(project)}
                          >
                            <Pencil size={17} />
                          </button>

                          <button
                            title="Delete project"
                            onClick={() =>
                              deleteProject(project.id)
                            }
                          >
                            <Trash2 size={17} />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}

          {/* ==================================
              MY TASKS PAGE
          ================================== */}

          {active === "My Tasks" && (
            <>
              <p className="eyebrow">TASK MANAGEMENT</p>

              <div className="page-heading">
                <div>
                  <h1>My Tasks</h1>
                  <p className="subtitle">
                    Organize, prioritize and track your daily work.
                  </p>
                </div>

                <button
                  className="create-button"
                  onClick={openTaskForm}
                >
                  <Plus size={19} /> Create Task
                </button>
              </div>

              {/* TASK STATISTICS */}

              <div className="task-summary-grid">
                {[
                  { label: "TOTAL TASKS", value: totalTasks },
                  {
                    label: "TODO",
                    value: tasks.filter(
                      (task) => task.status === "Todo"
                    ).length,
                  },
                  {
                    label: "IN PROGRESS",
                    value: inProgressTasks,
                  },
                  {
                    label: "COMPLETED",
                    value: completedTasks,
                  },
                ].map((item) => (
                  <div className="stat-card" key={item.label}>
                    <p className="stat-title">{item.label}</p>
                    <h2>{item.value}</h2>
                  </div>
                ))}
              </div>

              {/* TASK LIST */}

              <div className="task-list">
                {tasks.length === 0 ? (
                  <div className="panel project-empty">
                    <CheckSquare size={48} />
                    <h2>No tasks yet</h2>
                    <p>
                      Create your first task and start managing your work.
                    </p>

                    <button
                      className="create-button"
                      onClick={openTaskForm}
                    >
                      <Plus size={18} /> Create your first task
                    </button>
                  </div>
                ) : (
                  tasks.map((task) => {
                    const project = projects.find(
                      (p) => p.id === task.projectId
                    );

                    return (
                      <div className="task-card" key={task.id}>
                        <div className="task-card-main">
                          <div>
                            <h2>{task.title}</h2>

                            <p>
                              {task.description || "No description"}
                            </p>

                            <div className="task-meta">
                              <span>
                                {project?.name || "No project"}
                              </span>

                              <span
                                className={`priority ${task.priority.toLowerCase()}`}
                              >
                                {task.priority} Priority
                              </span>

                              <span>
                                {task.dueDate
                                  ? `Due: ${task.dueDate}`
                                  : "No due date"}
                              </span>
                            </div>
                          </div>

                          <select
                            className="task-status"
                            value={task.status}
                            onChange={(e) =>
                              updateTaskStatus(
                                task.id,
                                e.target.value
                              )
                            }
                          >
                            <option value="Todo">Todo</option>
                            <option value="In Progress">
                              In Progress
                            </option>
                            <option value="Completed">
                              Completed
                            </option>
                          </select>
                        </div>

                        <div className="task-actions">
                          <button onClick={() => editTask(task)}>
                            <Pencil size={17} /> Edit
                          </button>

                          <button
                            onClick={() => deleteTask(task.id)}
                          >
                            <Trash2 size={17} /> Delete
                          </button>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </>
          )}

          {/* OTHER PLACEHOLDER PAGES */}
          {active === "Subscription" && <Subscription />}
           {active === "Planning" && (
          <Planning tasks={tasks} onReschedule={rescheduleTask} />
        )}
      {active === "Reminders" && (
        <Reminders tasks={tasks}/>
      )}
 
        </section>
      </main>

      {/* ==================================
          PROJECT CREATE / EDIT MODAL
      ================================== */}

      {showForm && (
        <div className="modal-overlay">
          <div className="project-modal">
            <div className="modal-heading">
              <div>
                <p className="eyebrow">PROJECT MANAGEMENT</p>
                <h2>
                  {editId !== null
                    ? "Edit Project"
                    : "Create Project"}
                </h2>
              </div>

              <button
                className="close-button"
                onClick={() => setShowForm(false)}
              >
                <X size={21} />
              </button>
            </div>

            <label>Project Name *</label>

            <input
              type="text"
              placeholder="Enter project name"
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
            />

            <label>Description</label>

            <textarea
              placeholder="Describe your project..."
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />

            <div className="modal-actions">
              <button
                className="cancel-button"
                onClick={() => setShowForm(false)}
              >
                Cancel
              </button>

              <button
                className="create-button"
                onClick={saveProject}
              >
                {editId !== null
                  ? "Save Changes"
                  : "Create Project"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ==================================
          TASK CREATE / EDIT MODAL
      ================================== */}

      {showTaskForm && (
        <div className="modal-overlay">
          <div className="project-modal">
            <div className="modal-heading">
              <div>
                <p className="eyebrow">TASK MANAGEMENT</p>
                <h2>
                  {editTaskId !== null
                    ? "Edit Task"
                    : "Create Task"}
                </h2>
              </div>

              <button
                className="close-button"
                onClick={() => setShowTaskForm(false)}
              >
                <X size={21} />
              </button>
            </div>

            <label>Task Title *</label>

            <input
              type="text"
              placeholder="Enter task title"
              value={taskTitle}
              onChange={(e) => setTaskTitle(e.target.value)}
            />

            <label>Description</label>

            <textarea
              rows={3}
              placeholder="Enter task description"
              value={taskDescription}
              onChange={(e) =>
                setTaskDescription(e.target.value)
              }
            />

            <label>Project</label>

            <select
              className="task-form-select"
              value={taskProject}
              onChange={(e) => setTaskProject(e.target.value)}
            >
              <option value="">No Project</option>

              {projects.map((project) => (
                <option key={project.id} value={project.id}>
                  {project.name}
                </option>
              ))}
            </select>

            <label>Priority</label>

            <select
              className="task-form-select"
              value={taskPriority}
              onChange={(e) => setTaskPriority(e.target.value)}
            >
              <option value="Low">Low</option>
              <option value="Medium">Medium</option>
              <option value="High">High</option>
            </select>

            <label>Status</label>

            <select
              className="task-form-select"
              value={taskStatus}
              onChange={(e) => setTaskStatus(e.target.value)}
            >
              <option value="Todo">Todo</option>
              <option value="In Progress">In Progress</option>
              <option value="Completed">Completed</option>
            </select>

            <label>Due Date</label>

            <input
              type="date"
              value={taskDueDate}
              onChange={(e) => setTaskDueDate(e.target.value)}
            />

            <div className="modal-actions">
              <button
                className="cancel-button"
                onClick={() => setShowTaskForm(false)}
              >
                Cancel
              </button>

              <button
                className="create-button"
                onClick={saveTask}
              >
                {editTaskId !== null
                  ? "Save Changes"
                  : "Create Task"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
