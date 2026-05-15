import { Flame, Clock, Trophy, BarChart3 } from 'lucide-react';
import useWorkoutStore from '../../store/useWorkoutStore.js';
import './BottomNav.css';

const tabs = [
  { id: 'today',    label: 'Today',    Icon: Flame },
  { id: 'history',  label: 'History',  Icon: Clock },
  { id: 'prs',      label: 'PRs',      Icon: Trophy },
  { id: 'insights', label: 'Insights', Icon: BarChart3 },
];

export default function BottomNav() {
  const activeTab = useWorkoutStore(s => s.activeTab);
  const setActiveTab = useWorkoutStore(s => s.setActiveTab);

  return (
    <nav className="bottom-nav" id="bottom-nav">
      {tabs.map(({ id, label, Icon }) => (
        <button
          key={id}
          id={`nav-${id}`}
          className={`bottom-nav__tab ${activeTab === id ? 'bottom-nav__tab--active' : ''}`}
          onClick={() => setActiveTab(id)}
          aria-label={label}
          aria-current={activeTab === id ? 'page' : undefined}
        >
          <Icon size={24} strokeWidth={activeTab === id ? 2.5 : 1.5} />
          <span className="bottom-nav__label">{label}</span>
          {activeTab === id && <span className="bottom-nav__indicator" />}
        </button>
      ))}
    </nav>
  );
}
