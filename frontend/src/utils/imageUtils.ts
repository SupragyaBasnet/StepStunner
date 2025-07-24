// Utility function to get the correct image path from backend data
export const getImagePath = (imageName: string): string => {
  if (!imageName) return '';
  
  // If the image name already has a full path, return it
  if (imageName.startsWith('http') || imageName.startsWith('/')) {
    return imageName;
  }
  
  // Return the path to the image in the public folder
  return `/images/${imageName}`;
};

// Function to get a fallback image if the main image fails to load
export const getFallbackImage = (): string => {
  return '/images/logo.png'; // Use logo as fallback
}; 