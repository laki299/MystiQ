import React, { useEffect, useState } from 'react';
import { fetchAllAds, createAd, updateAdStatus, deleteAd } from '../../services/adminService';
import { AdItem, AdminRole } from '../../types/admin';

interface AdManagerProps {
  adminUid: string;
  adminRole: AdminRole;
}

export const AdManager: React.FC<AdManagerProps> = ({ adminUid, adminRole }) => {
  const [ads, setAds] = useState<AdItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Form State
  const [title, setTitle] = useState('');
  const [link, setLink] = useState('');
  const [order, setOrder] = useState<number>(0);

  const loadAds = async () => {
    setLoading(true);
    try {
      const data = await fetchAllAds();
      setAds(data);
    } catch (err) {
      console.error("Error fetching ads:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAds();
  }, []);

  const handleCreateAd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !link.trim()) return;

    setIsSubmitting(true);
    try {
      await createAd(adminUid, adminRole, {
        title: title.trim(),
        link: link.trim(),
        status: 'active',
        order: Number(order) || 0
      });
      setTitle('');
      setLink('');
      setOrder(0);
      await loadAds();
    } catch (err) {
      console.error("Error creating ad:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleStatus = async (adId: string, currentStatus: 'active' | 'paused') => {
    const nextStatus = currentStatus === 'active' ? 'paused' : 'active';
    try {
      await updateAdStatus(adminUid, adminRole, adId, nextStatus);
      setAds(prev => prev.map(ad => ad.id === adId ? { ...ad, status: nextStatus } : ad));
    } catch (err) {
      console.error("Error updating ad status:", err);
    }
  };

  const handleDeleteAd = async (adId: string) => {
    if (!window.confirm("Are you sure you want to delete this ad?")) return;
    try {
      await deleteAd(adminUid, adminRole, adId);
      setAds(prev => prev.filter(ad => ad.id !== adId));
    } catch (err) {
      console.error("Error deleting ad:", err);
    }
  };

  return (
    <div className="p-4 space-y-6 text-white bg-slate-900 rounded-xl border border-slate-800 shadow-xl">
      <div className="flex justify-between items-center border-b border-slate-800 pb-4">
        <div>
          <h2 className="text-xl font-bold text-amber-400">📢 In-House Ad Manager</h2>
          <p className="text-xs text-slate-400">Add and control unlimited promotional ads across the app</p>
        </div>
        <span className="bg-slate-800 text-amber-400 text-xs px-3 py-1 rounded-full font-semibold border border-amber-500/30">
          Total Ads: {ads.length}
        </span>
      </div>

      {/* Add New Ad Form */}
      <form onSubmit={handleCreateAd} className="bg-slate-800/60 p-4 rounded-lg border border-slate-700 space-y-4">
        <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wide">➕ Create New Ad</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <input
            type="text"
            placeholder="Ad Title / Description"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            className="px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-sm focus:outline-none focus:border-amber-500"
          />
          <input
            type="url"
            placeholder="Target URL (https://...)"
            value={link}
            onChange={(e) => setLink(e.target.value)}
            required
            className="px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-sm focus:outline-none focus:border-amber-500"
          />
          <div className="flex space-x-2">
            <input
              type="number"
              placeholder="Display Order (0, 1...)"
              value={order}
              onChange={(e) => setOrder(Number(e.target.value))}
              className="w-1/2 px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-sm focus:outline-none focus:border-amber-500"
            />
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-1/2 bg-amber-600 hover:bg-amber-500 disabled:bg-slate-700 text-xs font-bold rounded-lg transition"
            >
              {isSubmitting ? 'Adding...' : 'Add Ad'}
            </button>
          </div>
        </div>
      </form>

      {/* Ads List */}
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-slate-300">Active & Configured Ads</h3>
        {loading ? (
          <div className="text-center py-6 text-slate-500 text-sm">Loading Ads...</div>
        ) : ads.length === 0 ? (
          <div className="text-center py-6 text-slate-500 text-sm bg-slate-800/30 rounded-lg border border-dashed border-slate-700">
            No ads found. Add your first ad above!
          </div>
        ) : (
          <div className="space-y-2">
            {ads.map((ad) => (
              <div 
                key={ad.id} 
                className="flex flex-col md:flex-row md:items-center justify-between p-3 bg-slate-800/80 rounded-lg border border-slate-700 gap-3"
              >
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <span className="font-bold text-sm text-slate-100">{ad.title}</span>
                    <span className={`text-[10px] px-2 py-0.5 rounded font-bold uppercase ${
                      ad.status === 'active' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-slate-700 text-slate-400'
                    }`}>
                      {ad.status}
                    </span>
                  </div>
                  <a href={ad.link} target="_blank" rel="noreferrer" className="text-xs text-indigo-400 hover:underline block truncate max-w-md">
                    {ad.link}
                  </a>
                </div>

                <div className="flex items-center space-x-4 text-xs">
                  <div className="text-slate-400">
                    Views: <span className="text-white font-semibold">{ad.views || 0}</span>
                  </div>
                  <div className="text-slate-400">
                    Clicks: <span className="text-emerald-400 font-semibold">{ad.clicks || 0}</span>
                  </div>
                  <div className="text-slate-400">
                    Order: <span className="text-amber-400 font-semibold">{ad.order || 0}</span>
                  </div>

                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleToggleStatus(ad.id, ad.status)}
                      className={`px-2.5 py-1 text-xs font-semibold rounded ${
                        ad.status === 'active' 
                          ? 'bg-amber-500/20 text-amber-300 hover:bg-amber-500/30' 
                          : 'bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30'
                      }`}
                    >
                      {ad.status === 'active' ? 'Pause' : 'Activate'}
                    </button>
                    <button
                      onClick={() => handleDeleteAd(ad.id)}
                      className="px-2.5 py-1 bg-rose-500/20 text-rose-300 hover:bg-rose-500/30 text-xs font-semibold rounded"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
        
