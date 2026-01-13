
import React, { useState, useEffect } from 'react';
import { 
  AppView, 
  Task, 
  User, 
  RANKS,
  MonthlyStat
} from './types';
import * as storage from './services/storageService';
import Timer from './components/Timer';
import ParentApproval from './components/ParentApproval';
import Certificate from './components/Certificate';
import Settings from './components/Settings';
import { 
  Plus, 
  Play, 
  Award, 
  Calendar, 
  Settings as SettingsIcon, 
  Home,
  Clock,
  TrendingUp,
  User as UserIcon,
  Lock
} from 'lucide-react';

function App() {
  const [view, setView] = useState<AppView>(AppView.HOME);
  const [user, setUser] = useState<User>(storage.getUser());
  const [tasks, setTasks] = useState<Task[]>([]);
  const [activeTask, setActiveTask] = useState<Task | null>(null);
  
  // New Task Form
  const [newTaskSubject, setNewTaskSubject] = useState('');
  const [newTaskTime, setNewTaskTime] = useState(30);

  // Stats
  const [monthlyStats, setMonthlyStats] = useState(storage.getMonthlyStats());

  // Initialization
  useEffect(() => {
    const today = new Date().toISOString().split('T')[0];
    setTasks(storage.getTasks(today));
    setUser(storage.getUser());
  }, []);

  const refreshData = () => {
    const today = new Date().toISOString().split('T')[0];
    setTasks(storage.getTasks(today));
    setUser(storage.getUser());
  };

  const handleAddTask = () => {
    if (!newTaskSubject) return;
    const newTask: Task = {
      id: Date.now().toString(),
      subjectName: newTaskSubject,
      estimatedTime: newTaskTime,
      date: new Date().toISOString().split('T')[0],
      status: 'pending'
    };
    storage.addTask(newTask);
    refreshData();
    setNewTaskSubject('');
    setNewTaskTime(30);
  };

  const handleStartTask = (task: Task) => {
    setActiveTask(task);
    setView(AppView.TIMER);
  };

  const handleTimerFinish = (actualSeconds: number, isTimeOver: boolean) => {
    if (!activeTask) return;
    
    // Status Logic
    let status: Task['status'] = 'waiting_approval';
    if (isTimeOver && actualSeconds < 5) { 
        // Logic for accidental click or immediate quit? 
        // For now sticking to prompt: if completed after time -> +5. 
        // But if they clicked "Finished" it implies completion.
        // If they just let time run out without finishing, that's different. 
        // Assuming "Finished" button always means work is done.
    } 
    
    const updatedTask = storage.updateTask(activeTask.id, {
      actualTime: actualSeconds,
      status: 'waiting_approval'
    });

    if(updatedTask) setActiveTask(updatedTask);
    setView(AppView.APPROVAL);
  };
  
  const handleApproval = () => {
    if (!activeTask) return;
    
    // Scoring Logic
    let points = 0;
    const estSeconds = activeTask.estimatedTime * 60;
    
    if ((activeTask.actualTime || 0) <= estSeconds) {
      points = 10;
    } else {
      points = 5;
    }

    // Update Task
    storage.updateTask(activeTask.id, { 
      status: 'completed', 
      approved: true 
    });

    // Add Score
    storage.addScore(points, activeTask.id);
    
    refreshData();
    setView(AppView.RANK);
    setActiveTask(null);
  };

  const handleReject = () => {
     if (!activeTask) return;
     storage.updateTask(activeTask.id, { status: 'failed' });
     storage.addScore(-5, activeTask.id); // Penalty logic as per prompt
     refreshData();
     setView(AppView.HOME);
     setActiveTask(null);
  }

  // --- RENDER HELPERS ---

  const renderHome = () => (
    <div className="space-y-6 pb-24">
      {/* Header Card */}
      <div className="bg-gradient-to-r from-brand-600 to-brand-500 rounded-3xl p-6 text-white shadow-lg shadow-brand-200">
        <div className="flex justify-between items-start">
          <div>
            <p className="text-brand-100 font-medium text-sm">Welcome back,</p>
            <h1 className="text-3xl font-bold">{user.name}</h1>
          </div>
          <div className="bg-white/20 p-2 rounded-xl backdrop-blur-sm">
             <Award className="w-8 h-8 text-white" />
          </div>
        </div>
        
        <div className="mt-6 flex items-end gap-2">
           <span className="text-5xl font-bold">{user.totalPoints}</span>
           <span className="text-brand-100 mb-2 font-medium">Points</span>
        </div>
        
        <div className="mt-4 bg-white/10 rounded-xl p-3 flex justify-between items-center">
            <span className="font-medium text-brand-50">Current Rank</span>
            <span className={`font-bold text-white px-3 py-1 rounded-lg bg-white/20`}>
                {user.currentRank}
            </span>
        </div>
      </div>

      {/* Quick Action */}
      <div className="grid grid-cols-2 gap-4">
        <button 
            onClick={() => setView(AppView.TASK_LIST)}
            className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex flex-col items-center gap-2 hover:bg-slate-50 transition"
        >
            <div className="bg-blue-100 p-3 rounded-full text-blue-600">
                <Plus className="w-6 h-6" />
            </div>
            <span className="font-bold text-slate-700">Add Tasks</span>
        </button>
        <button 
            onClick={() => setView(AppView.RANK)}
            className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex flex-col items-center gap-2 hover:bg-slate-50 transition"
        >
            <div className="bg-orange-100 p-3 rounded-full text-orange-600">
                <TrendingUp className="w-6 h-6" />
            </div>
            <span className="font-bold text-slate-700">My Rank</span>
        </button>
      </div>

      {/* Today's Progress */}
      <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm">
         <div className="flex justify-between items-center mb-4">
            <h3 className="font-bold text-lg text-slate-800">Today's Tasks</h3>
            <span className="text-sm text-slate-400">{new Date().toLocaleDateString()}</span>
         </div>
         
         {tasks.length === 0 ? (
            <div className="text-center py-8 text-slate-400">
                <p>No tasks planned for today.</p>
                <button onClick={() => setView(AppView.TASK_LIST)} className="text-brand-600 font-bold mt-2">Start Planning</button>
            </div>
         ) : (
             <div className="space-y-3">
                 {tasks.slice(0, 3).map(task => (
                     <div key={task.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                         <div className="flex items-center gap-3">
                            <div className={`w-2 h-12 rounded-full ${task.status === 'completed' ? 'bg-green-500' : 'bg-slate-300'}`}></div>
                            <div>
                                <p className="font-bold text-slate-700">{task.subjectName}</p>
                                <p className="text-xs text-slate-500">{task.estimatedTime} min</p>
                            </div>
                         </div>
                         {task.status === 'pending' && (
                             <button onClick={() => handleStartTask(task)} className="bg-brand-600 text-white p-2 rounded-lg">
                                 <Play className="w-4 h-4" />
                             </button>
                         )}
                         {task.status === 'completed' && <div className="text-green-500 font-bold text-sm">Done</div>}
                     </div>
                 ))}
                 {tasks.length > 3 && <p className="text-center text-xs text-slate-400">And {tasks.length - 3} more...</p>}
             </div>
         )}
      </div>
    </div>
  );

  const renderTaskList = () => (
    <div className="pb-24 space-y-6">
      <h2 className="text-2xl font-bold text-slate-800 px-2">Daily Plan</h2>
      
      {/* Add Task Input */}
      <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 space-y-4">
        <input 
            type="text" 
            value={newTaskSubject}
            onChange={(e) => setNewTaskSubject(e.target.value)}
            placeholder="Subject Name (e.g., Biology)" 
            className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 font-medium outline-none focus:border-brand-500 transition"
        />
        <div className="flex gap-4">
            <div className="flex-1 bg-slate-50 border border-slate-200 rounded-xl p-2 flex items-center px-4">
                 <Clock className="w-5 h-5 text-slate-400 mr-2" />
                 <input 
                    type="number" 
                    value={newTaskTime}
                    onChange={(e) => setNewTaskTime(Number(e.target.value))}
                    className="bg-transparent w-full outline-none font-bold text-slate-700"
                 />
                 <span className="text-xs text-slate-400 ml-1">min</span>
            </div>
            <button 
                onClick={handleAddTask}
                disabled={!newTaskSubject}
                className="bg-brand-600 disabled:bg-slate-300 text-white px-6 rounded-xl font-bold"
            >
                <Plus className="w-6 h-6" />
            </button>
        </div>
      </div>

      {/* List */}
      <div className="space-y-3">
        {tasks.map((task) => (
            <div key={task.id} className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 flex items-center justify-between">
                <div>
                    <h4 className="font-bold text-slate-800">{task.subjectName}</h4>
                    <p className="text-xs text-slate-500">{task.estimatedTime} min • {task.status.replace('_', ' ')}</p>
                </div>
                {task.status === 'pending' ? (
                     <button 
                        onClick={() => handleStartTask(task)}
                        className="bg-brand-50 text-brand-600 px-4 py-2 rounded-lg text-sm font-bold hover:bg-brand-100"
                    >
                        START
                    </button>
                ) : (
                    <span className={`text-sm font-bold px-3 py-1 rounded-lg ${
                        task.status === 'completed' ? 'bg-green-100 text-green-600' :
                        task.status === 'failed' ? 'bg-red-100 text-red-600' : 
                        'bg-orange-100 text-orange-600'
                    }`}>
                        {task.status === 'completed' ? 'Done' : task.status === 'waiting_approval' ? 'Wait' : 'Failed'}
                    </span>
                )}
            </div>
        ))}
        {tasks.length === 0 && <div className="text-center text-slate-400 py-10">Add tasks to start your day!</div>}
      </div>
    </div>
  );

  const renderRankScreen = () => {
    const nextRank = Object.entries(RANKS).find(([name, range]) => range.min > user.totalPoints);
    const nextRankPoints = nextRank ? nextRank[1].min : user.totalPoints;
    const progress = Math.min(100, (user.totalPoints / nextRankPoints) * 100);

    return (
      <div className="pb-24 space-y-6">
        <h2 className="text-2xl font-bold text-slate-800 px-2">Your Rank</h2>
        
        <div className="bg-white p-8 rounded-3xl shadow-lg border border-slate-100 flex flex-col items-center text-center relative overflow-hidden">
             {/* Background Glow */}
             <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-brand-400 to-purple-500"></div>
             
             <div className={`w-32 h-32 rounded-full border-4 flex items-center justify-center mb-4 ${
                 user.currentRank === 'Gold' ? 'border-yellow-400 bg-yellow-50' : 
                 user.currentRank === 'Silver' ? 'border-slate-300 bg-slate-50' : 
                 'border-orange-400 bg-orange-50'
             }`}>
                <Award className={`w-16 h-16 ${RANKS[user.currentRank].color}`} />
             </div>
             
             <h3 className={`text-3xl font-black uppercase tracking-wider ${RANKS[user.currentRank].color}`}>
                 {user.currentRank}
             </h3>
             <p className="text-slate-400 font-medium mt-1">Current Standing</p>

             <div className="w-full mt-8">
                <div className="flex justify-between text-xs font-bold text-slate-400 mb-2">
                    <span>{user.totalPoints} pts</span>
                    <span>Next: {nextRankPoints} pts</span>
                </div>
                <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full bg-brand-500 transition-all duration-1000" style={{ width: `${progress}%` }}></div>
                </div>
             </div>
             
             <button 
                onClick={() => setView(AppView.CERTIFICATES)}
                className="mt-8 w-full py-3 bg-slate-900 text-white rounded-xl font-bold shadow-lg active:scale-95 transition flex items-center justify-center gap-2"
             >
                <Award className="w-5 h-5" />
                View Certificates
             </button>
        </div>
      </div>
    );
  };

  const renderCertificates = () => (
      <div className="pb-24 space-y-6">
          <h2 className="text-2xl font-bold text-slate-800 px-2">Certificates</h2>
          
          <div className="space-y-4">
              {/* Rank Certificate */}
              <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                      <div className="bg-purple-100 p-3 rounded-lg text-purple-600">
                          <Award className="w-6 h-6" />
                      </div>
                      <div>
                          <h4 className="font-bold text-slate-800">Rank Certificate</h4>
                          <p className="text-xs text-slate-500">For reaching {user.currentRank}</p>
                      </div>
                  </div>
                   <button 
                      onClick={() => setVerifyPinForCert('RANK')}
                      className="text-brand-600 font-bold text-sm bg-brand-50 px-3 py-1 rounded-lg"
                   >
                      View
                  </button>
              </div>

              <h3 className="font-bold text-slate-700 mt-6 px-2">Monthly History</h3>
              {monthlyStats.map((stat, idx) => (
                  <div key={idx} className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100">
                      <div className="flex justify-between items-start mb-4">
                         <div>
                             <h4 className="font-bold text-slate-800 text-lg">{stat.month}</h4>
                             <p className="text-xs text-slate-500">{stat.rank} Rank Achieved</p>
                         </div>
                         <button 
                            onClick={() => setVerifyPinForCert('MONTHLY', stat)}
                            className="bg-slate-900 text-white p-2 rounded-lg"
                         >
                             <Award className="w-4 h-4" />
                         </button>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-sm">
                          <div className="bg-slate-50 p-2 rounded-lg text-center">
                              <span className="block font-bold text-slate-800">{stat.totalPoints}</span>
                              <span className="text-slate-400 text-xs">Points</span>
                          </div>
                          <div className="bg-slate-50 p-2 rounded-lg text-center">
                              <span className="block font-bold text-slate-800">{stat.totalHours}h</span>
                              <span className="text-slate-400 text-xs">Studied</span>
                          </div>
                      </div>
                  </div>
              ))}
          </div>
      </div>
  );

  // --- CERTIFICATE PIN VERIFICATION STATE ---
  const [certToView, setCertToView] = useState<{type: 'RANK' | 'MONTHLY', data?: MonthlyStat} | null>(null);
  const [showPinForCert, setShowPinForCert] = useState(false);
  
  const setVerifyPinForCert = (type: 'RANK' | 'MONTHLY', data?: MonthlyStat) => {
      setCertToView({ type, data });
      setShowPinForCert(true);
  }

  // --- RENDER MAIN ---

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900">
      
      {/* Dynamic Main Content */}
      <main className="max-w-md mx-auto p-4 min-h-screen">
        
        {view === AppView.HOME && renderHome()}
        {view === AppView.TASK_LIST && renderTaskList()}
        {view === AppView.RANK && renderRankScreen()}
        {view === AppView.CERTIFICATES && renderCertificates()}
        {view === AppView.SETTINGS && (
            <Settings user={user} onUpdateUser={(updated) => setUser(updated)} />
        )}
        
        {/* Full Screen Overlays */}
        {view === AppView.TIMER && activeTask && (
          <div className="fixed inset-0 bg-white z-40">
             <Timer 
                task={activeTask} 
                onFinish={handleTimerFinish} 
                onCancel={() => { setActiveTask(null); setView(AppView.HOME); }}
             />
          </div>
        )}

        {view === AppView.APPROVAL && activeTask && (
          <div className="fixed inset-0 bg-slate-100/90 z-40 backdrop-blur-md flex items-center justify-center">
            <ParentApproval 
                task={activeTask}
                onApprove={handleApproval}
                onReject={handleReject}
            />
          </div>
        )}

        {/* Certificate Modal */}
        {certToView && !showPinForCert && (
            <Certificate 
                user={user} 
                type={certToView.type} 
                monthlyData={certToView.data}
                onClose={() => setCertToView(null)}
            />
        )}

        {/* Certificate PIN Check Overlay */}
        {showPinForCert && (
             <div className="fixed inset-0 bg-slate-900/50 z-50 flex items-center justify-center p-4">
                 <div className="bg-white p-6 rounded-2xl w-full max-w-sm">
                     <h3 className="font-bold text-center mb-4">Parent PIN Required</h3>
                     <ParentApproval 
                        task={{...activeTask, subjectName: 'Certificate Access', estimatedTime: 0, status: 'completed'} as any} 
                        // Using ParentApproval component just for the PIN logic UI reuse, forcing dummy task
                        onApprove={() => { setShowPinForCert(false); /* Cert modal shows automatically now because certToView is set */ }}
                        onReject={() => { setShowPinForCert(false); setCertToView(null); }}
                     />
                 </div>
             </div>
        )}
      </main>

      {/* Bottom Navigation */}
      {(view !== AppView.TIMER && view !== AppView.APPROVAL) && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 py-3 px-6 shadow-2xl z-30">
          <div className="max-w-md mx-auto flex justify-between items-center">
            <button onClick={() => setView(AppView.HOME)} className={`flex flex-col items-center gap-1 ${view === AppView.HOME ? 'text-brand-600' : 'text-slate-400'}`}>
              <Home className="w-6 h-6" />
              <span className="text-[10px] font-bold">Home</span>
            </button>
            <button onClick={() => setView(AppView.TASK_LIST)} className={`flex flex-col items-center gap-1 ${view === AppView.TASK_LIST ? 'text-brand-600' : 'text-slate-400'}`}>
              <Calendar className="w-6 h-6" />
              <span className="text-[10px] font-bold">Tasks</span>
            </button>
             {/* FAB for quick start */}
            <button onClick={() => setView(AppView.TASK_LIST)} className="bg-brand-600 text-white p-4 rounded-full -mt-8 shadow-lg shadow-brand-200 border-4 border-slate-50">
               <Play className="w-6 h-6 fill-current" />
            </button>
            <button onClick={() => setView(AppView.CERTIFICATES)} className={`flex flex-col items-center gap-1 ${view === AppView.CERTIFICATES ? 'text-brand-600' : 'text-slate-400'}`}>
              <Award className="w-6 h-6" />
              <span className="text-[10px] font-bold">Awards</span>
            </button>
            <button onClick={() => setView(AppView.SETTINGS)} className={`flex flex-col items-center gap-1 ${view === AppView.SETTINGS ? 'text-brand-600' : 'text-slate-400'}`}>
              <SettingsIcon className="w-6 h-6" />
              <span className="text-[10px] font-bold">Settings</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
