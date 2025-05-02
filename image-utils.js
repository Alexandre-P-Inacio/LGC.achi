/**
 * Image utility functions for handling various image formats
 */

// Function to decode image data from various formats (hex, base64, or regular URL)
function decodeImageData(imageData, fallbackImage = null) {
    // If there's no image data, return the fallback
    if (!imageData) {
        return fallbackImage;
    }
    
    try {
        // Case 1: Already a valid URL - return as is
        if (typeof imageData === 'string' && (imageData.startsWith('http') || imageData.startsWith('/'))) {
            return imageData;
        }
        
        // Case 2: Hex encoded URL (starting with \x)
        if (typeof imageData === 'string' && imageData.startsWith('\\x')) {
            console.log('Decoding hex-encoded URL');
            // Remove the \x and convert hex to ASCII
            const hexClean = imageData.replace(/\\x/g, "");
            let url = "";
            
            for (let i = 0; i < hexClean.length; i += 2) {
                url += String.fromCharCode(parseInt(hexClean.substr(i, 2), 16));
            }
            
            return url;
        }
        
        // Case 3: Base64 encoded image - return as is since it can be used directly in img src
        if (typeof imageData === 'string' && imageData.startsWith('data:')) {
            return imageData;
        }
        
        // If we can't determine the format, return fallback
        console.warn('Unknown image data format:', typeof imageData, imageData?.substring?.(0, 30));
        return fallbackImage;
    } catch (e) {
        console.error('Error decoding image data:', e);
        return fallbackImage;
    }
}

// Get default category image 
function getCategoryImage(category) {
    // Default category images mapping
    const categoryImageMap = {
        'public': 'assets/images/categories/public.jpg',
        'residential': 'assets/images/categories/residential.jpg',
        'commercial': 'assets/images/categories/commercial.jpg',
        'infrastructure': 'assets/images/categories/infrastructure.jpg',
        'industrial': 'assets/images/categories/industrial.jpg',
        'institutional': 'assets/images/categories/institutional.jpg',
        // Default fallback image for any other category
        'default': 'assets/images/categories/default.jpg'
    };
    
    // Normalize category name (lowercase, remove spaces)
    const normalizedCategory = category ? 
        category.toLowerCase().replace(/\s+/g, '-') : 'default';
    
    // Return the mapped image or the default one
    return categoryImageMap[normalizedCategory] || categoryImageMap['default'];
} 