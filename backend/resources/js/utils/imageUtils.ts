/**
 * Utility functions for handling images
 */

/**
 * Get a safe image URL with fallbacks
 */
export const getSafeImageUrl = (imageUrl: string | undefined, width = 48, height = 48): string => {
    if (!imageUrl) {
        return getPlaceholderImageUrl(width, height);
    }
    
    // Return the original URL, fallback will be handled by onError
    return imageUrl;
};

/**
 * Get a placeholder image URL
 */
export const getPlaceholderImageUrl = (width = 48, height = 48): string => {
    // Use Cloudinary's sample placeholder
    return `https://res.cloudinary.com/dd4hzavnw/image/upload/c_fill,w_${width},h_${height},g_center/v1/samples/placeholder.png`;
};

/**
 * Get an SVG data URL placeholder
 */
export const getSvgPlaceholderUrl = (width = 48, height = 48): string => {
    const svg = `
        <svg xmlns='http://www.w3.org/2000/svg' width='${width}' height='${height}' viewBox='0 0 ${width} ${height}' fill='#f3f4f6'>
            <rect width='${width}' height='${height}' fill='#f3f4f6'/>
            <g transform='translate(${width/4},${height/4})'>
                <path d='M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z' 
                      stroke='#d1d5db' stroke-width='2' fill='none'/>
            </g>
        </svg>
    `.trim();
    
    return `data:image/svg+xml,${encodeURIComponent(svg)}`;
};

/**
 * Handle image error with cascading fallbacks
 */
export const handleImageError = (event: React.SyntheticEvent<HTMLImageElement>, width = 48, height = 48) => {
    const target = event.currentTarget;
    const currentSrc = target.src;
    
    console.log('Image failed to load:', currentSrc);
    
    // First fallback: Cloudinary placeholder
    if (!currentSrc.includes('placeholder')) {
        target.src = getPlaceholderImageUrl(width, height);
        return;
    }
    
    // Final fallback: SVG data URL
    target.src = getSvgPlaceholderUrl(width, height);
    target.onerror = null; // Prevent infinite loop
};