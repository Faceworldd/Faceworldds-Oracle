
import React, { useState, useEffect } from 'react';
import Layout from './components/Layout';
import Dashboard from './components/Dashboard';
import ReflectionJournal from './components/ReflectionJournal';
import GrowthCoach from './components/GrowthCoach';
import VisionBoard from './components/VisionBoard';
import Pulse from './components/Pulse';
import Temple from './components/Temple';
import { AppView, AstroProfile, CosmicMarker, UserStats } from './types';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<AppView>(AppView.DASHBOARD);
  
  const [astroProfile, setAstroProfile] = useState<AstroProfile>(() => {
    const saved = localStorage.getItem('faceworldd_astro_profile');
    return saved ? JSON.parse(saved) : { sunSign: '', moonSign: '', risingSign: '', aiPersonality: 'Pisces' };
  });

  const [markers, setMarkers] = useState<CosmicMarker[]>(() => {
    const saved = localStorage.getItem('faceworldd_markers');
    return saved ? JSON.parse(saved) : [];
  });

  const [stats, setStats] = useState<UserStats>(() => {
    const saved = localStorage.getItem('faceworldd_stats');
    return saved ? JSON.parse(saved) : {
      firstOpened: Date.now(),
      totalActiveMinutes: 0,
      oracleInteractions: 0,
      journalEntries: 0,
      visionCreations: 0,
      experiencePoints: 0,
      level: 1,
      streak: 0,
      unlockedVibes: [],
      creatorLinks: {
        soundcloud: ''
      }
    };
  });

  // Persist Data
  useEffect(() => {
    localStorage.setItem('faceworldd_astro_profile', JSON.stringify(astroProfile));
  }, [astroProfile]);

  useEffect(() => {
    localStorage.setItem('faceworldd_markers', JSON.stringify(markers));
  }, [markers]);

  useEffect(() => {
    localStorage.setItem('faceworldd_stats', JSON.stringify(stats));
  }, [stats]);

  // Level Up Logic
  useEffect(() => {
    const calculatedLevel = Math.floor(stats.experiencePoints / 100) + 1;
    if (calculatedLevel !== stats.level) {
      setStats(prev => ({ 
        ...prev, 
        level: calculatedLevel
      }));
    }
  }, [stats.experiencePoints]);

  // Track active time
  useEffect(() => {
    const interval = setInterval(() => {
      setStats(prev => ({
        ...prev,
        totalActiveMinutes: prev.totalActiveMinutes + 1
      }));
    }, 60000);
    return () => clearInterval(interval);
  }, []);

  const incrementStat = (key: keyof UserStats, xp: number) => {
    setStats(prev => ({
      ...prev,
      [key]: (prev[key] as number) + 1,
      experiencePoints: prev.experiencePoints + xp
    }));
  };

  const handleDailyCheckIn = () => {
    const today = new Date().toLocaleDateString();
    if (stats.lastCheckIn === today) return;

    setStats(prev => {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const wasYesterday = prev.lastCheckIn === yesterday.toLocaleDateString();
      return {
        ...prev,
        streak: wasYesterday ? prev.streak + 1 : 1,
        lastCheckIn: today,
        experiencePoints: prev.experiencePoints + 10
      };
    });
  };

  const updateStats = (newStats: Partial<UserStats>) => {
    setStats(prev => ({ ...prev, ...newStats }));
  };

  const renderContent = () => {
    switch (currentView) {
      case AppView.DASHBOARD:
        return <Dashboard 
          setView={setCurrentView} 
          astroProfile={astroProfile} 
          setAstroProfile={setAstroProfile}
          stats={stats}
          onCheckIn={handleDailyCheckIn}
        />;
      case AppView.JOURNAL:
        return <ReflectionJournal 
          astroProfile={astroProfile} 
          onEntrySaved={() => incrementStat('journalEntries', 50)}
        />;
      case AppView.COACH:
        return <GrowthCoach 
          astroProfile={astroProfile} 
          onOracleChat={() => incrementStat('oracleInteractions', 30)}
        />;
      case AppView.VISION_BOARD:
        return <VisionBoard 
          astroProfile={astroProfile} 
          onVisionCreated={() => incrementStat('visionCreations', 40)}
        />;
      case AppView.PULSE:
        return <Pulse 
          markers={markers} 
          setMarkers={setMarkers} 
          stats={stats} 
        />;
      case AppView.TEMPLE:
        return <Temple stats={stats} astroProfile={astroProfile} onUpdateStats={updateStats} />;
      default:
        return <Dashboard 
          setView={setCurrentView} 
          astroProfile={astroProfile} 
          setAstroProfile={setAstroProfile}
          stats={stats}
          onCheckIn={handleDailyCheckIn}
        />;
    }
  };

  return (
    <Layout currentView={currentView} setView={setCurrentView} astroProfile={astroProfile} stats={stats}>
      {renderContent()}
    </Layout>
  );
};

export default App;
