import React, { useEffect, useState } from "react";

import {
  Navigate,
  NavLink,
  Route,
  Routes,
  useNavigate
} from "react-router-dom";

import {
  Activity,
  ArrowLeftRight,
  Boxes,
  CheckCircle2,
  ClipboardCheck,
  LayoutDashboard,
  LogOut,
  Menu,
  PackageCheck,
  ShieldCheck,
  Truck,
  Users,
  Warehouse,
  RefreshCw
} from "lucide-react";

import { useAuth } from "./AuthContext";
import { userApi } from "./api";

const roles = [
  "Admin",
  "Operations Manager",
  "Warehouse Manager",
  "Logistics Staff"
];

const navigation = {
  Admin: [
    ["Dashboard", "/", LayoutDashboard],
    ["User Management", "/users", Users],
    ["RBAC Demonstration", "/rbac", ShieldCheck],
    ["System Monitoring", "/monitoring", Activity]
  ],

  "Operations Manager": [
    ["Dashboard", "/", LayoutDashboard],
    ["Transfer Requests", "/transfers", ArrowLeftRight],
    ["Approvals", "/approvals", ClipboardCheck],
    ["Operations Monitoring", "/monitoring", Activity]
  ],

  "Warehouse Manager": [
    ["Dashboard", "/", LayoutDashboard],
    ["Warehouse Operations", "/warehouse", Warehouse],
    ["Incoming Transfers", "/incoming", Boxes],
    ["Outgoing Transfers", "/outgoing", PackageCheck]
  ],

  "Logistics Staff": [
    ["Dashboard", "/", LayoutDashboard],
    ["Assigned Transfers", "/assigned", Truck],
    ["Shipment Tracking", "/tracking", Activity]
  ]
};

/* LOGIN PAGE */

function Login() {
  const { login } = useAuth();

  const navigate = useNavigate();

  const [identifier, setIdentifier] = useState("admin");
  const [password, setPassword] = useState("");

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();

    setError("");
    setLoading(true);

    try {
      await login(identifier, password);
      navigate("/", { replace: true });
    } catch (err) {
      setError(
        err.response?.data?.message ||
        err.response?.data?.msg ||
        err.message ||
        "Login failed."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="login">

      <div className="loginbrand">

        <b className="mark">E4</b>

        <span>
          ENGINE E4
          <small>OPERATIONS CONSOLE</small>
        </span>

        <section>
          <small>OPERATIONS WORKFLOW & MONITORING</small>

          <h1>
            One workspace.
            <br />
            <i>Four roles.</i>
            <br />
            Clear control.
          </h1>

          <p>
            Coordinate warehouse operations, transfer
            approvals and logistics through role-based access.
          </p>
        </section>

        <footer>
          MULTI-WAREHOUSE INVENTORY REDISTRIBUTION SYSTEM
        </footer>

      </div>

      <form className="loginform" onSubmit={handleSubmit}>

        <div className="eyebrow">WELCOME BACK</div>

        <h2>Sign in to Engine E4</h2>

        <p>Use your assigned project account.</p>

        <label>Username or Email</label>

        <input
          value={identifier}
          onChange={(e) => setIdentifier(e.target.value)}
          required
        />

        <label>Password</label>

        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        {error && (
          <div className="error">{error}</div>
        )}

        <button className="primary" disabled={loading}>
          {loading ? "Signing in..." : "Sign in →"}
        </button>

        <small className="hint">
          Your role and permissions are loaded from the Flask backend.
        </small>

      </form>

    </div>
  );
}

/* PROTECTED ROUTE */

function ProtectedRoute({ children, allowedRoles }) {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (
    allowedRoles &&
    !allowedRoles.includes(user.role)
  ) {
    return <Navigate to="/" replace />;
  }

  return children;
}

/* APPLICATION LAYOUT */

function Shell({ children }) {
  const { user, logout } = useAuth();

  const navigate = useNavigate();

  const [collapsed, setCollapsed] = useState(false);

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  const menu = navigation[user.role] || [];

  return (
    <div className="shell">

      <aside className={collapsed ? "side narrow" : "side"}>

        <div className="sidebrand">
          <b className="mark">E4</b>

          {!collapsed && (
            <span>
              ENGINE E4
              <small>OPERATIONS CONSOLE</small>
            </span>
          )}
        </div>

        <small className="navlabel">
          {!collapsed && "WORKSPACE"}
        </small>

        {menu.map(([title, path, Icon]) => (
          <NavLink
            key={path}
            to={path}
            end={path === "/"}
            title={collapsed ? title : ""}
          >
            <Icon size={18} />

            {!collapsed && title}
          </NavLink>
        ))}

        <button
          className="signout"
          onClick={() => {
            logout();
            navigate("/login", { replace: true });
          }}
        >
          <LogOut size={18} />
          {!collapsed && "Sign out"}
        </button>

      </aside>

      <main>

        <header>

          <button
            className="hamb"
            onClick={() => setCollapsed(!collapsed)}
          >
            <Menu />
          </button>

          <span className="live">●</span>

          System workspace / <b>{user.role}</b>

          <div className="topright">

            <span>DEMO ENVIRONMENT</span>

            <b className="avatar">
              {(user.username || "U").slice(0, 2).toUpperCase()}
            </b>

            <div>
              <b>{user.username}</b>
              <small>{user.role}</small>
            </div>

          </div>

        </header>

        <div className="content">
          {children}
        </div>

        <footer className="foot">
          ENGINE E4 · OPERATIONS WORKFLOW & MONITORING ENGINE
          <span>RBAC DEMONSTRATION BUILD</span>
        </footer>

      </main>

    </div>
  );
}

/* COMMON COMPONENTS */

function Head({ tag, title, sub, action }) {
  return (
    <div className="head">

      <div>
        <small>{tag}</small>
        <h1>{title}</h1>
        <p>{sub}</p>
      </div>

      {action}

    </div>
  );
}

function Stat({ title, value, sub }) {
  return (
    <div className="stat">
      <small>{title}</small>
      <b>{value}</b>
      <span>{sub}</span>
    </div>
  );
}

/* DASHBOARD */

function Dashboard() {
  const { user } = useAuth();

  if (!user) return null;

  const role = user.role;

  const data = {
    Admin: [
      ["Total users", "3", "Registered accounts"],
      ["Active users", "3", "Currently enabled"],
      ["System roles", "4", "Configured roles"],
      ["Access model", "RBAC", "Role-based permissions"]
    ],

    "Operations Manager": [
      ["Transfer requests", "24", "Demo data"],
      ["Pending approvals", "6", "Requires review"],
      ["In progress", "9", "Active transfers"],
      ["Completed", "9", "Demo data"]
    ],

    "Warehouse Manager": [
      ["Incoming transfers", "5", "Demo data"],
      ["Outgoing transfers", "3", "Awaiting dispatch"],
      ["Pending receipts", "2", "Requires attention"],
      ["Warehouse status", "Active", "Operational"]
    ],

    "Logistics Staff": [
      ["Assigned transfers", "8", "Demo data"],
      ["Pending pickups", "2", "Awaiting collection"],
      ["In transit", "4", "Active shipments"],
      ["Delivered", "2", "Demo data"]
    ]
  };

  const activities = {
    Admin: [
      "User accounts configured",
      "Admin access verified",
      "User management APIs connected"
    ],

    "Operations Manager": [
      "TR-2048 requires approval",
      "TR-2043 moved to logistics",
      "TR-2039 needs attention"
    ],

    "Warehouse Manager": [
      "Incoming transfer expected",
      "Dispatch pending",
      "Receipt recorded"
    ],

    "Logistics Staff": [
      "Pickup assigned",
      "Shipment in transit",
      "Delivery completed"
    ]
  };

  return (
    <>
      <Head
        tag={`${role.toUpperCase()} WORKSPACE`}
        title={
          role === "Admin"
            ? "System overview"
            : `${role} dashboard`
        }
        sub={`Welcome, ${user.username}. Your workspace is configured for the ${role} role.`}
      />

      <div className="banner">
        <div>
          <small>ROLE VERIFIED</small>
          <h2>Welcome, {user.username}.</h2>
          <p>
            You are signed in as <b>{role}</b>.
            Your available modules reflect this role.
          </p>
        </div>

        <ShieldCheck size={38} />
      </div>

      <div className="stats">
        {(data[role] || []).map((item) => (
          <Stat
            key={item[0]}
            title={item[0]}
            value={item[1]}
            sub={item[2]}
          />
        ))}
      </div>

      <div className="columns">

        <section className="panel">

          <h3>Recent activity</h3>

          <p>Illustrative records for the demonstration</p>

          {(activities[role] || []).map((item, index) => (
            <div className="activity" key={item}>
              <i />
              <b>{item}</b>
              <small>
                {["Just now", "Today", "Yesterday"][index]}
              </small>
            </div>
          ))}

        </section>

        <section className="panel">

          <h3>Your access summary</h3>

          <p>Modules available to this role</p>

          {(navigation[role] || []).map((item) => (
            <div className="access" key={item[0]}>
              <CheckCircle2 size={16} />
              {item[0]}
              <span>Available</span>
            </div>
          ))}

          <NavLink className="link" to="/rbac">
            View permission matrix →
          </NavLink>

        </section>

      </div>

      <div className="note">
        Transfer and logistics figures are sample demonstration data.
        Authentication and User Management use the live Flask backend.
      </div>
    </>
  );
}

/* RBAC MATRIX */

function RBAC() {
  const { user, token } = useAuth();

  const rows = [
    ["View dashboard", 1, 1, 1, 1],
    ["Manage users", 1, 0, 0, 0],
    ["Create users", 1, 0, 0, 0],
    ["Update users", 1, 0, 0, 0],
    ["Deactivate / reactivate users", 1, 0, 0, 0],
    ["Approve transfer requests", 0, 1, 0, 0],
    ["Reject transfer requests", 0, 1, 0, 0],
    ["Warehouse operations", 1, 1, 1, 0],
    ["Logistics management", 1, 1, 0, 1],
    ["Shipment tracking", 1, 1, 1, 1],
    ["System administration", 1, 0, 0, 0]
  ];

  return (
    <>
      <Head
        tag="SECURITY & GOVERNANCE"
        title="RBAC access control"
        sub="Demonstrate how Engine E4 assigns capabilities to each authenticated role."
      />

      <div className="panel current">
        <div className="mark">E4</div>

        <div>
          <small>CURRENTLY SIGNED IN AS</small>
          <h2>{user.username}</h2>
          <p>{user.role} · Authenticated session</p>
        </div>

        <span className="badge">
          JWT {token ? "PRESENT" : "MISSING"}
        </span>
      </div>

      <section className="panel">

        <h3>Role permission matrix</h3>

        <p>
          Intended demonstration permissions;
          backend authorization remains authoritative.
        </p>

        <div className="tablewrap">

          <table>

            <thead>
              <tr>
                <th>MODULE / ACTION</th>

                {roles.map((role) => (
                  <th key={role}>{role}</th>
                ))}
              </tr>
            </thead>

            <tbody>

              {rows.map((row) => (
                <tr key={row[0]}>
                  <td><b>{row[0]}</b></td>

                  {row.slice(1).map((allowed, index) => (
                    <td key={index}>
                      <span className={allowed ? "yes" : "no"}>
                        {allowed ? "✓ Granted" : "— Restricted"}
                      </span>
                    </td>
                  ))}
                </tr>
              ))}

            </tbody>

          </table>

        </div>

      </section>

      <div className="note">
        Frontend visibility improves user experience.
        Flask backend authorization is the actual security boundary.
      </div>
    </>
  );
}

/* ADMIN USER MANAGEMENT */

function UsersPage() {
  const [users, setUsers] = useState([]);
  const [busy, setBusy] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [search, setSearch] = useState("");

  const [modal, setModal] = useState(null);

  const [form, setForm] = useState({
    username: "",
    email: "",
    password: "",
    role: "Warehouse Manager"
  });

  async function loadUsers() {
    setBusy(true);
    setError("");

    try {
      const response = await userApi.list();

      const result = response.data || {};

      setUsers(
        Array.isArray(result)
          ? result
          : result.users || result.data?.users || []
      );

    } catch (err) {
      setError(
        err.response?.data?.message ||
        err.response?.data?.msg ||
        "Could not retrieve users."
      );
    } finally {
      setBusy(false);
    }
  }

  useEffect(() => {
    loadUsers();
  }, []);

  function editUser(user) {
    setForm({
      username: user.username,
      email: user.email,
      password: "",
      role: user.role
    });

    setModal({
      type: "edit",
      user
    });
  }

  async function saveUser(event) {
    event.preventDefault();

    try {
      if (modal.type === "create") {
        await userApi.create(form);
      } else {
        await userApi.update(modal.user.id, {
          username: form.username,
          email: form.email,
          role: form.role
        });
      }

      setModal(null);
      setMessage("User saved successfully.");

      await loadUsers();

    } catch (err) {
      setMessage(
        err.response?.data?.message ||
        err.response?.data?.msg ||
        "Unable to save user."
      );
    }
  }

  async function toggleUser(user) {
    const action = user.is_active ? "Deactivate" : "Reactivate";

    if (!window.confirm(`${action} ${user.username}?`)) {
      return;
    }

    try {
      if (user.is_active) {
        await userApi.deactivate(user.id);
      } else {
        await userApi.reactivate(user.id);
      }

      setMessage("Account status updated successfully.");

      await loadUsers();

    } catch (err) {
      setMessage(
        err.response?.data?.message ||
        err.response?.data?.msg ||
        "Unable to update account status."
      );
    }
  }

  const filteredUsers = users.filter((user) =>
    `${user.username} ${user.email} ${user.role}`
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  return (
    <>
      <Head
        tag="ADMINISTRATION"
        title="User management"
        sub="Create, review and maintain system accounts and role assignments."
        action={
          <button
            className="primary"
            onClick={() => {
              setForm({
                username: "",
                email: "",
                password: "",
                role: "Warehouse Manager"
              });

              setModal({ type: "create" });
            }}
          >
            + Add user
          </button>
        }
      />

      {message && (
        <div className="note">
          {message}
          <button onClick={() => setMessage("")}> ×</button>
        </div>
      )}

      <section className="panel">

        <div className="toolbar">
          <h3>
            Registered users
            <small> LIVE BACKEND RECORDS</small>
          </h3>

          <button className="secondary" onClick={loadUsers}>
            <RefreshCw size={14} /> Refresh
          </button>
        </div>

        <input
          className="search"
          placeholder="Search username, email or role..."
          value={search}
          onChange={(event) => setSearch(event.target.value)}
        />

        {busy ? (
          <p>Loading users...</p>
        ) : error ? (
          <div className="error">{error}</div>
        ) : (
          <div className="tablewrap">

            <table>

              <thead>
                <tr>
                  <th>USER</th>
                  <th>ROLE</th>
                  <th>STATUS</th>
                  <th>ID</th>
                  <th>ACTIONS</th>
                </tr>
              </thead>

              <tbody>

                {filteredUsers.map((user) => (
                  <tr key={user.id}>

                    <td>
                      <b>{user.username}</b>
                      <small className="block">
                        {user.email}
                      </small>
                    </td>

                    <td>{user.role}</td>

                    <td>
                      <span className={user.is_active ? "yes" : "no"}>
                        {user.is_active ? "Active" : "Inactive"}
                      </span>
                    </td>

                    <td>#{user.id}</td>

                    <td>
                      <button
                        className="mini"
                        onClick={() => editUser(user)}
                      >
                        Edit
                      </button>

                      <button
                        className="mini"
                        onClick={() => toggleUser(user)}
                      >
                        {user.is_active ? "Deactivate" : "Reactivate"}
                      </button>
                    </td>

                  </tr>
                ))}

              </tbody>

            </table>

          </div>
        )}

      </section>

      <div className="note">
        User operations are connected to the authenticated Flask APIs.
      </div>

      {modal && (
        <div className="overlay">

          <form className="modal" onSubmit={saveUser}>

            <button
              type="button"
              className="close"
              onClick={() => setModal(null)}
            >
              ×
            </button>

            <h2>
              {modal.type === "create" ? "Create user" : "Update user"}
            </h2>

            <label>
              Username
              <input
                required
                minLength="3"
                value={form.username}
                onChange={(e) =>
                  setForm({ ...form, username: e.target.value })
                }
              />
            </label>

            <label>
              Email
              <input
                required
                type="email"
                value={form.email}
                onChange={(e) =>
                  setForm({ ...form, email: e.target.value })
                }
              />
            </label>

            {modal.type === "create" && (
              <label>
                Password
                <input
                  required
                  minLength="8"
                  type="password"
                  value={form.password}
                  onChange={(e) =>
                    setForm({ ...form, password: e.target.value })
                  }
                />
              </label>
            )}

            <label>
              Role
              <select
                value={form.role}
                onChange={(e) =>
                  setForm({ ...form, role: e.target.value })
                }
              >
                {roles.map((role) => (
                  <option key={role}>{role}</option>
                ))}
              </select>
            </label>

            <button className="primary">
              Save user
            </button>

          </form>

        </div>
      )}
    </>
  );
}

/* DEMONSTRATION MODULES */

const sampleTransfers = [
  [
    "TR-2048",
    "Diet Coke 500ml",
    "Hubballi Central",
    "Dharwad North",
    "240 units",
    "High",
    "Awaiting approval"
  ],
  [
    "TR-2047",
    "Mineral Water 1L",
    "Belagavi East",
    "Hubballi Central",
    "180 units",
    "Normal",
    "In transit"
  ],
  [
    "TR-2046",
    "Snack Pack",
    "Dharwad North",
    "Gadag Depot",
    "96 units",
    "Normal",
    "Completed"
  ]
];

function Module({ title }) {
  return (
    <>
      <Head
        tag="OPERATIONS"
        title={title}
        sub="Illustrative operational records for the RBAC demonstration."
      />

      <section className="panel">

        <h3>Transfer activity</h3>

        <div className="tablewrap">

          <table>

            <thead>
              <tr>
                <th>TRANSFER</th>
                <th>PRODUCT</th>
                <th>SOURCE</th>
                <th>DESTINATION</th>
                <th>QUANTITY</th>
                <th>PRIORITY</th>
                <th>STATUS</th>
              </tr>
            </thead>

            <tbody>
              {sampleTransfers.map((transfer) => (
                <tr key={transfer[0]}>
                  {transfer.map((value, index) => (
                    <td key={index}>{value}</td>
                  ))}
                </tr>
              ))}
            </tbody>

          </table>

        </div>

      </section>

      <div className="note">
        These are sample records. Transfer and logistics backend APIs
        are not yet connected.
      </div>
    </>
  );
}

/* SYSTEM MONITORING */

function Monitoring() {
  const checks = [
    ["Authentication & JWT", "Connected"],
    ["User management APIs", "Connected"],
    ["Role-based navigation", "Implemented"],
    ["Transfer requests", "Prototype data"],
    ["Approvals & logistics", "Prototype data"]
  ];

  return (
    <>
      <Head
        tag="SYSTEM"
        title="System monitoring"
        sub="Current implementation status of the Engine E4 demonstration."
      />

      <section className="panel">

        {checks.map(([name, status]) => (
          <div className="activity" key={name}>
            <b>{name}</b>
            <small>{status}</small>
          </div>
        ))}

      </section>
    </>
  );
}

/* MAIN APPLICATION */

export default function App() {
  const { user } = useAuth();

  /*
    IMPORTANT:
    Never render role-dependent components
    when user is null.
  */

  if (!user) {
    return (
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    );
  }

  const admin = ["Admin"];
  const operations = ["Admin", "Operations Manager"];
  const warehouse = [
    "Admin",
    "Operations Manager",
    "Warehouse Manager"
  ];

  return (
    <Routes>

      <Route
        path="/login"
        element={<Navigate to="/" replace />}
      />

      <Route
        path="/*"
        element={
          <Shell>
            <Routes>

              <Route
                path="/"
                element={<Dashboard />}
              />

              <Route
                path="/rbac"
                element={<RBAC />}
              />

              <Route
                path="/users"
                element={
                  <ProtectedRoute allowedRoles={admin}>
                    <UsersPage />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/monitoring"
                element={
                  <ProtectedRoute allowedRoles={operations}>
                    <Monitoring />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/transfers"
                element={
                  <ProtectedRoute allowedRoles={operations}>
                    <Module title="Transfer requests" />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/approvals"
                element={
                  <ProtectedRoute allowedRoles={operations}>
                    <Module title="Approval queue" />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/warehouse"
                element={
                  <ProtectedRoute allowedRoles={warehouse}>
                    <Module title="Warehouse operations" />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/incoming"
                element={
                  <ProtectedRoute allowedRoles={["Warehouse Manager"]}>
                    <Module title="Incoming transfers" />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/outgoing"
                element={
                  <ProtectedRoute allowedRoles={["Warehouse Manager"]}>
                    <Module title="Outgoing transfers" />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/assigned"
                element={
                  <ProtectedRoute allowedRoles={["Logistics Staff"]}>
                    <Module title="Assigned transfers" />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/tracking"
                element={
                  <ProtectedRoute allowedRoles={roles}>
                    <Module title="Shipment tracking" />
                  </ProtectedRoute>
                }
              />

              <Route
                path="*"
                element={<Navigate to="/" replace />}
              />

            </Routes>
          </Shell>
        }
      />

    </Routes>
  );
}