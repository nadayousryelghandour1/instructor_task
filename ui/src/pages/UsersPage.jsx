import { useEffect, useMemo, useState } from "react";
import { Box, InputAdornment, Snackbar, ToggleButton, ToggleButtonGroup, Typography } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import SearchIcon from "@mui/icons-material/Search";
import { listUsers } from "../api/users";
import { ROLES, ROLE_ORDER } from "../config/roles";
import { formatDate } from "../utils/format";
import PageHeader from "../components/PageHeader";
import DataTable from "../components/DataTable";
import EmptyState from "../components/EmptyState";
import RoleBadge from "../components/RoleBadge";
import TextField from "../components/TextField";
import Button from "../components/Button";
import Alert from "../components/Alert";
import UserCell from "../features/users/UserCell";
import AddUserDialog from "../features/users/AddUserDialog";
import { useAuth } from "../provider/useAuth";

const COLUMNS = [
  { key: "user", header: "User", render: (user) => <UserCell user={user} /> },
  { key: "role", header: "Role", width: 180, render: (user) => <RoleBadge role={user.role} /> },
  { key: "createdAt", header: "Created", width: 160, render: (user) => formatDate(user.createdAt) },
];

export default function UsersPage() {
  const { user: currentUser } = useAuth();
  const tenantId = currentUser?.tenant_id;
  const [data, setData] = useState({ status: "loading", users: [], error: "" });
  const [reloadKey, setReloadKey] = useState(0);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [notice, setNotice] = useState("");

  useEffect(() => {
  const controller = new AbortController();
  listUsers({ tenantId, signal: controller.signal })  
    .then((users) => setData({ status: "ready", users, error: "" }))
    .catch((err) => {
      if (err.name === "AbortError") return;
      setData({
        status: "error",
        users: [],
        error: err.status ? err.message : "Cannot reach the server",
      });
    });
  return () => controller.abort();
  }, [reloadKey, tenantId]);                              

  function reload() {
    setData((current) => ({ ...current, status: "loading" }));
    setReloadKey((key) => key + 1);
  }

  function handleCreated(user) {
    setDialogOpen(false);
    setNotice(`${user.name || "User"} was added`);
    reload();
  }

  const visibleUsers = useMemo(() => {
    const query = search.trim().toLowerCase();
    return data.users.filter((user) => {
      const matchesRole = roleFilter === "all" || user.role === roleFilter;
      const matchesSearch =
        !query || user.name.toLowerCase().includes(query) || user.email.toLowerCase().includes(query);
      return matchesRole && matchesSearch;
    });
  }, [data.users, search, roleFilter]);

  const loading = data.status === "loading";
  const hasFilters = search.trim() !== "" || roleFilter !== "all";

  return (
    <>
      <PageHeader
        title="Users"
        description="Add people to your organisation and choose their role."
        action={
          <Button startIcon={<AddIcon />} onClick={() => setDialogOpen(true)}>
            Add user
          </Button>
        }
      />

      {data.status === "error" && (
        <Alert
          variant="error"
          sx={{ mb: 2 }}
          action={
            <Button variant="secondary" size="small" onClick={reload}>
              Try again
            </Button>
          }
        >
          {data.error}
        </Alert>
      )}

      <Box sx={{ mb: 2, display: "flex", flexWrap: "wrap", gap: 2, alignItems: "center" }}>
        <TextField
          placeholder="Search by name or email"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          sx={{ maxWidth: 320 }}
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon fontSize="small" />
                </InputAdornment>
              ),
            },
            htmlInput: { "aria-label": "Search users" },
          }}
        />
        <ToggleButtonGroup
          exclusive
          size="small"
          value={roleFilter}
          onChange={(_, next) => next && setRoleFilter(next)}
          aria-label="Filter by role"
        >
          <ToggleButton value="all">All</ToggleButton>
          {ROLE_ORDER.map((key) => (
            <ToggleButton key={key} value={key}>
              {ROLES[key].label}
            </ToggleButton>
          ))}
        </ToggleButtonGroup>
      </Box>

      <DataTable
        columns={COLUMNS}
        rows={visibleUsers}
        getRowKey={(user) => user.id ?? user.email}
        loading={loading}
        emptyState={
          data.status === "error" ? null : hasFilters ? (
            <EmptyState
              title="No users match your filters"
              description="Try a different search or role."
              action={
                <Button
                  variant="secondary"
                  size="small"
                  onClick={() => {
                    setSearch("");
                    setRoleFilter("all");
                  }}
                >
                  Clear filters
                </Button>
              }
            />
          ) : (
            <EmptyState
              title="No users yet"
              description="Add the first person to your organisation."
              action={<Button onClick={() => setDialogOpen(true)}>Add user</Button>}
            />
          )
        }
      />

      {data.status === "ready" && data.users.length > 0 && (
        <Typography variant="body2" color="text.secondary" sx={{ mt: 1.5 }}>
          Showing {visibleUsers.length} of {data.users.length} users
        </Typography>
      )}

      <AddUserDialog open={dialogOpen} onClose={() => setDialogOpen(false)} onCreated={handleCreated} />

      <Snackbar
        open={Boolean(notice)}
        autoHideDuration={4000}
        onClose={() => setNotice("")}
        message={notice}
      />
    </>
  );
}
