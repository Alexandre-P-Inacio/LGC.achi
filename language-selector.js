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
            'footer-copyright': '© 2025 Architecture Portfolio. All rights reserved.',
            'practices-title': 'Practices',
            'select-practice': 'Select a practice area below',
            // Project categories
            'rf-telecommunications': 'RF & Telecommunications',
            'energy': 'Energy',
            'construction': 'Construction',
            'banking': 'Banking & Finance',
            'sand': 'Stand',
            'oil-gas': 'Oil & Gas',
            'real-estate': 'Real Estate',
            'nuclear': 'Nuclear',
            'industrial': 'Industrial',
            'naval': 'Naval',
            'bpo': 'GDO',
            'automotive': 'Automotive',
            'aerospace': 'Aerospace',
            'chemistry-pharmaceutical': 'Chemistry & Pharmaceutical',
            // Contact page translations
            'contact-title': 'Contact Us',
            'contact-form-title': 'Get in Touch',
            'your-name': 'Your Name',
            'your-email': 'Your Email',
            'subject': 'Subject',
            'message': 'Message',
            'send-message': 'Send Message',
            'global-presence': 'Our Global Presence',
            'our-locations': 'Our Locations',
            'our-location': 'Our Location',
            'map-view': 'Map View',
            'street-view': 'Street View',
            'headquarters': 'Headquarters',
            'email': 'Email',
            'our-website': 'Our website'
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
            'footer-copyright': '© 2025 Portafolio de Arquitectura. Todos los derechos reservados.',
            'practices-title': 'Prácticas',
            'select-practice': 'Seleccione un área de práctica a continuación',
            // Project categories
            'rf-telecommunications': 'RF y Telecomunicaciones',
            'energy': 'Energía',
            'construction': 'Construcción',
            'banking': 'Banca y Finanzas',
            'sand': 'Stand',
            'oil-gas': 'Petróleo y Gas',
            'real-estate': 'Bienes Raíces',
            'nuclear': 'Nuclear',
            'industrial': 'Industrial',
            'naval': 'Naval',
            'bpo': 'GDO',
            'automotive': 'Automotriz',
            'aerospace': 'Aeroespacial',
            'chemistry-pharmaceutical': 'Química y Farmacéutica',
            // Contact page translations
            'contact-title': 'Contáctenos',
            'contact-form-title': 'Póngase en Contacto',
            'your-name': 'Su Nombre',
            'your-email': 'Su Correo Electrónico',
            'subject': 'Asunto',
            'message': 'Mensaje',
            'send-message': 'Enviar Mensaje',
            'global-presence': 'Nuestra Presencia Global',
            'our-locations': 'Nuestras Ubicaciones',
            'our-location': 'Nuestra Ubicación',
            'map-view': 'Vista del Mapa',
            'street-view': 'Vista de Calle',
            'headquarters': 'Sede Central',
            'email': 'Correo Electrónico',
            'our-website': 'Nuestro sitio web'
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
            'footer-copyright': "© 2025 Portfolio d'Architecture. Tous droits réservés.",
            'practices-title': 'Pratiques',
            'select-practice': 'Sélectionnez un domaine de pratique ci-dessous',
            // Project categories
            'rf-telecommunications': 'RF et Télécommunications',
            'energy': 'Énergie',
            'construction': 'Construction',
            'banking': 'Banque et Finance',
            'sand': 'Stand',
            'oil-gas': 'Pétrole et Gaz',
            'real-estate': 'Immobilier',
            'nuclear': 'Nucléaire',
            'industrial': 'Industriel',
            'naval': 'Naval',
            'bpo': 'GDO',
            'automotive': 'Automobile',
            'aerospace': 'Aérospatiale',
            'chemistry-pharmaceutical': 'Chimie et Pharmaceutique',
            // Contact page translations
            'contact-title': 'Contactez-nous',
            'contact-form-title': 'Prendre Contact',
            'your-name': 'Votre Nom',
            'your-email': 'Votre Email',
            'subject': 'Sujet',
            'message': 'Message',
            'send-message': 'Envoyer le Message',
            'global-presence': 'Notre Présence Mondiale',
            'our-locations': 'Nos Emplacements',
            'our-location': 'Notre Emplacement',
            'map-view': 'Vue de la Carte',
            'street-view': 'Vue de la Rue',
            'headquarters': 'Siège Social',
            'email': 'Email',
            'our-website': 'Notre site web'
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
            'footer-copyright': '© 2025 Portfólio de Arquitetura. Todos os direitos reservados.',
            'practices-title': 'Práticas',
            'select-practice': 'Selecione uma área de prática abaixo',
            // Project categories
            'rf-telecommunications': 'RF e Telecomunicações',
            'energy': 'Energia',
            'construction': 'Construção',
            'banking': 'Banca e Finanças',
            'sand': 'Stand',
            'oil-gas': 'Petróleo e Gás',
            'real-estate': 'Imobiliário',
            'nuclear': 'Nuclear',
            'industrial': 'Industrial',
            'naval': 'Naval',
            'bpo': 'GDO',
            'automotive': 'Automotivo',
            'aerospace': 'Aeroespacial',
            'chemistry-pharmaceutical': 'Química e Farmacêutica',
            // Contact page translations
            'contact-title': 'Contate-nos',
            'contact-form-title': 'Entre em Contato',
            'your-name': 'Seu Nome',
            'your-email': 'Seu Email',
            'subject': 'Assunto',
            'message': 'Mensagem',
            'send-message': 'Enviar Mensagem',
            'global-presence': 'Nossa Presença Global',
            'our-locations': 'Nossas Localizações',
            'our-location': 'Nossa Localização',
            'map-view': 'Vista do Mapa',
            'street-view': 'Vista da Rua',
            'headquarters': 'Sede',
            'email': 'Email',
            'our-website': 'Nosso website'
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
            'footer-copyright': '© 2025 Architektur-Portfolio. Alle Rechte vorbehalten.',
            'practices-title': 'Praktiken',
            'select-practice': 'Wählen Sie unten einen Praxisbereich aus',
            // Project categories
            'rf-telecommunications': 'RF & Telekommunikation',
            'energy': 'Energie',
            'construction': 'Bau',
            'banking': 'Bank- und Finanzwesen',
            'sand': 'Stand',
            'oil-gas': 'Öl und Gas',
            'real-estate': 'Immobilien',
            'nuclear': 'Nuklear',
            'industrial': 'Industrie',
            'naval': 'Marine',
            'bpo': 'GDO',
            'automotive': 'Automobil',
            'aerospace': 'Luft- und Raumfahrt',
            'chemistry-pharmaceutical': 'Chemie und Pharma',
            // Contact page translations
            'contact-title': 'Kontaktieren Sie uns',
            'contact-form-title': 'Kontakt aufnehmen',
            'your-name': 'Ihr Name',
            'your-email': 'Ihre E-Mail',
            'subject': 'Betreff',
            'message': 'Nachricht',
            'send-message': 'Nachricht senden',
            'global-presence': 'Unsere globale Präsenz',
            'our-locations': 'Unsere Standorte',
            'our-location': 'Unser Standort',
            'map-view': 'Kartenansicht',
            'street-view': 'Straßenansicht',
            'headquarters': 'Hauptsitz',
            'email': 'E-mail',
            'our-website': 'Unsere Website'
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
            'footer-copyright': '© 2025 建筑作品集。保留所有权利。',
            'practices-title': '业务领域',
            'select-practice': '请在下方选择业务领域',
            // Project categories
            'rf-telecommunications': '射频和电信',
            'energy': '能源',
            'construction': '建筑',
            'banking': '银行和金融',
            'sand': '展台',
            'oil-gas': '石油和天然气',
            'real-estate': '房地产',
            'nuclear': '核能',
            'industrial': '工业',
            'naval': '海军',
            'bpo': 'GDO',
            'automotive': '汽车',
            'aerospace': '航空航天',
            'chemistry-pharmaceutical': '化学和制药',
            // Contact page translations
            'contact-title': '联系我们',
            'contact-form-title': '取得联系',
            'your-name': '您的姓名',
            'your-email': '您的电子邮件',
            'subject': '主题',
            'message': '信息',
            'send-message': '发送信息',
            'global-presence': '我们的全球存在',
            'our-locations': '我们的位置',
            'our-location': '我们的位置',
            'map-view': '地图视图',
            'street-view': '街景视图',
            'headquarters': '总部',
            'email': '电子邮件',
            'our-website': '我们的网站'
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
            'footer-copyright': '© 2025 Portfolio di Architettura. Tutti i diritti riservati.',
            'practices-title': 'Pratiche',
            'select-practice': "Seleziona un'area di pratica qui sotto",
            // Project categories
            'rf-telecommunications': 'RF e Telecomunicazioni',
            'energy': 'Energia',
            'construction': 'Costruzione',
            'banking': 'Banca e Finanza',
            'sand': 'Stand',
            'oil-gas': 'Petrolio e Gas',
            'real-estate': 'Immobiliare',
            'nuclear': 'Nucleare',
            'industrial': 'Industriale',
            'naval': 'Navale',
            'bpo': 'GDO',
            'automotive': 'Automobilistico',
            'aerospace': 'Aerospaziale',
            'chemistry-pharmaceutical': 'Chimica e Farmaceutica',
            // Contact page translations
            'contact-title': 'Contattaci',
            'contact-form-title': 'Mettiti in Contatto',
            'your-name': 'Il tuo Nome',
            'your-email': 'La tua Email',
            'subject': 'Oggetto',
            'message': 'Messaggio',
            'send-message': 'Invia Messaggio',
            'global-presence': 'La Nostra Presenza Globale',
            'our-locations': 'Le Nostre Sedi',
            'our-location': 'La Nostra Sede',
            'map-view': 'Vista Mappa',
            'street-view': 'Vista Strada',
            'headquarters': 'Sede Centrale',
            'email': 'Email',
            'our-website': 'Il nostro sito web'
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
            'footer-copyright': '© 2025 معرض أعمال الهندسة المعمارية. جميع الحقوق محفوظة.',
            'practices-title': 'مجالات العمل',
            'select-practice': 'اختر مجال عمل أدناه',
            // Project categories
            'rf-telecommunications': 'الترددات الراديوية والاتصالات',
            'energy': 'الطاقة',
            'construction': 'البناء',
            'banking': 'البنوك والتمويل',
            'sand': 'منصات العرض',
            'oil-gas': 'النفط والغاز',
            'real-estate': 'العقارات',
            'nuclear': 'الطاقة النووية',
            'industrial': 'الصناعي',
            'naval': 'البحري',
            'bpo': 'جي دي أو',
            'automotive': 'السيارات',
            'aerospace': 'الفضاء الجوي',
            'chemistry-pharmaceutical': 'الكيمياء والصيدلة',
            // Contact page translations
            'contact-title': 'اتصل بنا',
            'contact-form-title': 'تواصل معنا',
            'your-name': 'الاسم',
            'your-email': 'البريد الإلكتروني',
            'subject': 'الموضوع',
            'message': 'الرسالة',
            'send-message': 'إرسال الرسالة',
            'global-presence': 'تواجدنا العالمي',
            'our-locations': 'مواقعنا',
            'our-location': 'موقعنا',
            'map-view': 'عرض الخريطة',
            'street-view': 'عرض الشارع',
            'headquarters': 'المقر الرئيسي',
            'email': 'البريد الإلكتروني',
            'our-website': 'موقعنا الإلكتروني'
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
        '.footer-content p': 'footer-copyright',
        '.dashboard-popup-header h2': 'practices-title',
        '.dashboard-popup-content p': 'select-practice',
        // Contact page elements
        '.contact-section h1, .header-content h1': 'contact-title',
        '.form-container h2': 'contact-form-title',
        'label[for="name"]': 'your-name',
        'label[for="email"]': 'your-email',
        'label[for="subject"]': 'subject',
        'label[for="message"]': 'message',
        '.submit-button': 'send-message',
        '.global-presence h2': 'global-presence',
        '.locations-list h3': 'our-locations',
        '.map-container h2': 'our-location',
        '#mapViewBtn': 'map-view',
        '#streetViewBtn': 'street-view',
        '.contact-card:nth-child(1) h3': 'headquarters',
        '.contact-card:nth-child(2) h3': 'email',
        '.contact-card:nth-child(3) h3': 'our-website'
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
                    element.innerText = currentTranslations[key];
                }
            });
        }
        
        // Translate project categories
        document.querySelectorAll('.category-overlay h3').forEach(element => {
            const category = element.closest('.category-card').dataset.category;
            if (category && currentTranslations[category]) {
                element.innerText = currentTranslations[category];
            }
        });
        
        // Translate view project buttons
        document.querySelectorAll('.view-project-btn').forEach(element => {
            if (currentTranslations['view-project']) {
                element.innerText = currentTranslations['view-project'];
            }
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
}); 