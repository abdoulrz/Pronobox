import os
import re

filepath = 'c:/Users/Usuario/Documents/Pronobox/pronobox_codebase/src/components/settings/SettingsSimpleUser.tsx'

with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

# Replace wrapper
wrapper_old = """      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden">
        {/* Liste des sections */}
        <div className="space-y-3 p-4">"""

wrapper_new = """      {/* Navigation Tabs */}
      <div className="flex overflow-x-auto gap-2 p-2 mb-6 bg-white/10 dark:bg-gray-800/20 backdrop-blur-md rounded-2xl shadow-[0_8px_32px_0_rgba(31,38,135,0.07)] border border-white/20 dark:border-gray-700/30 hide-scrollbar sticky top-0 z-10">
        {[
          { id: 'profile', label: 'Profil', icon: '👤' },
          { id: 'security', label: 'Sécurité', icon: '🔒' },
          { id: 'notifications', label: 'Notifications', icon: '🔔' },
          { id: 'wallet', label: 'Portefeuille', icon: '💳' },
          { id: 'support', label: 'Aide & Support', icon: '🎧' },
          { id: 'faq', label: 'FAQ', icon: '❓' },
          { id: 'about', label: 'À propos', icon: 'ℹ️' },
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

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 overflow-hidden">"""

content = content.replace(wrapper_old, wrapper_new)

# Read by lines to skip headers
lines = content.split('\n')
new_lines = []
skip = False

section_ids = ['profile', 'security', 'notifications', 'wallet', 'support', 'faq', 'about']

for i, line in enumerate(lines):
    if skip:
        # Check if we hit the content start
        for sec_id in section_ids:
            if f"{{activeSection === '{sec_id}' &&" in line:
                skip = False
                
                # Check if the previous line was a comment that got skipped, but we can just append
                # the current line safely. Wait, if there was a `          {/* Contenu de la section` comment,
                # it was part of the skipped lines. That's fine, we don't need it.
                new_lines.append(line)
                break
        continue
        
    if '          {/* Section ' in line:
        skip = True
        continue
        
    # Replace ml-8
    if 'className="ml-8 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 mb-4 shadow-sm"' in line:
        line = line.replace('className="ml-8 bg-white', 'className="bg-white')
        line = line.replace('shadow-sm"', 'shadow-sm animate-fade-in"')
        
    new_lines.append(line)

content = '\n'.join(new_lines)

# Fix dangling closing div safely by checking what was at the bottom
# From earlier, the bottom was:
#           }
#         </div>
#       </div>
#       {/* Modal pour recharger le compte */}
content = content.replace("""          }
        </div>
      </div>
      {/* Modal pour recharger le compte */}""", """          }
      </div>
      {/* Modal pour recharger le compte */}""")

with open(filepath, 'w', encoding='utf-8') as f:
    f.write(content)

print("Done")
