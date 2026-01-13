import React from 'react';
import { User, MonthlyStat } from '../types';
import { Download, Share2, Award } from 'lucide-react';

interface CertificateProps {
  user: User;
  type: 'RANK' | 'MONTHLY';
  monthlyData?: MonthlyStat;
  onClose: () => void;
}

const Certificate: React.FC<CertificateProps> = ({ user, type, monthlyData, onClose }) => {
  const dateStr = new Date().toLocaleDateString();
  
  const handleDownload = () => {
    // In a real app, use html2canvas + jspdf here. 
    // For this demo, we simulate a download action.
    alert("Downloading PDF Certificate...");
  };

  return (
    <div className="flex flex-col items-center justify-center p-4 min-h-screen bg-slate-800/90 fixed inset-0 z-50 overflow-y-auto">
      <div className="bg-white w-full max-w-2xl p-8 rounded-lg shadow-2xl relative animate-scale-up border-8 border-double border-brand-200">
        
        {/* Certificate Border Decoration */}
        <div className="absolute top-4 left-4 w-16 h-16 border-t-4 border-l-4 border-brand-500 rounded-tl-3xl opacity-50"></div>
        <div className="absolute top-4 right-4 w-16 h-16 border-t-4 border-r-4 border-brand-500 rounded-tr-3xl opacity-50"></div>
        <div className="absolute bottom-4 left-4 w-16 h-16 border-b-4 border-l-4 border-brand-500 rounded-bl-3xl opacity-50"></div>
        <div className="absolute bottom-4 right-4 w-16 h-16 border-b-4 border-r-4 border-brand-500 rounded-br-3xl opacity-50"></div>

        <div className="text-center space-y-6 py-8">
          <div className="flex justify-center">
             <Award className="w-20 h-20 text-brand-500" />
          </div>
          
          <div>
            <h1 className="text-4xl font-serif font-bold text-slate-900 tracking-wide uppercase">
                Certificate of {type === 'RANK' ? 'Achievement' : 'Excellence'}
            </h1>
            <p className="text-slate-500 mt-2 font-serif italic">This certifies that</p>
          </div>

          <h2 className="text-5xl font-handwriting text-brand-700 font-bold py-4 border-b-2 border-slate-100 inline-block px-12">
            {user.name}
          </h2>

          <p className="text-slate-600 text-lg leading-relaxed max-w-lg mx-auto">
            {type === 'RANK' 
              ? `Has successfully reached the prestigious rank of ${user.currentRank} by demonstrating outstanding dedication and focus.`
              : `Has completed ${monthlyData?.totalHours} hours of study in ${monthlyData?.month}, earning ${monthlyData?.totalPoints} points.`
            }
          </p>

          <div className="grid grid-cols-2 gap-12 mt-12 pt-8">
            <div className="text-center">
              <p className="text-brand-900 font-bold text-xl">{dateStr}</p>
              <div className="h-px bg-slate-300 w-full mt-2"></div>
              <p className="text-slate-400 text-sm mt-1 uppercase tracking-widest">Date</p>
            </div>
            <div className="text-center">
              <p className="text-brand-900 font-bold text-xl font-handwriting">Parent Sig.</p>
              <div className="h-px bg-slate-300 w-full mt-2"></div>
              <p className="text-slate-400 text-sm mt-1 uppercase tracking-widest">Signature</p>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex gap-4 mt-8 print:hidden">
          <button 
            onClick={handleDownload}
            className="flex-1 bg-brand-600 hover:bg-brand-700 text-white py-3 rounded-lg font-bold flex items-center justify-center gap-2 transition"
          >
            <Download className="w-5 h-5" /> Download PDF
          </button>
          <button 
            onClick={onClose}
            className="px-6 py-3 border border-slate-300 rounded-lg font-bold text-slate-600 hover:bg-slate-50"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default Certificate;
