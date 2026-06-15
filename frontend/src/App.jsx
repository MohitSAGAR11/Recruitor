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

  useEffect(() => { init(); }, [init]);

  if (!authReady) {
    return <div className="app-main" style={{ minHeight: '100vh' }} />;
  }

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
    <div className="app-shell">
      <Sidebar />

      <main
        className="app-main"
        style={{
          display: 'flex',
          flexDirection: 'column',
          height: '100vh',
          overflow: isFullHeight ? 'hidden' : 'auto',
          position: 'relative',
        }}
      >
        <StepComponent />
      </main>

      {showHistory && <HistoryPanel />}
      {loading && currentStep !== 3 && (
        <LoadingOverlay message={loadingMessage || 'Processing...'} />
      )}
      <Toast toasts={toasts} onRemove={removeToast} />
    </div>
  );
}
