// Admin Language selector functionality
document.addEventListener('DOMContentLoaded', function() {
    // Languages data with flags and names - only English and Italian
    const languages = [
        { code: 'en', name: 'English', flag: 'assets/flags/uk.png' },
        { code: 'it', name: 'Italiano', flag: 'assets/flags/italy.png' }
    ];

    // Define translations for the admin dashboard
    const translations = {
        // English translations (default)
        'en': {
            'admin-dashboard': 'ADMIN DASHBOARD',
            'back-to-site': 'Back to Site',
            'logout-button': 'Logout',
            'welcome-admin': 'Welcome, admin',
            'total-projects': 'Total Projects',
            'completed': 'Completed',
            'in-progress': 'In Progress',
            'incompleted': 'Incompleted',
            'project-management': 'Project Management',
            'add-new-project': 'Add New Project',
            'search-projects': 'Search projects...',
            'all-status': 'All status',
            'project-name': 'Project Name',
            'category': 'Category',
            'status': 'Status',
            'type': 'Type',
            'file': 'File',
            'created': 'Created',
            'actions': 'Actions',
            'user-management': 'User Management',
            'add-new-user': 'Add New User',
            'search-users': 'Search users...',
            'all-roles': 'All roles',
            'admin': 'Admin',
            'user': 'User',
            'username': 'USERNAME',
            'role': 'ROLE',
            'loading': 'Loading...',
            'no-file': 'No file available for this project',
            'password-requirements': 'Password must contain:',
            'at-least-8': 'At least 8 characters',
            'at-least-uppercase': 'At least 1 uppercase letter',
            'at-least-lowercase': 'At least 1 lowercase letter',
            'at-least-number': 'At least 1 number',
            'at-least-special': 'At least 1 special character (!@#$%^&*...)',
            'edit': 'Edit',
            'delete': 'Delete',
            'share': 'Share',
            'view': 'View',
            'cancel': 'Cancel',
            'save-user': 'Save User',
            'footer-copyright': '© 2025 Architecture Portfolio Admin. All rights reserved.',
            'file-preview': 'File Preview',
            'download': 'Download',
            'zoom-in': 'Zoom In',
            'zoom-out': 'Zoom Out',
            'loading-preview': 'Loading preview...',
            'file-cannot-preview': 'This file type cannot be previewed',
            'file-download': 'The file may need to be downloaded to be viewed.',
            'download-file': 'Download File',
            'loading-shares': 'Loading...',
            'close': 'Close',
            'share-project': 'Share Project',
            'share-username': 'Username:',
            'share-permission': 'Permission:',
            'read': 'Read',
            'edit-permission': 'Edit',
            'shared-with': 'Shared with:',
            'password': 'Password',
            'keep-current-password': 'Leave blank to keep current password when editing',
            'powered-by': 'Powered by'
        },
        // Italian translations
        'it': {
            'admin-dashboard': 'PANNELLO DI AMMINISTRAZIONE',
            'back-to-site': 'Torna al Sito',
            'logout-button': 'Esci',
            'welcome-admin': 'Benvenuto, admin',
            'total-projects': 'Progetti Totali',
            'completed': 'Completati',
            'in-progress': 'In Corso',
            'incompleted': 'Incompleti',
            'project-management': 'Gestione Progetti',
            'add-new-project': 'Aggiungi Nuovo Progetto',
            'search-projects': 'Cerca progetti...',
            'all-status': 'Tutti gli stati',
            'project-name': 'Nome Progetto',
            'category': 'Categoria',
            'status': 'Stato',
            'type': 'Tipo',
            'file': 'File',
            'created': 'Creato',
            'actions': 'Azioni',
            'user-management': 'Gestione Utenti',
            'add-new-user': 'Aggiungi Nuovo Utente',
            'search-users': 'Cerca utenti...',
            'all-roles': 'Tutti i ruoli',
            'admin': 'Amministratore',
            'user': 'Utente',
            'username': 'NOME UTENTE',
            'role': 'RUOLO',
            'loading': 'Caricamento...',
            'no-file': 'Nessun file disponibile per questo progetto',
            'password-requirements': 'La password deve contenere:',
            'at-least-8': 'Almeno 8 caratteri',
            'at-least-uppercase': 'Almeno 1 lettera maiuscola',
            'at-least-lowercase': 'Almeno 1 lettera minuscola',
            'at-least-number': 'Almeno 1 numero',
            'at-least-special': 'Almeno 1 carattere speciale (!@#$%^&*...)',
            'edit': 'Modifica',
            'delete': 'Elimina',
            'share': 'Condividi',
            'view': 'Visualizza',
            'cancel': 'Annulla',
            'save-user': 'Salva Utente',
            'footer-copyright': '© 2025 Pannello di Amministrazione. Tutti i diritti riservati.',
            'file-preview': 'Anteprima File',
            'download': 'Scarica',
            'zoom-in': 'Zoom In',
            'zoom-out': 'Zoom Out',
            'loading-preview': 'Caricamento anteprima...',
            'file-cannot-preview': 'Questo tipo di file non può essere visualizzato in anteprima',
            'file-download': 'Il file potrebbe dover essere scaricato per essere visualizzato.',
            'download-file': 'Scarica File',
            'loading-shares': 'Caricamento...',
            'close': 'Chiudi',
            'share-project': 'Condividi Progetto',
            'share-username': 'Nome utente:',
            'share-permission': 'Permesso:',
            'read': 'Lettura',
            'edit-permission': 'Modifica',
            'shared-with': 'Condiviso con:',
            'password': 'Password',
            'keep-current-password': 'Lascia vuoto per mantenere la password attuale durante la modifica',
            'powered-by': 'Realizzato da'
        }
    };

    // Translation mapping for elements that need to be processed specifically
    const elementTranslations = {
        '.logo': 'admin-dashboard',
        '.nav-links a[href="index.html"]': 'back-to-site',
        '#logout-button, #admin-mobile-logout': 'logout-button',
        '.admin-mobile-welcome': 'welcome-admin',
        '.stat-card:nth-child(1) .stat-label': 'total-projects',
        '.stat-card:nth-child(2) .stat-label': 'completed',
        '.stat-card:nth-child(3) .stat-label': 'in-progress',
        '.stat-card:nth-child(4) .stat-label': 'incompleted',
        '.section-title:nth-of-type(1)': 'project-management',
        '.add-project-button:nth-of-type(1)': 'add-new-project',
        '#search-projects': 'search-projects',
        '#status-filter option[value="all"]': 'all-status',
        '#status-filter option[value="completed"]': 'completed',
        '#status-filter option[value="in_progress"]': 'in-progress',
        '#status-filter option[value="incompleted"]': 'incompleted',
        '.projects-table th:nth-child(1)': 'project-name',
        '.projects-table th:nth-child(2)': 'category',
        '.projects-table th:nth-child(3)': 'status',
        '.projects-table th:nth-child(4)': 'type',
        '.projects-table th:nth-child(5)': 'file',
        '.projects-table th:nth-child(6)': 'created',
        '.projects-table th:nth-child(7)': 'actions',
        '.section-title:nth-of-type(2)': 'user-management',
        'a[onclick="showUserModal()"]': 'add-new-user',
        '#search-users': 'search-users',
        '#role-filter option[value="all"]': 'all-roles',
        '#role-filter option[value="admin"]': 'admin',
        '#role-filter option[value="user"]': 'user',
        'th:contains("USERNAME")': 'username',
        'th:contains("ROLE")': 'role',
        'th:contains("ACTIONS")': 'actions',
        '.loading-spinner p': 'loading',
        '.footer-content p': 'footer-copyright',
        '.powered-by p': 'powered-by',
        '#modal-file-title': 'file-preview',
        '#download-button': 'download',
        '#zoom-in-button': 'zoom-in',
        '#zoom-out-button': 'zoom-out',
        '#file-loading span': 'loading-preview',
        '#file-unsupported h3': 'file-cannot-preview',
        '#file-unsupported p': 'file-download',
        '#file-download-link': 'download-file',
        '.loading-shares': 'loading-shares',
        '.close': 'close',
        '#shareModalLabel': 'share-project',
        'label[for="shareUsername"]': 'share-username',
        'label[for="sharePermission"]': 'share-permission',
        '#sharePermission option[value="read"]': 'read',
        '#sharePermission option[value="edit"]': 'edit-permission',
        '.current-shares-section h3': 'shared-with',
        '#user-form label[for="username"]': 'username',
        '#user-form label[for="user-password"]': 'password',
        '#user-form small': 'keep-current-password',
        '#user-form label[for="user-role"]': 'role',
        '.password-requirements small': 'password-requirements',
        '.password-requirements ul li:nth-child(1)': 'at-least-8',
        '.password-requirements ul li:nth-child(2)': 'at-least-uppercase',
        '.password-requirements ul li:nth-child(3)': 'at-least-lowercase',
        '.password-requirements ul li:nth-child(4)': 'at-least-number',
        '.password-requirements ul li:nth-child(5)': 'at-least-special',
        '.cancel-button': 'cancel',
        '.submit-button': 'save-user'
    };

    // Load translations when the page loads
    function applyTranslations(langCode) {
        // Default to English if the language is not supported
        const currentTranslations = translations[langCode] || translations['en'];
        
        // Apply translations to the page
        for (const [selector, key] of Object.entries(elementTranslations)) {
            try {
                // For complex selectors that use :contains pseudo-selector
                if (selector.includes(':contains')) {
                    const [baseSelector, textToFind] = selector.split(':contains(');
                    const cleanText = textToFind.replace(/["')]/g, '');
                    
                    // Find elements by base selector
                    const elements = document.querySelectorAll(baseSelector);
                    elements.forEach(element => {
                        if (element.textContent.includes(cleanText)) {
                            if (currentTranslations[key]) {
                                element.textContent = currentTranslations[key];
                            }
                        }
                    });
                } else {
                    // Regular selectors
                    const elements = document.querySelectorAll(selector);
                    elements.forEach(element => {
                        if (currentTranslations[key]) {
                            if (element.tagName === 'INPUT' && element.hasAttribute('placeholder')) {
                                element.setAttribute('placeholder', currentTranslations[key]);
                            } else {
                                element.textContent = currentTranslations[key];
                            }
                        }
                    });
                }
            } catch (error) {
                console.error(`Error applying translation for selector ${selector}:`, error);
            }
        }

        // Translate dynamic elements - action buttons
        // Desativar a tradução dos botões de ação para preservar os ícones
        // Os botões são criados com ícones em admin.js e devem ser mantidos assim
        /*
        document.querySelectorAll('.action-button').forEach(button => {
            // Extract what kind of button it is based on classes or text content
            if (button.classList.contains('edit-button') || button.textContent.includes('Edit')) {
                // Preservar o ícone se existir
                const icon = button.querySelector('i');
                if (icon) {
                    button.innerHTML = `<i class="${icon.className}"></i> ${currentTranslations['edit']}`;
                } else {
                    button.textContent = currentTranslations['edit'];
                }
            } else if (button.classList.contains('delete-button') || button.textContent.includes('Delete')) {
                const icon = button.querySelector('i');
                if (icon) {
                    button.innerHTML = `<i class="${icon.className}"></i> ${currentTranslations['delete']}`;
                } else {
                    button.textContent = currentTranslations['delete'];
                }
            } else if (button.classList.contains('share-button') || button.textContent.includes('Share')) {
                const icon = button.querySelector('i');
                if (icon) {
                    button.innerHTML = `<i class="${icon.className}"></i> ${currentTranslations['share']}`;
                } else {
                    button.textContent = currentTranslations['share'];
                }
            } else if (button.classList.contains('view-button') || button.textContent.includes('View')) {
                const icon = button.querySelector('i');
                if (icon) {
                    button.innerHTML = `<i class="${icon.className}"></i> ${currentTranslations['view']}`;
                } else {
                    button.textContent = currentTranslations['view'];
                }
            }
        });
        */
        
        console.log(`Admin translations applied for: ${langCode}`);
    }

    // Wait a bit for navigation.js to inject the navigation structure
    setTimeout(function() {
        // Get navigation element to inject the language selector
        const nav = document.querySelector('nav');
        
        if (nav) {
            // Create language selector container
            const languageSelector = document.createElement('div');
            languageSelector.className = 'language-selector';
            
            // Create the language button with current language (default to English)
            const currentLangCode = localStorage.getItem('selectedLanguage') || 'en';
            const currentLanguage = languages.find(lang => lang.code === currentLangCode) || languages[0];
            
            const languageButton = document.createElement('button');
            languageButton.className = 'language-button';
            languageButton.innerHTML = `<img src="${currentLanguage.flag}" alt="${currentLanguage.name}">`;
            languageSelector.appendChild(languageButton);
            
            // Create dropdown container
            const dropdown = document.createElement('div');
            dropdown.className = 'language-dropdown';
            
            // Add language options to dropdown
            languages.forEach(lang => {
                const option = document.createElement('div');
                option.className = 'language-option';
                option.setAttribute('data-lang', lang.code);
                option.innerHTML = `<img src="${lang.flag}" alt="${lang.name}"> ${lang.name}`;
                
                // Add click event for language selection
                option.addEventListener('click', function() {
                    // Update button with selected language
                    languageButton.innerHTML = `<img src="${lang.flag}" alt="${lang.name}">`;
                    
                    // Close dropdown
                    languageSelector.classList.remove('active');
                    
                    // Handle language change
                    changeLanguage(lang.code);
                });
                
                dropdown.appendChild(option);
            });
            
            languageSelector.appendChild(dropdown);
            
            // Create overlay for closing the dropdown when clicking outside
            const overlay = document.createElement('div');
            overlay.className = 'language-overlay';
            overlay.addEventListener('click', function() {
                languageSelector.classList.remove('active');
            });
            languageSelector.appendChild(overlay);
            
            // Toggle dropdown on button click
            languageButton.addEventListener('click', function(e) {
                e.stopPropagation();
                languageSelector.classList.toggle('active');
            });
            
            // Insert language selector
            const navLinks = document.querySelector('.nav-links');
            
            if (navLinks) {
                // Criar o wrapper do seletor de idiomas
                const langSelectorWrapper = document.createElement('li');
                langSelectorWrapper.className = 'lang-selector-wrapper';
                langSelectorWrapper.appendChild(languageSelector);
                
                // Inserir no início dos links de navegação
                navLinks.insertBefore(langSelectorWrapper, navLinks.firstChild);
            }

            // Also add to mobile menu
            const mobileMenu = document.querySelector('.admin-mobile-menu-content');
            if (mobileMenu) {
                const mobileLangSelector = document.createElement('div');
                mobileLangSelector.className = 'mobile-language-selector';
                
                // Add language options to mobile menu
                languages.forEach(lang => {
                    const mobileOption = document.createElement('a');
                    mobileOption.href = '#';
                    mobileOption.className = 'mobile-language-option';
                    mobileOption.setAttribute('data-lang', lang.code);
                    mobileOption.innerHTML = `<img src="${lang.flag}" alt="${lang.name}"> ${lang.name}`;
                    
                    // Add click event for language selection
                    mobileOption.addEventListener('click', function(e) {
                        e.preventDefault();
                        changeLanguage(lang.code);
                        
                        // Close mobile menu
                        document.getElementById('admin-mobile-menu').classList.remove('open');
                        document.getElementById('admin-mobile-overlay').classList.remove('open');
                    });
                    
                    mobileLangSelector.appendChild(mobileOption);
                });
                
                // Insert at the beginning of the mobile menu
                mobileMenu.insertBefore(mobileLangSelector, mobileMenu.firstChild);
            }
            
            // Initialize with stored language or default
            const savedLanguage = localStorage.getItem('selectedLanguage');
            if (savedLanguage) {
                changeLanguage(savedLanguage);
            }
        }
    }, 300);
    
    // Function to change language
    function changeLanguage(langCode) {
        // Store selected language
        localStorage.setItem('selectedLanguage', langCode);
        
        // Apply translations
        applyTranslations(langCode);
        
        console.log(`Language changed to: ${langCode}`);
    }

    // Make changeLanguage accessible globally
    window.applyTranslations = function() {
        const currentLang = localStorage.getItem('selectedLanguage') || 'en';
        applyTranslations(currentLang);
    };
    
    // Apply initial translations
    window.applyTranslations();
    
    // Add event listener for dynamic content loading
    document.addEventListener('adminContentLoaded', function() {
        window.applyTranslations();
    });
    
    // Add mutation observer to detect DOM changes and apply translations when needed
    const observer = new MutationObserver(function(mutations) {
        // Check if any project items or user items were added
        const shouldTranslate = mutations.some(mutation => {
            return Array.from(mutation.addedNodes).some(node => {
                if (node.nodeType === Node.ELEMENT_NODE) {
                    return node.classList && (
                        node.classList.contains('project-row') || 
                        node.classList.contains('user-row') ||
                        node.querySelector('.project-row, .user-row, .action-button')
                    );
                }
                return false;
            });
        });
        
        if (shouldTranslate) {
            window.applyTranslations();
        }
    });
    
    // Start observing the target node for configured mutations
    const observerConfig = { childList: true, subtree: true };
    observer.observe(document.body, observerConfig);
}); 