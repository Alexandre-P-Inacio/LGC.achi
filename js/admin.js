/**
 * Admin Panel JavaScript
 */

document.addEventListener('DOMContentLoaded', function() {
    // Toggle sidebar on mobile
    const sidebarToggle = document.querySelector('.sidebar-toggle');
    const sidebar = document.querySelector('.sidebar');
    const mainContent = document.querySelector('.main-content');
    
    if (sidebarToggle) {
        sidebarToggle.addEventListener('click', function() {
            sidebar.classList.toggle('collapsed');
            mainContent.classList.toggle('expanded');
        });
    }
    
    // View toggle functionality
    const viewToggles = document.querySelectorAll('.btn-view-toggle');
    const viewSections = document.querySelectorAll('.view-section');
    
    if (viewToggles.length > 0) {
        viewToggles.forEach(toggle => {
            toggle.addEventListener('click', function() {
                const view = this.getAttribute('data-view');
                
                // Remove active class from all toggles and sections
                viewToggles.forEach(t => t.classList.remove('active'));
                viewSections.forEach(s => s.classList.remove('active'));
                
                // Add active class to selected toggle and section
                this.classList.add('active');
                document.getElementById(view + '-view').classList.add('active');
                
                // Initialize flipbook if that view is selected
                if (view === 'flipbook') {
                    initFlipbook();
                }
            });
        });
    }
    
    // Flipbook functionality
    function initFlipbook() {
        const flipbook = document.getElementById('projects-flipbook');
        if (!flipbook) return;
        
        const pages = flipbook.querySelectorAll('.flipbook-page');
        const prevBtn = document.getElementById('prev-page');
        const nextBtn = document.getElementById('next-page');
        const currentPageEl = document.getElementById('current-page');
        const totalPagesEl = document.getElementById('total-pages');
        
        let currentPage = 0;
        const totalPages = pages.length;
        
        // Initialize flipbook
        updateFlipbook();
        
        // Update flipbook state
        function updateFlipbook() {
            // Update page indicator
            if (currentPageEl) currentPageEl.textContent = currentPage + 1;
            if (totalPagesEl) totalPagesEl.textContent = totalPages;
            
            // Disable/enable buttons
            if (prevBtn) prevBtn.disabled = currentPage === 0;
            if (nextBtn) nextBtn.disabled = currentPage === totalPages - 1;
            
            // Update page classes
            pages.forEach((page, index) => {
                page.classList.remove('active', 'prev', 'next');
                
                if (index === currentPage) {
                    page.classList.add('active');
                } else if (index === currentPage - 1) {
                    page.classList.add('prev');
                } else if (index === currentPage + 1) {
                    page.classList.add('next');
                }
            });
        }
        
        // Event listeners for buttons
        if (prevBtn) {
            prevBtn.addEventListener('click', function() {
                if (currentPage > 0) {
                    currentPage--;
                    updateFlipbook();
                }
            });
        }
        
        if (nextBtn) {
            nextBtn.addEventListener('click', function() {
                if (currentPage < totalPages - 1) {
                    currentPage++;
                    updateFlipbook();
                }
            });
        }
    }
    
    // File upload preview
    const fileInput = document.getElementById('file-upload');
    const fileList = document.querySelector('.file-list');
    const fileUploadContainer = document.querySelector('.file-upload-container');
    
    if (fileInput && fileList) {
        fileUploadContainer.addEventListener('click', function() {
            fileInput.click();
        });
        
        fileInput.addEventListener('change', function() {
            fileList.innerHTML = '';
            
            if (this.files.length > 0) {
                for (let i = 0; i < this.files.length; i++) {
                    const file = this.files[i];
                    const fileSize = formatFileSize(file.size);
                    const fileExtension = file.name.split('.').pop().toLowerCase();
                    let fileIconClass = 'fas fa-file';
                    
                    // Set icon based on file type
                    if (['jpg', 'jpeg', 'png', 'gif', 'svg'].includes(fileExtension)) {
                        fileIconClass = 'fas fa-file-image';
                    } else if (['doc', 'docx', 'txt', 'pdf'].includes(fileExtension)) {
                        fileIconClass = 'fas fa-file-alt';
                    } else if (['xls', 'xlsx', 'csv'].includes(fileExtension)) {
                        fileIconClass = 'fas fa-file-excel';
                    } else if (['zip', 'rar', '7z'].includes(fileExtension)) {
                        fileIconClass = 'fas fa-file-archive';
                    }
                    
                    const fileItem = document.createElement('div');
                    fileItem.className = 'file-item';
                    fileItem.innerHTML = `
                        <i class="${fileIconClass}"></i>
                        <div class="file-info">
                            <div class="file-name">${file.name}</div>
                            <div class="file-size">${fileSize}</div>
                        </div>
                    `;
                    
                    fileList.appendChild(fileItem);
                }
            }
        });
    }
    
    // Format file size
    function formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
    }
    
    // Project image preview
    const imageInput = document.getElementById('project-image');
    const imagePreview = document.querySelector('.image-preview');
    
    if (imageInput && imagePreview) {
        imageInput.addEventListener('change', function() {
            if (this.files && this.files[0]) {
                const reader = new FileReader();
                
                reader.onload = function(e) {
                    imagePreview.innerHTML = `<img src="${e.target.result}" alt="Project Preview">`;
                    imagePreview.style.display = 'block';
                };
                
                reader.readAsDataURL(this.files[0]);
            } else {
                imagePreview.innerHTML = '';
                imagePreview.style.display = 'none';
            }
        });
    }
    
    // Confirm delete
    const deleteForms = document.querySelectorAll('.delete-form');
    
    if (deleteForms) {
        deleteForms.forEach(form => {
            form.addEventListener('submit', function(e) {
                const confirmed = confirm('Are you sure you want to delete this item? This action cannot be undone.');
                
                if (!confirmed) {
                    e.preventDefault();
                }
            });
        });
    }
    
    // Auto hide alerts after 5 seconds
    const alerts = document.querySelectorAll('.alert');
    
    if (alerts) {
        alerts.forEach(alert => {
            setTimeout(() => {
                alert.style.opacity = '0';
                setTimeout(() => {
                    alert.style.display = 'none';
                }, 300);
            }, 5000);
        });
    }
    
    // Toggle password visibility
    const passwordToggle = document.querySelectorAll('.password-toggle');
    
    if (passwordToggle) {
        passwordToggle.forEach(toggle => {
            toggle.addEventListener('click', function() {
                const passwordField = this.parentElement.querySelector('input');
                const type = passwordField.getAttribute('type');
                
                if (type === 'password') {
                    passwordField.setAttribute('type', 'text');
                    this.innerHTML = '<i class="fas fa-eye-slash"></i>';
                } else {
                    passwordField.setAttribute('type', 'password');
                    this.innerHTML = '<i class="fas fa-eye"></i>';
                }
            });
        });
    }
    
    // Initialize flipbook if it's visible on page load
    if (document.querySelector('.flipbook-container.view-section.active')) {
        initFlipbook();
    }
}); 