// Client dashboard functions using PHP endpoints

// Load projects based on category
async function loadProjects(category = 'all', searchQuery = '') {
    try {
        const url = new URL('client-api.php', window.location.origin);
        url.searchParams.append('action', 'list_projects');
        
        if (category && category !== 'all') {
            url.searchParams.append('category', category);
        }
        
        if (searchQuery) {
            url.searchParams.append('search', searchQuery);
        }
        
        const response = await fetch(url);
        
        if (!response.ok) {
            throw new Error('Failed to load projects');
        }
        
        const result = await response.json();
        return result.data || [];
    } catch (error) {
        console.error('Error loading projects:', error);
        return [];
    }
}

// Load featured projects
async function loadFeaturedProjects() {
    try {
        const response = await fetch('client-api.php?action=featured_projects');
        
        if (!response.ok) {
            throw new Error('Failed to load featured projects');
        }
        
        const result = await response.json();
        return result.data || [];
    } catch (error) {
        console.error('Error loading featured projects:', error);
        return [];
    }
}

// Get user information
async function getUserInfo(username) {
    try {
        const response = await fetch(`client-api.php?action=get_user_info&username=${encodeURIComponent(username)}`);
        
        if (!response.ok) {
            throw new Error('Failed to get user information');
        }
        
        const result = await response.json();
        return result.data || null;
    } catch (error) {
        console.error('Error getting user information:', error);
        return null;
    }
}

// Display projects in portfolio grid
function displayProjects(projects) {
    const projectGrid = document.getElementById('portfolio-grid');
    const noProjectsElement = document.getElementById('no-projects');
    
    if (!projectGrid) return;
    
    // Clear loading spinner
    projectGrid.innerHTML = '';
    
    if (projects.length === 0) {
        // Show no projects message
        if (noProjectsElement) {
            noProjectsElement.style.display = 'flex';
        }
        return;
    }
    
    // Hide no projects message
    if (noProjectsElement) {
        noProjectsElement.style.display = 'none';
    }
    
    // Create project cards
    projects.forEach(project => {
        const card = document.createElement('div');
        card.className = 'portfolio-item';
        card.setAttribute('data-category', project.category || '');
        card.setAttribute('data-id', project.id);
        
        if (project.file_name) {
            card.setAttribute('data-file-url', `get_file.php?project_id=${project.id}`);
            
            const fileName = project.file_name;
            const fileExt = fileName.split('.').pop().toLowerCase();
            
            // Create card content HTML
            let cardContent = `
                <div class="portfolio-info">
                    <h3>${project.name}</h3>
                    <p>${formatCategory(project.category)}</p>
                </div>
            `;
            
            // Add appropriate thumbnail based on file type
            if (['pdf'].includes(fileExt)) {
                // PDF thumbnail using canvas
                cardContent = `
                    <div class="portfolio-thumbnail pdf-container">
                        <canvas class="pdf-thumbnail" data-pdf="get_file.php?project_id=${project.id}" width="350"></canvas>
                        <div class="file-overlay">
                            <i class="fas fa-file-pdf"></i>
                        </div>
                    </div>
                    ${cardContent}
                `;
            } else if (['doc', 'docx'].includes(fileExt)) {
                // Word document
                cardContent = `
                    <div class="portfolio-thumbnail">
                        <div class="file-icon">
                            <i class="fas fa-file-word"></i>
                        </div>
                    </div>
                    ${cardContent}
                `;
            } else if (['xls', 'xlsx'].includes(fileExt)) {
                // Excel document
                cardContent = `
                    <div class="portfolio-thumbnail">
                        <div class="file-icon">
                            <i class="fas fa-file-excel"></i>
                        </div>
                    </div>
                    ${cardContent}
                `;
            } else if (['ppt', 'pptx'].includes(fileExt)) {
                // PowerPoint document
                cardContent = `
                    <div class="portfolio-thumbnail">
                        <div class="file-icon">
                            <i class="fas fa-file-powerpoint"></i>
                        </div>
                    </div>
                    ${cardContent}
                `;
            } else if (['jpg', 'jpeg', 'png', 'gif'].includes(fileExt)) {
                // Image files
                cardContent = `
                    <div class="portfolio-thumbnail">
                        <img src="get_file.php?project_id=${project.id}" alt="${project.name}" onerror="this.onerror=null; this.src='assets/placeholder.jpg';">
                    </div>
                    ${cardContent}
                `;
            } else {
                // Generic file icon for other file types
                cardContent = `
                    <div class="portfolio-thumbnail">
                        <div class="file-icon">
                            <i class="fas fa-file"></i>
                        </div>
                    </div>
                    ${cardContent}
                `;
            }
            
            // Add view project button
            cardContent += `
                <div class="portfolio-links">
                    <a href="javascript:void(0)" class="view-project-btn" data-project-id="${project.id}" data-file-name="${fileName}">View Project</a>
                </div>
            `;
            
            card.innerHTML = cardContent;
        } else {
            // No file available
            card.innerHTML = `
                <div class="portfolio-thumbnail">
                    <div class="file-icon">
                        <i class="fas fa-file-circle-exclamation"></i>
                    </div>
                </div>
                <div class="portfolio-info">
                    <h3>${project.name}</h3>
                    <p>${formatCategory(project.category)}</p>
                    <span class="no-file-note">No file available</span>
                </div>
            `;
        }
        
        projectGrid.appendChild(card);
    });
    
    // Initialize PDF thumbnails after adding all cards
    initPdfThumbnails();
    
    // Add event listeners to view project buttons
    document.querySelectorAll('.view-project-btn').forEach(button => {
        button.addEventListener('click', function() {
            const projectId = this.getAttribute('data-project-id');
            const fileName = this.getAttribute('data-file-name');
            
            openProjectViewer(projectId, fileName);
        });
    });
}

// Format category for display
function formatCategory(category) {
    if (!category) return 'Uncategorized';
    
    // Replace hyphens with spaces and capitalize each word
    return category
        .replace(/-/g, ' ')
        .replace(/\b\w/g, char => char.toUpperCase());
}

// Initialize PDF thumbnails
function initPdfThumbnails() {
    // Check if PDF.js is loaded
    if (typeof pdfjsLib === 'undefined') {
        console.error('PDF.js not loaded');
        return;
    }
    
    // Set worker source
    pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.10.377/pdf.worker.min.js';
    
    // Get all PDF thumbnails
    document.querySelectorAll('.pdf-thumbnail').forEach(canvas => {
        const pdfUrl = canvas.getAttribute('data-pdf');
        if (!pdfUrl) return;
        
        // Load the PDF
        pdfjsLib.getDocument(pdfUrl).promise.then(pdf => {
            // Get the first page
            pdf.getPage(1).then(page => {
                const viewport = page.getViewport({ scale: 0.5 });
                const context = canvas.getContext('2d');
                canvas.height = viewport.height;
                canvas.width = viewport.width;
                
                // Render the page
                page.render({
                    canvasContext: context,
                    viewport: viewport
                });
            }).catch(error => {
                console.error('Error rendering PDF page:', error);
            });
        }).catch(error => {
            console.error('Error loading PDF:', error);
        });
    });
}

// Open project viewer
function openProjectViewer(projectId, fileName) {
    // Create modal for viewing the project
    const modal = document.createElement('div');
    modal.className = 'project-modal';
    modal.innerHTML = `
        <div class="project-modal-content">
            <div class="project-modal-header">
                <h3>Project: ${fileName || 'File'}</h3>
                <button class="close-modal">&times;</button>
            </div>
            <div class="project-modal-body">
                <iframe src="get_file.php?project_id=${projectId}" frameborder="0"></iframe>
            </div>
        </div>
    `;
    
    // Add modal to body
    document.body.appendChild(modal);
    
    // Show modal
    setTimeout(() => {
        modal.classList.add('active');
    }, 10);
    
    // Close modal when clicking the close button
    modal.querySelector('.close-modal').addEventListener('click', () => {
        modal.classList.remove('active');
        setTimeout(() => {
            modal.remove();
        }, 300);
    });
    
    // Close modal when clicking outside the content
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.classList.remove('active');
            setTimeout(() => {
                modal.remove();
            }, 300);
        }
    });
}

// Initialize portfolio page
async function initPortfolio() {
    const urlParams = new URLSearchParams(window.location.search);
    const categoryParam = urlParams.get('category');
    const searchParam = urlParams.get('search');
    
    // Set active filter button
    if (categoryParam) {
        document.querySelectorAll('.filter-button, .filter-item').forEach(button => {
            if (button.getAttribute('data-filter') === categoryParam) {
                button.classList.add('active');
                
                // Update the filter info text
                const categoryFilterInfo = document.getElementById('category-filter-info');
                if (categoryFilterInfo) {
                    categoryFilterInfo.textContent = `Showing ${formatCategory(categoryParam)} projects`;
                }
            } else {
                button.classList.remove('active');
            }
        });
    }
    
    // Load projects with filter
    const projects = await loadProjects(categoryParam, searchParam);
    displayProjects(projects);
    
    // Add event listeners to filter buttons
    document.querySelectorAll('.filter-button, .filter-item').forEach(button => {
        button.addEventListener('click', function() {
            const filter = this.getAttribute('data-filter');
            
            // Update URL without reloading page
            const url = new URL(window.location);
            if (filter === 'all') {
                url.searchParams.delete('category');
            } else {
                url.searchParams.set('category', filter);
            }
            window.history.pushState({}, '', url);
            
            // Update active button
            document.querySelectorAll('.filter-button, .filter-item').forEach(btn => {
                btn.classList.remove('active');
            });
            this.classList.add('active');
            
            // Update the filter info text
            const categoryFilterInfo = document.getElementById('category-filter-info');
            if (categoryFilterInfo) {
                if (filter === 'all') {
                    categoryFilterInfo.textContent = 'Showing all projects';
                } else {
                    categoryFilterInfo.textContent = `Showing ${formatCategory(filter)} projects`;
                }
            }
            
            // Close dropdown if open
            const dropdown = document.querySelector('.filter-dropdown-content');
            if (dropdown) {
                dropdown.classList.remove('show');
            }
            
            // Load projects with the new filter
            loadProjects(filter, searchParam).then(projects => {
                displayProjects(projects);
            });
        });
    });
    
    // Toggle dropdown
    const dropdownBtn = document.querySelector('.filter-dropdown-btn');
    if (dropdownBtn) {
        dropdownBtn.addEventListener('click', function() {
            const dropdown = document.querySelector('.filter-dropdown-content');
            dropdown.classList.toggle('show');
        });
    }
    
    // Close dropdown when clicking outside
    window.addEventListener('click', function(e) {
        if (!e.target.matches('.filter-dropdown-btn')) {
            const dropdowns = document.querySelectorAll('.filter-dropdown-content');
            dropdowns.forEach(dropdown => {
                if (dropdown.classList.contains('show')) {
                    dropdown.classList.remove('show');
                }
            });
        }
    });
}

// Initialize the portfolio when the DOM is loaded
document.addEventListener('DOMContentLoaded', initPortfolio);

// Export functions
window.clientFunctions = {
    loadProjects,
    loadFeaturedProjects,
    getUserInfo,
    displayProjects,
    formatCategory,
    initPdfThumbnails,
    openProjectViewer,
    initPortfolio
}; 