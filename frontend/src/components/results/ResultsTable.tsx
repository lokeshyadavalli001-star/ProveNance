import React, { useState } from 'react';
import { Download, Search, Lock, ArrowUpDown } from 'lucide-react';
import { apiService } from '../../services/api.js';

interface ResultsTableProps {
  queryId: string;
  columns: Array<{ name: string; label: string; isRestricted: boolean; isMasked: boolean }>;
  rows: Record<string, any>[];
  restrictedColumnsFiltered: string[];
}

export const ResultsTable: React.FC<ResultsTableProps> = ({
  queryId,
  columns,
  rows,
  restrictedColumnsFiltered
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState<string | null>(null);
  const [sortAsc, setSortAsc] = useState(true);
  const [isExporting, setIsExporting] = useState(false);

  const handleExportCsv = async () => {
    setIsExporting(true);
    try {
      await apiService.exportCsv(queryId);
    } catch (e) {
      console.error('Failed to export CSV', e);
    } finally {
      setIsExporting(false);
    }
  };

  const filteredRows = rows.filter(row => {
    if (!searchTerm) return true;
    return Object.values(row).some(val =>
      String(val).toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  const sortedRows = [...filteredRows].sort((a, b) => {
    if (!sortField) return 0;
    const aVal = a[sortField];
    const bVal = b[sortField];
    if (aVal === bVal) return 0;
    return sortAsc ? (aVal > bVal ? 1 : -1) : (aVal < bVal ? 1 : -1);
  });

  const toggleSort = (field: string) => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(true);
    }
  };

  return (
    <div className="space-y-4">
      {/* Top Filter & Export Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-500" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Filter records in table..."
            className="w-full rounded-xl border border-slate-700 bg-slate-900 pl-8 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:border-provenance-500 focus:outline-none"
          />
        </div>

        <div className="flex items-center space-x-3">
          {restrictedColumnsFiltered.length > 0 && (
            <div className="flex items-center space-x-1.5 rounded-lg bg-amber-950/40 border border-amber-800/40 px-2.5 py-1 text-[11px] text-amber-300">
              <Lock className="h-3 w-3" />
              <span>{restrictedColumnsFiltered.length} columns masked by Policy Guard</span>
            </div>
          )}

          <button
            onClick={handleExportCsv}
            disabled={isExporting || rows.length === 0}
            className="flex items-center space-x-1.5 rounded-xl border border-slate-700 bg-slate-800 px-3.5 py-1.5 text-xs font-semibold text-slate-200 hover:bg-slate-700 hover:text-white transition disabled:opacity-50"
          >
            <Download className="h-3.5 w-3.5" />
            <span>{isExporting ? 'Exporting...' : 'Export Secure CSV'}</span>
          </button>
        </div>
      </div>

      {/* Table Container */}
      <div className="overflow-x-auto rounded-xl border border-slate-800 bg-slate-950 shadow-sm">
        <table className="w-full text-left text-xs text-slate-300">
          <thead className="bg-slate-900 text-[11px] font-semibold uppercase tracking-wider text-slate-400 border-b border-slate-800">
            <tr>
              {columns.map((col) => (
                <th
                  key={col.name}
                  onClick={() => toggleSort(col.name)}
                  className="px-4 py-3.5 cursor-pointer hover:text-white transition whitespace-nowrap"
                >
                  <div className="flex items-center space-x-1">
                    <span>{col.label}</span>
                    <ArrowUpDown className="h-3 w-3 text-slate-500" />
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-850/60">
            {sortedRows.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="px-4 py-8 text-center text-slate-500">
                  No records match the filter criteria.
                </td>
              </tr>
            ) : (
              sortedRows.map((row, idx) => (
                <tr key={idx} className="hover:bg-slate-900/40 transition">
                  {columns.map((col) => {
                    const val = row[col.name];
                    const isRestrictedVal = typeof val === 'string' && val.includes('CONFIDENTIAL_RESTRICTED');
                    return (
                      <td key={col.name} className="px-4 py-3 font-medium whitespace-nowrap">
                        {isRestrictedVal ? (
                          <span className="inline-flex items-center space-x-1 rounded bg-slate-900 px-2 py-0.5 text-[11px] text-amber-300/80 border border-slate-800 font-mono">
                            <Lock className="h-2.5 w-2.5" />
                            <span>Masked</span>
                          </span>
                        ) : (
                          val ?? '-'
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      <div className="text-[11px] text-slate-500 text-right">
        Displaying {sortedRows.length} of {rows.length} rows • Formulas protected against CSV injection
      </div>
    </div>
  );
};
