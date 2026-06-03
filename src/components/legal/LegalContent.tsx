import React from 'react';
interface LegalContentProps {
  type: 'terms' | 'privacy' | 'cookies' | 'legal';
  onClose?: () => void;
  isInline?: boolean;
}
const LegalContent: React.FC<LegalContentProps> = ({ type, onClose, isInline }) => {
  // Content mapping for different legal pages
  const contentMap = {
    terms: {
      title: "Conditions Générales d'Utilisation",
      content: `
        <h2>1. Acceptation des conditions</h2>
        <p>En accédant à PronosBox, vous acceptez d'être lié par ces Conditions Générales d'Utilisation, toutes les lois et réglementations applicables, et vous acceptez que vous êtes responsable du respect des lois locales applicables.</p>
        <h2>2. Licence d'utilisation</h2>
        <p>Une licence révocable, non-exclusive et non-transférable vous est accordée pour utiliser PronosBox selon ces conditions. Cette licence ne vous permet pas de revendre ou d'exploiter commercialement le service sans autorisation.</p>
        <h2>3. Contenu utilisateur</h2>
        <p>En publiant du contenu sur PronosBox, vous garantissez que vous possédez tous les droits nécessaires sur ce contenu et qu'il ne viole aucune loi ou droit de tiers.</p>
        <h2>4. Modification des conditions</h2>
        <p>PronosBox se réserve le droit de modifier ces conditions à tout moment. Les utilisateurs seront informés des changements importants.</p>
        <h2>5. Limitation de responsabilité</h2>
        <p>PronosBox ne pourra être tenu responsable de tout dommage direct, indirect, accessoire ou consécutif résultant de l'utilisation ou de l'impossibilité d'utiliser nos services.</p>
      `
    },
    privacy: {
      title: 'Politique de Confidentialité',
      content: `
        <h2>1. Collecte d'informations</h2>
        <p>Nous collectons des informations lorsque vous vous inscrivez, vous connectez, et utilisez notre plateforme. Les données peuvent inclure votre nom, adresse email, et préférences d'utilisation.</p>
        <h2>2. Utilisation des informations</h2>
        <p>Les informations que nous collectons sont utilisées pour personnaliser votre expérience, améliorer notre site, et vous fournir les services demandés.</p>
        <h2>3. Protection des informations</h2>
        <p>Nous mettons en œuvre diverses mesures de sécurité pour protéger vos informations personnelles. Les données sensibles sont cryptées et transmises de manière sécurisée.</p>
        <h2>4. Divulgation à des tiers</h2>
        <p>Nous ne vendons, n'échangeons, ni ne transférons vos informations personnelles identifiables à des tiers sans votre consentement, sauf si requis par la loi.</p>
        <h2>5. Consentement</h2>
        <p>En utilisant notre site, vous considérez avoir lu et accepté notre politique de confidentialité.</p>
      `
    },
    cookies: {
      title: 'Politique des Cookies',
      content: `
        <h2>1. Qu'est-ce qu'un cookie?</h2>
        <p>Un cookie est un petit fichier stocké sur votre appareil qui nous aide à fournir des fonctionnalités sur notre site.</p>
        <h2>2. Comment utilisons-nous les cookies?</h2>
        <p>Nous utilisons des cookies pour comprendre et enregistrer vos préférences, améliorer le site, et fournir des fonctionnalités personnalisées.</p>
        <h2>3. Types de cookies utilisés</h2>
        <p>Nous utilisons des cookies de session, des cookies persistants, des cookies de fonctionnalité et des cookies de ciblage.</p>
        <h2>4. Contrôle des cookies</h2>
        <p>Vous pouvez choisir de désactiver les cookies dans les paramètres de votre navigateur, mais cela peut affecter certaines fonctionnalités de notre site.</p>
        <h2>5. Cookies tiers</h2>
        <p>Certains de nos partenaires peuvent également utiliser des cookies sur notre site pour diverses fonctionnalités et analyses.</p>
      `
    },
    legal: {
      title: 'Mentions Légales',
      content: `
        <h2>1. Éditeur du site</h2>
        <p>PronosBox est édité par PronosBox SAS, société au capital de 10 000€, immatriculée au RCS sous le numéro 123 456 789.</p>
        <h2>2. Siège social</h2>
        <p>123 Avenue des Sports, 75001 Paris, France</p>
        <h2>3. Directeur de la publication</h2>
        <p>Jean Dupont, Président de PronosBox SAS</p>
        <h2>4. Hébergement</h2>
        <p>Le site est hébergé par Hosting Services Inc., situé au 456 Server Street, San Francisco, CA 94107, USA.</p>
        <h2>5. Contact</h2>
        <p>Pour toute question, veuillez nous contacter à contact@pronosbox.com ou au +33 1 23 45 67 89.</p>
      `
    }
  };
  const selectedContent = contentMap[type];

  if (isInline) {
    return (
      <div className="w-full flex flex-col bg-transparent overflow-hidden">
        <div className="overflow-y-auto max-h-[60vh] pr-2">
          <div
            className="text-gray-800 dark:text-gray-200 
                       [&>h2]:text-base [&>h2]:font-extrabold [&>h2]:mt-5 [&>h2]:mb-2.5 [&>h2]:text-gray-900 [&>h2]:dark:text-white [&>h2]:pb-1.5 [&>h2]:border-b [&>h2]:border-gray-200/50 [&>h2]:dark:border-gray-700/30
                       [&>p]:text-sm [&>p]:text-gray-600 [&>p]:dark:text-gray-400 [&>p]:leading-relaxed [&>p]:mb-4"
            dangerouslySetInnerHTML={{
              __html: selectedContent.content
            }}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
          <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100">
            {selectedContent.title}
          </h2>
          <button
            onClick={() => onClose?.()}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">

            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor">

              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12" />

            </svg>
          </button>
        </div>
        <div className="p-4 overflow-y-auto flex-grow">
          <div
            className="prose dark:prose-invert max-w-none"
            dangerouslySetInnerHTML={{
              __html: selectedContent.content
            }} />

        </div>
        <div className="p-4 border-t border-gray-200 dark:border-gray-700 flex justify-end">
          <button
            onClick={() => onClose?.()}
            className="px-4 py-2 bg-green-600 text-white rounded-md text-sm font-medium hover:bg-green-700">

            Fermer
          </button>
        </div>
      </div>
    </div>);

};
export default LegalContent;