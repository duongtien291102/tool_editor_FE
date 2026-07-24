import React from 'react';
import type { CreditPackage, UserWallet } from '../types';

interface CreditsTabProps {
  wallet: UserWallet;
  packages: CreditPackage[];
  onPurchase: (packageId: string) => void;
}

export const CreditsTab: React.FC<CreditsTabProps> = ({
  wallet,
  packages,
  onPurchase
}) => {
  return (
    <div className="space-y-6">
      <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-6 shadow-xl flex justify-between items-center">
        <div>
          <span className="text-xs font-semibold text-indigo-400 uppercase tracking-wider">Credit Wallet</span>
          <h3 className="text-3xl font-extrabold text-white mt-1">{wallet.remainingCredits.toLocaleString()} Credits</h3>
        </div>
        <div className="text-right text-xs text-slate-400">
          <p>Purchased: <span className="text-emerald-400 font-semibold">{wallet.totalPurchasedCredits.toLocaleString()}</span></p>
          <p>Used: <span className="text-amber-400 font-semibold">{wallet.totalUsedCredits.toLocaleString()}</span></p>
        </div>
      </div>

      <div>
        <h4 className="text-lg font-bold text-white mb-4">Credit Top-Up Packages</h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {packages.map(pkg => (
            <div
              key={pkg.id}
              className={`bg-slate-900/80 border rounded-xl p-5 shadow-lg flex flex-col justify-between relative ${
                pkg.isPopular ? 'border-purple-500/80 ring-1 ring-purple-500/20' : 'border-slate-800'
              }`}
            >
              {pkg.isPopular && (
                <span className="absolute -top-2.5 right-4 px-2 py-0.5 bg-purple-600 text-white text-[10px] font-bold uppercase rounded shadow">
                  Most Popular
                </span>
              )}

              <div>
                <h5 className="text-base font-bold text-white">{pkg.name}</h5>
                <p className="text-2xl font-extrabold text-indigo-400 mt-2">{pkg.credits.toLocaleString()} Credits</p>
                <p className="text-xs text-slate-400 mt-1">${pkg.priceUsd} one-time</p>
              </div>

              <button
                onClick={() => onPurchase(pkg.id)}
                className="mt-5 w-full py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-lg shadow transition-all"
              >
                Buy Now (${pkg.priceUsd})
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
