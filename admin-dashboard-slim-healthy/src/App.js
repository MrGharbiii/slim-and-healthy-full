import React, { useState, useEffect } from 'react';
import LoginScreen from './screens/LoginScreen';
import DemandeDetailsScreen from './screens/DemandeDetailsScreen';
import ActionPlanScreen from './screens/ActionPlanScreen';
import UserDashboardScreen from './screens/UserDashboardScreen';
import UsersGridScreen from './screens/UsersGridScreen';
import { authAPI } from './services/apiService';
import './App.css';

function App() {
  const [currentScreen, setCurrentScreen] = useState('login');
  const [selectedDemandeId, setSelectedDemandeId] = useState(null);
  const [selectedProfiles, setSelectedProfiles] = useState([]);
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check if user is already logged in
  useEffect(() => {
    const checkAuthStatus = () => {
      try {
        // Try to get user info and token from storage
        const storedUser =
          localStorage.getItem('user') || sessionStorage.getItem('user');
        const accessToken =
          localStorage.getItem('accessToken') ||
          sessionStorage.getItem('accessToken');

        if (storedUser && accessToken) {
          // Parse the user info
          const parsedUser = JSON.parse(storedUser);
          setUser(parsedUser);
          // Check if user is admin to determine which screen to show
          if (parsedUser.isAdmin) {
            setCurrentScreen('listeDemandes');
          } else {
            setCurrentScreen('userDashboard');
          }
        }
      } catch (error) {
        console.error('Error checking auth status:', error);
        // Clear any potentially corrupt data
        localStorage.removeItem('user');
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        sessionStorage.removeItem('user');
        sessionStorage.removeItem('accessToken');
        sessionStorage.removeItem('refreshToken');
      } finally {
        setIsLoading(false);
      }
    };

    checkAuthStatus();
  }, []);

  const handleLogin = (userData) => {
    setUser(userData);
    // Check if user is admin to determine which screen to show
    if (userData.isAdmin) {
      setCurrentScreen('listeDemandes');
    } else {
      setCurrentScreen('userDashboard');
    }
  };

  const handleLogout = async () => {
    try {
      // Call the logout API endpoint
      await authAPI.logout();

      // State update
      setUser(null);
      setCurrentScreen('login');
    } catch (error) {
      console.error('Logout error:', error);
      // Even if API call fails, still log out on the frontend
      setUser(null);
      setCurrentScreen('login');
    }
  };

  const handleDemandeClick = (demande) => {
    setSelectedDemandeId(demande.id);
    setCurrentScreen('demandeDetails');
  };

  const handleBackToList = () => {
    setSelectedDemandeId(null);
    setCurrentScreen('listeDemandes');
  };

  const handleNavigateToActionPlan = (profiles) => {
    setSelectedProfiles(profiles);
    setCurrentScreen('actionPlan');
  };

  const handleBackToDetails = () => {
    setCurrentScreen('demandeDetails');
  };

  const handleSavePlan = (plan) => {
    console.log('Plan saved in App:', plan);
    // The API call is now handled directly in the ActionPlanScreen component
    // We just need to navigate back after the plan is saved
    setTimeout(() => {
      handleBackToList();
    }, 1000); // Small delay to allow the user to see the success message
  };

  // Show loading screen while checking auth status
  if (isLoading) {
    return <div className="loading-screen">Loading...</div>;
  }

  const renderScreen = () => {
    switch (currentScreen) {
      case 'login':
        return <LoginScreen onLogin={handleLogin} />;
      case 'userDashboard':
        return <UserDashboardScreen onLogout={handleLogout} />;
      case 'listeDemandes':
        return (
          <UsersGridScreen
            user={user}
            onLogout={handleLogout}
            onDemandeClick={handleDemandeClick}
          />
        );
      case 'demandeDetails':
        return (
          <DemandeDetailsScreen
            demandeId={selectedDemandeId}
            onBack={handleBackToList}
            onNavigateToActionPlan={handleNavigateToActionPlan}
          />
        );
      case 'actionPlan':
        return (
          <ActionPlanScreen
            profiles={selectedProfiles}
            onBack={handleBackToDetails}
            onSavePlan={handleSavePlan}
            userId={selectedDemandeId}
          />
        );
      default:
        return <LoginScreen onLogin={handleLogin} />;
    }
  };

  return <div className="App">{renderScreen()}</div>;
}

export default App;
