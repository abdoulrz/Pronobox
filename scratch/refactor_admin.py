import re

with open('c:/Users/Usuario/Documents/Pronobox/pronobox_codebase/src/components/settings/SettingsAdminUser.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Replace the accordion list container wrapper
# from:
#       <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden">
#         {/* Liste des sections */}
#         <div className="space-y-3 p-4">
# to our new horizontal nav + container

nav_tsx = """      {/* Navigation Tabs */}
      <div className="flex overflow-x-auto gap-2 p-2 mb-6 bg-white/10 dark:bg-gray-800/20 backdrop-blur-md rounded-2xl shadow-[0_8px_32px_0_rgba(31,38,135,0.07)] border border-white/20 dark:border-gray-700/30 hide-scrollbar sticky top-0 z-10">
        {[
          { id: 'profile', label: 'Profil', icon: '👤' },
          { id: 'notifications', label: 'Notifications', icon: '🔔' },
          { id: 'security', label: 'Sécurité', icon: '🔒' },
        ].map((item) => {
          const isActive = activeSection === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveSection(item.id)}
              className={`
                flex items-center gap-2 px-5 py-3 text-sm font-medium whitespace-nowrap rounded-xl transition-all duration-300 ease-out
                ${isActive 
                  ? 'bg-gradient-to-r from-green-500/20 to-emerald-500/20 text-green-700 dark:text-green-300 shadow-inner border border-green-500/30' 
                  : 'text-gray-600 dark:text-gray-400 hover:bg-white/40 dark:hover:bg-gray-700/40 hover:text-gray-900 dark:hover:text-white border border-transparent'}
              `}
            >
              <span className="text-lg">{item.icon}</span>
              {item.label}
            </button>
          );
        })}
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 overflow-hidden">
"""

# 1. Replace the wrapper
wrapper_regex = r'<div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden">\s*\{\/\* Liste des sections \*\/\}\s*<div className="space-y-3 p-4">'
content = re.sub(wrapper_regex, nav_tsx, content)

# 2. Remove the accordion headers (the clickable divs before the actual content)
accordion_header_regex = r'\{\/\* Section [a-zA-Zé]+ \*\/\}\s*<div\s+className={`p-3 border \$\{activeSection === \'[a-z]+\' \? [^\}]+\} rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer transition-all`}\s+onClick=\{\(\) => handleSectionClick\(\'[a-z]+\'\)\}>.*?</div>\s*</div>\s*</div>'
content = re.sub(accordion_header_regex, '', content, flags=re.DOTALL)

# 3. Clean up the activeSection wrappers (we keep them, but un-indent them if needed, or just leave them as they are conditional renders)
# They look like: {activeSection === 'profile' && (
# And they close with )} further down. We leave them because we still want the conditional rendering!
# Wait, inside they have `<div className="ml-8 ...` we should remove `ml-8` to make it flush.
content = re.sub(r'className="ml-8 bg-white', 'className="bg-white', content)
content = re.sub(r'className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700 animate-fade-in pl-8"', 'className="animate-fade-in"', content)

with open('c:/Users/Usuario/Documents/Pronobox/pronobox_codebase/src/components/settings/SettingsAdminUser.tsx', 'w', encoding='utf-8') as f:
    f.write(content)

print("Done")
