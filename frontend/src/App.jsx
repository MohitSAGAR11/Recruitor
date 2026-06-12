import React, { useEffect } from 'react';
import Sidebar from './components/layout/Sidebar.jsx';
import Toast from './components/ui/Toast.jsx';
import LoadingOverlay from './components/ui/LoadingOverlay.jsx';
import Step1_JDInput from './components/steps/Step1_JDInput.jsx';
import Step2_CVUpload from './components/steps/Step2_CVUpload.jsx';
import Step3_Scoring from './components/steps/Step3_Scoring.jsx';
import Step4_Results from './components/steps/Step4_Results.jsx';
import AuthScreen from './components/auth/AuthScreen.jsx';
import HistoryPanel from './components/HistoryPanel.jsx';
import useRecruitStore from './store/useRecruitStore.js';
import useAuthStore from './store/useAuthStore.js';

const STEP_COMPONENTS = {
  1: Step1_JDInput,
  2: Step2_CVUpload,
  3: Step3_Scoring,
  4: Step4_Results,
};

export default function App() {
  const { currentStep, loading, loadingMessage, toasts, removeToast, showHistory } = useRecruitStore();
  const { user, authReady, init } = useAuthStore();

  // On boot, restore any existing login session
  useEffect(() => { init(); }, [init]);

  // While checking for an existing session, render nothing (avoids auth flash)
  if (!authReady) {
    return <div style={{ width: '100%', height: '100vh' }} />;
  }

  // Not logged in → show the auth screen
  if (!user) {
    return (
      <>
        <AuthScreen />
        <Toast toasts={toasts} onRemove={removeToast} />
      </>
    );
  }

  const StepComponent = STEP_COMPONENTS[currentStep] || Step1_JDInput;
  const isFullHeight = currentStep === 4;

  return (
    <div style={{ display: 'flex', width: '100%', height: '100vh', overflow: 'hidden' }}>
      {/* Fixed Sidebar */}
      <Sidebar />

      {/* Main content area */}
      <main
        style={{
          flex: 1,
          overflow: isFullHeight ? 'hidden' : 'auto',
          background: 'var(--bg-base)',
          position: 'relative',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <StepComponent />
      </main>

      {/* History panel (slide-over) */}
      {showHistory && <HistoryPanel />}

      {/* Loading overlay (global — only for non-scoring operations) */}
      {loading && currentStep !== 3 && (
        <LoadingOverlay message={loadingMessage || 'Processing…'} />
      )}

      {/* Toast notifications */}
      <Toast toasts={toasts} onRemove={removeToast} />
    </div>
  );
}

