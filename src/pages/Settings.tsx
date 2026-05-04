
import { useAuth } from '../contexts/AuthContext';
import SettingsSimpleUser from '../components/settings/SettingsSimpleUser';
import SettingsProUser from '../components/settings/SettingsProUser';
import SettingsAdminUser from '../components/settings/SettingsAdminUser';
const Settings = () => {
  const { isAdmin, isPro } = useAuth();
  // Détermine quel composant de paramètres afficher en fonction du type d'utilisateur
  const renderSettingsComponent = () => {
    if (isAdmin) {
      return <SettingsAdminUser />;
    } else if (isPro) {
      return <SettingsProUser />;
    } else {
      return <SettingsSimpleUser />;
    }
  };
  return (
    <div className="container mx-auto px-4 py-6">
      <h1 className="text-xl font-bold mb-6">Paramètres</h1>
      {renderSettingsComponent()}
    </div>);

};
export default Settings;