'use client';
import { useState, useEffect } from 'react';
import axios from 'axios';
import { Website, Status } from '@prisma/client';
import { useSession } from 'next-auth/react';
import { Trash2, ExternalLink } from 'lucide-react';

const WebsitesTable = ({ initialWebsites, userId }: { initialWebsites: Website[]; userId: string }) => {
  const [websites, setWebsites] = useState(initialWebsites);
  const { data: session, status } = useSession();

  useEffect(() => {
    const interval = setInterval(async () => {
      if (status === "authenticated" && session?.user?.id) {
        const response = await axios.get<Website[]>(
          `/api/websites?userId=${session.user.id}` // Filter by user
        );
        setWebsites(response.data);
      }
    }, 300000); // Refresh every 5 minutes
    return () => clearInterval(interval);
  }, [session, status]);
  const handleDelete = async (id: string) => {
    if (status !== 'authenticated') return;
    
    try {
      await axios.delete(`/api/websites?deleteId=${id}`);
      setWebsites(websites.filter(w => w.id !== id));
    } catch (error) {
      console.error('Delete error:', error);
    }
  };

  return (
    <div className="space-y-6 p-6 rounded-xl bg-gray-800/50 backdrop-blur-sm border border-gray-700/30 shadow-lg">
      <h3 className="text-xl font-semibold text-gray-100 mb-4">Your Websites</h3>
      
      {websites.length === 0 ? (
        <p className="text-gray-400 p-4 text-center">No websites added yet</p>
      ) : (
        <div className="space-y-3">
          {websites.map(website => (
            <div 
              key={website.id} 
              className="flex items-center justify-between p-2 rounded-lg bg-gray-700/40 backdrop-blur-sm border border-gray-600/30 hover:bg-gray-700/60 transition-colors"
            >
              <div className="flex items-center gap-3">
                <a 
                  href={website.url} 
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-200 hover:text-blue-400 hover:underline flex items-center gap-2"
                >
                  {website.url}
                  <ExternalLink className="h-3.5 w-3.5 text-gray-400/80" />
                </a>
              </div>
              
              <div className="flex items-center gap-4">
                <span className={`px-3 py-1.5 text-xs rounded-full ${
                  website.status === Status.up 
                    ? 'bg-green-900/30 text-green-300' 
                    : 'bg-red-900/30 text-red-300'
                }`}>
                  {website.status}
                </span>
                
                <button 
                  onClick={() => handleDelete(website.id)}
                  className="p-2 rounded-full hover:bg-gray-600/50 text-gray-400 hover:text-red-400 transition-colors"
                  title="Delete website"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default WebsitesTable;