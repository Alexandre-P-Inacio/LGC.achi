// Language selector functionality
document.addEventListener('DOMContentLoaded', function() {
    // Languages data with flags and names
    const languages = [
        { code: 'en', name: 'English', flag: 'assets/flags/uk.png' },
        { code: 'es', name: 'Español', flag: 'assets/flags/spain.png' },
        { code: 'fr', name: 'Français', flag: 'assets/flags/france.png' },
        { code: 'pt', name: 'Português', flag: 'assets/flags/portugal.png' },
        { code: 'de', name: 'Deutsch', flag: 'assets/flags/germany.png' },
        { code: 'zh', name: '中文', flag: 'assets/flags/china.png' },
        { code: 'it', name: 'Italiano', flag: 'assets/flags/italy.png' },
        { code: 'ar', name: 'العربية', flag: 'assets/flags/saudi-arabia.png' }
    ];

    // Define translations for the website
    const translations = {
        // English translations (default)
        'en': {
            'nav-home': 'Home',
            'nav-portfolios': 'Reserved Portfolios',
            'nav-about': 'About',
            'nav-contact': 'Contact',
            'login-button': 'Sign In',
            'register-button': 'Register',
            'logout-button': 'Logout',
            'hero-title': 'Architecture Portfolio',
            'featured-projects': 'Featured Projects',
            'about-title': 'About Us',
            'about-content': 'LLGC ingegneria architettura was founded in 2009. The collaboration between different professional skills through integrated design between engineering and architecture has become a point of strength and distinction over time. An approach aimed at understanding the needs of the interlocutor by evaluating the different peculiarities of each client, with a view to research and innovation in the sector. LGC ia has gained multiple experiences in the field of building, industrial, interior design, exhibit, structural, plant design, following each project in the different study phases, from preliminary design also through 3D graphic modeling, obtaining authorization titles, up to the construction phase with particular attention to work management and safety. LGC has also developed its specialization in the sector of infrastructures for radio telecommunications networks, providing its engineering and architecture services to the main national operators. LGC ia over the years has become a design partner of Italian and foreign multinational companies.',
            'show-more': 'Show More',
            'show-less': 'Show Less',
            'view-project': 'View Project',
            'view-details': 'View Details',
            'footer-copyright': '© 2025 Architecture Portfolio. All rights reserved.',
            'footer-credits': 'Powered by',
            'practices-title': 'Practices',
            'select-practice': 'Select a practice area below',
            'all-categories': 'All Categories',
            'select-category': 'Select Category',
            'showing-all': 'Showing all projects',
            'showing-in': 'Showing projects in',
            // Project categories translations
            'category-rf-telecommunications': 'RF Telecommunications',
            'category-energy': 'Energy',
            'category-construction': 'Construction',
            'category-banking': 'Bank Insurance Office',
            'category-sand': 'Stand',
            'category-oil-gas': 'Oil & Gas',
            'category-real-estate': 'Real Estate',
            'category-nuclear': 'Nuclear',
            'category-industrial': 'Industrial',
            'category-naval': 'Naval',
            'category-bpo': 'BPO',
            'category-automotive': 'Automotive',
            'category-aerospace': 'Aerospace',
            'category-chemistry-pharmaceutical': 'Chemistry & Pharmaceutical',
            // Contact page translations
            'contact-title': 'Contact Us',
            'contact-subtitle': 'We are ready to transform your ideas into reality',
            'contact-address': 'Address',
            'contact-email': 'Email',
            'contact-website': 'Our website',
            'global-presence': 'Our Global Presence',
            'our-offices': 'Our Offices',
            'send-message': 'Send Us a Message',
            'form-name': 'Name',
            'form-email': 'Email',
            'form-subject': 'Subject',
            'form-message': 'Message',
            'submit-button': 'Send Message',
            'our-location': 'Our Location',
            'map-view': 'Map View',
            'street-view': 'Street View',
            'get-directions': 'Get Directions',
            'form-success': 'Thank you! Your message has been sent successfully. We will get back to you soon.'
        },
        // Spanish translations
        'es': {
            'nav-home': 'Inicio',
            'nav-portfolios': 'Portafolios',
            'nav-about': 'Nosotros',
            'nav-contact': 'Contacto',
            'login-button': 'Iniciar Sesión',
            'register-button': 'Registrarse',
            'logout-button': 'Cerrar Sesión',
            'hero-title': 'Portafolio de Arquitectura',
            'featured-projects': 'Proyectos Destacados',
            'about-title': 'Sobre Nosotros',
            'about-content': 'LLGC ingegneria architettura fue fundada en 2009. La colaboración entre diferentes habilidades profesionales a través del diseño integrado entre ingeniería y arquitectura se ha convertido en un punto de fortaleza y distinción con el tiempo. Un enfoque dirigido a comprender las necesidades del interlocutor evaluando las diferentes peculiaridades de cada cliente, con miras a la investigación y la innovación en el sector. LGC ia ha ganado múltiples experiencias en el campo de la construcción, diseño industrial, diseño de interiores, exhibición, diseño estructural, diseño de plantas, siguiendo cada proyecto en las diferentes fases de estudio, desde el diseño preliminar también a través del modelado gráfico 3D, obteniendo títulos de autorización, hasta la fase de construcción con particular atención a la gestión del trabajo y la seguridad. LGC también ha desarrollado su especialización en el sector de infraestructuras para redes de telecomunicaciones por radio, prestando sus servicios de ingeniería y arquitectura a los principales operadores nacionales. LGC ia a lo largo de los años se ha convertido en un socio de diseño de empresas multinacionales italianas y extranjeras.',
            'show-more': 'Mostrar Más',
            'show-less': 'Mostrar Menos',
            'view-project': 'Ver Proyecto',
            'view-details': 'Ver Detalles',
            'footer-copyright': '© 2025 Portafolio de Arquitectura. Todos los derechos reservados.',
            'footer-credits': 'Desarrollado por',
            'practices-title': 'Prácticas',
            'select-practice': 'Seleccione un área de práctica a continuación',
            'all-categories': 'Todas las Categorías',
            'select-category': 'Seleccionar Categoría',
            'showing-all': 'Mostrando todos los proyectos',
            'showing-in': 'Mostrando proyectos en',
            // Project categories translations
            'category-rf-telecommunications': 'Telecomunicaciones RF',
            'category-energy': 'Energía',
            'category-construction': 'Construcción',
            'category-banking': 'Banca y Seguros',
            'category-sand': 'Stand',
            'category-oil-gas': 'Petróleo y Gas',
            'category-real-estate': 'Bienes Raíces',
            'category-nuclear': 'Nuclear',
            'category-industrial': 'Industrial',
            'category-naval': 'Naval',
            'category-bpo': 'BPO',
            'category-automotive': 'Automotriz',
            'category-aerospace': 'Aeroespacial',
            'category-chemistry-pharmaceutical': 'Química y Farmacéutica',
            // Contact page translations
            'contact-title': 'Contáctenos',
            'contact-subtitle': 'Estamos listos para transformar sus ideas en realidad',
            'contact-address': 'Dirección',
            'contact-email': 'Correo Electrónico',
            'contact-website': 'Nuestro sitio web',
            'global-presence': 'Nuestra Presencia Global',
            'our-offices': 'Nuestras Oficinas',
            'send-message': 'Envíenos un Mensaje',
            'form-name': 'Nombre',
            'form-email': 'Correo Electrónico',
            'form-subject': 'Asunto',
            'form-message': 'Mensaje',
            'submit-button': 'Enviar Mensaje',
            'our-location': 'Nuestra Ubicación',
            'map-view': 'Vista de Mapa',
            'street-view': 'Vista de Calle',
            'get-directions': 'Obtener Indicaciones',
            'form-success': '¡Gracias! Su mensaje ha sido enviado con éxito. Nos pondremos en contacto con usted pronto.'
        },
        // French translations
        'fr': {
            'nav-home': 'Accueil',
            'nav-portfolios': 'Portfolios',
            'nav-about': 'À Propos',
            'nav-contact': 'Contact',
            'login-button': 'Connexion',
            'register-button': "S'inscrire",
            'logout-button': 'Déconnexion',
            'hero-title': "Portfolio d'Architecture",
            'featured-projects': 'Projets en Vedette',
            'about-title': 'À Propos de Nous',
            'about-content': "LLGC ingegneria architettura a été fondée en 2009. La collaboration entre différentes compétences professionnelles à travers une conception intégrée entre l'ingénierie et l'architecture est devenue un point de force et de distinction au fil du temps. Une approche visant à comprendre les besoins de l'interlocuteur en évaluant les différentes particularités de chaque client, dans une optique de recherche et d'innovation dans le secteur. LGC ia a acquis de multiples expériences dans le domaine de la construction, du design industriel, de la décoration intérieure, de l'exposition, de la conception structurelle, de la conception d'usines, en suivant chaque projet dans les différentes phases d'étude, de la conception préliminaire également à travers la modélisation graphique 3D, l'obtention de titres d'autorisation, jusqu'à la phase de construction avec une attention particulière à la gestion du travail et à la sécurité. LGC a également développé sa spécialisation dans le secteur des infrastructures pour les réseaux de radiocommunications, en fournissant ses services d'ingénierie et d'architecture aux principaux opérateurs nationaux. LGC ia au fil des ans est devenu un partenaire de conception de sociétés multinationales italiennes et étrangères.",
            'show-more': 'Voir Plus',
            'show-less': 'Voir Moins',
            'view-project': 'Voir le Projet',
            'view-details': 'Voir les Détails',
            'footer-copyright': "© 2025 Portfolio d'Architecture. Tous droits réservés.",
            'footer-credits': 'Propulsé par',
            'practices-title': 'Pratiques',
            'select-practice': 'Sélectionnez un domaine de pratique ci-dessous',
            'all-categories': 'Toutes les Catégories',
            'select-category': 'Sélectionner Catégorie',
            'showing-all': 'Affichage de tous les projets',
            'showing-in': 'Affichage des projets dans',
            // Project categories translations
            'category-rf-telecommunications': 'Télécommunications RF',
            'category-energy': 'Énergie',
            'category-construction': 'Construction',
            'category-banking': 'Banque et Assurance',
            'category-sand': 'Stand',
            'category-oil-gas': 'Pétrole et Gaz',
            'category-real-estate': 'Immobilier',
            'category-nuclear': 'Nucléaire',
            'category-industrial': 'Industriel',
            'category-naval': 'Naval',
            'category-bpo': 'BPO',
            'category-automotive': 'Automobile',
            'category-aerospace': 'Aérospatial',
            'category-chemistry-pharmaceutical': 'Chimie et Pharmaceutique',
            // Contact page translations
            'contact-title': 'Contactez-Nous',
            'contact-subtitle': 'Nous sommes prêts à transformer vos idées en réalité',
            'contact-address': 'Adresse',
            'contact-email': 'Email',
            'contact-website': 'Notre site web',
            'global-presence': 'Notre Présence Mondiale',
            'our-offices': 'Nos Bureaux',
            'send-message': 'Envoyez-Nous un Message',
            'form-name': 'Nom',
            'form-email': 'Email',
            'form-subject': 'Sujet',
            'form-message': 'Message',
            'submit-button': 'Envoyer le Message',
            'our-location': 'Notre Emplacement',
            'map-view': 'Vue Carte',
            'street-view': 'Vue Rue',
            'get-directions': 'Obtenir l\'Itinéraire',
            'form-success': 'Merci ! Votre message a été envoyé avec succès. Nous vous répondrons bientôt.'
        },
        // Portuguese translations
        'pt': {
            'nav-home': 'Início',
            'nav-portfolios': 'Portfólios',
            'nav-about': 'Sobre',
            'nav-contact': 'Contato',
            'login-button': 'Entrar',
            'register-button': 'Registrar',
            'logout-button': 'Sair',
            'hero-title': 'Portfólio de Arquitetura',
            'featured-projects': 'Projetos em Destaque',
            'about-title': 'Sobre Nós',
            'about-content': 'A LLGC ingegneria architettura foi fundada em 2009. A colaboração entre diferentes competências profissionais através do design integrado entre engenharia e arquitetura tornou-se um ponto de força e distinção ao longo do tempo. Uma abordagem que visa compreender as necessidades do interlocutor, avaliando as diferentes peculiaridades de cada cliente, com vista à investigação e inovação no setor. A LGC ia adquiriu múltiplas experiências na área da construção, design industrial, design de interiores, exposição, design estrutural, projeto de instalações, seguindo cada projeto nas diferentes fases de estudo, desde o projeto preliminar também através da modelagem gráfica 3D, obtenção de títulos de autorização, até à fase de construção com particular atenção à gestão do trabalho e à segurança. A LGC também desenvolveu a sua especialização no setor de infraestruturas para redes de radiotelecomunicações, prestando os seus serviços de engenharia e arquitetura aos principais operadores nacionais. A LGC ia ao longo dos anos tornou-se parceira de design de empresas multinacionais italianas e estrangeiras.',
            'show-more': 'Mostrar Mais',
            'show-less': 'Mostrar Menos',
            'view-project': 'Ver Projeto',
            'view-details': 'Ver Detalhes',
            'footer-copyright': '© 2025 Portfólio de Arquitetura. Todos os direitos reservados.',
            'footer-credits': 'Desenvolvido por',
            'practices-title': 'Práticas',
            'select-practice': 'Selecione uma área de prática abaixo',
            'all-categories': 'Todas as Categorias',
            'select-category': 'Selecionar Categoria',
            'showing-all': 'Mostrando todos os projetos',
            'showing-in': 'Mostrando projetos em',
            // Project categories translations
            'category-rf-telecommunications': 'Telecomunicações RF',
            'category-energy': 'Energia',
            'category-construction': 'Construção',
            'category-banking': 'Banco Seguros Escritório',
            'category-sand': 'Stand',
            'category-oil-gas': 'Petróleo e Gás',
            'category-real-estate': 'Imobiliário',
            'category-nuclear': 'Nuclear',
            'category-industrial': 'Industrial',
            'category-naval': 'Naval',
            'category-bpo': 'BPO',
            'category-automotive': 'Automotivo',
            'category-aerospace': 'Aeroespacial',
            'category-chemistry-pharmaceutical': 'Química e Farmacêutica',
            // Contact page translations
            'contact-title': 'Contate-nos',
            'contact-subtitle': 'Estamos prontos para transformar suas ideias em realidade',
            'contact-address': 'Endereço',
            'contact-email': 'Email',
            'contact-website': 'Nosso site',
            'global-presence': 'Nossa Presença Global',
            'our-offices': 'Nossos Escritórios',
            'send-message': 'Envie-nos uma Mensagem',
            'form-name': 'Nome',
            'form-email': 'Email',
            'form-subject': 'Assunto',
            'form-message': 'Mensagem',
            'submit-button': 'Enviar Mensagem',
            'our-location': 'Nossa Localização',
            'map-view': 'Vista do Mapa',
            'street-view': 'Vista da Rua',
            'get-directions': 'Obter Direções',
            'form-success': 'Obrigado! Sua mensagem foi enviada com sucesso. Entraremos em contato em breve.'
        },
        // German translations
        'de': {
            'nav-home': 'Startseite',
            'nav-portfolios': 'Portfolios',
            'nav-about': 'Über uns',
            'nav-contact': 'Kontakt',
            'login-button': 'Anmelden',
            'register-button': 'Registrieren',
            'logout-button': 'Abmelden',
            'hero-title': 'Architektur-Portfolio',
            'featured-projects': 'Ausgewählte Projekte',
            'about-title': 'Über Uns',
            'about-content': 'LLGC ingegneria architettura wurde 2009 gegründet. Die Zusammenarbeit zwischen verschiedenen Fachkompetenzen durch integriertes Design zwischen Ingenieurwesen und Architektur ist im Laufe der Zeit zu einem Punkt der Stärke und Unterscheidung geworden. Ein Ansatz, der darauf abzielt, die Bedürfnisse des Gesprächspartners zu verstehen, indem die verschiedenen Besonderheiten jedes Kunden bewertet werden, mit Blick auf Forschung und Innovation in der Branche. LGC ia hat vielfältige Erfahrungen im Bereich Bau, Industriedesign, Innenarchitektur, Ausstellung, Strukturdesign, Anlagendesign gesammelt und jeden Projekt in den verschiedenen Studienphasen begleitet, von der Vorplanung auch durch 3D-Grafikmodellierung, Einholung von Genehmigungstiteln bis hin zur Bauphase mit besonderer Aufmerksamkeit für Arbeitsmanagement und Sicherheit. LGC hat auch seine Spezialisierung im Bereich der Infrastrukturen für Radiotelekommunikationsnetze entwickelt und bietet seine Ingenieur- und Architekturdienstleistungen für die wichtigsten nationalen Betreiber an. LGC ia ist im Laufe der Jahre zu einem Designpartner italienischer und ausländischer multinationaler Unternehmen geworden.',
            'show-more': 'Mehr anzeigen',
            'show-less': 'Weniger anzeigen',
            'view-project': 'Projekt ansehen',
            'view-details': 'Details ansehen',
            'footer-copyright': '© 2025 Architektur-Portfolio. Alle Rechte vorbehalten.',
            'footer-credits': 'Powered by',
            'practices-title': 'Praktiken',
            'select-practice': 'Wählen Sie unten einen Praxisbereich aus',
            'all-categories': 'Alle Kategorien',
            'select-category': 'Kategorie auswählen',
            'showing-all': 'Alle Projekte werden angezeigt',
            'showing-in': 'Projekte werden angezeigt in',
            // Project categories translations
            'category-rf-telecommunications': 'RF-Telekommunikation',
            'category-energy': 'Energie',
            'category-construction': 'Konstruktion',
            'category-banking': 'Bank Versicherung Büro',
            'category-sand': 'Stand',
            'category-oil-gas': 'Öl & Gas',
            'category-real-estate': 'Immobilien',
            'category-nuclear': 'Nuklear',
            'category-industrial': 'Industriell',
            'category-naval': 'Marine',
            'category-bpo': 'BPO',
            'category-automotive': 'Automobil',
            'category-aerospace': 'Luft- und Raumfahrt',
            'category-chemistry-pharmaceutical': 'Chemie & Pharmazie',
            // Contact page translations
            'contact-title': 'Kontaktieren Sie uns',
            'contact-subtitle': 'Wir sind bereit, Ihre Ideen in die Realität umzusetzen',
            'contact-address': 'Adresse',
            'contact-email': 'E-Mail',
            'contact-website': 'Unsere Webseite',
            'global-presence': 'Unsere globale Präsenz',
            'our-offices': 'Unsere Büros',
            'send-message': 'Senden Sie uns eine Nachricht',
            'form-name': 'Name',
            'form-email': 'E-Mail',
            'form-subject': 'Betreff',
            'form-message': 'Nachricht',
            'submit-button': 'Nachricht senden',
            'our-location': 'Unser Standort',
            'map-view': 'Kartenansicht',
            'street-view': 'Straßenansicht',
            'get-directions': 'Route anzeigen',
            'form-success': 'Vielen Dank! Ihre Nachricht wurde erfolgreich gesendet. Wir werden uns in Kürze bei Ihnen melden.'
        },
        // Chinese translations
        'zh': {
            'nav-home': '首页',
            'nav-portfolios': '作品集',
            'nav-about': '关于我们',
            'nav-contact': '联系我们',
            'login-button': '登录',
            'register-button': '注册',
            'logout-button': '退出',
            'hero-title': '建筑作品集',
            'featured-projects': '精选项目',
            'about-title': '关于我们',
            'about-content': 'LLGC 工程建筑公司成立于2009年。通过工程与建筑之间的集成设计，不同专业技能之间的协作已成为一种优势和特色。我们的方法旨在评估每个客户的不同特点，了解对话者的需求，着眼于行业研究与创新。LGC在建筑、工业设计、室内设计、展览、结构设计、工厂设计等领域积累了丰富经验，跟踪每个项目的不同研究阶段，从初步设计到3D图形建模，获取授权许可，直至建设阶段，特别注重工作管理和安全。LGC还在无线电通信网络基础设施领域发展了专业化，为主要国家运营商提供工程和建筑服务。多年来，LGC成为了意大利和外国跨国公司的设计合作伙伴。',
            'show-more': '显示更多',
            'show-less': '显示更少',
            'view-project': '查看项目',
            'view-details': '查看详情',
            'footer-copyright': '© 2025 建筑作品集。保留所有权利。',
            'footer-credits': '技术支持',
            'practices-title': '业务领域',
            'select-practice': '请在下方选择业务领域',
            'all-categories': '所有类别',
            'select-category': '选择类别',
            'showing-all': '显示所有项目',
            'showing-in': '显示类别中的项目',
            // Project categories translations
            'category-rf-telecommunications': '射频电信',
            'category-energy': '能源',
            'category-construction': '建筑',
            'category-banking': '银行保险办公',
            'category-sand': '展台',
            'category-oil-gas': '石油和天然气',
            'category-real-estate': '房地产',
            'category-nuclear': '核能',
            'category-industrial': '工业',
            'category-naval': '海军',
            'category-bpo': '业务流程外包',
            'category-automotive': '汽车',
            'category-aerospace': '航空航天',
            'category-chemistry-pharmaceutical': '化学和制药',
            // Contact page translations
            'contact-title': '联系我们',
            'contact-subtitle': '我们随时准备将您的想法变为现实',
            'contact-address': '地址',
            'contact-email': '电子邮件',
            'contact-website': '我们的网站',
            'global-presence': '我们的全球布局',
            'our-offices': '我们的办事处',
            'send-message': '给我们发送消息',
            'form-name': '姓名',
            'form-email': '电子邮件',
            'form-subject': '主题',
            'form-message': '消息',
            'submit-button': '发送消息',
            'our-location': '我们的位置',
            'map-view': '地图视图',
            'street-view': '街景视图',
            'get-directions': '获取路线',
            'form-success': '谢谢您！您的消息已成功发送。我们将尽快与您联系。'
        },
        // Italian translations
        'it': {
            'nav-home': 'Home',
            'nav-portfolios': 'Portfolio',
            'nav-about': 'Chi Siamo',
            'nav-contact': 'Contatti',
            'login-button': 'Accedi',
            'register-button': 'Registrati',
            'logout-button': 'Esci',
            'hero-title': 'Portfolio di Architettura',
            'featured-projects': 'Progetti in Evidenza',
            'about-title': 'Chi Siamo',
            'about-content': 'LLGC ingegneria architettura è stata fondata nel 2009. La collaborazione tra diverse competenze professionali attraverso la progettazione integrata tra ingegneria e architettura è diventata nel tempo un punto di forza e distinzione. Un approccio volto a comprendere le esigenze dell\'interlocutore valutando le diverse peculiarità di ogni cliente, nell\'ottica della ricerca e dell\'innovazione nel settore. LGC ia ha maturato molteplici esperienze nel campo dell\'edilizia, del design industriale, dell\'interior design, dell\'exhibit, della progettazione strutturale, impiantistica, seguendo ogni progetto nelle diverse fasi di studio, dalla progettazione preliminare anche attraverso la modellazione grafica 3D, l\'ottenimento dei titoli autorizzativi, fino alla fase costruttiva con particolare attenzione alla gestione lavori e sicurezza. LGC ha inoltre sviluppato la propria specializzazione nel settore delle infrastrutture per le reti di radio-telecomunicazioni, fornendo i propri servizi di ingegneria e architettura ai principali operatori nazionali. LGC ia nel corso degli anni è diventata partner progettuale di multinazionali italiane e straniere.',
            'show-more': 'Mostra di più',
            'show-less': 'Mostra meno',
            'view-project': 'Visualizza Progetto',
            'view-details': 'Visualizza Dettagli',
            'footer-copyright': '© 2025 Portfolio di Architettura. Tutti i diritti riservati.',
            'footer-credits': 'Realizzato da',
            'practices-title': 'Pratiche',
            'select-practice': "Seleziona un'area di pratica qui sotto",
            'all-categories': 'Tutte le Categorie',
            'select-category': 'Seleziona Categoria',
            'showing-all': 'Mostrando tutti i progetti',
            'showing-in': 'Mostrando progetti in',
            // Project categories translations
            'category-rf-telecommunications': 'Telecomunicazioni RF',
            'category-energy': 'Energia',
            'category-construction': 'Costruzione',
            'category-banking': 'Banca Assicurazione Ufficio',
            'category-sand': 'Stand',
            'category-oil-gas': 'Petrolio e Gas',
            'category-real-estate': 'Immobiliare',
            'category-nuclear': 'Nucleare',
            'category-industrial': 'Industriale',
            'category-naval': 'Navale',
            'category-bpo': 'BPO',
            'category-automotive': 'Automobilistico',
            'category-aerospace': 'Aerospaziale',
            'category-chemistry-pharmaceutical': 'Chimica e Farmaceutica',
            // Contact page translations
            'contact-title': 'Contattaci',
            'contact-subtitle': 'Siamo pronti a trasformare le tue idee in realtà',
            'contact-address': 'Indirizzo',
            'contact-email': 'Email',
            'contact-website': 'Il nostro sito web',
            'global-presence': 'La Nostra Presenza Globale',
            'our-offices': 'I Nostri Uffici',
            'send-message': 'Inviaci un Messaggio',
            'form-name': 'Nome',
            'form-email': 'Email',
            'form-subject': 'Oggetto',
            'form-message': 'Messaggio',
            'submit-button': 'Invia Messaggio',
            'our-location': 'La Nostra Posizione',
            'map-view': 'Vista Mappa',
            'street-view': 'Vista Strada',
            'get-directions': 'Ottieni Indicazioni',
            'form-success': 'Grazie! Il tuo messaggio è stato inviato con successo. Ti contatteremo presto.'
        },
        // Arabic translations (right-to-left language)
        'ar': {
            'nav-home': 'الرئيسية',
            'nav-portfolios': 'المشاريع',
            'nav-about': 'من نحن',
            'nav-contact': 'اتصل بنا',
            'login-button': 'تسجيل الدخول',
            'register-button': 'التسجيل',
            'logout-button': 'تسجيل الخروج',
            'hero-title': 'معرض أعمال الهندسة المعمارية',
            'featured-projects': 'المشاريع المميزة',
            'about-title': 'من نحن',
            'about-content': 'تأسست LLGC للهندسة والعمارة في عام 2009. وأصبح التعاون بين المهارات المهنية المختلفة من خلال التصميم المتكامل بين الهندسة والعمارة نقطة قوة وتميز مع مرور الوقت. نهج يهدف إلى فهم احتياجات المتعامل من خلال تقييم الخصائص المختلفة لكل عميل، مع التركيز على البحث والابتكار في القطاع. اكتسبت LGC خبرات متعددة في مجال البناء والتصميم الصناعي والتصميم الداخلي والمعارض والتصميم الهيكلي وتصميم المصانع، ومتابعة كل مشروع في مراحل الدراسة المختلفة، من التصميم الأولي أيضًا من خلال النمذجة الرسومية ثلاثية الأبعاد، والحصول على تراخيص، وصولاً إلى مرحلة البناء مع اهتمام خاص بإدارة العمل والسلامة. كما طورت LGC تخصصها في قطاع البنية التحتية لشبكات الاتصالات اللاسلكية، حيث تقدم خدمات الهندسة والعمارة للمشغلين الوطنيين الرئيسيين. أصبحت LGC على مر السنين شريكًا في التصميم للشركات الإيطالية والأجنبية متعددة الجنسيات.',
            'show-more': 'عرض المزيد',
            'show-less': 'عرض أقل',
            'view-project': 'عرض المشروع',
            'view-details': 'عرض التفاصيل',
            'footer-copyright': '© 2025 معرض أعمال الهندسة المعمارية. جميع الحقوق محفوظة.',
            'footer-credits': 'بواسطة',
            'practices-title': 'مجالات العمل',
            'select-practice': 'اختر مجال عمل أدناه',
            'all-categories': 'جميع الفئات',
            'select-category': 'اختر الفئة',
            'showing-all': 'عرض جميع المشاريع',
            'showing-in': 'عرض المشاريع في',
            // Project categories translations
            'category-rf-telecommunications': 'اتصالات الترددات الراديوية',
            'category-energy': 'الطاقة',
            'category-construction': 'البناء',
            'category-banking': 'المصارف والتأمين',
            'category-sand': 'المنصات',
            'category-oil-gas': 'النفط والغاز',
            'category-real-estate': 'العقارات',
            'category-nuclear': 'النووية',
            'category-industrial': 'الصناعي',
            'category-naval': 'البحرية',
            'category-bpo': 'خدمات الأعمال',
            'category-automotive': 'السيارات',
            'category-aerospace': 'الفضاء الجوي',
            'category-chemistry-pharmaceutical': 'الكيميائية والصيدلانية',
            // Contact page translations
            'contact-title': 'اتصل بنا',
            'contact-subtitle': 'نحن جاهزون لتحويل أفكارك إلى واقع',
            'contact-address': 'العنوان',
            'contact-email': 'البريد الإلكتروني',
            'contact-website': 'موقعنا الإلكتروني',
            'global-presence': 'تواجدنا العالمي',
            'our-offices': 'مكاتبنا',
            'send-message': 'أرسل لنا رسالة',
            'form-name': 'الاسم',
            'form-email': 'البريد الإلكتروني',
            'form-subject': 'الموضوع',
            'form-message': 'الرسالة',
            'submit-button': 'إرسال الرسالة',
            'our-location': 'موقعنا',
            'map-view': 'عرض الخريطة',
            'street-view': 'عرض الشارع',
            'get-directions': 'الحصول على الاتجاهات',
            'form-success': 'شكرا لك! تم إرسال رسالتك بنجاح. سنتواصل معك قريبًا.'
        }
    };

    // Translation mapping for elements that need to be processed specifically
    const elementTranslations = {
        '#nav-home': 'nav-home',
        '#nav-portfolios': 'nav-portfolios',
        '#nav-about': 'nav-about', 
        '#nav-contact': 'nav-contact',
        '.login-button': 'login-button',
        '.register-button': 'register-button',
        '#logout-button, #logout-link': 'logout-button',
        '.hero-content h1': 'hero-title',
        '#projects h2': 'featured-projects',
        '.about h2': 'about-title',
        '.desktop-paragraph': 'about-content',
        '.show-more-text': 'show-more',
        '.show-less-text': 'show-less',
        '.view-project-btn': 'view-project',
<<<<<<< Updated upstream
        '.view-button': 'view-project',
        '.view-project-button': 'view-details',
        '.footer-content p': 'footer-copyright',
=======
        '.footer-content > p:first-of-type': 'footer-copyright',
        '.footer-credits p': 'footer-credits',
>>>>>>> Stashed changes
        '.dashboard-popup-header h2': 'practices-title',
        '.dashboard-popup-content p': 'select-practice',
        '.filter-button[data-filter="all"]': 'all-categories',
        '.filter-dropdown-btn': 'select-category',
        '#category-filter-info': 'showing-all',
        // Contact page elements translations
        '#contact-hero .hero-content h1': 'contact-title',
        '#contact-hero .hero-content p': 'contact-subtitle',
        '.contact-card:nth-child(1) h3': 'contact-address',
        '.contact-card:nth-child(2) h3': 'contact-email',
        '.contact-card:nth-child(3) h3': 'contact-website',
        '#global-presence h2': 'global-presence',
        '.locations-list h3': 'our-offices',
        '.form-container h2': 'send-message',
        'label[for="name"]': 'form-name',
        'label[for="email"]': 'form-email',
        'label[for="subject"]': 'form-subject',
        'label[for="message"]': 'form-message',
        '.submit-button': 'submit-button',
        '.map-container h2': 'our-location',
        '#mapViewBtn': 'map-view',
        '#streetViewBtn': 'street-view',
        '.directions-button': 'get-directions'
    };

    // Load translations when the page loads
    function applyTranslations(langCode) {
        // Default to English if the language is not supported
        const currentTranslations = translations[langCode] || translations['en'];
        
        // Apply translations to the page
        for (const [selector, key] of Object.entries(elementTranslations)) {
            const elements = document.querySelectorAll(selector);
            
            elements.forEach(element => {
                // Only translate if we have a translation
                if (currentTranslations[key]) {
<<<<<<< Updated upstream
                    // Special handling for filter-dropdown-btn to keep the icon
                    if (selector === '.filter-dropdown-btn') {
                        element.innerHTML = `${currentTranslations[key]} <i class="fas fa-chevron-down"></i>`;
=======
                    // Special handling for footer credits to preserve the links
                    if (key === 'footer-credits') {
                        // Find all text nodes in the element
                        const walker = document.createTreeWalker(
                            element,
                            NodeFilter.SHOW_TEXT,
                            null,
                            false
                        );
                        
                        let textNode;
                        // Find first non-empty text node (should be "Powered by")
                        while (textNode = walker.nextNode()) {
                            if (textNode.nodeValue.trim()) {
                                // Replace just the "Powered by" text while preserving whitespace
                                textNode.nodeValue = textNode.nodeValue.replace(/Powered by|Desarrollado por|Propulsé par|Desenvolvido por|Realizzato da|技术支持|بواسطة/, currentTranslations[key]);
                                break;
                            }
                        }
>>>>>>> Stashed changes
                    } else {
                        element.innerText = currentTranslations[key];
                    }
                }
            });
        }
        
        // Translate category names - both in the filter dropdown and in the category cards
        const categoryElements = document.querySelectorAll('.filter-item, .category-card .category-overlay h3, .portfolio-category, .category-tag');
        categoryElements.forEach(element => {
            const category = element.getAttribute('data-filter') || 
                             element.closest('[data-category]')?.getAttribute('data-category') || 
                             element.textContent.trim().toLowerCase().replace(/\s+/g, '-');
            
            if (category) {
                const translationKey = `category-${category}`;
                if (currentTranslations[translationKey]) {
                    element.innerText = currentTranslations[translationKey];
                }
            }
        });
        
        // Special handling for filter info
        const filterInfo = document.getElementById('category-filter-info');
        if (filterInfo) {
            const text = filterInfo.textContent;
            if (text.startsWith('Showing all')) {
                filterInfo.textContent = currentTranslations['showing-all'];
            } else if (text.includes('in')) {
                const category = text.split('in ')[1].trim();
                const categoryKey = `category-${category.toLowerCase().replace(/\s+/g, '-')}`;
                if (currentTranslations[categoryKey]) {
                    filterInfo.textContent = `${currentTranslations['showing-in']} ${currentTranslations[categoryKey]}`;
                }
            }
        }
        
        // Translate all view project buttons
        document.querySelectorAll('.view-project-btn, .view-button').forEach(button => {
            button.innerText = currentTranslations['view-project'];
        });
        
        // Translate all view details buttons
        document.querySelectorAll('.view-project-button').forEach(button => {
            button.innerText = currentTranslations['view-details'];
        });
        
        // Handle RTL languages (like Arabic)
        if (langCode === 'ar') {
            document.documentElement.setAttribute('dir', 'rtl');
            document.body.classList.add('rtl');
        } else {
            document.documentElement.setAttribute('dir', 'ltr');
            document.body.classList.remove('rtl');
        }
        
        console.log(`Translations applied for: ${langCode}`);
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
                    // Skip if already the current language
                    if (lang.code === currentLangCode) {
                        languageSelector.classList.remove('active');
                        return;
                    }
                    
                    // Update button with selected language
                    languageButton.innerHTML = `<img src="${lang.flag}" alt="${lang.name}">`;
                    
                    // Close dropdown
                    languageSelector.classList.remove('active');
                    
                    // Handle language change - with user interaction flag set to true
                    changeLanguage(lang.code, true);
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
            
            // Insert language selector based on logged in status
            const logoutButton = document.getElementById('logout-button') || document.getElementById('logout-link');
            const navLinks = document.querySelector('.nav-links');
            const authButtons = document.querySelector('.auth-buttons');
            
            if (logoutButton) {
                // User is logged in, place language selector after logout button
                const langSelectorWrapper = document.createElement('li');
                langSelectorWrapper.className = 'lang-selector-wrapper';
                langSelectorWrapper.appendChild(languageSelector);
                
                // Insert after the logout button's parent li
                const logoutLi = logoutButton.closest('li');
                if (logoutLi && logoutLi.parentNode) {
                    logoutLi.parentNode.insertBefore(langSelectorWrapper, logoutLi.nextSibling);
                } else if (navLinks) {
                    // If we can't find logout button's parent, append to nav-links
                    navLinks.appendChild(langSelectorWrapper);
                }
            } else if (authButtons) {
                // User is logged out, place language selector at far right while keeping auth buttons
                const langSelectorWrapper = document.createElement('li');
                langSelectorWrapper.className = 'lang-selector-wrapper';
                langSelectorWrapper.appendChild(languageSelector);
                
                // Add language selector after auth buttons
                authButtons.parentNode.insertBefore(langSelectorWrapper, authButtons.nextSibling);
            } else {
                // Fallback if no auth buttons found
                if (navLinks) {
                    const langSelectorWrapper = document.createElement('li');
                    langSelectorWrapper.className = 'lang-selector-wrapper';
                    langSelectorWrapper.appendChild(languageSelector);
                    navLinks.appendChild(langSelectorWrapper);
                } else {
                    // Last resort fallback
                    const hamburger = nav.querySelector('.hamburger-menu');
                    if (hamburger) {
                        nav.insertBefore(languageSelector, hamburger);
                    } else {
                        nav.appendChild(languageSelector);
                    }
                }
            }
            
            // Initialize with stored language or default
            const savedLanguage = localStorage.getItem('selectedLanguage');
            if (savedLanguage) {
                // Apply translations without reloading (false = not user-initiated)
                changeLanguage(savedLanguage, false);
            }
        }
    }, 300);
    
    // Function to change language
    function changeLanguage(langCode, isUserAction) {
        // Store selected language
        localStorage.setItem('selectedLanguage', langCode);
        
        // Apply translations
        applyTranslations(langCode);
        
        console.log(`Language changed to: ${langCode}`);
        
        // Reload the page ONLY if this is a user-initiated action, not on page load
        if (isUserAction === true) {
            window.location.reload();
        }
    }

    // Make changeLanguage accessible globally
    window.applyTranslations = function() {
        const currentLang = localStorage.getItem('selectedLanguage') || 'en';
        applyTranslations(currentLang);
    };
    
    // Add event listeners for dynamic content loading
    // Listen for custom events that indicate when content has been loaded dynamically
    document.addEventListener('projectsLoaded', function() {
        window.applyTranslations();
    });
    
    document.addEventListener('portfolioFiltered', function() {
        window.applyTranslations();
    });
    
    // Add mutation observer to detect DOM changes and apply translations when needed
    const observer = new MutationObserver(function(mutations) {
        // Check if any new project items or category items were added
        const shouldTranslate = mutations.some(mutation => {
            return Array.from(mutation.addedNodes).some(node => {
                if (node.nodeType === Node.ELEMENT_NODE) {
                    return node.classList && (
                        node.classList.contains('portfolio-card') || 
                        node.classList.contains('category-card') ||
                        node.classList.contains('view-project-btn') ||
                        node.classList.contains('view-button') ||
                        node.classList.contains('filter-item') ||
                        node.querySelector('.portfolio-card, .category-card, .view-project-btn, .view-button, .filter-item')
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