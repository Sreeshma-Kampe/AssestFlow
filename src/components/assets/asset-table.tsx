"use client";

import { useEffect, useMemo, useState } from "react";
import { EmptyState } from "@/components/common/empty-state";
import { LoadingSkeleton } from "@/components/common/loading-skeleton";
import { TableWrapper } from "@/components/common/table-wrapper";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";
import Link from "next/link";

type AssetRecord = {
  id: string;
  name: string;
  tag: string;
  serialNumber?: string | null;
  location?: string | null;
  status?: string | null;
  createdAt?: string;
  updatedAt?: string;
  category?: { name?: string | null } | null;
  department?: { name?: string | null } | null;
};

type AssetMeta = {
  page: number;
  perPage: number;
  total: number;
};

export function AssetTable() {
  const [items, setItems] = useState<AssetRecord[]>([]);
  const [meta, setMeta] = useState<AssetMeta>({ page: 1, perPage: 8, total: 0 });
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("updatedAt");
  const [dir, setDir] = useState<"asc" | "desc">("desc");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`/api/assets?page=${page}&perPage=${meta.perPage}&search=${encodeURIComponent(search)}&sort=${sort}&dir=${dir}`, {
          signal: controller.signal,
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data?.message ?? "Unable to load assets.");
        setItems(data.data ?? []);
        setMeta(data.meta ?? { page, perPage: meta.perPage, total: 0 });
      } catch (err: any) {
        if (err.name !== "AbortError") setError(err.message ?? "Unable to load assets.");
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    };

    load();
    return () => controller.abort();
  }, [dir, meta.perPage, page, search, sort]);

  const statusCounts = useMemo(() => {
    const counts = items.reduce<Record<string, number>>((acc, asset) => {
      const status = (asset.status ?? "UNKNOWN").toUpperCase();
      acc[status] = (acc[status] ?? 0) + 1;
      return acc;
    }, {});

    return counts;
  }, [items]);

  const totalPages = Math.max(1, Math.ceil(meta.total / meta.perPage));

  return (
    <div className="space-y-4">
      <div className="grid gap-3 md:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <p className="text-sm text-slate-500">Total assets</p>
          <p className="mt-2 text-2xl font-semibold">{meta.total}</p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <p className="text-sm text-slate-500">Visible now</p>
          <p className="mt-2 text-2xl font-semibold">{items.length}</p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <p className="text-sm text-slate-500">Status mix</p>
          <p className="mt-2 text-sm font-medium text-slate-700 dark:text-slate-300">
            {Object.entries(statusCounts)
              .slice(0, 3)
              .map(([label, count]) => `${label}: ${count}`)
              .join(" • ") || "No status data"}
          </p>
        </div>
      </div>

      <div className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900 md:flex-row md:items-center md:justify-between">
        <label className="flex flex-1 items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-600 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-300">
          <Search className="h-4 w-4" />
          <input
            value={search}
            onChange={(event) => {
              setSearch(event.target.value);
              setPage(1);
            }}
            placeholder="Search assets by name, tag, or serial"
            className="w-full border-none bg-transparent outline-none"
          />
        </label>

        <div className="flex items-center gap-2">
          <select
            value={`${sort}:${dir}`}
            onChange={(event) => {
              const [nextSort, nextDir] = event.target.value.split(":");
              setSort(nextSort);
              setDir(nextDir as "asc" | "desc");
              setPage(1);
            }}
            className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-950"
          >
            <option value="updatedAt:desc">Newest updated</option>
            <option value="createdAt:desc">Newest created</option>
            <option value="name:asc">Name A–Z</option>
            <option value="name:desc">Name Z–A</option>
          </select>
        </div>
      </div>

      <TableWrapper>
        {loading ? (
          <div className="p-6">
            <LoadingSkeleton />
          </div>
        ) : error ? (
          <div className="p-6 text-sm text-red-600">{error}</div>
        ) : items.length === 0 ? (
          <div className="p-6">
            <EmptyState title="No assets found" description="Try a different search or register a new asset to populate this directory." />
          </div>
        ) : (
          <table className="w-full table-auto">
            <thead>
              <tr className="text-left text-sm text-slate-500">
                <th className="p-3">Name</th>
                <th className="p-3">Tag</th>
                <th className="p-3">Category</th>
                <th className="p-3">Department</th>
                <th className="p-3">Location</th>
                <th className="p-3">Status</th>
                <th className="p-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.map((asset) => (
                <tr key={asset.id} className="border-t text-sm text-slate-700 dark:text-slate-300">
                  <td className="p-3">
                    <div className="font-medium text-slate-900 dark:text-slate-100">{asset.name}</div>
                    <div className="text-xs text-slate-500">{asset.serialNumber ?? "No serial"}</div>
                  </td>
                  <td className="p-3">{asset.tag}</td>
                  <td className="p-3">{asset.category?.name ?? "-"}</td>
                  <td className="p-3">{asset.department?.name ?? "-"}</td>
                  <td className="p-3">{asset.location ?? "-"}</td>
                  <td className="p-3">
                    <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${getStatusClass(asset.status)}`}>
                      {asset.status ?? "UNKNOWN"}
                    </span>
                  </td>
                  <td className="p-3">
                    <Link href={`/assets/${asset.id}`} className="text-sm font-medium text-blue-600 hover:underline">
                      Open
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </TableWrapper>

      {!loading && !error && items.length > 0 ? (
        <div className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white p-3 text-sm text-slate-600 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <span>
            Page {page} of {totalPages}
          </span>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => setPage((current) => Math.max(1, current - 1))} disabled={page === 1}>
              Previous
            </Button>
            <Button size="sm" onClick={() => setPage((current) => Math.min(totalPages, current + 1))} disabled={page === totalPages}>
              Next
            </Button>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function getStatusClass(status?: string | null) {
  switch ((status ?? "UNKNOWN").toUpperCase()) {
    case "ACTIVE":
      return "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300";
    case "PENDING":
      return "bg-amber-100 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300";
    case "ARCHIVED":
      return "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300";
    default:
      return "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300";
  }
}
