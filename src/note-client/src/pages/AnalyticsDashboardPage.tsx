import React from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../store';
import { Note } from '../types';

const AnalyticsDashboardPage: React.FC = () => {
  const { items: notes, status } = useSelector((state: RootState) => state.notes);
  
  // Get processed notes with analysis data
  const processedNotes = notes.filter(note => note.status === 'processed' && note.analysis);
  
  // Calculate overall sentiment distribution
  const sentimentDistribution = processedNotes.reduce(
    (acc, note) => {
      const sentiment = note.analysis?.sentiment?.label || 'neutral';
      acc[sentiment] = (acc[sentiment] || 0) + 1;
      return acc;
    },
    { positive: 0, negative: 0, neutral: 0 } as Record<string, number>
  );
  
  // Get most common topics/tags
  const tagCounts = notes.reduce((acc, note) => {
    if (note.tags) {
      note.tags.forEach(tag => {
        acc[tag] = (acc[tag] || 0) + 1;
      });
    }
    return acc;
  }, {} as Record<string, number>);
  
  // Sort tags by frequency
  const topTags = Object.entries(tagCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);
  
  // Get notes by category
  const categoryCounts = notes.reduce((acc, note) => {
    const category = note.category || 'Uncategorized';
    acc[category] = (acc[category] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  
  if (status === 'loading') {
    return (
      <div className="flex justify-center p-8">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white"></div>
      </div>
    );
  }
  
  return (
    <div style={{padding: '1.5rem'}}>
      <h1 style={{fontSize: '1.875rem', fontWeight: 'bold', color: 'white', marginBottom: '1.5rem'}}>
        Analytics Dashboard
      </h1>
      
      <div className="responsive-grid" style={{marginBottom: '1.5rem'}}>
        {/* Summary Stats */}
        <div className="modern-card hover-lift">
          <div style={{padding: '1rem', borderBottom: '1px solid rgba(255, 255, 255, 0.2)'}}>
            <h2 className="text-primary" style={{fontSize: '1.25rem', fontWeight: '500'}}>Notes Summary</h2>
          </div>
          <div>
            <ul style={{listStyle: 'none', padding: 0, margin: 0, borderTop: '1px solid rgba(255, 255, 255, 0.1)'}}>
              <li style={{padding: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255, 255, 255, 0.1)'}}>
                <span className="text-primary">Total Notes</span>
                <span className="text-secondary">{notes.length}</span>
              </li>
              <li style={{padding: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255, 255, 255, 0.1)'}}>
                <span className="text-primary">Processed Notes</span>
                <span className="text-secondary">{processedNotes.length}</span>
              </li>
              <li style={{padding: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                <span className="text-primary">Processing Rate</span>
                <span className="text-secondary">{Math.round((processedNotes.length / Math.max(notes.length, 1)) * 100)}%</span>
              </li>
            </ul>
          </div>
        </div>
        
        {/* Sentiment Analysis */}
        <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-lg transition-all duration-300 hover:translate-y-[-2px] hover:bg-white/20 overflow-hidden">
          <div className="p-4 border-b border-white/20">
            <h2 className="text-white text-xl font-medium">Sentiment Analysis</h2>
          </div>
          <div className="p-6 space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-white">Positive</span>
                <span className="text-white/70">{sentimentDistribution.positive}</span>
              </div>
              <div className="w-full bg-white/20 rounded-full h-2.5">
                <div 
                  className="bg-emerald-500/80 h-2.5 rounded-full" 
                  style={{ width: `${(sentimentDistribution.positive / Math.max(processedNotes.length, 1)) * 100}%` }}
                ></div>
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-white">Neutral</span>
                <span className="text-white/70">{sentimentDistribution.neutral}</span>
              </div>
              <div className="w-full bg-white/20 rounded-full h-2.5">
                <div 
                  className="bg-blue-500/80 h-2.5 rounded-full" 
                  style={{ width: `${(sentimentDistribution.neutral / Math.max(processedNotes.length, 1)) * 100}%` }}
                ></div>
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-white">Negative</span>
                <span className="text-white/70">{sentimentDistribution.negative}</span>
              </div>
              <div className="w-full bg-white/20 rounded-full h-2.5">
                <div 
                  className="bg-rose-500/80 h-2.5 rounded-full" 
                  style={{ width: `${(sentimentDistribution.negative / Math.max(processedNotes.length, 1)) * 100}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Popular Tags */}
        <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-lg transition-all duration-300 hover:translate-y-[-2px] hover:bg-white/20 overflow-hidden">
          <div className="p-4 border-b border-white/20">
            <h2 className="text-white text-xl font-medium">Popular Tags</h2>
          </div>
          <div className="p-6">
            {topTags.length > 0 ? (
              <div className="space-y-3">
                {topTags.map(([tag, count]) => (
                  <div key={tag} className="flex justify-between items-center">
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-sidebar-primary/40 backdrop-blur-md border border-white/20 text-white">{tag}</span>
                    <span className="text-white/70">{count} notes</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-white/60">No tags found</p>
            )}
          </div>
        </div>
        
        {/* Category Distribution */}
        <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-lg transition-all duration-300 hover:translate-y-[-2px] hover:bg-white/20 overflow-hidden col-span-1 md:col-span-3">
          <div className="p-4 border-b border-white/20">
            <h2 className="text-white text-xl font-medium">Notes by Category</h2>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
              {Object.entries(categoryCounts).map(([category, count]) => (
                <div key={category} className="backdrop-blur-md bg-white/5 border border-white/10 rounded-lg p-4 text-center transition-all duration-300 hover:translate-y-[-2px] hover:bg-white/10">
                  <p className="text-2xl font-bold text-white mb-1">{count}</p>
                  <p className="text-white/60">{category}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
        
        {/* Recently Processed Notes */}
        <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-lg transition-all duration-300 hover:translate-y-[-2px] hover:bg-white/20 overflow-hidden col-span-1 md:col-span-3">
          <div className="p-4 border-b border-white/20">
            <h2 className="text-white text-xl font-medium">Recently Processed Notes</h2>
          </div>
          <div className="p-0">
            {processedNotes.length > 0 ? (
              <ul className="divide-y divide-white/10">
                {processedNotes.slice(0, 5).map(note => (
                  <li key={note.id} className="p-4 hover:bg-white/5">
                    <div className="flex justify-between items-start gap-4">
                      <div>
                        <h3 className="text-white font-medium">{note.title}</h3>
                        <div className="flex items-center mt-1">
                          <span className="text-white/60 text-xs">
                            {new Date(note.updatedAt).toLocaleDateString()}
                          </span>
                          {note.analysis?.sentiment && (
                            <span 
                              className={`ml-2 px-2 py-0.5 rounded text-xs text-white ${
                                note.analysis.sentiment.label === 'positive' ? 'bg-emerald-500' :
                                note.analysis.sentiment.label === 'negative' ? 'bg-rose-500' : 'bg-blue-500'
                              }`}
                            >
                              {note.analysis.sentiment.label}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="p-4 text-white/60">No processed notes found</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsDashboardPage;
