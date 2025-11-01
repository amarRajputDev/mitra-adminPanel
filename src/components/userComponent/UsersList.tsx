import React from "react";
import { useNavigate } from "react-router-dom";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Eye, ArrowLeft, ArrowRight } from "lucide-react";

/**
 * UserList Component
 * Props:
 *  - users: array of user objects
 *  - loading: boolean
 *  - page: current page
 *  - totalPages: total number of pages
 *  - onPageChange: function(newPage)
 */
export default function UserList({
  users = [],
  loading = false,
  page = 1,
  totalPages = 1,
  onPageChange = (num) => {},
}) {
  const navigate = useNavigate();

  if (loading) {
    return (
      <div className="flex justify-center py-10">
        <div className="h-6 w-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Table Section */}
      <div className="overflow-x-auto rounded-lg border border-gray-100 dark:border-slate-700 bg-white dark:bg-slate-900 transition-colors">
        <Table className="min-w-[900px]">
          <TableHeader>
            <TableRow className="bg-blue-50 dark:bg-slate-800 text-gray-700 dark:text-gray-300">
              <TableHead>ID</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Plan</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Last Login</TableHead>
              <TableHead>Tenders Viewed</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Created</TableHead>
              <TableHead className="text-right">Action</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {users.length > 0 ? (
              users.map((u) => (
                <TableRow
                  key={u.id}
                  className="hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors"
                >
                  <TableCell className="dark:text-gray-200">{u.id}</TableCell>
                  <TableCell className="dark:text-gray-200">
                    {u.name || "—"}
                  </TableCell>
                  <TableCell className="truncate max-w-[180px] dark:text-gray-300">
                    {u.email || "—"}
                  </TableCell>
                  <TableCell className="dark:text-gray-300">
                    {u.plan_name || "Free"}
                  </TableCell>
                  <TableCell className="capitalize dark:text-gray-300">
                    {u.role || "user"}
                  </TableCell>
                  <TableCell className="dark:text-gray-400 text-sm">
                    {u.last_login
                      ? new Date(u.last_login).toLocaleString("en-IN")
                      : "—"}
                  </TableCell>
                  <TableCell className="dark:text-gray-300">
                    {u.tenders_viewed || 0}
                  </TableCell>
                  <TableCell>
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                        u.status === "active"
                          ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                          : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                      }`}
                    >
                      {u.status || "inactive"}
                    </span>
                  </TableCell>
                  <TableCell className="dark:text-gray-400">
                    {new Date(u.created_at_ist).toLocaleDateString("en-IN")}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-blue-600 border-blue-200 hover:bg-blue-50 dark:border-slate-700 dark:text-blue-400 dark:hover:bg-slate-800"
                      onClick={() => navigate(`/admin/users/${u.id}`)}
                    >
                      <Eye className="h-4 w-4 mr-1" /> View
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={10}
                  className="text-center py-10 text-gray-500 dark:text-gray-400"
                >
                  No users found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination Section */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-3">
        <Button
          variant="outline"
          size="sm"
          disabled={page === 1}
          onClick={() => onPageChange(page - 1)}
          className="w-full sm:w-auto dark:border-slate-700 dark:text-gray-200"
        >
          <ArrowLeft className="h-4 w-4 mr-1" /> Prev
        </Button>

        <p className="text-sm text-gray-600 dark:text-gray-400">
          Page {page} of {totalPages}
        </p>

        <Button
          variant="outline"
          size="sm"
          disabled={page === totalPages}
          onClick={() => onPageChange(page + 1)}
          className="w-full sm:w-auto dark:border-slate-700 dark:text-gray-200"
        >
          Next <ArrowRight className="h-4 w-4 ml-1" />
        </Button>
      </div>
    </div>
  );
}
