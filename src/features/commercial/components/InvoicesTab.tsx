import React from 'react';
import type { Invoice, CreditTransaction } from '../types';

interface InvoicesTabProps {
  invoices: Invoice[];
  transactions: CreditTransaction[];
}

export const InvoicesTab: React.FC<InvoicesTabProps> = ({ invoices, transactions }) => {
  return (
    <div className="space-y-6">
      <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-6 shadow-xl space-y-4">
        <h3 className="text-xl font-bold text-white">Invoices & Receipts</h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-800/60 text-slate-400 uppercase font-semibold border-b border-slate-700">
              <tr>
                <th className="py-3 px-4">Invoice ID</th>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4">Amount</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">PDF</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {invoices.map(inv => (
                <tr key={inv.id} className="hover:bg-slate-800/30">
                  <td className="py-3 px-4 font-mono text-indigo-300">{inv.id}</td>
                  <td className="py-3 px-4 text-slate-400">{new Date(inv.createdAt).toLocaleDateString()}</td>
                  <td className="py-3 px-4 font-bold text-white">${inv.amount.toFixed(2)} {inv.currency}</td>
                  <td className="py-3 px-4">
                    <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 rounded text-[10px]">
                      {inv.status}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <a href={inv.invoicePdfUrl} target="_blank" rel="noreferrer" className="text-indigo-400 hover:underline font-semibold">
                      Download PDF
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-6 shadow-xl space-y-4">
        <h4 className="text-lg font-bold text-white">Credit Transactions Ledger</h4>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-800/60 text-slate-400 uppercase font-semibold border-b border-slate-700">
              <tr>
                <th className="py-3 px-4">Transaction ID</th>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4">Type</th>
                <th className="py-3 px-4">Description</th>
                <th className="py-3 px-4 text-right">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {transactions.map(tx => (
                <tr key={tx.id} className="hover:bg-slate-800/30">
                  <td className="py-3 px-4 font-mono text-slate-400">{tx.id}</td>
                  <td className="py-3 px-4 text-slate-400">{new Date(tx.createdAt).toLocaleString()}</td>
                  <td className="py-3 px-4 text-indigo-300">{tx.type}</td>
                  <td className="py-3 px-4 text-slate-300">{tx.description}</td>
                  <td className={`py-3 px-4 text-right font-bold ${tx.amount > 0 ? 'text-emerald-400' : 'text-amber-400'}`}>
                    {tx.amount > 0 ? `+${tx.amount}` : tx.amount}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
