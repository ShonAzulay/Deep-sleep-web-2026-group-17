import SpaceLayout from './ui/SpaceLayout';
import GlassCard from './ui/GlassCard';

export default function RoleSelect({ onSelect }) {
  return (
    <SpaceLayout>
      <GlassCard className="w-full max-w-2xl" glowColor="indigo">
        <h1 className="mb-10 text-center text-3xl sm:text-4xl font-extrabold text-white drop-shadow-[0_0_15px_rgba(255,255,255,0.5)]">
          בחר תפקיד להתחברות
        </h1>

        <div className="space-y-6">
          <button
            onClick={() => onSelect("student")}
            className="w-full rounded-2xl bg-indigo-600/20 border border-indigo-500/50 py-6
                       text-xl font-bold text-white hover:bg-indigo-600/40 hover:border-cyan-400 hover:scale-[1.02]
                       shadow-[0_0_15px_rgba(99,102,241,0.2)] hover:shadow-[0_0_25px_rgba(0,243,255,0.4)]
                       transition-all duration-300 group relative overflow-hidden"
          >
            <span className="relative z-10">👨‍🎓 כניסת תלמיד</span>
            <div className="absolute inset-0 bg-gradient-to-r from-indigo-600/10 to-cyan-500/10 opacity-0 group-hover:opacity-100 transition-opacity" />
          </button>

          <button
            onClick={() => onSelect("teacher")}
            className="w-full rounded-2xl bg-emerald-600/20 border border-emerald-500/50 py-6
                       text-xl font-bold text-white hover:bg-emerald-600/40 hover:border-emerald-400 hover:scale-[1.02]
                       shadow-[0_0_15px_rgba(16,185,129,0.2)] hover:shadow-[0_0_25px_rgba(52,211,153,0.4)]
                       transition-all duration-300 group relative overflow-hidden"
          >
            <span className="relative z-10">👨‍🏫 כניסת מורה</span>
             <div className="absolute inset-0 bg-gradient-to-r from-emerald-600/10 to-teal-500/10 opacity-0 group-hover:opacity-100 transition-opacity" />
          </button>

          <button
            onClick={() => onSelect("researchManager")}
            className="w-full rounded-2xl bg-purple-600/20 border border-purple-500/50 py-6
                       text-xl font-bold text-white hover:bg-purple-600/40 hover:border-fuchsia-400 hover:scale-[1.02]
                       shadow-[0_0_15px_rgba(147,51,234,0.2)] hover:shadow-[0_0_25px_rgba(232,121,249,0.4)]
                       transition-all duration-300 group relative overflow-hidden"
          >
             <span className="relative z-10">🔬 כניסת מנהל מחקר</span>
             <div className="absolute inset-0 bg-gradient-to-r from-purple-600/10 to-pink-500/10 opacity-0 group-hover:opacity-100 transition-opacity" />
          </button>
        </div>
      </GlassCard>
      
       {/* Footer Branding */}
      <div className="absolute bottom-4 text-indigo-500/30 text-xs font-mono tracking-widest pointer-events-none z-20">
        DEEP-SLEEP LABS // PORTAL
      </div>
    </SpaceLayout>
  );
}
